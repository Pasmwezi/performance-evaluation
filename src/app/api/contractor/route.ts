import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { protectedJson, requireProtectedBApi } from "@/lib/protected-access";
import { logAuditEvent } from "@/lib/audit-logger";

export async function POST(req: NextRequest) {
  try {
    const { session, response } = await requireProtectedBApi();
    if (response || !session) {
      return response || new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    // Validate low-score justification
    const scores = [
      body.qualityOfWorkmanship ? parseInt(body.qualityOfWorkmanship, 10) : null,
      body.time ? parseInt(body.time, 10) : null,
      body.projectManagement ? parseInt(body.projectManagement, 10) : null,
      body.contractManagement ? parseInt(body.contractManagement, 10) : null,
      body.healthAndSafety ? parseInt(body.healthAndSafety, 10) : null,
    ];

    const hasLowScore = scores.some((s) => s !== null && s <= 7);
    const lowScoreJustification = String(body.lowScoreJustification || "").trim();

    if (hasLowScore && !lowScoreJustification) {
      return new NextResponse(
        "Low score justification is required when any category score is 7 or less.",
        { status: 400 }
      );
    }
    
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
      qualityOfWorkmanship: scores[0],
      time: scores[1],
      projectManagement: scores[2],
      contractManagement: scores[3],
      healthAndSafety: scores[4],
      totalPoints: body.totalPoints ? parseInt(body.totalPoints, 10) : null,
      comments: body.comments,
      originalPdfUrl: body.originalPdfUrl,
      createdById: session.user?.id || null,
      lowScoreJustification: hasLowScore ? lowScoreJustification : null,
    };

    const evaluation = await prisma.contractorEvaluation.create({
      data,
    });

    // Log audit event
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    await logAuditEvent({
      userId: session.user?.id || "unknown",
      userEmail: session.user?.email || "unknown@example.com",
      action: "CREATE_EVALUATION",
      entityType: "ContractorEvaluation",
      entityId: evaluation.id,
      details: { contractorName: body.contractorName, contractNumber: body.contractNumber, projectNumber: body.projectNumber },
      ipAddress: ip,
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
