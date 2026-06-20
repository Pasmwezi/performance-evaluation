
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return new Response("Missing info", { status: 400 });
    }

    const exists = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    if (exists) {
      return new Response("User already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return Response.json(user);
  } catch (error) {
    return new Response("Internal error", { status: 500 });
  }
}
