import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const consultants = await prisma.consultant.findMany({
      orderBy: { name: "asc" },
      include: {
        evaluations: true
      }
    });

    return NextResponse.json(consultants);
  } catch (error) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
