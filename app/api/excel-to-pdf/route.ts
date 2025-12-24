import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { html } = await request.json();

    if (!html) {
      return NextResponse.json(
        { error: 'HTML content is required' },
        { status: 400 }
      );
    }

    // Create a new PDF document
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4',
    });

    // Parse HTML table and add to PDF
    // This is a simple implementation - for complex tables, consider using html2pdf or puppeteer
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const table = doc.querySelector('table');

    if (table) {
      const rows = Array.from(table.querySelectorAll('tr'));
      let yPosition = 20;
      const lineHeight = 7;
      const margin = 10;

      rows.forEach((row, rowIndex) => {
        const cells = Array.from(row.querySelectorAll('td, th'));
        let xPosition = margin;
        const cellWidth = (pdf.internal.pageSize.width - 2 * margin) / cells.length;

        cells.forEach((cell) => {
          const text = cell.textContent?.trim() || '';
          
          // Header styling
          if (rowIndex === 0) {
            pdf.setFontSize(10);
            pdf.setFont('helvetica', 'bold');
          } else {
            pdf.setFontSize(9);
            pdf.setFont('helvetica', 'normal');
          }

          pdf.text(text, xPosition, yPosition, {
            maxWidth: cellWidth - 2,
          });

          xPosition += cellWidth;
        });

        yPosition += lineHeight;

        // Add new page if needed
        if (yPosition > pdf.internal.pageSize.height - 20) {
          pdf.addPage();
          yPosition = 20;
        }
      });
    } else {
      // If no table found, just add the text content
      pdf.setFontSize(12);
      pdf.text('Excel Data', 20, 20);
      
      const textContent = doc.body.textContent || 'No content';
      pdf.text(textContent, 20, 30, {
        maxWidth: pdf.internal.pageSize.width - 40,
      });
    }

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename=excel-export.pdf',
      },
    });
  } catch (error) {
    console.error('Excel to PDF conversion error:', error);
    return NextResponse.json(
      { error: 'Failed to convert Excel to PDF' },
      { status: 500 }
    );
  }
}
