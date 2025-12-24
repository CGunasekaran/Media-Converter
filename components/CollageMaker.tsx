"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { downloadFile } from "@/lib/utils";

type LayoutType =
  | "grid-2"
  | "grid-3"
  | "grid-4"
  | "instagram"
  | "facebook"
  | "custom";

const LAYOUTS = [
  {
    value: "grid-2" as LayoutType,
    label: "2 Images (Grid)",
    width: 800,
    height: 400,
    slots: 2,
  },
  {
    value: "grid-3" as LayoutType,
    label: "3 Images (Grid)",
    width: 900,
    height: 300,
    slots: 3,
  },
  {
    value: "grid-4" as LayoutType,
    label: "4 Images (Grid)",
    width: 800,
    height: 800,
    slots: 4,
  },
  {
    value: "instagram" as LayoutType,
    label: "Instagram Post",
    width: 1080,
    height: 1080,
    slots: 4,
  },
  {
    value: "facebook" as LayoutType,
    label: "Facebook Cover",
    width: 820,
    height: 312,
    slots: 3,
  },
];

export default function CollageMaker() {
  const [layout, setLayout] = useState<LayoutType>("grid-4");
  const [images, setImages] = useState<string[]>([]);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [spacing, setSpacing] = useState(10);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const selectedLayout = LAYOUTS.find((l) => l.value === layout) || LAYOUTS[2];

  const drawImageCover = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      img: HTMLImageElement,
      x: number,
      y: number,
      w: number,
      h: number
    ) => {
      const imgRatio = img.width / img.height;
      const boxRatio = w / h;

      let sw, sh, sx, sy;

      if (imgRatio > boxRatio) {
        sh = img.height;
        sw = sh * boxRatio;
        sx = (img.width - sw) / 2;
        sy = 0;
      } else {
        sw = img.width;
        sh = sw / boxRatio;
        sx = 0;
        sy = (img.height - sh) / 2;
      }

      ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
    },
    []
  );

  const drawGrid2 = useCallback(
    (ctx: CanvasRenderingContext2D, imgs: HTMLImageElement[]) => {
      const w = (selectedLayout.width - spacing) / 2;
      const h = selectedLayout.height;

      imgs.forEach((img, i) => {
        const x = i * (w + spacing);
        drawImageCover(ctx, img, x, 0, w, h);
      });
    },
    [selectedLayout.width, selectedLayout.height, spacing, drawImageCover]
  );

  const drawGrid3 = useCallback(
    (ctx: CanvasRenderingContext2D, imgs: HTMLImageElement[]) => {
      const w = (selectedLayout.width - 2 * spacing) / 3;
      const h = selectedLayout.height;

      imgs.forEach((img, i) => {
        const x = i * (w + spacing);
        drawImageCover(ctx, img, x, 0, w, h);
      });
    },
    [selectedLayout.width, selectedLayout.height, spacing, drawImageCover]
  );

  const drawGrid4 = useCallback(
    (ctx: CanvasRenderingContext2D, imgs: HTMLImageElement[]) => {
      const w = (selectedLayout.width - spacing) / 2;
      const h = (selectedLayout.height - spacing) / 2;

      imgs.forEach((img, i) => {
        const col = i % 2;
        const row = Math.floor(i / 2);
        const x = col * (w + spacing);
        const y = row * (h + spacing);
        drawImageCover(ctx, img, x, y, w, h);
      });
    },
    [selectedLayout.width, selectedLayout.height, spacing, drawImageCover]
  );

  const drawFacebookCover = useCallback(
    (ctx: CanvasRenderingContext2D, imgs: HTMLImageElement[]) => {
      if (imgs.length === 0) return;

      const mainW = selectedLayout.width * 0.6;
      const sideW = (selectedLayout.width - mainW - 2 * spacing) / 2;
      const h = selectedLayout.height;

      drawImageCover(ctx, imgs[0], 0, 0, mainW, h);

      if (imgs.length > 1) {
        drawImageCover(ctx, imgs[1], mainW + spacing, 0, sideW, h);
      }
      if (imgs.length > 2) {
        drawImageCover(ctx, imgs[2], mainW + sideW + 2 * spacing, 0, sideW, h);
      }
    },
    [selectedLayout.width, selectedLayout.height, spacing, drawImageCover]
  );

  const drawCollage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = selectedLayout.width;
    canvas.height = selectedLayout.height;

    // Fill background
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const loadedImages = images.map((src) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = src;
      });
    });

    Promise.all(loadedImages).then((imgs) => {
      switch (layout) {
        case "grid-2":
          drawGrid2(ctx, imgs);
          break;
        case "grid-3":
          drawGrid3(ctx, imgs);
          break;
        case "grid-4":
        case "instagram":
          drawGrid4(ctx, imgs);
          break;
        case "facebook":
          drawFacebookCover(ctx, imgs);
          break;
      }
    });
  }, [
    images,
    layout,
    backgroundColor,
    selectedLayout,
    drawGrid2,
    drawGrid3,
    drawGrid4,
    drawFacebookCover,
  ]);

  useEffect(() => {
    if (images.length > 0) {
      drawCollage();
    }
  }, [images, drawCollage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const readers = files.map((file) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      setImages((prev) => [...prev, ...results].slice(0, selectedLayout.slots));
    });
  };

  const downloadCollage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        downloadFile(blob, `collage-${layout}.png`);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAll = () => {
    setImages([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-300 dark:border-violet-700 rounded-lg p-4">
        <p className="text-sm text-white font-medium">
          <strong>🎨 Collage Maker:</strong> Combine multiple images into
          beautiful layouts for social media
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4 bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-4">
            ⚙️ Collage Settings
          </h3>

          {/* Layout Selection */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Layout Template
            </label>
            <select
              value={layout}
              onChange={(e) => setLayout(e.target.value as LayoutType)}
              className="w-full p-3 border rounded-lg text-white dark:text-white bg-gray-800 dark:bg-gray-800 focus:ring-2 focus:ring-violet-500"
            >
              {LAYOUTS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label} ({l.width}x{l.height}px)
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Add Images ({images.length}/{selectedLayout.slots})
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={images.length >= selectedLayout.slots}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={images.length >= selectedLayout.slots}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
            >
              {images.length === 0 ? "📁 Choose Images" : "➕ Add More Images"}
            </button>
          </div>

          {/* Image List */}
          {images.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-white">
                Selected Images
              </label>
              {images.map((img, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-white dark:bg-slate-700 p-2 rounded"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Image ${i + 1}`}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">
                    Image {i + 1}
                  </span>
                  <button
                    onClick={() => removeImage(i)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Background Color */}
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

          {/* Spacing */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Image Spacing: {spacing}px
            </label>
            <input
              type="range"
              min="0"
              max="50"
              step="5"
              value={spacing}
              onChange={(e) => setSpacing(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Action Buttons */}
          {images.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={downloadCollage}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-lg hover:from-violet-700 hover:to-purple-700 transition-colors font-medium shadow-lg"
              >
                💾 Download Collage
              </button>
              <button
                onClick={clearAll}
                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              >
                🗑️ Clear
              </button>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">👁️ Preview</h3>

          {images.length > 0 ? (
            <div className="bg-white dark:bg-slate-700 p-6 rounded-lg">
              <canvas
                ref={canvasRef}
                className="w-full border border-gray-300 dark:border-gray-600 rounded"
              />
            </div>
          ) : (
            <div className="bg-gray-200 dark:bg-gray-700 p-12 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Select a layout and upload images to create a collage
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Max {selectedLayout.slots} images for this layout
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
