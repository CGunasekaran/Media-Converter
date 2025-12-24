"use client";

import { useState, useRef } from "react";
import QRCode from "qrcode";
import jsQR from "jsqr";
import { downloadFile } from "@/lib/utils";

export default function QRCodeTools() {
  const [mode, setMode] = useState<"generate" | "scan">("generate");
  const [text, setText] = useState("");
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [scannedText, setScannedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Customization options
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [size, setSize] = useState(300);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateQRCode = async () => {
    if (!text.trim()) {
      alert("Please enter text or URL");
      return;
    }

    setLoading(true);
    try {
      const url = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });
      setQrImage(url);
    } catch (error) {
      console.error("Error generating QR code:", error);
      alert("Failed to generate QR code");
    } finally {
      setLoading(false);
    }
  };

  const scanQRCode = async (file: File) => {
    setLoading(true);
    setScannedText(null);

    try {
      const image = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        image.onload = () => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext("2d");
          if (!ctx) return;

          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            setScannedText(code.data);
          } else {
            alert("No QR code found in the image");
          }
          setLoading(false);
        };
        image.src = e.target?.result as string;
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error scanning QR code:", error);
      alert("Failed to scan QR code");
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      scanQRCode(file);
    }
  };

  const downloadQRCode = () => {
    if (!qrImage) return;

    fetch(qrImage)
      .then((res) => res.blob())
      .then((blob) => {
        downloadFile(blob, "qrcode.png");
      });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-300 dark:border-purple-700 rounded-lg p-4">
        <p className="text-sm text-white font-medium">
          <strong>📱 QR Code Tools:</strong> Generate custom QR codes or scan
          existing ones from images
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex gap-4">
        <button
          onClick={() => setMode("generate")}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
            mode === "generate"
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          🎨 Generate QR Code
        </button>
        <button
          onClick={() => setMode("scan")}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
            mode === "scan"
              ? "bg-indigo-600 text-white shadow-lg"
              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
          }`}
        >
          🔍 Scan QR Code
        </button>
      </div>

      {mode === "generate" ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Generator Controls */}
          <div className="space-y-4 bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4">
              ⚙️ QR Code Settings
            </h3>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Enter Text or URL
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="https://example.com or any text..."
                className="w-full h-24 p-3 border rounded-lg text-white dark:text-white bg-gray-800 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  QR Color
                </label>
                <input
                  type="color"
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                  className="w-full h-12 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Background Color
                </label>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-12 rounded cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Size: {size}px
              </label>
              <input
                type="range"
                min="200"
                max="600"
                step="50"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <button
              onClick={generateQRCode}
              disabled={loading || !text.trim()}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium disabled:opacity-50 shadow-lg"
            >
              {loading ? "⏳ Generating..." : "✨ Generate QR Code"}
            </button>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">📱 Preview</h3>
            {qrImage ? (
              <div className="bg-white dark:bg-slate-700 p-6 rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImage}
                  alt="QR Code"
                  className="w-full max-w-md mx-auto"
                />
                <button
                  onClick={downloadQRCode}
                  className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  💾 Download QR Code
                </button>
              </div>
            ) : (
              <div className="bg-gray-200 dark:bg-gray-700 p-12 rounded-lg text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Your QR code will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Scanner */}
          <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4">
              📷 Upload Image to Scan
            </h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              📁 Select Image with QR Code
            </button>
          </div>

          {loading && (
            <div className="text-center py-8">
              <p className="text-white">⏳ Scanning...</p>
            </div>
          )}

          {scannedText && (
            <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4">
                ✅ Scanned Result
              </h3>
              <div className="bg-white dark:bg-slate-700 p-4 rounded">
                <p className="text-gray-700 dark:text-gray-200 break-all">
                  {scannedText}
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(scannedText);
                  alert("Copied to clipboard!");
                }}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                📋 Copy to Clipboard
              </button>
            </div>
          )}
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
