'use client';

import { useState, useRef } from 'react';
import { downloadFile } from '@/lib/utils';

interface ColorInfo {
  hex: string;
  rgb: string;
  hsl: string;
  count: number;
}

export default function ColorPaletteExtractor() {
  const [image, setImage] = useState<string | null>(null);
  const [colors, setColors] = useState<ColorInfo[]>([]);
  const [colorCount, setColorCount] = useState(5);
  const [loading, setLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
      extractColors(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const extractColors = (imageSrc: string) => {
    setLoading(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Resize for performance
      const maxSize = 300;
      let w = img.width;
      let h = img.height;

      if (w > h && w > maxSize) {
        h = (h * maxSize) / w;
        w = maxSize;
      } else if (h > maxSize) {
        w = (w * maxSize) / h;
        h = maxSize;
      }

      canvas.width = w;
      canvas.height = h;
      ctx.drawImage(img, 0, 0, w, h);

      const imageData = ctx.getImageData(0, 0, w, h);
      const pixels = imageData.data;

      // Count color occurrences
      const colorMap = new Map<string, number>();

      for (let i = 0; i < pixels.length; i += 4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];

        // Skip transparent pixels
        if (a < 128) continue;

        // Round colors to reduce variations
        const roundedR = Math.round(r / 10) * 10;
        const roundedG = Math.round(g / 10) * 10;
        const roundedB = Math.round(b / 10) * 10;

        const key = `${roundedR},${roundedG},${roundedB}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }

      // Sort by frequency and get top colors
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, colorCount)
        .map(([rgb, count]) => {
          const [r, g, b] = rgb.split(',').map(Number);
          return {
            hex: rgbToHex(r, g, b),
            rgb: `rgb(${r}, ${g}, ${b})`,
            hsl: rgbToHsl(r, g, b),
            count,
          };
        });

      setColors(sortedColors);
      setLoading(false);
    };
    img.src = imageSrc;
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  };

  const rgbToHsl = (r: number, g: number, b: number): string => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
  };

  const copyColor = (color: ColorInfo, format: 'hex' | 'rgb' | 'hsl') => {
    const value = format === 'hex' ? color.hex : format === 'rgb' ? color.rgb : color.hsl;
    navigator.clipboard.writeText(value);
    alert(`Copied ${value} to clipboard!`);
  };

  const exportPalette = () => {
    const paletteData = {
      colors: colors.map(c => ({
        hex: c.hex,
        rgb: c.rgb,
        hsl: c.hsl,
      })),
      extractedFrom: image,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' });
    downloadFile(blob, 'color-palette.json');
  };

  const generateGradient = () => {
    if (colors.length < 2) return '';
    return `linear-gradient(90deg, ${colors.map(c => c.hex).join(', ')})`;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 border border-fuchsia-300 dark:border-fuchsia-700 rounded-lg p-4">
        <p className="text-sm text-white font-medium">
          <strong>🎨 Color Palette Extractor:</strong> Extract dominant colors from images and generate color schemes
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4 bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-4">⚙️ Settings</h3>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Upload Image
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              {image ? '📷 Change Image' : '📁 Choose Image'}
            </button>
          </div>

          {image && (
            <>
              {/* Color Count */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Number of Colors: {colorCount}
                </label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  step="1"
                  value={colorCount}
                  onChange={(e) => {
                    setColorCount(Number(e.target.value));
                    if (image) extractColors(image);
                  }}
                  className="w-full"
                />
              </div>

              {loading && (
                <div className="text-center py-4">
                  <p className="text-white">⏳ Extracting colors...</p>
                </div>
              )}

              {!loading && colors.length > 0 && (
                <>
                  {/* Color Palette */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Extracted Colors
                    </label>
                    <div className="space-y-2">
                      {colors.map((color, i) => (
                        <div key={i} className="bg-white dark:bg-slate-700 rounded-lg overflow-hidden">
                          <div
                            className="h-16"
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className="p-3 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-mono text-gray-700 dark:text-gray-200">
                                {color.hex}
                              </span>
                              <button
                                onClick={() => copyColor(color, 'hex')}
                                className="px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded hover:bg-gray-300 dark:hover:bg-gray-500"
                              >
                                Copy HEX
                              </button>
                            </div>
                            <div className="flex gap-2 text-xs text-gray-600 dark:text-gray-300">
                              <button
                                onClick={() => copyColor(color, 'rgb')}
                                className="underline hover:text-gray-800 dark:hover:text-gray-100"
                              >
                                {color.rgb}
                              </button>
                              <button
                                onClick={() => copyColor(color, 'hsl')}
                                className="underline hover:text-gray-800 dark:hover:text-gray-100"
                              >
                                {color.hsl}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Gradient Preview */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Color Gradient
                    </label>
                    <div
                      className="h-20 rounded-lg"
                      style={{ background: generateGradient() }}
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generateGradient());
                        alert('Gradient CSS copied to clipboard!');
                      }}
                      className="w-full mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                    >
                      📋 Copy Gradient CSS
                    </button>
                  </div>

                  {/* Export */}
                  <button
                    onClick={exportPalette}
                    className="w-full px-6 py-3 bg-gradient-to-r from-fuchsia-600 to-pink-600 text-white rounded-lg hover:from-fuchsia-700 hover:to-pink-700 transition-colors font-medium shadow-lg"
                  >
                    💾 Export Palette (JSON)
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">👁️ Preview</h3>

          {image ? (
            <div className="bg-white dark:bg-slate-700 p-6 rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image}
                alt="Source"
                className="w-full border border-gray-300 dark:border-gray-600 rounded"
              />
            </div>
          ) : (
            <div className="bg-gray-200 dark:bg-gray-700 p-12 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Upload an image to extract color palette
              </p>
            </div>
          )}
        </div>
      </div>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
