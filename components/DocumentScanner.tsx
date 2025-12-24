"use client";

import { useState, useRef, useEffect } from "react";
import { downloadFile } from "@/lib/utils";

export default function DocumentScanner() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment",
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });

      setStream(mediaStream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Failed to access camera. Please grant camera permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setCameraActive(false);
    }
  };

  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL("image/jpeg", 0.95);
    setCapturedImage(imageData);
    setProcessedImage(null);
    stopCamera();
  };

  const processDocument = async () => {
    if (!capturedImage) return;

    setLoading(true);

    try {
      // Convert base64 to blob
      const response = await fetch(capturedImage);
      const blob = await response.blob();

      // Create FormData
      const formData = new FormData();
      formData.append("file", blob, "scan.jpg");

      // Send to API for processing
      const apiResponse = await fetch("/api/scan-document", {
        method: "POST",
        body: formData,
      });

      if (!apiResponse.ok) {
        throw new Error("Failed to process document");
      }

      const resultBlob = await apiResponse.blob();
      const url = URL.createObjectURL(resultBlob);
      setProcessedImage(url);
    } catch (error) {
      console.error("Error processing document:", error);
      alert("Failed to process document. Showing original image.");
      setProcessedImage(capturedImage);
    } finally {
      setLoading(false);
    }
  };

  const convertToPDF = async () => {
    const imageToConvert = processedImage || capturedImage;
    if (!imageToConvert) return;

    setLoading(true);

    try {
      const response = await fetch(imageToConvert);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("files", blob, "scan.jpg");

      const apiResponse = await fetch("/api/image-to-pdf", {
        method: "POST",
        body: formData,
      });

      if (!apiResponse.ok) {
        throw new Error("Failed to convert to PDF");
      }

      const pdfBlob = await apiResponse.blob();
      downloadFile(pdfBlob, "scanned-document.pdf");
    } catch (error) {
      console.error("Error converting to PDF:", error);
      alert("Failed to convert to PDF");
    } finally {
      setLoading(false);
    }
  };

  const downloadImage = () => {
    const imageToDownload = processedImage || capturedImage;
    if (!imageToDownload) return;

    fetch(imageToDownload)
      .then((res) => res.blob())
      .then((blob) => {
        downloadFile(blob, "scanned-document.jpg");
      });
  };

  const retake = () => {
    setCapturedImage(null);
    setProcessedImage(null);
    startCamera();
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-300 dark:border-emerald-700 rounded-lg p-4">
        <p className="text-sm text-white font-medium">
          <strong>📸 Document Scanner:</strong> Use your camera to scan
          documents with automatic edge detection and perspective correction
        </p>
      </div>

      {!cameraActive && !capturedImage && (
        <div className="text-center">
          <button
            onClick={startCamera}
            className="px-8 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition-colors font-medium text-lg shadow-lg"
          >
            📷 Start Camera
          </button>
        </div>
      )}

      {cameraActive && (
        <div className="space-y-4">
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto"
            />
            <div className="absolute inset-0 border-4 border-dashed border-white/30 m-8 pointer-events-none" />
          </div>

          <div className="flex gap-4">
            <button
              onClick={captureImage}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium shadow-lg"
            >
              📸 Capture
            </button>
            <button
              onClick={stopCamera}
              className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              ✖️ Cancel
            </button>
          </div>
        </div>
      )}

      {capturedImage && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Original Capture */}
            <div>
              <h3 className="text-lg font-bold text-white mb-2">📷 Captured</h3>
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={capturedImage}
                  alt="Captured"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            </div>

            {/* Processed Image */}
            {processedImage && (
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  ✨ Processed
                </h3>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={processedImage}
                    alt="Processed"
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="bg-white/50 dark:bg-slate-800/50 p-6 rounded-lg backdrop-blur-sm space-y-3">
            <h3 className="text-lg font-bold text-white mb-4">🛠️ Actions</h3>

            {!processedImage && (
              <button
                onClick={processDocument}
                disabled={loading}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-medium disabled:opacity-50 shadow-lg"
              >
                {loading ? "⏳ Processing..." : "✨ Auto-Crop & Enhance"}
              </button>
            )}

            <button
              onClick={convertToPDF}
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-lg hover:from-red-700 hover:to-orange-700 transition-colors font-medium disabled:opacity-50 shadow-lg"
            >
              {loading ? "⏳ Converting..." : "📄 Convert to PDF"}
            </button>

            <button
              onClick={downloadImage}
              className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-medium shadow-lg"
            >
              💾 Download Image
            </button>

            <button
              onClick={retake}
              className="w-full px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              🔄 Retake Photo
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
