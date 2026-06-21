import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { requireProtectedBApi } from "@/lib/protected-access";
import { getProtectedUploadDir } from "@/lib/protected-files";

export async function GET(_req: Request, ctx: RouteContext<"/api/files/[filename]">) {
  const { response } = await requireProtectedBApi();
  if (response) {
    return response;
  }

  const { filename } = await ctx.params;
  const safeFilename = path.basename(filename);

  if (safeFilename !== filename) {
    return new NextResponse("Invalid file", { status: 400 });
  }

  const filepath = path.join(getProtectedUploadDir(), safeFilename);

  try {
    const file = await fs.readFile(filepath);

    return new NextResponse(file, {
      headers: {
        "Cache-Control": "no-store",
        "Content-Disposition": `attachment; filename="${safeFilename.replace(/"/g, "_")}"`,
        "Content-Type": "application/pdf",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    return new NextResponse("File not found", { status: 404 });
  }
}
