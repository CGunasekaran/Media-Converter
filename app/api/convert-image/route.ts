import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const format = formData.get("format") as string;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (
      !format ||
      !["png", "jpg", "jpeg", "webp", "avif", "tiff"].includes(format)
    ) {
      return NextResponse.json({ error: "Invalid format" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let convertedBuffer;
    switch (format) {
      case "png":
        convertedBuffer = await sharp(buffer).png().toBuffer();
        break;
      case "jpg":
      case "jpeg":
        convertedBuffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
        break;
      case "webp":
        convertedBuffer = await sharp(buffer).webp({ quality: 90 }).toBuffer();
        break;
      case "avif":
        convertedBuffer = await sharp(buffer).avif({ quality: 90 }).toBuffer();
        break;
      case "tiff":
        convertedBuffer = await sharp(buffer).tiff().toBuffer();
        break;
      default:
        convertedBuffer = await sharp(buffer).png().toBuffer();
    }

    return new NextResponse(new Uint8Array(convertedBuffer), {
      headers: {
        "Content-Type": `image/${format}`,
        "Content-Disposition": `attachment; filename="converted.${format}"`,
      },
    });
  } catch (error) {
    console.error("Image conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert image" },
      { status: 500 }
    );
  }
}
