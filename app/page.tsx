"use client";

import ImageToText from "@/components/ImageToText";
import TextToImage from "@/components/TextToImage";
import ImageToPDF from "@/components/ImageToPDF";
import PDFToImage from "@/components/PDFToImage";
import ImageConverter from "@/components/ImageConverter";
import ImageEditor from "@/components/ImageEditor";
import BatchImageProcessor from "@/components/BatchImageProcessor";
import BackgroundRemover from "@/components/BackgroundRemover";
import PDFTools from "@/components/PDFTools";
import DocumentScanner from "@/components/DocumentScanner";
import QRCodeTools from "@/components/QRCodeTools";
import BarcodeTools from "@/components/BarcodeTools";
import SVGConverter from "@/components/SVGConverter";
import ExcelCSVTools from "@/components/ExcelCSVTools";
import MemeGenerator from "@/components/MemeGenerator";
import CollageMaker from "@/components/CollageMaker";
import PlaceholderGenerator from "@/components/PlaceholderGenerator";
import ColorPaletteExtractor from "@/components/ColorPaletteExtractor";

export default function Home() {
  const tools = [
    {
      id: "image-to-text",
      label: "Image to Text (OCR)",
      icon: "📝",
      component: <ImageToText />,
    },
    {
      id: "text-to-image",
      label: "Text to Image",
      icon: "🖼️",
      component: <TextToImage />,
    },
    {
      id: "image-to-pdf",
      label: "Image to PDF",
      icon: "📄",
      component: <ImageToPDF />,
    },
    {
      id: "pdf-to-image",
      label: "PDF to Image",
      icon: "🖼️",
      component: <PDFToImage />,
    },
    {
      id: "image-converter",
      label: "Image Format Converter",
      icon: "🔄",
      component: <ImageConverter />,
    },
    {
      id: "image-editor",
      label: "Image Editor",
      icon: "✨",
      component: <ImageEditor />,
    },
    {
      id: "batch-processor",
      label: "Batch Image Processing",
      icon: "📦",
      component: <BatchImageProcessor />,
    },
    {
      id: "background-remover",
      label: "Background Remover",
      icon: "🎨",
      component: <BackgroundRemover />,
    },
    {
      id: "pdf-tools",
      label: "PDF Tools",
      icon: "🛠️",
      component: <PDFTools />,
    },
    {
      id: "document-scanner",
      label: "Document Scanner",
      icon: "📸",
      component: <DocumentScanner />,
    },
    {
      id: "qrcode-tools",
      label: "QR Code Generator/Scanner",
      icon: "📱",
      component: <QRCodeTools />,
    },
    {
      id: "barcode-tools",
      label: "Barcode Generator/Scanner",
      icon: "📊",
      component: <BarcodeTools />,
    },
    {
      id: "svg-converter",
      label: "SVG to PNG/JPG Converter",
      icon: "🎨",
      component: <SVGConverter />,
    },
    {
      id: "excel-csv-tools",
      label: "Excel/CSV Tools",
      icon: "📈",
      component: <ExcelCSVTools />,
    },
    {
      id: "meme-generator",
      label: "Meme Generator",
      icon: "😂",
      component: <MemeGenerator />,
    },
    {
      id: "collage-maker",
      label: "Collage Maker",
      icon: "🖼️",
      component: <CollageMaker />,
    },
    {
      id: "placeholder-generator",
      label: "Image Placeholder Generator",
      icon: "🎯",
      component: <PlaceholderGenerator />,
    },
    {
      id: "color-palette-extractor",
      label: "Color Palette Extractor",
      icon: "🎨",
      component: <ColorPaletteExtractor />,
    },
  ];

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            All Conversion Tools
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
            Scroll through all available tools and features
          </p>
        </div>

        {/* All Tools as Sections */}
        <div className="space-y-12">
          {tools.map((tool, index) => (
            <section key={tool.id} id={tool.id} className="scroll-mt-24">
              <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
                {/* Section Header */}
                <div className="bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950 px-8 py-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <span className="text-4xl">{tool.icon}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                        {tool.label}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                        Tool #{index + 1} of {tools.length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Section Content */}
                <div className="p-8">{tool.component}</div>
              </div>
            </section>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-200 dark:border-slate-700 shadow-lg">
            <span className="text-green-600 dark:text-green-400 text-xl">
              🔒
            </span>
            <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">
              All conversions happen locally in your browser. Your files are
              never uploaded to a server.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
