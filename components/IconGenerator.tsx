"use client";

import { useState, useRef } from "react";
import { downloadFile } from "@/lib/utils";

interface IconSize {
  name: string;
  size: number;
  platform: "favicon" | "ios" | "android" | "pwa";
  filename: string;
}

const ICON_SIZES: IconSize[] = [
  // Favicons
  {
    name: "Favicon 16x16",
    size: 16,
    platform: "favicon",
    filename: "favicon-16x16.png",
  },
  {
    name: "Favicon 32x32",
    size: 32,
    platform: "favicon",
    filename: "favicon-32x32.png",
  },
  {
    name: "Favicon 48x48",
    size: 48,
    platform: "favicon",
    filename: "favicon-48x48.png",
  },
  {
    name: "Favicon 64x64",
    size: 64,
    platform: "favicon",
    filename: "favicon-64x64.png",
  },

  // iOS App Icons
  {
    name: "iOS 180x180 (iPhone)",
    size: 180,
    platform: "ios",
    filename: "apple-touch-icon-180x180.png",
  },
  {
    name: "iOS 167x167 (iPad Pro)",
    size: 167,
    platform: "ios",
    filename: "apple-touch-icon-167x167.png",
  },
  {
    name: "iOS 152x152 (iPad)",
    size: 152,
    platform: "ios",
    filename: "apple-touch-icon-152x152.png",
  },
  {
    name: "iOS 120x120 (iPhone)",
    size: 120,
    platform: "ios",
    filename: "apple-touch-icon-120x120.png",
  },
  {
    name: "iOS 87x87 (iPhone)",
    size: 87,
    platform: "ios",
    filename: "apple-touch-icon-87x87.png",
  },
  {
    name: "iOS 80x80 (iPhone)",
    size: 80,
    platform: "ios",
    filename: "apple-touch-icon-80x80.png",
  },
  {
    name: "iOS 76x76 (iPad)",
    size: 76,
    platform: "ios",
    filename: "apple-touch-icon-76x76.png",
  },
  {
    name: "iOS 60x60",
    size: 60,
    platform: "ios",
    filename: "apple-touch-icon-60x60.png",
  },

  // Android App Icons
  {
    name: "Android 512x512",
    size: 512,
    platform: "android",
    filename: "android-chrome-512x512.png",
  },
  {
    name: "Android 192x192",
    size: 192,
    platform: "android",
    filename: "android-chrome-192x192.png",
  },
  {
    name: "Android 144x144",
    size: 144,
    platform: "android",
    filename: "android-chrome-144x144.png",
  },
  {
    name: "Android 96x96",
    size: 96,
    platform: "android",
    filename: "android-chrome-96x96.png",
  },
  {
    name: "Android 72x72",
    size: 72,
    platform: "android",
    filename: "android-chrome-72x72.png",
  },
  {
    name: "Android 48x48",
    size: 48,
    platform: "android",
    filename: "android-chrome-48x48.png",
  },

  // PWA
  {
    name: "PWA 512x512",
    size: 512,
    platform: "pwa",
    filename: "pwa-512x512.png",
  },
  {
    name: "PWA 192x192",
    size: 192,
    platform: "pwa",
    filename: "pwa-192x192.png",
  },
];

type Platform = "all" | "favicon" | "ios" | "android" | "pwa";

