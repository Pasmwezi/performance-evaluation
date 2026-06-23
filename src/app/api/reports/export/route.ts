import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireProtectedBApi } from "@/lib/protected-access";

export async function GET(req: NextRequest) {
  try {
    const { session, response } = await requireProtectedBApi();
    if (response || !session) {
      return response || new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "all";
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");

    const dateFilter: any = {};
    if (dateFrom) dateFilter.gte = new Date(dateFrom);
    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      dateFilter.lte = endOfDay;
    }

    const hasDateFilter = dateFrom || dateTo;
    const filterWhere = hasDateFilter ? { createdAt: dateFilter } : {};

    const csvLines: string[] = [];

    if (type === "all" || type === "contractor") {
      const contractorEvals = await prisma.contractorEvaluation.findMany({
        where: filterWhere,
        include: { contractor: true },
        orderBy: { createdAt: "desc" },
      });

      if (contractorEvals.length > 0 && csvLines.length === 0) {
        csvLines.push("Type,Vendor Name,Contract Number,Project Number,Total Score,Quality,Time,Project Mgmt,Contract Mgmt,Health & Safety,Comments,Date");
      }

      for (const ev of contractorEvals) {
        const line = [
          "Contractor",
          `"${ev.contractor.name.replace(/"/g, '""')}"`,
          `"${ev.contractNumber.replace(/"/g, '""')}"`,
          `"${ev.projectNumber.replace(/"/g, '""')}"`,
          ev.totalPoints || "",
          ev.qualityOfWorkmanship ?? "N/A",
          ev.time ?? "N/A",
          ev.projectManagement ?? "N/A",
          ev.contractManagement ?? "N/A",
          ev.healthAndSafety ?? "N/A",
          `"${(ev.comments || "").replace(/"/g, '""')}"`,
          ev.createdAt.toISOString(),
        ];
        csvLines.push(line.join(","));
      }
    }

    if (type === "all" || type === "consultant") {
      const consultantEvals = await prisma.consultantEvaluation.findMany({
        where: filterWhere,
        include: { consultant: true },
        orderBy: { createdAt: "desc" },
      });

      if (consultantEvals.length > 0 && csvLines.length === 0) {
        csvLines.push("Type,Vendor Name,Contract Number,Project Number,Total Score,Design,Quality of Results,Mgmt,Time,Cost,Comments,Date");
      } else if (consultantEvals.length > 0) {
        csvLines.push("");
        csvLines.push("Type,Vendor Name,Contract Number,Project Number,Total Score,Design,Quality of Results,Mgmt,Time,Cost,Comments,Date");
      }

      for (const ev of consultantEvals) {
        const line = [
          "Consultant",
          `"${ev.consultant.name.replace(/"/g, '""')}"`,
          `"${ev.contractNumber.replace(/"/g, '""')}"`,
          `"${ev.projectNumber.replace(/"/g, '""')}"`,
          ev.totalPoints || "",
          ev.design ?? "N/A",
          ev.qualityOfResults ?? "N/A",
          ev.management ?? "N/A",
          ev.time ?? "N/A",
          ev.cost ?? "N/A",
          `"${(ev.comments || "").replace(/"/g, '""')}"`,
          ev.createdAt.toISOString(),
        ];
        csvLines.push(line.join(","));
      }
    }

    const csvContent = csvLines.join("\n");
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="procurement_performance_report_${Date.now()}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("Export report error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
