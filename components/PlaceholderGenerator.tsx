'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { downloadFile } from '@/lib/utils';

type PatternType = 'solid' | 'gradient' | 'dots' | 'grid' | 'diagonal';

export default function PlaceholderGenerator() {
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(400);
  const [text, setText] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#CCCCCC');
  const [secondaryColor, setSecondaryColor] = useState('#999999');
  const [textColor, setTextColor] = useState('#333333');
  const [pattern, setPattern] = useState<PatternType>('solid');
  const [fontSize, setFontSize] = useState(32);
  const [showDimensions, setShowDimensions] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawPlaceholder = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Draw background pattern
    switch (pattern) {
      case 'solid':
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        break;
      case 'gradient':
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        gradient.addColorStop(0, backgroundColor);
        gradient.addColorStop(1, secondaryColor);
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
        break;
      case 'dots':
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = secondaryColor;
        for (let x = 10; x < width; x += 20) {
          for (let y = 10; y < height; y += 20) {
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        break;
      case 'grid':
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 1;
        for (let x = 0; x < width; x += 20) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, height);
          ctx.stroke();
        }
        for (let y = 0; y < height; y += 20) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(width, y);
          ctx.stroke();
        }
        break;
      case 'diagonal':
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        ctx.strokeStyle = secondaryColor;
        ctx.lineWidth = 2;
        for (let i = -height; i < width; i += 20) {
          ctx.beginPath();
          ctx.moveTo(i, 0);
          ctx.lineTo(i + height, height);
          ctx.stroke();
        }
        break;
    }

    // Draw text
    ctx.fillStyle = textColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const centerX = width / 2;
    const centerY = height / 2;

    // Draw custom text
    if (text) {
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillText(text, centerX, centerY);
    }

    // Draw dimensions
    if (showDimensions) {
      const dimText = `${width} × ${height}`;
      const dimFontSize = Math.min(fontSize * 0.7, 24);
      ctx.font = `${dimFontSize}px Arial`;
      const yOffset = text ? fontSize * 0.8 : 0;
      ctx.fillText(dimText, centerX, centerY + yOffset);
    }
  }, [width, height, text, backgroundColor, secondaryColor, textColor, pattern, fontSize, showDimensions]);

  useEffect(() => {
    drawPlaceholder();
  }, [drawPlaceholder]);

  const downloadPlaceholder = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        downloadFile(blob, `placeholder-${width}x${height}.png`);
      }
    });
  };

  const copyAsDataURL = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL();
    navigator.clipboard.writeText(dataURL);
    alert('Data URL copied to clipboard!');
  };

  const presets = [
    { name: 'Banner', width: 1200, height: 300 },
    { name: 'Square', width: 600, height: 600 },
    { name: 'Portrait', width: 400, height: 600 },
    { name: 'Landscape', width: 800, height: 450 },
    { name: 'Instagram', width: 1080, height: 1080 },
    { name: 'Facebook', width: 1200, height: 630 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-300 dark:border-teal-700 rounded-lg p-4">
        <p className="text-sm text-white font-medium">
          <strong>🖼️ Placeholder Generator:</strong> Create custom placeholder images with text, colors, and patterns
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4 bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-4">⚙️ Settings</h3>

          {/* Presets */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Quick Presets
            </label>
            <div className="grid grid-cols-3 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => {
                    setWidth(preset.width);
                    setHeight(preset.height);
                  }}
                  className="px-3 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm"
                >
                  {preset.name}
                </button>
              ))}
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
                min="50"
                max="2000"
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
                min="50"
                max="2000"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full p-2 border rounded-lg text-gray-700"
              />
            </div>
          </div>

          {/* Text */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Custom Text (Optional)
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text..."
              className="w-full p-3 border rounded-lg text-gray-700"
            />
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Font Size: {fontSize}px
            </label>
            <input
              type="range"
              min="16"
              max="72"
              step="4"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full"
            />
          </div>

          {/* Pattern */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Background Pattern
            </label>
            <select
              value={pattern}
              onChange={(e) => setPattern(e.target.value as PatternType)}
              className="w-full p-3 border rounded-lg text-gray-700"
            >
              <option value="solid">Solid Color</option>
              <option value="gradient">Gradient</option>
              <option value="dots">Dots</option>
              <option value="grid">Grid</option>
              <option value="diagonal">Diagonal Lines</option>
            </select>
          </div>

          {/* Colors */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Primary Color
              </label>
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
                className="w-full h-12 rounded cursor-pointer"
              />
            </div>

            {pattern !== 'solid' && (
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Pattern Color
                </label>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full h-12 rounded cursor-pointer"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Text Color
              </label>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-full h-12 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="showDimensions"
              checked={showDimensions}
              onChange={(e) => setShowDimensions(e.target.checked)}
              className="w-5 h-5 rounded"
            />
            <label htmlFor="showDimensions" className="text-sm text-white">
              Show dimensions on image
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={downloadPlaceholder}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-lg hover:from-teal-700 hover:to-cyan-700 transition-colors font-medium shadow-lg"
            >
              💾 Download
            </button>
            <button
              onClick={copyAsDataURL}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              📋 Copy URL
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">👁️ Preview</h3>

          <div className="bg-white dark:bg-slate-700 p-6 rounded-lg">
            <canvas
              ref={canvasRef}
              className="w-full border border-gray-300 dark:border-gray-600 rounded"
              style={{ maxHeight: '600px', objectFit: 'contain' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
