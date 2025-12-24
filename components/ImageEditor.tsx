'use client';

import { useState, useRef } from 'react';
import { downloadFile } from '@/lib/utils';

type FilterType = 'none' | 'grayscale' | 'sepia' | 'blur' | 'brightness' | 'contrast' | 'invert';

export default function ImageEditor() {
  const [image, setImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [filter, setFilter] = useState<FilterType>('none');
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [blur, setBlur] = useState(0);
  const [quality, setQuality] = useState(90);
  const [watermarkText, setWatermarkText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

  const applyEdits = async () => {
    if (!image) return;
    setLoading(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        // Set canvas size
        canvas.width = img.width;
        canvas.height = img.height;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Save context state
        ctx.save();

        // Apply transformations
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);

        // Apply filters
        const filters = [];
        if (filter === 'grayscale') filters.push('grayscale(100%)');
        if (filter === 'sepia') filters.push('sepia(100%)');
        if (filter === 'invert') filters.push('invert(100%)');
        if (brightness !== 100) filters.push(`brightness(${brightness}%)`);
        if (contrast !== 100) filters.push(`contrast(${contrast}%)`);
        if (blur > 0) filters.push(`blur(${blur}px)`);
        
        ctx.filter = filters.join(' ');

        // Draw image
        ctx.drawImage(img, 0, 0);

        // Add watermark if provided
        if (watermarkText) {
          ctx.filter = 'none';
          ctx.font = '30px Arial';
          ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
          ctx.textAlign = 'right';
          ctx.textBaseline = 'bottom';
          ctx.fillText(watermarkText, canvas.width - 20, canvas.height - 20);
        }

        // Restore context state
        ctx.restore();

        // Get processed image
        const processed = canvas.toDataURL('image/jpeg', quality / 100);
        setProcessedImage(processed);
        setLoading(false);
      };
      img.src = image;
    } catch (error) {
      console.error('Error processing image:', error);
      setLoading(false);
    }
  };

  const downloadImage = () => {
    if (!processedImage) return;
    
    fetch(processedImage)
      .then(res => res.blob())
      .then(blob => {
        downloadFile(blob, 'edited-image.jpg');
      });
  };

  const resetAll = () => {
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setFilter('none');
    setBrightness(100);
    setContrast(100);
    setBlur(0);
    setQuality(90);
    setWatermarkText('');
    setProcessedImage(null);
  };

  return (
    <div className="space-y-6">
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
            <h3 className="text-lg font-bold text-white mb-4">✨ Edit Controls</h3>

            {/* Transform */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white">🔄 Transform</h4>
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Rotation: {rotation}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setFlipH(!flipH)}
                  className={`flex-1 px-4 py-2 rounded ${flipH ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  ↔️ Flip H
                </button>
                <button
                  onClick={() => setFlipV(!flipV)}
                  className={`flex-1 px-4 py-2 rounded ${flipV ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-700'}`}
                >
                  ↕️ Flip V
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white">🎨 Filters</h4>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as FilterType)}
                className="w-full p-2 border rounded text-gray-700"
              >
                <option value="none">None</option>
                <option value="grayscale">Grayscale</option>
                <option value="sepia">Sepia</option>
                <option value="invert">Invert</option>
              </select>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Brightness: {brightness}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Contrast: {contrast}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Blur: {blur}px
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={blur}
                  onChange={(e) => setBlur(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            {/* Watermark */}
            <div className="space-y-3">
              <h4 className="font-semibold text-white">💧 Watermark</h4>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                placeholder="Enter watermark text"
                className="w-full p-2 border rounded text-gray-700"
              />
            </div>

            {/* Quality */}
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Quality: {quality}%
              </label>
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={applyEdits}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
              >
                {loading ? '⏳ Processing...' : '✅ Apply Edits'}
              </button>
              <button
                onClick={resetAll}
                className="px-4 py-3 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                🔄 Reset
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">📷 Original</h3>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="Original" className="w-full rounded-lg shadow-lg" />
            </div>

            {processedImage && (
              <div>
                <h3 className="text-lg font-bold text-white mb-2">✨ Edited</h3>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={processedImage} alt="Processed" className="w-full rounded-lg shadow-lg" />
                <button
                  onClick={downloadImage}
                  className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
                >
                  💾 Download Edited Image
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
}
