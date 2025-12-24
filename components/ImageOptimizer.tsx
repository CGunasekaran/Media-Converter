'use client';

import { useState, useRef } from 'react';
import { downloadFile } from '@/lib/utils';

interface OptimizedImage {
  format: string;
  size: number;
  width: number;
  height: number;
  dataUrl: string;
  quality: number;
}

interface ResponsiveSet {
  width: number;
  dataUrl: string;
  size: number;
}

export default function ImageOptimizer() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number>(0);
  const [optimizedImages, setOptimizedImages] = useState<OptimizedImage[]>([]);
  const [responsiveSets, setResponsiveSets] = useState<ResponsiveSet[]>([]);
  const [quality, setQuality] = useState(85);
  const [targetFormat, setTargetFormat] = useState<'webp' | 'jpg' | 'png'>('webp');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generateResponsive, setGenerateResponsive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const responsiveWidths = [320, 640, 768, 1024, 1280, 1920];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalSize(file.size);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceImage(event.target?.result as string);
      setOptimizedImages([]);
      setResponsiveSets([]);
    };
    reader.readAsDataURL(file);
  };

  const optimizeImage = async (
    img: HTMLImageElement,
    format: string,
    quality: number,
    targetWidth?: number
  ): Promise<{ dataUrl: string; size: number; width: number; height: number }> => {
    return new Promise((resolve) => {
      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ dataUrl: '', size: 0, width: 0, height: 0 });
        return;
      }

      const width = targetWidth || img.width;
      const height = (img.height * width) / img.width;

      canvas.width = width;
      canvas.height = height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, width, height);

      const mimeType = format === 'webp' ? 'image/webp' : 
                       format === 'jpg' ? 'image/jpeg' : 
                       'image/png';

      const dataUrl = canvas.toDataURL(mimeType, quality / 100);
      
      // Calculate approximate size
      const base64Length = dataUrl.split(',')[1].length;
      const size = Math.round((base64Length * 3) / 4);

      resolve({ dataUrl, size, width, height });
    });
  };

  const processImage = async () => {
    if (!sourceImage) return;

    setIsProcessing(true);
    const img = new Image();
    img.src = sourceImage;

    img.onload = async () => {
      const optimized: OptimizedImage[] = [];

      // Generate WebP
      const webp = await optimizeImage(img, 'webp', quality);
      optimized.push({
        format: 'webp',
        size: webp.size,
        width: webp.width,
        height: webp.height,
        dataUrl: webp.dataUrl,
        quality
      });

      // Generate fallback JPG
      const jpg = await optimizeImage(img, 'jpg', quality);
      optimized.push({
        format: 'jpg',
        size: jpg.size,
        width: jpg.width,
        height: jpg.height,
        dataUrl: jpg.dataUrl,
        quality
      });

      // Generate fallback PNG if selected format is PNG
      if (targetFormat === 'png') {
        const png = await optimizeImage(img, 'png', 100);
        optimized.push({
          format: 'png',
          size: png.size,
          width: png.width,
          height: png.height,
          dataUrl: png.dataUrl,
          quality: 100
        });
      }

      setOptimizedImages(optimized);

      // Generate responsive sets if enabled
      if (generateResponsive) {
        const responsive: ResponsiveSet[] = [];
        
        for (const width of responsiveWidths) {
          if (width < img.width) {
            const result = await optimizeImage(img, targetFormat, quality, width);
            responsive.push({
              width,
              dataUrl: result.dataUrl,
              size: result.size
            });
          }
        }
        
        setResponsiveSets(responsive);
      }

      setIsProcessing(false);
    };
  };

  const downloadOptimized = (image: OptimizedImage) => {
    const blob = dataURLtoBlob(image.dataUrl);
    downloadFile(blob, `optimized.${image.format}`);
  };

  const downloadResponsive = (item: ResponsiveSet) => {
    const blob = dataURLtoBlob(item.dataUrl);
    downloadFile(blob, `responsive-${item.width}w.${targetFormat}`);
  };

  const dataURLtoBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getSavingsPercent = (original: number, optimized: number): number => {
    return Math.round(((original - optimized) / original) * 100);
  };

  const copyPictureElement = () => {
    const webpImage = optimizedImages.find(img => img.format === 'webp');
    const fallbackImage = optimizedImages.find(img => img.format === 'jpg');
    
    if (!webpImage || !fallbackImage) return;

    const html = `<picture>
  <source srcset="image.webp" type="image/webp">
  <source srcset="image.jpg" type="image/jpeg">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>`;

    navigator.clipboard.writeText(html);
    alert('HTML picture element copied to clipboard!');
  };

  const copyResponsiveSrcset = () => {
    if (responsiveSets.length === 0) return;

    const srcset = responsiveSets
      .map(item => `image-${item.width}w.${targetFormat} ${item.width}w`)
      .join(',\n  ');

    const html = `<img
  srcset="${srcset}"
  sizes="(max-width: 640px) 100vw,
         (max-width: 1024px) 50vw,
         33vw"
  src="image-${responsiveSets[0].width}w.${targetFormat}"
  alt="Description"
  loading="lazy">`;

    navigator.clipboard.writeText(html);
    alert('Responsive srcset HTML copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-300 dark:border-green-700 rounded-lg p-4">
        <p className="text-sm text-white font-medium">
          <strong>🚀 Image Optimizer:</strong> Optimize images for web, generate responsive sets, and convert to WebP with fallbacks
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4 bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-4">⚙️ Optimization Settings</h3>

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
              className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-medium shadow-lg"
            >
              {sourceImage ? '📁 Change Image' : '📁 Choose Image'}
            </button>
            {originalSize > 0 && (
              <p className="text-xs text-gray-400 dark:text-gray-300 mt-2">
                Original size: {formatBytes(originalSize)}
              </p>
            )}
          </div>

          {sourceImage && (
            <>
              {/* Quality Slider */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Quality: {quality}%
                </label>
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Lower quality = smaller file size
                </p>
              </div>

              {/* Target Format */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Target Format
                </label>
                <select
                  value={targetFormat}
                  onChange={(e) => setTargetFormat(e.target.value as 'webp' | 'jpg' | 'png')}
                  className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-green-500"
                >
                  <option value="webp">WebP (Best compression)</option>
                  <option value="jpg">JPG (Compatible)</option>
                  <option value="png">PNG (Lossless)</option>
                </select>
              </div>

              {/* Generate Responsive */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="responsive"
                  checked={generateResponsive}
                  onChange={(e) => setGenerateResponsive(e.target.checked)}
                  className="w-4 h-4"
                />
                <label htmlFor="responsive" className="text-sm text-white cursor-pointer">
                  Generate responsive image sets (320w, 640w, 768w, 1024w, 1280w, 1920w)
                </label>
              </div>

              {/* Optimize Button */}
              <button
                onClick={processImage}
                disabled={isProcessing}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-medium shadow-lg disabled:opacity-50"
              >
                {isProcessing ? '⏳ Processing...' : '🚀 Optimize Image'}
              </button>

              {/* Results */}
              {optimizedImages.length > 0 && (
                <div className="pt-4 border-t border-gray-300 dark:border-gray-600 space-y-2">
                  <p className="text-sm text-white font-semibold mb-3">
                    ✅ Optimized Results:
                  </p>

                  <button
                    onClick={copyPictureElement}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                  >
                    📋 Copy HTML Picture Element
                  </button>

                  {responsiveSets.length > 0 && (
                    <button
                      onClick={copyResponsiveSrcset}
                      className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      📋 Copy Responsive Srcset
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Preview & Results */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">👁️ Results</h3>

          {sourceImage ? (
            <div className="space-y-4">
              {/* Optimized Images */}
              {optimizedImages.length > 0 && (
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-medium">
                    Optimized Versions:
                  </p>
                  <div className="space-y-3">
                    {optimizedImages.map((img, index) => (
                      <div 
                        key={index}
                        className="p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase">
                              {img.format}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {img.width} × {img.height}
                            </p>
                          </div>
                          <button
                            onClick={() => downloadOptimized(img)}
                            className="px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-xs font-medium"
                          >
                            💾 Download
                          </button>
                        </div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-600 dark:text-gray-400">
                            Size: {formatBytes(img.size)}
                          </span>
                          {originalSize > 0 && (
                            <span className="text-green-600 dark:text-green-400 font-semibold">
                              ({getSavingsPercent(originalSize, img.size)}% smaller)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Responsive Sets */}
              {responsiveSets.length > 0 && (
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg max-h-[400px] overflow-y-auto">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-medium">
                    Responsive Image Sets:
                  </p>
                  <div className="space-y-2">
                    {responsiveSets.map((item, index) => (
                      <div 
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-slate-800 rounded"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {item.width}w
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatBytes(item.size)}
                          </p>
                        </div>
                        <button
                          onClick={() => downloadResponsive(item)}
                          className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                        >
                          💾 Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-200 dark:bg-gray-700 p-12 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                🚀 No image uploaded yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Upload an image to start optimizing
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Information */}
      <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
        <h3 className="text-lg font-bold text-white mb-4">💡 Optimization Tips</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">🎯 WebP Format</h4>
            <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-xs">
              <li>• 25-35% smaller than JPG</li>
              <li>• Supports transparency</li>
              <li>• Modern browser support</li>
              <li>• Best for web performance</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">📱 Responsive Images</h4>
            <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-xs">
              <li>• Serve right size per device</li>
              <li>• Reduces bandwidth usage</li>
              <li>• Faster page load times</li>
              <li>• Better mobile experience</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-green-600 dark:text-green-400 mb-2">🔄 Fallbacks</h4>
            <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-xs">
              <li>• Use &lt;picture&gt; element</li>
              <li>• JPG fallback for old browsers</li>
              <li>• Progressive enhancement</li>
              <li>• Cross-browser compatible</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
