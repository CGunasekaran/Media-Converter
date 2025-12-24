import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";

// Force dynamic rendering
export const dynamic = 'force-dynamic';

// Lazy load pdfjs-dist to avoid build issues
let pdfjsLib: typeof import("pdfjs-dist") | null = null;

async function getPdfjsLib() {
  if (!pdfjsLib) {
    pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
  }
  return pdfjsLib;
}

export async function POST(request: NextRequest) {
  try {
    await getPdfjsLib(); // Initialize pdfjs-dist
    
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const operation = formData.get("operation") as string;

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    let resultPdf: PDFDocument;

    switch (operation) {
      case "merge":
        resultPdf = await mergePDFs(files);
        break;
      case "split":
        const pageRanges = formData.get("pageRanges") as string;
        resultPdf = await splitPDF(files[0], pageRanges);
        break;
      case "rotate":
        const rotationAngle =
          parseInt(formData.get("rotationAngle") as string) || 90;
        resultPdf = await rotatePDF(files[0], rotationAngle);
        break;
      case "add-page-numbers":
        const position = formData.get("pageNumberPosition") as string;
        resultPdf = await addPageNumbers(files[0], position);
        break;
      case "compress":
        resultPdf = await compressPDF(files[0]);
        break;
      case "extract-text":
        const text = await extractTextFromPDF(files[0]);
        return NextResponse.json({ text });
      default:
        return NextResponse.json(
          { error: "Invalid operation" },
          { status: 400 }
        );
    }

    const pdfBytes = await resultPdf.save();

    return new NextResponse(new Uint8Array(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${operation}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF tools error:", error);
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 }
    );
  }
}

async function mergePDFs(files: File[]): Promise<PDFDocument> {
  const mergedPdf = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  return mergedPdf;
}

async function splitPDF(file: File, rangesStr: string): Promise<PDFDocument> {
  const bytes = await file.arrayBuffer();
  const originalPdf = await PDFDocument.load(bytes);
  const newPdf = await PDFDocument.create();

  // Parse ranges like "1-3,5,7-10"
  const ranges = rangesStr.split(",").map((range) => range.trim());
  const pageIndices: number[] = [];

  for (const range of ranges) {
    if (range.includes("-")) {
      const [start, end] = range.split("-").map((n) => parseInt(n.trim()) - 1);
      for (let i = start; i <= end; i++) {
        if (i >= 0 && i < originalPdf.getPageCount()) {
          pageIndices.push(i);
        }
      }
    } else {
      const pageNum = parseInt(range) - 1;
      if (pageNum >= 0 && pageNum < originalPdf.getPageCount()) {
        pageIndices.push(pageNum);
      }
    }
  }

  const copiedPages = await newPdf.copyPages(originalPdf, pageIndices);
  copiedPages.forEach((page) => newPdf.addPage(page));

  return newPdf;
}

async function rotatePDF(file: File, angle: number): Promise<PDFDocument> {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes);
  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    page.setRotation(degrees(angle));
  });

  return pdfDoc;
}

async function addPageNumbers(
  file: File,
  position: string
): Promise<PDFDocument> {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes);
  const pages = pdfDoc.getPages();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

  pages.forEach((page, index) => {
    const { width, height } = page.getSize();
    const pageNumber = `${index + 1}`;
    const fontSize = 12;

    let x: number, y: number;

    switch (position) {
      case "bottom-center":
        x = width / 2 - (fontSize * pageNumber.length) / 4;
        y = 20;
        break;
      case "bottom-right":
        x = width - 50;
        y = 20;
        break;
      case "top-right":
        x = width - 50;
        y = height - 30;
        break;
      default:
        x = width / 2 - (fontSize * pageNumber.length) / 4;
        y = 20;
    }

    page.drawText(pageNumber, {
      x,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });
  });

  return pdfDoc;
}

async function compressPDF(file: File): Promise<PDFDocument> {
  const bytes = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(bytes);

  // Note: pdf-lib doesn't directly support image compression
  // This is a basic implementation that removes metadata
  // For better compression, you'd need additional libraries

  // Remove metadata to reduce size
  pdfDoc.setTitle("");
  pdfDoc.setAuthor("");
  pdfDoc.setSubject("");
  pdfDoc.setKeywords([]);
  pdfDoc.setProducer("");
  pdfDoc.setCreator("");

  return pdfDoc;
}

async function extractTextFromPDF(file: File): Promise<string> {
  const pdfjs = await getPdfjsLib();
  const bytes = await file.arrayBuffer();
  const uint8Array = new Uint8Array(bytes);

  const loadingTask = pdfjs.getDocument({ data: uint8Array });
  const pdf = await loadingTask.promise;

  let fullText = "";

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    fullText += `\n--- Page ${i} ---\n${pageText}\n`;
  }

  return fullText;
}
