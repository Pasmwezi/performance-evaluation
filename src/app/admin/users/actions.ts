"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/protected-access";
import { prisma } from "@/lib/prisma";
import { logAuditEvent } from "@/lib/audit-logger";
import bcrypt from "bcrypt";

type UserRoleInput = "ADMIN" | "CONTRACTING_OFFICER" | "EVALUATOR";

export async function updateUserAccess(formData: FormData) {
  const session = await requireAdminSession();
  const userId = String(formData.get("userId") || "");
  const role = String(formData.get("role") || "CONTRACTING_OFFICER") as UserRoleInput;
  const protectedBAccess = formData.get("protectedBAccess") === "on";
  const accessJustification = String(formData.get("accessJustification") || "").trim() || null;

  if (!userId || !["ADMIN", "CONTRACTING_OFFICER", "EVALUATOR"].includes(role)) {
    throw new Error("Invalid access update");
  }

  if (session.user?.id === userId && role !== "ADMIN") {
    throw new Error("Admins cannot remove their own admin role");
  }

  const oldUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      role: role as any,
      protectedBAccess: role === "ADMIN" ? true : protectedBAccess,
      accessJustification,
    },
  });

  await logAuditEvent({
    userId: session.user?.id || "admin",
    userEmail: session.user?.email || "admin@example.com",
    action: "UPDATE_USER_ACCESS",
    entityType: "User",
    entityId: userId,
    details: {
      changedFrom: {
        role: oldUser?.role,
        protectedBAccess: oldUser?.protectedBAccess,
        accessJustification: oldUser?.accessJustification,
      },
      changedTo: {
        role: updatedUser.role,
        protectedBAccess: updatedUser.protectedBAccess,
        accessJustification: updatedUser.accessJustification,
      },
    },
  });

  revalidatePath("/admin/users");
}

export async function resetUserPassword(formData: FormData) {
  const session = await requireAdminSession();
  const userId = String(formData.get("userId") || "");
  const newPassword = String(formData.get("newPassword") || "").trim();

  if (!userId || !newPassword) {
    throw new Error("Missing user ID or password");
  }

  if (newPassword.length < 8 || !/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    throw new Error("Password must be at least 8 characters long and contain both letters and numbers");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: {
      password: hashedPassword,
    },
  });

  await logAuditEvent({
    userId: session.user?.id || "admin",
    userEmail: session.user?.email || "admin@example.com",
    action: "PASSWORD_RESET",
    entityType: "User",
    entityId: userId,
    details: { targetEmail: user.email },
  });

  revalidatePath("/admin/users");
}
