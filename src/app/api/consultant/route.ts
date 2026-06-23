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
      body.design ? parseInt(body.design, 10) : null,
      body.qualityOfResults ? parseInt(body.qualityOfResults, 10) : null,
      body.management ? parseInt(body.management, 10) : null,
      body.time ? parseInt(body.time, 10) : null,
      body.cost ? parseInt(body.cost, 10) : null,
    ];

    const hasLowScore = scores.some((s) => s !== null && s <= 7);
    const lowScoreJustification = String(body.lowScoreJustification || "").trim();

    if (hasLowScore && !lowScoreJustification) {
      return new NextResponse(
        "Low score justification is required when any category score is 7 or less.",
        { status: 400 }
      );
    }

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
      design: scores[0],
      qualityOfResults: scores[1],
      management: scores[2],
      time: scores[3],
      cost: scores[4],
      totalPoints: body.totalPoints ? parseInt(body.totalPoints, 10) : null,
      comments: body.comments,
      originalPdfUrl: body.originalPdfUrl,
      createdById: session.user?.id || null,
      lowScoreJustification: hasLowScore ? lowScoreJustification : null,
    };

    const evaluation = await prisma.consultantEvaluation.create({
      data,
    });

    // Log audit event
    const ip = req.headers.get("x-forwarded-for") || "127.0.0.1";
    await logAuditEvent({
      userId: session.user?.id || "unknown",
      userEmail: session.user?.email || "unknown@example.com",
      action: "CREATE_EVALUATION",
      entityType: "ConsultantEvaluation",
      entityId: evaluation.id,
      details: { firmName: body.firmName, contractNumber: body.contractNumber, projectNumber: body.projectNumber },
      ipAddress: ip,
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
