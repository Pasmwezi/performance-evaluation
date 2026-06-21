"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/protected-access";
import { prisma } from "@/lib/prisma";

type UserRoleInput = "ADMIN" | "CONTRACTING_OFFICER";

export async function updateUserAccess(formData: FormData) {
  const session = await requireAdminSession();
  const userId = String(formData.get("userId") || "");
  const role = String(formData.get("role") || "CONTRACTING_OFFICER") as UserRoleInput;
  const protectedBAccess = formData.get("protectedBAccess") === "on";
  const accessJustification = String(formData.get("accessJustification") || "").trim() || null;

  if (!userId || !["ADMIN", "CONTRACTING_OFFICER"].includes(role)) {
    throw new Error("Invalid access update");
  }

  if (session.user?.id === userId && role !== "ADMIN") {
    throw new Error("Admins cannot remove their own admin role");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      role: role as any,
      protectedBAccess: role === "ADMIN" ? true : protectedBAccess,
      accessJustification,
    },
  });

  revalidatePath("/admin/users");
}
