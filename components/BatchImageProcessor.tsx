"use client";

import { useState, useRef } from "react";
import { downloadFile } from "@/lib/utils";

type BatchOperation = "resize" | "filter" | "convert" | "rename";

interface ProcessedFile {
  name: string;
  blob: Blob;
  url: string;
}

export default function BatchImageProcessor() {
  const [files, setFiles] = useState<File[]>([]);
  const [operation, setOperation] = useState<BatchOperation>("resize");
  const [loading, setLoading] = useState(false);
  const [processedFiles, setProcessedFiles] = useState<ProcessedFile[]>([]);

  // Operation settings
  const [targetWidth, setTargetWidth] = useState(800);
  const [targetHeight, setTargetHeight] = useState(600);
  const [maintainAspect, setMaintainAspect] = useState(true);
  const [filter, setFilter] = useState("grayscale");
  const [targetFormat, setTargetFormat] = useState("png");
  const [renamePrefix, setRenamePrefix] = useState("image");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    setFiles(selectedFiles);
    setProcessedFiles([]);
  };

  const processImages = async () => {
    if (files.length === 0) {
      alert("Please select images first");
      return;
    }

    setLoading(true);
    setProcessedFiles([]);

    try {
      const processed: ProcessedFile[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) continue;

        const img = await loadImage(file);

        if (operation === "resize") {
          // Resize logic
          let width = targetWidth;
          let height = targetHeight;

          if (maintainAspect) {
            const ratio = Math.min(
              targetWidth / img.width,
              targetHeight / img.height
            );
            width = img.width * ratio;
            height = img.height * ratio;
          }

          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);

          const blob = await canvasToBlob(canvas, "image/png");
          const newName = `${file.name.split(".")[0]}_resized.png`;
          processed.push({
            name: newName,
            blob,
            url: URL.createObjectURL(blob),
          });
        } else if (operation === "filter") {
          // Apply filter
          canvas.width = img.width;
          canvas.height = img.height;

          if (filter === "grayscale") {
            ctx.filter = "grayscale(100%)";
          } else if (filter === "sepia") {
            ctx.filter = "sepia(100%)";
          } else if (filter === "blur") {
            ctx.filter = "blur(5px)";
          } else if (filter === "brightness") {
            ctx.filter = "brightness(150%)";
          }

          ctx.drawImage(img, 0, 0);

          const blob = await canvasToBlob(canvas, "image/png");
          const newName = `${file.name.split(".")[0]}_${filter}.png`;
          processed.push({
            name: newName,
            blob,
            url: URL.createObjectURL(blob),
          });
        } else if (operation === "convert") {
          // Convert format
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.drawImage(img, 0, 0);

          const mimeType = `image/${targetFormat}`;
          const blob = await canvasToBlob(canvas, mimeType);
          const newName = `${file.name.split(".")[0]}.${targetFormat}`;
          processed.push({
            name: newName,
            blob,
            url: URL.createObjectURL(blob),
          });
        } else if (operation === "rename") {
          // Rename files
          const extension = file.name.split(".").pop();
          const newName = `${renamePrefix}_${i + 1}.${extension}`;
          processed.push({
            name: newName,
            blob: file,
            url: URL.createObjectURL(file),
          });
        }
      }

      setProcessedFiles(processed);
      setLoading(false);
    } catch (error) {
      console.error("Error processing images:", error);
      setLoading(false);
      alert("Error processing images");
    }
  };

  const loadImage = (file: File): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const canvasToBlob = (
    canvas: HTMLCanvasElement,
    type: string
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error("Failed to create blob"));
        },
        type,
        0.9
      );
    });
  };

  const downloadAll = () => {
    processedFiles.forEach((file) => {
      downloadFile(file.blob, file.name);
    });
  };

  const downloadSingle = (file: ProcessedFile) => {
    downloadFile(file.blob, file.name);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
        <h3 className="text-lg font-bold text-white mb-4">
          📦 Batch Processing
        </h3>

        {/* File Selection */}
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            📁 Select Multiple Images ({files.length} selected)
          </button>
        </div>

        {/* Operation Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-2">
            Select Operation
          </label>
          <select
            value={operation}
            onChange={(e) => setOperation(e.target.value as BatchOperation)}
            className="w-full p-3 border rounded-lg text-white dark:text-white bg-gray-800 dark:bg-gray-800 font-medium"
          >
            <option value="resize">📏 Resize Images</option>
            <option value="filter">🎨 Apply Filter</option>
            <option value="convert">🔄 Convert Format</option>
            <option value="rename">✏️ Bulk Rename</option>
          </select>
        </div>

        {/* Operation Settings */}
        <div className="space-y-4 mb-4">
          {operation === "resize" && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    value={targetWidth}
                    onChange={(e) => setTargetWidth(Number(e.target.value))}
                    className="w-full p-2 border rounded text-white dark:text-white bg-gray-800 dark:bg-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    value={targetHeight}
                    onChange={(e) => setTargetHeight(Number(e.target.value))}
                    className="w-full p-2 border rounded text-white dark:text-white bg-gray-800 dark:bg-gray-800"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={maintainAspect}
                  onChange={(e) => setMaintainAspect(e.target.checked)}
                  className="w-4 h-4"
                />
                Maintain aspect ratio
              </label>
            </div>
          )}

          {operation === "filter" && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Select Filter
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full p-2 border rounded text-white dark:text-white bg-gray-800 dark:bg-gray-800"
              >
                <option value="grayscale">Grayscale</option>
                <option value="sepia">Sepia</option>
                <option value="blur">Blur</option>
                <option value="brightness">Brightness</option>
              </select>
            </div>
          )}

          {operation === "convert" && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Target Format
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="w-full p-2 border rounded text-white dark:text-white bg-gray-800 dark:bg-gray-800"
              >
                <option value="png">PNG</option>
                <option value="jpeg">JPEG</option>
                <option value="webp">WebP</option>
              </select>
            </div>
          )}

          {operation === "rename" && (
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Name Prefix
              </label>
              <input
                type="text"
                value={renamePrefix}
                onChange={(e) => setRenamePrefix(e.target.value)}
                placeholder="image"
                className="w-full p-2 border rounded text-white dark:text-white bg-gray-800 dark:bg-gray-800"
              />
              <p className="text-sm text-white mt-1">
                Files will be named: {renamePrefix}_1, {renamePrefix}_2, etc.
              </p>
            </div>
          )}
        </div>

        {/* Process Button */}
        <button
          onClick={processImages}
          disabled={loading || files.length === 0}
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
        >
          {loading ? "⏳ Processing..." : "🚀 Process All Images"}
        </button>
      </div>

      {/* Results */}
      {processedFiles.length > 0 && (
        <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold text-white">
              ✅ Processed Images ({processedFiles.length})
            </h3>
            <button
              onClick={downloadAll}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
            >
              💾 Download All
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {processedFiles.map((file, index) => (
              <div key={index} className="space-y-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-32 object-cover rounded-lg shadow"
                />
                <p className="text-xs text-white truncate">{file.name}</p>
                <button
                  onClick={() => downloadSingle(file)}
                  className="w-full px-2 py-1 bg-indigo-600 text-white text-xs rounded hover:bg-indigo-700"
                >
                  💾 Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
