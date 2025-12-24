import { NextRequest, NextResponse } from "next/server";
import { createCanvas } from "canvas";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      text,
      width = 800,
      height = 600,
      fontSize = 24,
      fontColor = "#000000",
      backgroundColor = "#ffffff",
      fontFamily = "Arial",
      format = "png",
    } = body;

    if (!text) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    // Create canvas
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");

    // Set background
    context.fillStyle = backgroundColor;
    context.fillRect(0, 0, width, height);

    // Set text properties
    context.fillStyle = fontColor;
    context.font = `${fontSize}px ${fontFamily}`;
    context.textAlign = "left";
    context.textBaseline = "top";

    // Word wrap text
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = "";
    const maxWidth = width - 40; // 20px padding on each side

    for (const word of words) {
      const testLine = currentLine + word + " ";
      const metrics = context.measureText(testLine);

      if (metrics.width > maxWidth && currentLine !== "") {
        lines.push(currentLine);
        currentLine = word + " ";
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine);

    // Draw text lines
    const lineHeight = fontSize * 1.2;
    let y = 20; // Top padding

    for (const line of lines) {
      context.fillText(line, 20, y);
      y += lineHeight;
    }

    // Convert canvas to buffer
    const buffer = canvas.toBuffer("image/png");

    // Convert to requested format
    let convertedBuffer;
    switch (format) {
      case "jpg":
      case "jpeg":
        convertedBuffer = await sharp(buffer).jpeg({ quality: 90 }).toBuffer();
        break;
      case "webp":
        convertedBuffer = await sharp(buffer).webp({ quality: 90 }).toBuffer();
        break;
      case "png":
      default:
        convertedBuffer = buffer;
    }

    return new NextResponse(new Uint8Array(convertedBuffer), {
      headers: {
        "Content-Type": `image/${format}`,
        "Content-Disposition": `attachment; filename="text-image.${format}"`,
      },
    });
  } catch (error) {
    console.error("Text to image conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert text to image" },
      { status: 500 }
    );
  }
}
