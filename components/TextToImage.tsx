"use client";

import { useState, useRef } from "react";
import { downloadFile } from "@/lib/utils";

export default function TextToImage() {
  const [text, setText] = useState("");
  const [fontSize, setFontSize] = useState(32);
  const [fontColor, setFontColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const generateImage = () => {
    if (!text.trim()) {
      alert("Please enter some text");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const padding = 40;
    const lineHeight = fontSize * 1.4;

    ctx.font = `${fontSize}px Arial`;
    const lines = text.split("\n");
    const maxWidth = Math.max(
      ...lines.map((line) => ctx.measureText(line).width)
    );

    canvas.width = maxWidth + padding * 2;
    canvas.height = lines.length * lineHeight + padding * 2;

    // Draw background
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw text
    ctx.fillStyle = fontColor;
    ctx.font = `${fontSize}px Arial`;
    ctx.textBaseline = "top";

    lines.forEach((line, index) => {
      ctx.fillText(line, padding, padding + index * lineHeight);
    });

    // Convert to image
    const url = canvas.toDataURL("image/png");
    setImageUrl(url);
  };

  const downloadImage = () => {
    if (!imageUrl) return;

    fetch(imageUrl)
      .then((res) => res.blob())
      .then((blob) => {
        downloadFile(blob, "text-image.png");
      });
  };

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Enter Text
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full h-40 p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Type your text here..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Font Size: {fontSize}px
              </label>
              <input
                type="range"
                min="16"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Font Color
              </label>
              <input
                type="color"
                value={fontColor}
                onChange={(e) => setFontColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-white mb-2">
                Background Color
              </label>
              <input
                type="color"
                value={bgColor}
                onChange={(e) => setBgColor(e.target.value)}
                className="w-full h-10 rounded cursor-pointer"
              />
            </div>
          </div>

          <button
            onClick={generateImage}
            className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Generate Image
          </button>
        </div>

        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Preview
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[300px] flex items-center justify-center">
            {imageUrl ? (
              <div className="space-y-4">
                <img
                  src={imageUrl}
                  alt="Generated"
                  className="max-w-full rounded"
                />
                <button
                  onClick={downloadImage}
                  className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Download Image
                </button>
              </div>
            ) : (
              <p className="text-gray-400">
                Your generated image will appear here
              </p>
            )}
          </div>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
