import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { protectedJson, requireProtectedBApi } from "@/lib/protected-access";

export async function POST(req: NextRequest) {
  try {
    const { response } = await requireProtectedBApi();
    if (response) {
      return response;
    }

    const body = await req.json();
    
    let consultant = await prisma.consultant.findUnique({
      where: { name: body.firmName }
    });

    if (!consultant) {
      consultant = await prisma.consultant.create({
        data: {
          name: body.firmName,
          address: body.firmAddress
        }
      });
    }

    const data = {
      consultantId: consultant.id,
      contractNumber: body.contractNumber,
      projectNumber: body.projectNumber,
      clientReferenceNumber: body.clientReferenceNumber,
      descriptionOfWork: body.descriptionOfWork,
      pmName: body.pmName,
      pmTelephone: body.pmTelephone,
      pmFax: body.pmFax,
      pmCell: body.pmCell,
      pmEmail: body.pmEmail,
      awardAmount: body.awardAmount ? parseFloat(body.awardAmount) : null,
      awardDate: body.awardDate ? new Date(body.awardDate) : null,
      finalAmount: body.finalAmount ? parseFloat(body.finalAmount) : null,
      completionDate: body.completionDate ? new Date(body.completionDate) : null,
      amendmentsCount: body.amendmentsCount ? parseInt(body.amendmentsCount, 10) : null,
      design: body.design ? parseInt(body.design, 10) : null,
      qualityOfResults: body.qualityOfResults ? parseInt(body.qualityOfResults, 10) : null,
      management: body.management ? parseInt(body.management, 10) : null,
      time: body.time ? parseInt(body.time, 10) : null,
      cost: body.cost ? parseInt(body.cost, 10) : null,
      totalPoints: body.totalPoints ? parseInt(body.totalPoints, 10) : null,
      comments: body.comments,
      originalPdfUrl: body.originalPdfUrl,
    };

    const evaluation = await prisma.consultantEvaluation.create({
      data,
    });

    return protectedJson(evaluation);
  } catch (error) {
    console.error("Create consultant eval error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function GET() {
  try {
    const { response } = await requireProtectedBApi();
    if (response) {
      return response;
    }

    const evaluations = await prisma.consultantEvaluation.findMany({
      include: {
        consultant: true
      },
      orderBy: { createdAt: "desc" }
    });

    return protectedJson(evaluations);
  } catch (error) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
