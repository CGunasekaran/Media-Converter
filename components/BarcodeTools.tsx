'use client';

import { useState, useRef, useEffect } from 'react';
import JsBarcode from 'jsbarcode';
import jsQR from 'jsqr';
import { downloadFile } from '@/lib/utils';

const BARCODE_FORMATS = [
  { value: 'CODE128', label: 'CODE128 (Default)' },
  { value: 'EAN13', label: 'EAN-13 (13 digits)' },
  { value: 'EAN8', label: 'EAN-8 (8 digits)' },
  { value: 'UPC', label: 'UPC (12 digits)' },
  { value: 'CODE39', label: 'CODE39' },
  { value: 'ITF14', label: 'ITF-14 (14 digits)' },
  { value: 'MSI', label: 'MSI' },
  { value: 'pharmacode', label: 'Pharmacode' },
];

export default function BarcodeTools() {
  const [mode, setMode] = useState<'generate' | 'scan'>('generate');
  const [text, setText] = useState('');
  const [format, setFormat] = useState('CODE128');
  const [barcodeGenerated, setBarcodeGenerated] = useState(false);
  const [scannedText, setScannedText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customization options
  const [width, setWidth] = useState(2);
  const [height, setHeight] = useState(100);
  const [displayValue, setDisplayValue] = useState(true);
  const [lineColor, setLineColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');

  const barcodeCanvasRef = useRef<HTMLCanvasElement>(null);
  const scanCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateBarcode = () => {
    if (!text.trim()) {
      setError('Please enter text');
      return;
    }

    setError(null);
    try {
      const canvas = barcodeCanvasRef.current;
      if (!canvas) return;

      JsBarcode(canvas, text, {
        format: format,
        width: width,
        height: height,
        displayValue: displayValue,
        lineColor: lineColor,
        background: backgroundColor,
        margin: 10,
      });

      setBarcodeGenerated(true);
    } catch (err) {
      setError(`Failed to generate barcode: ${(err as Error).message}`);
      setBarcodeGenerated(false);
    }
  };

  const downloadBarcode = () => {
    const canvas = barcodeCanvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (blob) {
        downloadFile(blob, 'barcode.png');
      }
    });
  };

  const scanBarcode = async (file: File) => {
    setLoading(true);
    setScannedText(null);
    setError(null);

    try {
      const image = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        image.onload = () => {
          const canvas = scanCanvasRef.current;
          if (!canvas) return;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          canvas.width = image.width;
          canvas.height = image.height;
          ctx.drawImage(image, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);

          if (code) {
            setScannedText(code.data);
          } else {
            setError('No barcode/QR code found in the image');
          }
          setLoading(false);
        };
        image.src = e.target?.result as string;
      };

      reader.readAsDataURL(file);
    } catch {
      setError('Failed to scan barcode');
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      scanBarcode(file);
    }
  };

  // Auto-generate on text change
  useEffect(() => {
    if (text.trim() && mode === 'generate') {
      const timer = setTimeout(() => {
        generateBarcode();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, format, width, height, displayValue, lineColor, backgroundColor, mode]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
        <p className="text-sm text-white font-medium">
          <strong>📊 Barcode Tools:</strong> Generate various barcode formats or scan barcodes from images
        </p>
      </div>

      {/* Mode Selection */}
      <div className="flex gap-4">
        <button
          onClick={() => setMode('generate')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
            mode === 'generate'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          🎨 Generate Barcode
        </button>
        <button
          onClick={() => setMode('scan')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
            mode === 'scan'
              ? 'bg-blue-600 text-white shadow-lg'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          }`}
        >
          🔍 Scan Barcode
        </button>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-400 text-white p-4 rounded-lg">
          ⚠️ {error}
        </div>
      )}

      {mode === 'generate' ? (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Generator Controls */}
          <div className="space-y-4 bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4">⚙️ Barcode Settings</h3>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Barcode Format
              </label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value)}
                className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
              >
                {BARCODE_FORMATS.map((fmt) => (
                  <option key={fmt.value} value={fmt.value}>
                    {fmt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Enter Text/Number
              </label>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="e.g., 1234567890"
                className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-300 mt-1">
                {format === 'EAN13' && 'Enter 12 or 13 digits'}
                {format === 'EAN8' && 'Enter 7 or 8 digits'}
                {format === 'UPC' && 'Enter 11 or 12 digits'}
                {format === 'ITF14' && 'Enter 13 or 14 digits'}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Line Width: {width}
                </label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Height: {height}px
                </label>
                <input
                  type="range"
                  min="50"
                  max="200"
                  step="10"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Line Color
                </label>
                <input
                  type="color"
                  value={lineColor}
                  onChange={(e) => setLineColor(e.target.value)}
                  className="w-full h-12 rounded cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Background
                </label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className="w-full h-12 rounded cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="displayValue"
                checked={displayValue}
                onChange={(e) => setDisplayValue(e.target.checked)}
                className="w-5 h-5 rounded"
              />
              <label htmlFor="displayValue" className="text-sm text-white">
                Show text below barcode
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">📊 Preview</h3>
            {text.trim() ? (
              <div className="bg-white dark:bg-slate-700 p-6 rounded-lg">
                <canvas
                  ref={barcodeCanvasRef}
                  className="w-full max-w-md mx-auto"
                  style={{ display: barcodeGenerated ? 'block' : 'none' }}
                />
                {barcodeGenerated && (
                  <button
                    onClick={downloadBarcode}
                    className="w-full mt-4 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    💾 Download Barcode
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-gray-200 dark:bg-gray-700 p-12 rounded-lg text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  Your barcode will appear here
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Scanner */}
          <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
            <h3 className="text-lg font-bold text-white mb-4">📷 Upload Image to Scan</h3>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              📁 Select Image with Barcode
            </button>
          </div>

          {loading && (
            <div className="text-center py-8">
              <p className="text-white">⏳ Scanning...</p>
            </div>
          )}

          {scannedText && (
            <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
              <h3 className="text-lg font-bold text-white mb-4">✅ Scanned Result</h3>
              <div className="bg-white dark:bg-slate-700 p-4 rounded">
                <p className="text-gray-700 dark:text-gray-200 break-all">{scannedText}</p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(scannedText);
                  alert('Copied to clipboard!');
                }}
                className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                📋 Copy to Clipboard
              </button>
            </div>
          )}
        </div>
      )}

      <canvas ref={scanCanvasRef} style={{ display: 'none' }} />
    </div>
  );
}
