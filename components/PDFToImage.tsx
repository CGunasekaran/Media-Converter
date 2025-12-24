"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { PDFDocument } from "pdf-lib";
import { MAX_FILE_SIZE, formatFileSize } from "@/lib/utils";

interface ExtractedImage {
  url: string;
  index: number;
}

export default function PDFToImage() {
  const [images, setImages] = useState<ExtractedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [pdfName, setPdfName] = useState("");

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      const file = acceptedFiles[0];
      setPdfName(file.name.replace(".pdf", ""));
      await extractImages(file);
    },
  });

  const extractImages = async (file: File) => {
    setLoading(true);
    setImages([]);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pages = pdfDoc.getPages();
      const extractedImages: ExtractedImage[] = [];

      // Note: pdf-lib doesn't directly support rendering to images
      // For a production app, you'd want to use pdf.js or a server-side solution
      // This is a simplified demonstration

      alert(
        `PDF loaded with ${pages.length} page(s). ` +
          `For full PDF to image conversion, you would need to use pdf.js library ` +
          `or a server-side solution. This demo shows the structure.`
      );

      // In a real implementation, you would use pdf.js like this:
      // import * as pdfjsLib from 'pdfjs-dist';
      // Then render each page to a canvas and convert to image
    } catch (error) {
      console.error("Error extracting images:", error);
      alert("Failed to process PDF file");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = (url: string, index: number) => {
    const link = document.createElement("a");
    link.href = url;
    link.download = `${pdfName}-page-${index + 1}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-indigo-500 bg-indigo-50"
            : "border-gray-300 hover:border-indigo-400"
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="text-4xl">📄</div>
          <p className="text-lg font-medium text-gray-700">
            {isDragActive ? "Drop the PDF here" : "Drag & drop a PDF file"}
          </p>
          <p className="text-sm text-gray-500">
            or click to select (Max size: {formatFileSize(MAX_FILE_SIZE)})
          </p>
        </div>
      </div>

      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Processing PDF...</p>
        </div>
      )}

      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.index} className="border rounded-lg p-4 space-y-2">
              <img
                src={img.url}
                alt={`Page ${img.index + 1}`}
                className="w-full rounded"
              />
              <button
                onClick={() => downloadImage(img.url, img.index)}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors text-sm"
              >
                Download Page {img.index + 1}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
