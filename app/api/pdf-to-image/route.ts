import { NextRequest, NextResponse } from "next/server";
import { createCanvas } from "canvas";
import sharp from "sharp";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    // Dynamically import pdfjs-dist to avoid build-time issues
    const pdfjsLib = await import("pdfjs-dist");

    // Set up PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const format = (formData.get("format") as string) || "png";
    const pageNumber = parseInt(formData.get("page") as string) || 1;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const uint8Array = new Uint8Array(bytes);

    // Load PDF
    const loadingTask = pdfjsLib.getDocument({ data: uint8Array });
    const pdf = await loadingTask.promise;

    if (pageNumber < 1 || pageNumber > pdf.numPages) {
      return NextResponse.json(
        { error: `Invalid page number. PDF has ${pdf.numPages} pages` },
        { status: 400 }
      );
    }

    // Get the page
    const page = await pdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 2.0 });

    // Create canvas
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    // Render PDF page to canvas
    await page.render({
      canvasContext: context as unknown as CanvasRenderingContext2D,
      viewport: viewport,
      canvas: canvas as unknown as HTMLCanvasElement,
    }).promise;

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
        "Content-Disposition": `attachment; filename="page-${pageNumber}.${format}"`,
      },
    });
  } catch (error) {
    console.error("PDF to image conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert PDF to image" },
      { status: 500 }
    );
  }
}
