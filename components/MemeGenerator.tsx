'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { downloadFile } from '@/lib/utils';

const FONTS = [
  { value: 'Impact', label: 'Impact (Classic)' },
  { value: 'Arial Black', label: 'Arial Black' },
  { value: 'Comic Sans MS', label: 'Comic Sans MS' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
];

export default function MemeGenerator() {
  const [image, setImage] = useState<string | null>(null);
  const [topText, setTopText] = useState('');
  const [bottomText, setBottomText] = useState('');
  const [font, setFont] = useState('Impact');
  const [fontSize, setFontSize] = useState(48);
  const [textColor, setTextColor] = useState('#FFFFFF');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawMeme = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      // Set canvas size to image size
      canvas.width = img.width;
      canvas.height = img.height;

      // Draw image
      ctx.drawImage(img, 0, 0);

      // Configure text style
      ctx.font = `bold ${fontSize}px ${font}`;
      ctx.fillStyle = textColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = strokeWidth;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';

      const centerX = canvas.width / 2;
      const padding = 20;

      // Draw top text
      if (topText) {
        const topY = padding;
        ctx.strokeText(topText.toUpperCase(), centerX, topY);
        ctx.fillText(topText.toUpperCase(), centerX, topY);
      }

      // Draw bottom text
      if (bottomText) {
        ctx.textBaseline = 'bottom';
        const bottomY = canvas.height - padding;
        ctx.strokeText(bottomText.toUpperCase(), centerX, bottomY);
        ctx.fillText(bottomText.toUpperCase(), centerX, bottomY);
      }
    };
    img.src = image;
  }, [image, topText, bottomText, font, fontSize, textColor, strokeColor, strokeWidth]);

  useEffect(() => {
    if (image) {
      drawMeme();
    }
  }, [image, drawMeme]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const downloadMeme = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        downloadFile(blob, 'meme.png');
      }
    });
  };

  const resetMeme = () => {
    setImage(null);
    setTopText('');
    setBottomText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 border border-pink-300 dark:border-pink-700 rounded-lg p-4">
        <p className="text-sm text-white font-medium">
          <strong>😂 Meme Generator:</strong> Create hilarious memes with custom text, fonts, and styles
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4 bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-4">⚙️ Meme Settings</h3>

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
              {/* Text Inputs */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Top Text
                </label>
                <input
                  type="text"
                  value={topText}
                  onChange={(e) => setTopText(e.target.value)}
                  placeholder="Enter top text..."
                  className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-pink-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Bottom Text
                </label>
                <input
                  type="text"
                  value={bottomText}
                  onChange={(e) => setBottomText(e.target.value)}
                  placeholder="Enter bottom text..."
                  className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-pink-500"
                />
              </div>

              {/* Font Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Font
                </label>
                <select
                  value={font}
                  onChange={(e) => setFont(e.target.value)}
                  className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-pink-500"
                >
                  {FONTS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Font Size: {fontSize}px
                </label>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="2"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
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

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Outline Color
                  </label>
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => setStrokeColor(e.target.value)}
                    className="w-full h-12 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Stroke Width */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Outline Width: {strokeWidth}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={strokeWidth}
                  onChange={(e) => setStrokeWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={downloadMeme}
                  disabled={!topText && !bottomText}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-700 hover:to-rose-700 transition-colors font-medium disabled:opacity-50 shadow-lg"
                >
                  💾 Download Meme
                </button>
                <button
                  onClick={resetMeme}
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

          {image ? (
            <div className="bg-white dark:bg-slate-700 p-6 rounded-lg">
              <canvas
                ref={canvasRef}
                className="w-full border border-gray-300 dark:border-gray-600 rounded"
              />
            </div>
          ) : (
            <div className="bg-gray-200 dark:bg-gray-700 p-12 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400">
                Upload an image to start creating your meme
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
