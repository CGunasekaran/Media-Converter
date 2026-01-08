import { NextRequest, NextResponse } from "next/server";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

// Force dynamic rendering
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { html } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: "HTML content is required" },
        { status: 400 }
      );
    }

    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    // Extract table data from HTML string without using DOMParser
    const tableData = extractTableData(html);

    if (tableData.length > 0) {
      // Use autotable for better table rendering
      autoTable(pdf, {
        head: [tableData[0]],
        body: tableData.slice(1),
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] },
        margin: { top: 10 },
      });
    } else {
      // If no table data, show error message
      pdf.setFontSize(12);
      pdf.text("No table data found in Excel file", 20, 20);
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output("arraybuffer"));

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=excel-export.pdf",
      },
    });
  } catch (error) {
    console.error("Excel to PDF conversion error:", error);
    return NextResponse.json(
      { error: "Failed to convert Excel to PDF" },
      { status: 500 }
    );
  }
}

// Helper function to extract table data from HTML string
function extractTableData(html: string): string[][] {
  const tableData: string[][] = [];

  // Simple regex-based extraction (alternative to DOMParser)
  const trMatches = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi);

  if (trMatches) {
    trMatches.forEach((tr) => {
      const row: string[] = [];
      const cellMatches = tr.match(/<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi);

      if (cellMatches) {
        cellMatches.forEach((cell) => {
          // Remove HTML tags and decode entities
          const text = cell
            .replace(/<[^>]+>/g, "")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, '"')
            .trim();
          row.push(text);
        });
      }

      if (row.length > 0) {
        tableData.push(row);
      }
    });
  }

  return tableData;
}
