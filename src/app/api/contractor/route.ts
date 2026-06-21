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
    
    let contractor = await prisma.contractor.findUnique({
      where: { name: body.contractorName }
    });

    if (!contractor) {
      contractor = await prisma.contractor.create({
        data: {
          name: body.contractorName,
          address: body.contractorAddress
        }
      });
    }

    const data = {
      contractorId: contractor.id,
      contractNumber: body.contractNumber,
      projectNumber: body.projectNumber,
      clientReferenceNumber: body.clientReferenceNumber,
      descriptionOfWork: body.descriptionOfWork,
      superintendent: body.superintendent,
      pmName: body.pmName,
      pmTelephone: body.pmTelephone,
      pmFax: body.pmFax,
      pmCell: body.pmCell,
      pmEmail: body.pmEmail,
      awardAmount: body.awardAmount ? parseFloat(body.awardAmount) : null,
      awardDate: body.awardDate ? new Date(body.awardDate) : null,
      finalAmount: body.finalAmount ? parseFloat(body.finalAmount) : null,
      completionDate: body.completionDate ? new Date(body.completionDate) : null,
      changeOrdersCount: body.changeOrdersCount ? parseInt(body.changeOrdersCount, 10) : null,
      finalCertificateDate: body.finalCertificateDate ? new Date(body.finalCertificateDate) : null,
      qualityOfWorkmanship: body.qualityOfWorkmanship ? parseInt(body.qualityOfWorkmanship, 10) : null,
      time: body.time ? parseInt(body.time, 10) : null,
      projectManagement: body.projectManagement ? parseInt(body.projectManagement, 10) : null,
      contractManagement: body.contractManagement ? parseInt(body.contractManagement, 10) : null,
      healthAndSafety: body.healthAndSafety ? parseInt(body.healthAndSafety, 10) : null,
      totalPoints: body.totalPoints ? parseInt(body.totalPoints, 10) : null,
      comments: body.comments,
      originalPdfUrl: body.originalPdfUrl,
    };

    const evaluation = await prisma.contractorEvaluation.create({
      data,
    });

    return protectedJson(evaluation);
  } catch (error) {
    console.error("Create contractor eval error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function GET() {
  try {
    const { response } = await requireProtectedBApi();
    if (response) {
      return response;
    }

    const evaluations = await prisma.contractorEvaluation.findMany({
      include: {
        contractor: true
      },
      orderBy: { createdAt: "desc" }
    });

    return protectedJson(evaluations);
  } catch (error) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
