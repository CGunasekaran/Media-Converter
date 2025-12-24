"use client";

import { useState } from "react";
import ImageToText from "@/components/ImageToText";
import TextToImage from "@/components/TextToImage";
import ImageToPDF from "@/components/ImageToPDF";
import PDFToImage from "@/components/PDFToImage";
import ImageConverter from "@/components/ImageConverter";
import ImageEditor from "@/components/ImageEditor";
import BatchImageProcessor from "@/components/BatchImageProcessor";
import BackgroundRemover from "@/components/BackgroundRemover";
import PDFTools from "@/components/PDFTools";
import DocumentScanner from "@/components/DocumentScanner";
import { TabType } from "@/types";

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>("image-to-text");

  const tabs = [
    { id: "image-to-text", label: "Image to Text", icon: "📝" },
    { id: "text-to-image", label: "Text to Image", icon: "🖼️" },
    { id: "image-to-pdf", label: "Image to PDF", icon: "📄" },
    { id: "pdf-to-image", label: "PDF to Image", icon: "🖼️" },
    { id: "image-converter", label: "Image Converter", icon: "🔄" },
    { id: "image-editor", label: "Image Editor", icon: "✨" },
    { id: "batch-processor", label: "Batch Processing", icon: "📦" },
    { id: "background-remover", label: "Background Remover", icon: "🎨" },
    { id: "pdf-tools", label: "PDF Tools", icon: "🛠️" },
    { id: "document-scanner", label: "Document Scanner", icon: "📸" },
  ] as const;

  return (
    <main className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-5xl font-extrabold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Choose Your Conversion Tool
          </h2>
          <p className="text-slate-600 dark:text-slate-300 text-lg font-medium">
            Select a tool below to start converting your files
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <div className="flex flex-wrap border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-slate-50 to-indigo-50 dark:from-slate-900 dark:to-indigo-950">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-[150px] px-6 py-4 text-sm font-semibold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-b-4 border-indigo-600 dark:border-indigo-400 shadow-lg"
                    : "text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-800/50"
                }`}
              >
                <span className="mr-2 text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {activeTab === "image-to-text" && <ImageToText />}
            {activeTab === "text-to-image" && <TextToImage />}
            {activeTab === "image-to-pdf" && <ImageToPDF />}
            {activeTab === "pdf-to-image" && <PDFToImage />}
            {activeTab === "image-converter" && <ImageConverter />}
            {activeTab === "image-editor" && <ImageEditor />}
            {activeTab === "batch-processor" && <BatchImageProcessor />}
            {activeTab === "background-remover" && <BackgroundRemover />}
            {activeTab === "pdf-tools" && <PDFTools />}
            {activeTab === "document-scanner" && <DocumentScanner />}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-10">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-200 dark:border-slate-700 shadow-lg">
            <span className="text-green-600 dark:text-green-400 text-xl">
              🔒
            </span>
            <p className="text-slate-700 dark:text-slate-300 text-sm font-medium">
              All conversions happen locally in your browser. Your files are
              never uploaded to a server.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
