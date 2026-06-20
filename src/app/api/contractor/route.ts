import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    // First, resolve the Contractor entity
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

    // Now create the evaluation
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

    return NextResponse.json(evaluation);
  } catch (error) {
    console.error("Create contractor eval error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const evaluations = await prisma.contractorEvaluation.findMany({
      include: {
        contractor: true
      },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(evaluations);
  } catch (error) {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
