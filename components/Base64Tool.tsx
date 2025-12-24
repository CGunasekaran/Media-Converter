'use client';

import { useState, useRef } from 'react';
import { downloadFile } from '@/lib/utils';

type Mode = 'encode' | 'decode';

export default function Base64Tool() {
  const [mode, setMode] = useState<Mode>('encode');
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [base64String, setBase64String] = useState('');
  const [decodedImage, setDecodedImage] = useState<string | null>(null);
  const [imageInfo, setImageInfo] = useState<{ width: number; height: number; size: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setSourceImage(dataUrl);
      setBase64String(dataUrl);

      // Get image info
      const img = new Image();
      img.onload = () => {
        setImageInfo({
          width: img.width,
          height: img.height,
          size: file.size
        });
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  };

  const handleBase64Input = (value: string) => {
    setBase64String(value);
    
    // Try to decode and display image
    if (value.startsWith('data:image') || value.match(/^[A-Za-z0-9+/]+=*$/)) {
      try {
        const dataUrl = value.startsWith('data:') ? value : `data:image/png;base64,${value}`;
        const img = new Image();
        img.onload = () => {
          setDecodedImage(dataUrl);
          setImageInfo({
            width: img.width,
            height: img.height,
            size: Math.round((value.length * 3) / 4)
          });
        };
        img.onerror = () => {
          setDecodedImage(null);
          setImageInfo(null);
        };
        img.src = dataUrl;
      } catch {
        setDecodedImage(null);
        setImageInfo(null);
      }
    }
  };

  const downloadDecodedImage = () => {
    if (!decodedImage) return;
    
    const blob = dataURLtoBlob(decodedImage);
    const extension = decodedImage.includes('image/png') ? 'png' : 
                     decodedImage.includes('image/jpeg') ? 'jpg' : 
                     decodedImage.includes('image/webp') ? 'webp' : 'png';
    downloadFile(blob, `decoded-image.${extension}`);
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

  const copyBase64 = () => {
    if (!base64String) return;
    navigator.clipboard.writeText(base64String);
    alert('Base64 string copied to clipboard!');
  };

  const copyBase64Only = () => {
    if (!base64String) return;
    const base64Only = base64String.split(',')[1] || base64String;
    navigator.clipboard.writeText(base64Only);
    alert('Base64 (without data URI) copied to clipboard!');
  };

  const copyHTMLImg = () => {
    if (!base64String) return;
    const html = `<img src="${base64String}" alt="Image" />`;
    navigator.clipboard.writeText(html);
    alert('HTML img tag copied to clipboard!');
  };

  const copyCSSBackground = () => {
    if (!base64String) return;
    const css = `background-image: url('${base64String}');`;
    navigator.clipboard.writeText(css);
    alert('CSS background code copied to clipboard!');
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const getBase64Length = (): number => {
    if (!base64String) return 0;
    const base64Only = base64String.split(',')[1] || base64String;
    return base64Only.length;
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-300 dark:border-orange-700 rounded-lg p-4">
        <p className="text-sm text-white font-medium">
          <strong>🔐 Base64 Encoder/Decoder:</strong> Convert images to Base64 strings and decode Base64 back to images
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4 bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-4">⚙️ Mode Selection</h3>

          {/* Mode Tabs */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                setMode('encode');
                setBase64String('');
                setDecodedImage(null);
              }}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                mode === 'encode'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              📤 Encode Image
            </button>
            <button
              onClick={() => {
                setMode('decode');
                setSourceImage(null);
                setImageInfo(null);
              }}
              className={`px-4 py-3 rounded-lg font-medium transition-colors ${
                mode === 'decode'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
              }`}
            >
              📥 Decode Base64
            </button>
          </div>

          {mode === 'encode' ? (
            <>
              {/* Encode Mode */}
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
                  className="w-full px-4 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 transition-colors font-medium shadow-lg"
                >
                  {sourceImage ? '📁 Change Image' : '📁 Choose Image'}
                </button>
              </div>

              {sourceImage && (
                <>
                  {/* Image Info */}
                  {imageInfo && (
                    <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Dimensions:</strong> {imageInfo.width} × {imageInfo.height}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Size:</strong> {formatBytes(imageInfo.size)}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Base64 Length:</strong> {getBase64Length().toLocaleString()} chars
                      </p>
                    </div>
                  )}

                  {/* Base64 Output */}
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">
                      Base64 String:
                    </label>
                    <textarea
                      value={base64String}
                      readOnly
                      className="w-full h-32 p-3 border rounded-lg text-xs font-mono text-gray-700 resize-none"
                      placeholder="Base64 will appear here..."
                    />
                  </div>

                  {/* Copy Buttons */}
                  <div className="space-y-2">
                    <button
                      onClick={copyBase64}
                      className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
                    >
                      📋 Copy Full Data URI
                    </button>
                    <button
                      onClick={copyBase64Only}
                      className="w-full px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm"
                    >
                      📋 Copy Base64 Only
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={copyHTMLImg}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs"
                      >
                        📋 HTML &lt;img&gt;
                      </button>
                      <button
                        onClick={copyCSSBackground}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs"
                      >
                        📋 CSS bg
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : (
            <>
              {/* Decode Mode */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Paste Base64 String:
                </label>
                <textarea
                  value={base64String}
                  onChange={(e) => handleBase64Input(e.target.value)}
                  className="w-full h-48 p-3 border rounded-lg text-xs font-mono text-gray-700 resize-none"
                  placeholder="Paste Base64 string here (with or without data URI prefix)..."
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Accepts: data:image/png;base64,... or just the Base64 string
                </p>
              </div>

              {decodedImage && (
                <>
                  {/* Decoded Image Info */}
                  {imageInfo && (
                    <div className="p-3 bg-gray-100 dark:bg-slate-700 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Dimensions:</strong> {imageInfo.width} × {imageInfo.height}
                      </p>
                      <p className="text-sm text-gray-700 dark:text-gray-300">
                        <strong>Estimated Size:</strong> {formatBytes(imageInfo.size)}
                      </p>
                    </div>
                  )}

                  <button
                    onClick={downloadDecodedImage}
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg hover:from-orange-700 hover:to-amber-700 transition-colors font-medium shadow-lg"
                  >
                    💾 Download Decoded Image
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">👁️ Preview</h3>

          {mode === 'encode' && sourceImage ? (
            <div className="bg-white dark:bg-slate-700 p-6 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-medium">
                Source Image:
              </p>
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sourceImage}
                  alt="Source"
                  className="max-w-full max-h-[400px] border border-gray-300 dark:border-gray-600 rounded"
                />
              </div>
            </div>
          ) : mode === 'decode' && decodedImage ? (
            <div className="bg-white dark:bg-slate-700 p-6 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-medium">
                Decoded Image:
              </p>
              <div className="flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={decodedImage}
                  alt="Decoded"
                  className="max-w-full max-h-[400px] border border-gray-300 dark:border-gray-600 rounded"
                />
              </div>
            </div>
          ) : (
            <div className="bg-gray-200 dark:bg-gray-700 p-12 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {mode === 'encode' ? '📤 No image uploaded yet' : '📥 No Base64 string decoded yet'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {mode === 'encode' 
                  ? 'Upload an image to encode it to Base64' 
                  : 'Paste a Base64 string to decode it'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Information */}
      <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
        <h3 className="text-lg font-bold text-white mb-4">💡 Base64 Usage</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">✅ Good For</h4>
            <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-xs">
              <li>• Small images (icons, logos)</li>
              <li>• Inline CSS/HTML</li>
              <li>• Email templates</li>
              <li>• Reducing HTTP requests</li>
              <li>• Data URIs in code</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">❌ Avoid For</h4>
            <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-xs">
              <li>• Large images (&gt;10KB)</li>
              <li>• Photos and screenshots</li>
              <li>• Images that change often</li>
              <li>• SEO-important images</li>
              <li>• Performance-critical pages</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-orange-600 dark:text-orange-400 mb-2">📊 Trade-offs</h4>
            <ul className="text-gray-700 dark:text-gray-300 space-y-1 text-xs">
              <li>• +33% larger than binary</li>
              <li>• Cannot be cached separately</li>
              <li>• Increases HTML/CSS size</li>
              <li>• No progressive loading</li>
              <li>• Not crawlable by search engines</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
