import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { protectedJson, requireProtectedBApi } from "@/lib/protected-access";

export async function GET(req: NextRequest) {
  try {
    const { response } = await requireProtectedBApi();
    if (response) {
      return response;
    }

    const consultants = await prisma.consultant.findMany({
      orderBy: { name: "asc" },
      include: {
        evaluations: true
      }
    });

    return protectedJson(consultants);
  } catch (error) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
