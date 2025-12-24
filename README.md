# 🎨 Media Converter Suite

A comprehensive, modern media conversion application built with Next.js 15, featuring a beautiful gradient UI and powerful image processing capabilities.

## ✨ Features

### 📝 **Basic Conversions**
- **Image to Text (OCR)** - Extract text from images using Tesseract.js
- **Text to Image** - Generate images from text with customizable styling
- **Image to PDF** - Convert multiple images into a single PDF document
- **PDF to Image** - Extract pages from PDF files as images
- **Image Format Converter** - Convert between PNG, JPG, WebP, AVIF, and TIFF

### 🎨 **Advanced Image Editing**
- **Image Editor** - Professional image editing with:
  - ⚡ Rotate images (0-360°)
  - ↔️ Flip horizontally/vertically
  - 🎨 Apply filters (grayscale, sepia, invert)
  - ☀️ Adjust brightness and contrast
  - 🌫️ Apply blur effects
  - 💧 Add text watermarks
  - 🗜️ Compress images with quality control

### 📦 **Batch Processing**
- **Bulk Resize** - Resize multiple images at once with aspect ratio control
- **Bulk Filter** - Apply the same filter to multiple images
- **Format Conversion** - Convert multiple images to different formats
- **Bulk Rename** - Rename files with custom prefixes

### 🖼️ **Background Removal**
- Remove backgrounds from images automatically
- Replace with solid colors
- Replace with custom background images
- Transparent background export

### 📄 **PDF Tools**
- **Merge PDFs** - Combine multiple PDF files into one document
- **Split PDF** - Extract specific pages or split by page ranges (e.g., 1-3,5,7-10)
- **Rotate Pages** - Rotate all pages by 90°, 180°, or 270°
- **Add Page Numbers** - Add page numbers to all pages with customizable position
- **Compress PDF** - Reduce PDF file size by removing metadata
- **Extract Text** - Extract all text content from PDFs

### 📸 **Document Scanner**
- **Camera Scanning** - Use device camera to scan documents
- **Auto-Enhancement** - Automatic contrast and sharpness adjustment
- **Document Sizing** - Resize scans to A4 dimensions at 300 DPI
- **Convert to PDF** - Convert scanned documents directly to PDF
- **Save as Image** - Download scanned documents as JPEG images

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

```bash
# Clone the repository
git clone https://github.com/CGunasekaran/Media-Converter.git
cd Media-Converter

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 🛠️ Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Modern, utility-first styling
- **Sharp** - High-performance image processing
- **jsPDF** - PDF generation
- **pdf-lib** - PDF manipulation and editing
- **Tesseract.js** - OCR for text extraction
- **pdfjs-dist** - PDF parsing and rendering
- **@imgly/background-removal** - AI-powered background removal
- **Canvas (node-canvas)** - Server-side canvas rendering

## 📁 Project Structure

```
media-converter/
├── app/
│   ├── api/              # API routes for server-side processing
│   │   ├── convert-image/
│   │   ├── image-to-pdf/
│   │   ├── image-to-text/
│   │   ├── pdf-to-image/
│   │   ├── text-to-image/
│   │   ├── remove-background/
│   │   ├── pdf-tools/
│   │   └── scan-document/
│   ├── layout.tsx        # Root layout with header/footer
│   ├── page.tsx          # Main page with tab navigation
│   └── globals.css       # Global styles
├── components/           # React components
│   ├── BackgroundRemover.tsx
│   ├── BatchImageProcessor.tsx
│   ├── DocumentScanner.tsx
│   ├── ImageConverter.tsx
│   ├── ImageEditor.tsx
│   ├── ImageToPDF.tsx
│   ├── ImageToText.tsx
│   ├── PDFToImage.tsx
│   ├── PDFTools.tsx
│   └── TextToImage.tsx
├── lib/
│   └── utils.ts          # Utility functions
└── types/
    └── index.ts          # TypeScript type definitions
```

## 🎨 Design Features

- **Modern Gradient UI** - Indigo, purple, and pink gradient themes
- **Dark Mode Support** - Automatic dark mode detection
- **Responsive Design** - Works on all device sizes
- **Glass-morphism Effects** - Modern, translucent UI elements
- **Smooth Animations** - Polished transitions and hover effects

## 🔒 Privacy & Security

All file processing happens **locally in your browser** or on the server without storing files. Your data is never permanently saved or shared.

## 👨‍💻 Developer

Created by [Gunasekaran](https://gunasekaran-portfolio.vercel.app/)

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 🌐 Deploy on Vercel

The easiest way to deploy this app is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Check out the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

