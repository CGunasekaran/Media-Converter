"use client";
import { useNotification } from "@/components/Toast";

import { useState, useRef } from "react";
import { downloadFile } from "@/lib/utils";
import { removeBackground as removeBackgroundLib } from "@imgly/background-removal";

export default function BackgroundRemover() {
  const notification = useNotification();
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [bgColor, setBgColor] = useState("#ffffff");
  const [replaceWithColor, setReplaceWithColor] = useState(false);
  const [replacementImage, setReplacementImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBgImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setReplacementImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeBackground = async () => {
    if (!image) {
      notification.warning("Please select an image first");
      return;
    }

    setLoading(true);

    try {
      // Convert base64 to blob
      const response = await fetch(image);
      const blob = await response.blob();

      // Remove background using client-side library
      const result = await removeBackgroundLib(blob);

      // Process the result with color or image replacement if needed
      if (replaceWithColor || replacementImage) {
        // Create canvas to composite images
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Failed to create canvas context");
        }

        // Load the foreground image (with removed background)
        const foregroundImg = new Image();
        const foregroundUrl = URL.createObjectURL(result);

        await new Promise((resolve, reject) => {
          foregroundImg.onload = resolve;
          foregroundImg.onerror = reject;
          foregroundImg.src = foregroundUrl;
        });

        canvas.width = foregroundImg.width;
        canvas.height = foregroundImg.height;

        if (replaceWithColor) {
          // Fill with solid color
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else if (replacementImage) {
          // Draw replacement image as background
          const bgImg = new Image();
          await new Promise((resolve, reject) => {
            bgImg.onload = resolve;
            bgImg.onerror = reject;
            bgImg.src = replacementImage;
          });
          ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);
        }

        // Draw foreground on top
        ctx.drawImage(foregroundImg, 0, 0);

        // Clean up
        URL.revokeObjectURL(foregroundUrl);

        // Convert canvas to blob
        const finalBlob = await new Promise<Blob>((resolve, reject) => {
          canvas.toBlob((blob) => {
            if (blob) resolve(blob);
            else reject(new Error("Failed to create blob"));
          }, "image/png");
        });

        const url = URL.createObjectURL(finalBlob);
        setProcessedImage(url);
      } else {
        // No replacement, just use the result directly
        const url = URL.createObjectURL(result);
        setProcessedImage(url);
      }
    } catch (error) {
      console.error("Error removing background:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      notification.error(`Failed to remove background: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;

    fetch(processedImage)
      .then((res) => res.blob())
      .then((blob) => {
        downloadFile(blob, "no-background.png");
      });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-300 dark:border-purple-700 rounded-lg p-4">
        <p className="text-sm text-white font-medium">
          <strong>✨ Background Removal:</strong> Upload an image and we&apos;ll
          automatically remove its background. You can replace it with a solid
          color or another image!
        </p>
      </div>

      <div className="text-center">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          📁 Select Image
        </button>
      </div>

      {image && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Controls */}
          <div className="space-y-4 bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4">
              ⚙️ Background Options
            </h3>

            <div className="space-y-4">
              <label className="flex items-center gap-2 text-white font-medium">
                <input
                  type="radio"
                  checked={!replaceWithColor}
                  onChange={() => setReplaceWithColor(false)}
                  className="w-4 h-4"
                />
                Transparent Background
              </label>

              <label className="flex items-center gap-2 text-white font-medium">
                <input
                  type="radio"
                  checked={replaceWithColor}
                  onChange={() => setReplaceWithColor(true)}
                  className="w-4 h-4"
                />
                Replace with Color
              </label>

              {replaceWithColor && (
                <div className="ml-6">
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
              )}

              {!replaceWithColor && (
                <div className="ml-6">
                  <label className="block text-sm font-medium text-white mb-2">
                    Replace with Image (Optional)
                  </label>
                  <input
                    ref={bgImageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleBgImageSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => bgImageInputRef.current?.click()}
                    className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    {replacementImage
                      ? "✅ Image Selected"
                      : "🖼️ Select Background Image"}
                  </button>
                  {replacementImage && (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={replacementImage}
                      alt="Background"
                      className="mt-2 w-full h-24 object-cover rounded"
                    />
                  )}
                </div>
              )}
            </div>

            <button
              onClick={removeBackground}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium disabled:opacity-50 shadow-lg"
            >
              {loading ? "⏳ Removing Background..." : "🎨 Remove Background"}
            </button>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">📷 Original</h3>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image}
                  alt="Original"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            </div>

            {processedImage && (
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  ✨ Processed
                </h3>
                <div
                  className="rounded-lg p-4"
                  style={{
                    backgroundColor: replaceWithColor ? bgColor : "transparent",
                    backgroundImage:
                      !replaceWithColor && replacementImage
                        ? `url(${replacementImage})`
                        : "none",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={processedImage}
                    alt="Processed"
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
                <button
                  onClick={downloadImage}
                  className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-lg"
                >
                  💾 Download Image
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
