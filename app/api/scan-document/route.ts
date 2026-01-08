import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    if (buffer.length === 0) {
      return NextResponse.json(
        { error: "Image file is empty or invalid" },
        { status: 400 }
      );
    }

    // Process the image with sharp
    // Auto-crop, enhance contrast and brightness
    const processedBuffer = await sharp(buffer)
      .resize(2480, 3508, {
        // A4 size at 300 DPI
        fit: "inside",
        withoutEnlargement: true,
      })
      .normalize() // Auto-adjust contrast
      .sharpen() // Sharpen text
      .toColorspace("srgb")
      .jpeg({ quality: 95 })
      .toBuffer();

    return new NextResponse(new Uint8Array(processedBuffer), {
      headers: {
        "Content-Type": "image/jpeg",
        "Content-Disposition": 'attachment; filename="scanned-document.jpg"',
      },
    });
  } catch (error) {
    console.error("Document scanning error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to process document";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
