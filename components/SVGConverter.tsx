"use client";

import { useState, useRef } from "react";
import { downloadFile } from "@/lib/utils";

type ConversionFormat = "png" | "jpg";

export default function SVGConverter() {
  const [svgFile, setSvgFile] = useState<File | null>(null);
  const [svgContent, setSvgContent] = useState<string>("");
  const [format, setFormat] = useState<ConversionFormat>("png");
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [transparent, setTransparent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.includes("svg")) {
      alert("Please select an SVG file");
      return;
    }

    setSvgFile(file);
    const text = await file.text();
    setSvgContent(text);
    setConvertedImage(null);
  };

  const convertSVG = async () => {
    if (!svgContent) {
      alert("Please select an SVG file first");
      return;
    }

    setLoading(true);
    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Parse SVG to get dimensions
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgContent, "image/svg+xml");
      const svgElement = svgDoc.querySelector("svg");

      if (!svgElement) {
        throw new Error("Invalid SVG file");
      }

      // Get original dimensions
      const viewBox = svgElement.getAttribute("viewBox");
      let origWidth = parseFloat(svgElement.getAttribute("width") || "0");
      let origHeight = parseFloat(svgElement.getAttribute("height") || "0");

      if (viewBox && (!origWidth || !origHeight)) {
        const [, , vbWidth, vbHeight] = viewBox.split(" ").map(Number);
        origWidth = vbWidth;
        origHeight = vbHeight;
      }

      // Calculate dimensions
      let finalWidth = width;
      let finalHeight = height;

      if (maintainAspectRatio && origWidth && origHeight) {
        const aspectRatio = origWidth / origHeight;
        if (width / height > aspectRatio) {
          finalWidth = height * aspectRatio;
        } else {
          finalHeight = width / aspectRatio;
        }
      }

      // Set canvas dimensions
      canvas.width = finalWidth;
      canvas.height = finalHeight;

      // Set background
      if (!transparent) {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Create blob from SVG
      const svgBlob = new Blob([svgContent], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      // Load and draw image
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
        URL.revokeObjectURL(url);

        // Convert to desired format
        const mimeType = format === "png" ? "image/png" : "image/jpeg";
        const quality = format === "jpg" ? 0.95 : undefined;
        const dataUrl = canvas.toDataURL(mimeType, quality);

        setConvertedImage(dataUrl);
        setLoading(false);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        alert("Failed to load SVG image");
        setLoading(false);
      };

      img.src = url;
    } catch (error) {
      console.error("Conversion error:", error);
      alert("Failed to convert SVG");
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!convertedImage) return;

    fetch(convertedImage)
      .then((res) => res.blob())
      .then((blob) => {
        const filename =
          svgFile?.name.replace(".svg", `.${format}`) || `converted.${format}`;
        downloadFile(blob, filename);
      });
  };

  const resetConverter = () => {
    setSvgFile(null);
    setSvgContent("");
    setConvertedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-300 dark:border-green-700 rounded-lg p-4">
        <p className="text-sm text-white font-medium">
          <strong>🎨 SVG Converter:</strong> Convert SVG files to PNG or JPG
          with custom dimensions
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4 bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-4">
            ⚙️ Conversion Settings
          </h3>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Select SVG File
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept=".svg,image/svg+xml"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {svgFile ? `📄 ${svgFile.name}` : "📁 Choose SVG File"}
            </button>
          </div>

          {svgFile && (
            <>
              {/* Format Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Output Format
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setFormat("png")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      format === "png"
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    🖼️ PNG
                  </button>
                  <button
                    onClick={() => setFormat("jpg")}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      format === "jpg"
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}
                  >
                    🖼️ JPG
                  </button>
                </div>
              </div>

              {/* Dimensions */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Width (px)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="4000"
                    step="50"
                    value={width}
                    onChange={(e) => setWidth(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg text-gray-700"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Height (px)
                  </label>
                  <input
                    type="number"
                    min="100"
                    max="4000"
                    step="50"
                    value={height}
                    onChange={(e) => setHeight(Number(e.target.value))}
                    className="w-full p-2 border rounded-lg text-gray-700"
                  />
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="aspectRatio"
                    checked={maintainAspectRatio}
                    onChange={(e) => setMaintainAspectRatio(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <label htmlFor="aspectRatio" className="text-sm text-white">
                    Maintain aspect ratio
                  </label>
                </div>

                {format === "png" && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="transparent"
                      checked={transparent}
                      onChange={(e) => setTransparent(e.target.checked)}
                      className="w-5 h-5 rounded"
                    />
                    <label htmlFor="transparent" className="text-sm text-white">
                      Transparent background
                    </label>
                  </div>
                )}

                {!transparent && (
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="w-full h-12 rounded cursor-pointer"
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={convertSVG}
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-medium disabled:opacity-50 shadow-lg"
                >
                  {loading ? "⏳ Converting..." : "✨ Convert SVG"}
                </button>
                <button
                  onClick={resetConverter}
                  className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  🔄 Reset
                </button>
              </div>
            </>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">👁️ Preview</h3>

          {svgContent && !convertedImage && (
            <div className="bg-white dark:bg-slate-700 p-6 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Original SVG:
              </p>
              <div
                className="border border-gray-300 dark:border-gray-600 rounded p-4 max-h-96 overflow-auto"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
            </div>
          )}

          {convertedImage && (
            <div className="bg-white dark:bg-slate-700 p-6 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Converted to {format.toUpperCase()}:
              </p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={convertedImage}
                alt="Converted"
                className="w-full border border-gray-300 dark:border-gray-600 rounded"
              />
              <button
                onClick={downloadImage}
                className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                💾 Download {format.toUpperCase()}
              </button>
            </div>
          )}

          {!svgContent && (
            <div className="bg-gray-200 dark:bg-gray-700 p-12 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Upload an SVG file to see preview
              </p>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
