"use client";

import { useState, useRef } from "react";
import { downloadFile } from "@/lib/utils";

type PDFOperation =
  | "merge"
  | "split"
  | "rotate"
  | "compress"
  | "extract-text"
  | "add-page-numbers";

export default function PDFTools() {
  const [operation, setOperation] = useState<PDFOperation>("merge");
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url: string; text?: string } | null>(
    null
  );

  // Split PDF settings
  const [pageRanges, setPageRanges] = useState("1-3,5,7-10");

  // Rotate settings
  const [rotationAngle, setRotationAngle] = useState<90 | 180 | 270>(90);

  // Page numbers settings
  const [pageNumberPosition, setPageNumberPosition] = useState<
    "bottom-center" | "bottom-right" | "top-right"
  >("bottom-center");

  // Compress settings
  const [compressionQuality, setCompressionQuality] = useState(60);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    setResult(null);
  };

  const processFiles = async () => {
    if (files.length === 0) {
      alert("Please select PDF file(s) first");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("operation", operation);
      formData.append("pageRanges", pageRanges);
      formData.append("rotationAngle", rotationAngle.toString());
      formData.append("pageNumberPosition", pageNumberPosition);
      formData.append("compressionQuality", compressionQuality.toString());

      const response = await fetch("/api/pdf-tools", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to process PDF");
      }

      if (operation === "extract-text") {
        const data = await response.json();
        setResult({ url: "", text: data.text });
      } else {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setResult({ url });
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert(error instanceof Error ? error.message : "Failed to process PDF");
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = () => {
    if (!result?.url) return;

    fetch(result.url)
      .then((res) => res.blob())
      .then((blob) => {
        const filename =
          operation === "merge"
            ? "merged.pdf"
            : operation === "split"
            ? "split.pdf"
            : operation === "rotate"
            ? "rotated.pdf"
            : operation === "compress"
            ? "compressed.pdf"
            : operation === "add-page-numbers"
            ? "numbered.pdf"
            : "output.pdf";
        downloadFile(blob, filename);
      });
  };

  const getOperationDescription = () => {
    switch (operation) {
      case "merge":
        return "Combine multiple PDF files into one document";
      case "split":
        return "Extract specific pages or split by page ranges (e.g., 1-3,5,7-10)";
      case "rotate":
        return "Rotate all pages in the PDF by 90°, 180°, or 270°";
      case "compress":
        return "Reduce PDF file size while maintaining readability";
      case "extract-text":
        return "Extract all text content from the PDF";
      case "add-page-numbers":
        return "Add page numbers to all pages in the PDF";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
        <p className="text-sm text-white font-medium">
          <strong>📄 PDF Tools:</strong> Powerful utilities to manipulate and
          manage your PDF documents
        </p>
      </div>

      <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
        <h3 className="text-lg font-bold text-white mb-4">
          🛠️ Select Operation
        </h3>

        {/* Operation Selection */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
          {[
            { id: "merge", label: "Merge PDFs", icon: "🔗" },
            { id: "split", label: "Split PDF", icon: "✂️" },
            { id: "rotate", label: "Rotate Pages", icon: "🔄" },
            { id: "add-page-numbers", label: "Page Numbers", icon: "🔢" },
            { id: "compress", label: "Compress PDF", icon: "🗜️" },
            { id: "extract-text", label: "Extract Text", icon: "📝" },
          ].map((op) => (
            <button
              key={op.id}
              onClick={() => setOperation(op.id as PDFOperation)}
              className={`p-4 rounded-lg font-medium transition-all ${
                operation === op.id
                  ? "bg-indigo-600 text-white shadow-lg scale-105"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
              }`}
            >
              <span className="text-2xl mb-2 block">{op.icon}</span>
              {op.label}
            </button>
          ))}
        </div>

        <p className="text-sm text-white mb-4 p-3 bg-blue-500/20 rounded">
          {getOperationDescription()}
        </p>

        {/* File Selection */}
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            multiple={operation === "merge"}
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            📁 Select PDF {operation === "merge" ? "Files" : "File"} (
            {files.length} selected)
          </button>
        </div>

        {files.length > 0 && (
          <div className="mb-4 p-3 bg-white dark:bg-slate-700 rounded">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
              Selected Files:
            </p>
            <ul className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
              {files.map((file, index) => (
                <li key={index} className="truncate">
                  • {file.name}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Operation-specific settings */}
        <div className="space-y-4 mb-4">
          {operation === "split" && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Page Ranges (e.g., 1-3,5,7-10)
              </label>
              <input
                type="text"
                value={pageRanges}
                onChange={(e) => setPageRanges(e.target.value)}
                placeholder="1-3,5,7-10"
                className="w-full p-2 border rounded text-gray-700"
              />
            </div>
          )}

          {operation === "rotate" && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Rotation Angle
              </label>
              <select
                value={rotationAngle}
                onChange={(e) =>
                  setRotationAngle(Number(e.target.value) as 90 | 180 | 270)
                }
                className="w-full p-2 border rounded text-gray-700"
              >
                <option value="90">90° Clockwise</option>
                <option value="180">180° (Upside Down)</option>
                <option value="270">270° (90° Counter-clockwise)</option>
              </select>
            </div>
          )}

          {operation === "add-page-numbers" && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Page Number Position
              </label>
              <select
                value={pageNumberPosition}
                onChange={(e) =>
                  setPageNumberPosition(
                    e.target.value as
                      | "bottom-center"
                      | "bottom-right"
                      | "top-right"
                  )
                }
                className="w-full p-2 border rounded text-gray-700"
              >
                <option value="bottom-center">Bottom Center</option>
                <option value="bottom-right">Bottom Right</option>
                <option value="top-right">Top Right</option>
              </select>
            </div>
          )}

          {operation === "compress" && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Compression Quality: {compressionQuality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={compressionQuality}
                onChange={(e) => setCompressionQuality(Number(e.target.value))}
                className="w-full"
              />
              <p className="text-xs text-white mt-1">
                Lower = smaller file size, higher = better quality
              </p>
            </div>
          )}
        </div>

        {/* Process Button */}
        <button
          onClick={processFiles}
          disabled={loading || files.length === 0}
          className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-medium disabled:opacity-50 shadow-lg"
        >
          {loading ? "⏳ Processing..." : "🚀 Process PDF"}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-4">✅ Result</h3>

          {result.text ? (
            <div>
              <p className="text-sm font-medium text-white mb-2">
                Extracted Text:
              </p>
              <div className="bg-white dark:bg-slate-700 p-4 rounded max-h-96 overflow-y-auto">
                <pre className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">
                  {result.text}
                </pre>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(result.text || "");
                  alert("Text copied to clipboard!");
                }}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                📋 Copy to Clipboard
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-white mb-4">
                PDF processed successfully!
              </p>
              <button
                onClick={downloadResult}
                className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg"
              >
                💾 Download Processed PDF
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
