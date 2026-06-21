import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { requireProtectedBApi } from "@/lib/protected-access";
import { buildProtectedFileUrl, getProtectedUploadDir } from "@/lib/protected-files";
import pdf from "pdf-parse";
import { extractDataFromText } from "@/lib/pdf-extractor";

export async function POST(req: NextRequest) {
  try {
    const { response } = await requireProtectedBApi();
    if (response) {
      return response;
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return new NextResponse("No file uploaded", { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return new NextResponse("Only PDF forms can be uploaded", { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Parse text from PDF
    let text = "";
    try {
      const result = await pdf(buffer);
      text = result.text || "";
    } catch (parseError) {
      console.error("PDF parse error:", parseError);
      return new NextResponse("Failed to parse text from PDF form", { status: 400 });
    }

    // Extract fields
    const extractedData = extractDataFromText(text);

    // Save the PDF file to protected uploads directory
    const uploadDir = getProtectedUploadDir();
    await fs.mkdir(uploadDir, { recursive: true });

    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-]/g, "_");
    const filename = `${uniqueSuffix}-${safeName}`;
    const filepath = path.join(uploadDir, filename);

    await fs.writeFile(filepath, buffer, { flag: "wx" });

    // Return the extracted data along with the file url
    return NextResponse.json(
      {
        data: extractedData,
        originalPdfUrl: buildProtectedFileUrl(filename),
      },
      {
        headers: {
          "Cache-Control": "no-store",
          "X-Content-Type-Options": "nosniff",
        },
      }
    );
  } catch (error) {
    console.error("Extract API error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