export default function IconGenerator() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("all");
  const [generatedIcons, setGeneratedIcons] = useState<{
    [key: string]: string;
  }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#FFFFFF");
  const [padding, setPadding] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setSourceImage(event.target?.result as string);
      setGeneratedIcons({});
    };
    reader.readAsDataURL(file);
  };

  const generateIcon = (
    img: HTMLImageElement,
    size: number
  ): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve("");
        return;
      }

      // Fill background
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, size, size);

      // Calculate dimensions with padding
      const paddingPx = (size * padding) / 100;
      const drawSize = size - paddingPx * 2;

      // Calculate source dimensions to maintain aspect ratio
      const sourceRatio = img.width / img.height;
      let sourceWidth = img.width;
      let sourceHeight = img.height;
      let sourceX = 0;
      let sourceY = 0;

      if (sourceRatio > 1) {
        // Landscape - crop width
        sourceWidth = img.height;
        sourceX = (img.width - sourceWidth) / 2;
      } else if (sourceRatio < 1) {
        // Portrait - crop height
        sourceHeight = img.width;
        sourceY = (img.height - sourceHeight) / 2;
      }

      // Draw image centered with padding
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        paddingPx,
        paddingPx,
        drawSize,
        drawSize
      );

      resolve(canvas.toDataURL("image/png"));
    });
  };

  const generateAllIcons = async () => {
    if (!sourceImage) return;

    setIsGenerating(true);
    const img = new Image();
    img.src = sourceImage;

    img.onload = async () => {
      const icons: { [key: string]: string } = {};

      const sizesToGenerate =
        selectedPlatform === "all"
          ? ICON_SIZES
          : ICON_SIZES.filter((icon) => icon.platform === selectedPlatform);

      for (const iconSize of sizesToGenerate) {
        const dataUrl = await generateIcon(img, iconSize.size);
        icons[iconSize.filename] = dataUrl;
      }

      setGeneratedIcons(icons);
      setIsGenerating(false);
    };
  };

  const downloadIcon = (filename: string, dataUrl: string) => {
    const blob = dataURLtoBlob(dataUrl);
    downloadFile(blob, filename);
  };

  const downloadAll = async () => {
    // Note: In a real implementation, you'd want to use JSZip library
    // For now, we'll download each file individually
    Object.entries(generatedIcons).forEach(([filename, dataUrl], index) => {
      setTimeout(() => {
        downloadIcon(filename, dataUrl);
      }, index * 100); // Stagger downloads to avoid browser blocking
    });
  };

  const dataURLtoBlob = (dataUrl: string): Blob => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const copyHTMLCode = () => {
    const html = `<!-- Favicons -->
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">

<!-- iOS -->
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon-180x180.png">
<link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png">
<link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png">

<!-- Android -->
<link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png">

<!-- PWA Manifest -->
<link rel="manifest" href="/site.webmanifest">`;

    navigator.clipboard.writeText(html);
    alert("HTML code copied to clipboard!");
  };

  const copyManifestJSON = () => {
    const manifest = {
      name: "Your App Name",
      short_name: "App",
      icons: [
        {
          src: "/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
        },
        {
          src: "/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
        },
      ],
      theme_color: "#ffffff",
      background_color: "#ffffff",
      display: "standalone",
    };

    navigator.clipboard.writeText(JSON.stringify(manifest, null, 2));
    alert("Manifest JSON copied to clipboard!");
  };

  const filteredIconSizes =
    selectedPlatform === "all"
      ? ICON_SIZES
      : ICON_SIZES.filter((icon) => icon.platform === selectedPlatform);

  const generatedCount = Object.keys(generatedIcons).length;

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-300 dark:border-blue-700 rounded-lg p-4">
        <p className="text-sm text-white font-medium">
          <strong>🎯 Icon Generator:</strong> Generate favicon sets and app
          icons for iOS/Android in multiple sizes automatically
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4 bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-4">
            ⚙️ Icon Settings
          </h3>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Upload Source Image
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
              className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors font-medium shadow-lg"
            >
              {sourceImage ? "📁 Change Image" : "📁 Choose Image"}
            </button>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
              Recommended: Square image (1024x1024px or larger)
            </p>
          </div>

          {sourceImage && (
            <>
              {/* Platform Selection */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Platform
                </label>
                <select
                  value={selectedPlatform}
                  onChange={(e) =>
                    setSelectedPlatform(e.target.value as Platform)
                  }
                  className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">
                    All Platforms ({ICON_SIZES.length} icons)
                  </option>
                  <option value="favicon">Favicons Only (4 icons)</option>
                  <option value="ios">iOS Only (8 icons)</option>
                  <option value="android">Android Only (6 icons)</option>
                  <option value="pwa">PWA Only (2 icons)</option>
                </select>
              </div>

              {/* Background Color */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Background Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-12 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="flex-1 p-2 border rounded text-gray-700"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>

              {/* Padding */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Padding: {padding}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={padding}
                  onChange={(e) => setPadding(Number(e.target.value))}
                  className="w-full"
                />
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Add space around the icon (recommended for iOS)
                </p>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateAllIcons}
                disabled={isGenerating}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-colors font-medium shadow-lg disabled:opacity-50"
              >
                {isGenerating
                  ? "⏳ Generating..."
                  : `🎨 Generate ${filteredIconSizes.length} Icons`}
              </button>

              {generatedCount > 0 && (
                <>
                  <div className="pt-4 border-t border-gray-300 dark:border-gray-600">
                    <p className="text-sm text-white mb-3">
                      ✅ Generated {generatedCount} icons
                    </p>

                    <div className="space-y-2">
                      <button
                        onClick={downloadAll}
                        className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      >
                        💾 Download All Icons
                      </button>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={copyHTMLCode}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                        >
                          📋 Copy HTML
                        </button>
                        <button
                          onClick={copyManifestJSON}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                          📋 Copy Manifest
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">
            👁️ Preview & Download
          </h3>

          {sourceImage ? (
            <div className="space-y-4">
              {/* Source Image Preview */}
              <div className="bg-white dark:bg-slate-700 p-4 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2 font-medium">
                  Source Image:
                </p>
                <div className="flex justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={sourceImage}
                    alt="Source"
                    className="max-w-[200px] max-h-[200px] border border-gray-300 dark:border-gray-600 rounded"
                  />
                </div>
              </div>

              {/* Generated Icons */}
              {generatedCount > 0 && (
                <div className="bg-white dark:bg-slate-700 p-4 rounded-lg max-h-[600px] overflow-y-auto">
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3 font-medium">
                    Generated Icons:
                  </p>
                  <div className="space-y-3">
                    {filteredIconSizes.map((iconSize) => {
                      const dataUrl = generatedIcons[iconSize.filename];
                      if (!dataUrl) return null;

                      return (
                        <div
                          key={iconSize.filename}
                          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-slate-800 rounded-lg"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={dataUrl}
                            alt={iconSize.name}
                            className="border border-gray-300 dark:border-gray-600"
                            style={{
                              width: Math.min(iconSize.size, 64),
                              height: Math.min(iconSize.size, 64),
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                              {iconSize.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {iconSize.filename}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              downloadIcon(iconSize.filename, dataUrl)
                            }
                            className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-xs font-medium whitespace-nowrap"
                          >
                            💾 Download
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-200 dark:bg-gray-700 p-12 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                🎯 No image uploaded yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Upload a square image to start generating icons
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Platform Information */}
      {sourceImage && (
        <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-4">
            📱 Platform Icon Sizes
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                🌐 Favicons
              </h4>
              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                <li>• 16x16 - Browser tab</li>
                <li>• 32x32 - Taskbar</li>
                <li>• 48x48 - Windows site icon</li>
                <li>• 64x64 - High-res displays</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                🍎 iOS
              </h4>
              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                <li>• 180x180 - iPhone home screen</li>
                <li>• 167x167 - iPad Pro</li>
                <li>• 152x152 - iPad</li>
                <li>• 120x120 - iPhone (Retina)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                🤖 Android
              </h4>
              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                <li>• 512x512 - Play Store</li>
                <li>• 192x192 - Home screen</li>
                <li>• 144x144 - High-density</li>
                <li>• 96x96 - Medium-density</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-blue-600 dark:text-blue-400">
                📲 PWA
              </h4>
              <ul className="text-xs text-gray-700 dark:text-gray-300 space-y-1">
                <li>• 512x512 - Splash screen</li>
                <li>• 192x192 - App icon</li>
                <li>• Used in manifest.json</li>
                <li>• Install to home screen</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
