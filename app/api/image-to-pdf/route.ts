import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import sharp from "sharp";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const pdf = new jsPDF();
    let isFirstPage = true;

    for (const file of files) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Get image metadata
      const metadata = await sharp(buffer).metadata();

      // Convert image to JPEG for PDF compatibility
      const processedBuffer = await sharp(buffer)
        .jpeg({ quality: 90 })
        .toBuffer();

      const base64Image = processedBuffer.toString("base64");
      const imgData = `data:image/jpeg;base64,${base64Image}`;

      // Calculate dimensions to fit in PDF page
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      let imgWidth = metadata.width || 210;
      let imgHeight = metadata.height || 297;

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      imgWidth = imgWidth * ratio;
      imgHeight = imgHeight * ratio;

      if (!isFirstPage) {
        pdf.addPage();
      }
      isFirstPage = false;

      // Center the image on the page
      const x = (pdfWidth - imgWidth) / 2;
      const y = (pdfHeight - imgHeight) / 2;

      pdf.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
    }

    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="converted.pdf"',
      },
    });
  } catch (error) {
    console.error("Image to PDF conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert images to PDF" },
      { status: 500 }
    );
  }
}
