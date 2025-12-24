'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { downloadFile } from '@/lib/utils';

type Tool = 'pen' | 'line' | 'arrow' | 'rectangle' | 'circle' | 'text';
type ExportFormat = 'png' | 'jpg' | 'webp';

interface Point {
  x: number;
  y: number;
}

interface DrawAction {
  tool: Tool;
  color: string;
  lineWidth: number;
  points?: Point[];
  startPoint?: Point;
  endPoint?: Point;
  text?: string;
}

export default function ScreenshotTool() {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [tool, setTool] = useState<Tool>('pen');
  const [color, setColor] = useState('#FF0000');
  const [lineWidth, setLineWidth] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [actions, setActions] = useState<DrawAction[]>([]);
  const [currentAction, setCurrentAction] = useState<DrawAction | null>(null);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textPosition, setTextPosition] = useState<Point>({ x: 0, y: 0 });

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);

  const drawAction = useCallback((ctx: CanvasRenderingContext2D, action: DrawAction) => {
    ctx.strokeStyle = action.color;
    ctx.fillStyle = action.color;
    ctx.lineWidth = action.lineWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    switch (action.tool) {
      case 'pen':
        if (action.points && action.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(action.points[0].x, action.points[0].y);
          action.points.forEach(point => ctx.lineTo(point.x, point.y));
          ctx.stroke();
        }
        break;

      case 'line':
        if (action.startPoint && action.endPoint) {
          ctx.beginPath();
          ctx.moveTo(action.startPoint.x, action.startPoint.y);
          ctx.lineTo(action.endPoint.x, action.endPoint.y);
          ctx.stroke();
        }
        break;

      case 'arrow':
        if (action.startPoint && action.endPoint) {
          const { startPoint, endPoint } = action;
          const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
          const headLength = 20;

          ctx.beginPath();
          ctx.moveTo(startPoint.x, startPoint.y);
          ctx.lineTo(endPoint.x, endPoint.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(endPoint.x, endPoint.y);
          ctx.lineTo(
            endPoint.x - headLength * Math.cos(angle - Math.PI / 6),
            endPoint.y - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(endPoint.x, endPoint.y);
          ctx.lineTo(
            endPoint.x - headLength * Math.cos(angle + Math.PI / 6),
            endPoint.y - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }
        break;

      case 'rectangle':
        if (action.startPoint && action.endPoint) {
          const width = action.endPoint.x - action.startPoint.x;
          const height = action.endPoint.y - action.startPoint.y;
          ctx.strokeRect(action.startPoint.x, action.startPoint.y, width, height);
        }
        break;

      case 'circle':
        if (action.startPoint && action.endPoint) {
          const radius = Math.sqrt(
            Math.pow(action.endPoint.x - action.startPoint.x, 2) +
            Math.pow(action.endPoint.y - action.startPoint.y, 2)
          );
          ctx.beginPath();
          ctx.arc(action.startPoint.x, action.startPoint.y, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
        break;

      case 'text':
        if (action.startPoint && action.text) {
          ctx.font = `${action.lineWidth}px Arial`;
          ctx.fillText(action.text, action.startPoint.x, action.startPoint.y);
        }
        break;
    }
  }, []);

  const redrawAnnotations = useCallback(() => {
    const canvas = displayCanvasRef.current;
    const baseCanvas = canvasRef.current;
    if (!canvas || !baseCanvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Copy base image
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(baseCanvas, 0, 0);

    // Draw all saved actions
    actions.forEach(action => drawAction(ctx, action));

    // Draw current action
    if (currentAction) {
      drawAction(ctx, currentAction);
    }
  }, [actions, currentAction, drawAction]);

  useEffect(() => {
    if (screenshot && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        redrawAnnotations();
      };
      img.src = screenshot;
    }
  }, [screenshot, redrawAnnotations]);

  const captureScreenshot = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true
      });

      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      video.onloadedmetadata = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');
        setScreenshot(dataUrl);
        setActions([]);

        stream.getTracks().forEach(track => track.stop());
      };
    } catch (error) {
      console.error('Error capturing screenshot:', error);
      alert('Screenshot capture failed. Please ensure you have granted permission.');
    }
  };

  const uploadScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setScreenshot(event.target?.result as string);
      setActions([]);
    };
    reader.readAsDataURL(file);
  };

  const getCanvasPoint = (e: React.MouseEvent<HTMLCanvasElement>): Point => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!screenshot) return;

    const point = getCanvasPoint(e);
    setIsDrawing(true);

    if (tool === 'text') {
      setTextPosition(point);
      setShowTextInput(true);
      return;
    }

    if (tool === 'pen') {
      setCurrentAction({
        tool,
        color,
        lineWidth,
        points: [point]
      });
    } else {
      setCurrentAction({
        tool,
        color,
        lineWidth,
        startPoint: point,
        endPoint: point
      });
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentAction || tool === 'text') return;

    const point = getCanvasPoint(e);

    if (tool === 'pen') {
      setCurrentAction({
        ...currentAction,
        points: [...(currentAction.points || []), point]
      });
    } else {
      setCurrentAction({
        ...currentAction,
        endPoint: point
      });
    }

    redrawAnnotations();
  };

  const stopDrawing = () => {
    if (!isDrawing || tool === 'text') return;

    if (currentAction) {
      setActions([...actions, currentAction]);
      setCurrentAction(null);
    }
    setIsDrawing(false);
  };

  const addText = () => {
    if (!textInput.trim()) {
      setShowTextInput(false);
      return;
    }

    const textAction: DrawAction = {
      tool: 'text',
      color,
      lineWidth: 24,
      startPoint: textPosition,
      text: textInput
    };

    setActions([...actions, textAction]);
    setTextInput('');
    setShowTextInput(false);
  };

  useEffect(() => {
    if (screenshot) {
      redrawAnnotations();
    }
  }, [screenshot, redrawAnnotations]);

  const undo = () => {
    if (actions.length > 0) {
      setActions(actions.slice(0, -1));
    }
  };

  const clearAnnotations = () => {
    setActions([]);
    setCurrentAction(null);
  };

  const downloadScreenshot = () => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;

    const mimeType = exportFormat === 'png' ? 'image/png' : 
                     exportFormat === 'jpg' ? 'image/jpeg' : 
                     'image/webp';

    canvas.toBlob((blob) => {
      if (blob) {
        downloadFile(blob, `screenshot.${exportFormat}`);
      }
    }, mimeType, exportFormat === 'jpg' ? 0.9 : undefined);
  };

  const copyToClipboard = async () => {
    const canvas = displayCanvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      if (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          alert('Screenshot copied to clipboard!');
        } catch (error) {
          console.error('Failed to copy:', error);
          alert('Failed to copy to clipboard');
        }
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 border border-purple-300 dark:border-purple-700 rounded-lg p-4">
        <p className="text-sm text-white font-medium">
          <strong>📸 Screenshot Tool:</strong> Capture, annotate, and export screenshots in various formats
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4 bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm">
          <h3 className="text-lg font-bold text-white mb-4">⚙️ Screenshot Controls</h3>

          {/* Capture Options */}
          <div className="space-y-3">
            <button
              onClick={captureScreenshot}
              className="w-full px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors font-medium shadow-lg"
            >
              📸 Capture Screenshot
            </button>

            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={uploadScreenshot}
                className="hidden"
                id="upload-screenshot"
              />
              <label
                htmlFor="upload-screenshot"
                className="block w-full px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium text-center cursor-pointer"
              >
                📁 Upload Image
              </label>
            </div>
          </div>

          {screenshot && (
            <>
              {/* Annotation Tools */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Annotation Tools
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setTool('pen')}
                    className={`px-3 py-2 rounded transition-colors ${
                      tool === 'pen' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    ✏️ Pen
                  </button>
                  <button
                    onClick={() => setTool('line')}
                    className={`px-3 py-2 rounded transition-colors ${
                      tool === 'line' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    📏 Line
                  </button>
                  <button
                    onClick={() => setTool('arrow')}
                    className={`px-3 py-2 rounded transition-colors ${
                      tool === 'arrow' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    ➡️ Arrow
                  </button>
                  <button
                    onClick={() => setTool('rectangle')}
                    className={`px-3 py-2 rounded transition-colors ${
                      tool === 'rectangle' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    ⬜ Rect
                  </button>
                  <button
                    onClick={() => setTool('circle')}
                    className={`px-3 py-2 rounded transition-colors ${
                      tool === 'circle' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    ⭕ Circle
                  </button>
                  <button
                    onClick={() => setTool('text')}
                    className={`px-3 py-2 rounded transition-colors ${
                      tool === 'text' ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                    }`}
                  >
                    📝 Text
                  </button>
                </div>
              </div>

              {/* Color Picker */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Annotation Color
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-12 rounded cursor-pointer"
                />
              </div>

              {/* Line Width */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Line Width: {lineWidth}px
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={lineWidth}
                  onChange={(e) => setLineWidth(Number(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Export Format */}
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Export Format
                </label>
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value as ExportFormat)}
                  className="w-full p-3 border rounded-lg text-gray-700 focus:ring-2 focus:ring-purple-500"
                >
                  <option value="png">PNG (Lossless)</option>
                  <option value="jpg">JPG (Smaller size)</option>
                  <option value="webp">WebP (Modern)</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <button
                    onClick={undo}
                    disabled={actions.length === 0}
                    className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors font-medium disabled:opacity-50"
                  >
                    ↶ Undo
                  </button>
                  <button
                    onClick={clearAnnotations}
                    disabled={actions.length === 0}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                  >
                    🗑️ Clear
                  </button>
                </div>

                <button
                  onClick={downloadScreenshot}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors font-medium shadow-lg"
                >
                  💾 Download Screenshot
                </button>

                <button
                  onClick={copyToClipboard}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
                >
                  📋 Copy to Clipboard
                </button>
              </div>
            </>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-white">👁️ Preview & Annotate</h3>

          {screenshot ? (
            <div className="bg-white dark:bg-slate-700 p-6 rounded-lg relative">
              <canvas
                ref={canvasRef}
                className="hidden"
              />
              <canvas
                ref={displayCanvasRef}
                width={800}
                height={600}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="w-full border border-gray-300 dark:border-gray-600 rounded cursor-crosshair"
              />

              {showTextInput && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-slate-800 p-4 rounded-lg shadow-lg">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addText()}
                    placeholder="Enter text..."
                    className="w-64 p-2 border rounded text-gray-700 dark:text-white dark:bg-slate-700 mb-2"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={addText}
                      className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Add
                    </button>
                    <button
                      onClick={() => {
                        setShowTextInput(false);
                        setTextInput('');
                      }}
                      className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-gray-200 dark:bg-gray-700 p-12 rounded-lg text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                📸 No screenshot captured yet
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Capture your screen or upload an image to start annotating
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
