# 🎨 Media Converter Suite

A comprehensive, all-in-one media conversion and editing application built with Next.js 15, featuring 22 powerful tools with a beautiful gradient UI and advanced image processing capabilities.

## 🌟 Overview

Media Converter Suite is your one-stop solution for all media conversion, editing, and generation needs. From basic format conversions to advanced creative tools, this application provides everything you need to work with images, PDFs, documents, and more - all in your browser with a modern, intuitive interface.

## 📊 Tool Count

✅ **22 Professional Tools** including:
- 5 Basic Conversion Tools
- 6 Creative & Design Tools
- 4 Optimization & Encoding Tools
- 7 Professional Document Tools

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

### 📱 **QR Code Tools**
- **QR Code Generator** - Create custom QR codes from text or URLs
- **Color Customization** - Choose QR code and background colors
- **Size Control** - Generate QR codes from 200px to 600px
- **QR Code Scanner** - Scan and decode QR codes from images

### 📊 **Barcode Tools**
- **Barcode Generator** - Support for 8 formats (CODE128, EAN13, EAN8, UPC, CODE39, ITF14, MSI, Pharmacode)
- **Live Preview** - Real-time barcode generation as you type
- **Customization** - Adjust line width, height, colors, and display options
- **Barcode Scanner** - Scan barcodes from uploaded images

### 🎨 **SVG Converter**
- **SVG to PNG/JPG** - Convert vector graphics to raster images
- **Custom Dimensions** - Set width and height (100-4000px)
- **Aspect Ratio** - Maintain original proportions or custom sizing
- **Background Control** - Transparent backgrounds or custom colors

### 📊 **Excel/CSV Tools**
- **CSV ↔ JSON** - Convert between CSV and JSON formats
- **Excel → CSV/JSON** - Extract data from Excel files
- **Excel → PDF** - Convert Excel spreadsheets to PDF documents
- **Data Visualization** - Create interactive charts (bar, line, pie) from data
- **Preview & Download** - View converted data before downloading

### 🎭 **Creative Tools**
- **Meme Generator** - Create memes with top and bottom text
  - Multiple font styles (Impact, Arial, Comic Sans, etc.)
  - Adjustable font size and color
  - Automatic text positioning and styling
  - Instant preview and download
  
- **Collage Maker** - Create beautiful photo collages
  - 8 layout templates (grid, masonry, horizontal, vertical, spotlight, etc.)
  - Drag & drop multiple images
  - Automatic layout arrangement
  - High-quality PNG export
  
- **Placeholder Generator** - Generate placeholder images for design
  - 8 pattern types (solid, gradient, grid, dots, stripes, etc.)
  - Custom dimensions (100-2000px)
  - Custom text overlays
  - Instant generation and download
  
- **Color Palette Extractor** - Extract color palettes from images
  - Automatic dominant color detection
  - 5-color palette generation
  - Hex color codes with copy functionality
  - Color distribution analysis

### 📸 **Screenshot Tool**
- **Screen Capture** - Capture your screen with annotation tools
  - Fullscreen, window, or area selection
  - 6 annotation tools: pen, line, arrow, rectangle, circle, text
  - Customizable colors and stroke widths
  - Undo/redo functionality
  - Export in PNG, JPG, or WebP formats

### 🎨 **Icon Generator**
- **Multi-Platform Icons** - Generate icons for all platforms
  - 26 icon sizes (16x16 to 1024x1024)
  - Favicon formats (16x16, 32x32, 48x48)
  - iOS icons (57x57 to 180x180)
  - Android icons (36x36 to 192x192)
  - PWA icons (144x144, 192x192, 512x512)
  - Filter by platform or download all as ZIP

### 🚀 **Image Optimizer**
- **Web Optimization** - Optimize images for web performance
  - WebP conversion with quality control
  - Generate responsive image sets (320px, 640px, 1024px, 1920px)
  - HTML `<picture>` element code generation
  - Size comparison before/after
  - Automatic format recommendations

### 🔐 **Base64 Tools**
- **Base64 Encoder** - Convert images to Base64 strings
  - Encode any image format to Base64
  - Copy Base64 string or download as text file
  - HTML `<img>` tag code generation
  - CSS `background-image` code generation
  
- **Base64 Decoder** - Convert Base64 strings back to images
  - Paste Base64 string to decode
  - Preview decoded image
  - Download in original or converted format

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- npm, yarn, pnpm, or bun package manager

### Installation

```bash
- **QRCode** - QR code generation
- **jsQR** - QR code scanning
- **JsBarcode** - Barcode generation (8 formats)
- **XLSX** - Excel/CSV file processing
- **Chart.js** - Data visualization with charts
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
- **jsPDF** - PDF generation and manipulation
- **pdf-lib** - PDF manipulation and editing
- **Tesseract.js** - OCR for text extraction
- **pdfjs-dist** - PDF parsing and rendering
- **@imgly/background-removal** - AI-powered background removal
- **Canvas API** - Client-side image manipulation and drawing
- **html2canvas** - Screenshot capture functionality
- **QRCode.js** - QR code generation
- **jsQR** - QR code scanning
- **JsBarcode** - Barcode generation (8 formats)
- **XLSX** - Excel/CSV file processing
- **JSZip** - ZIP file creation for batch downloads

## 📁 Project Structure

```
media-converter/
├── app/
│   ├── api/              # API routes for server-side processing
│   │   ├── convert-image/
│   │   ├── image-to-pdf/
│   │   ├── image-to-text/
│   │   ├── pdf-to-image/
│   │   └── text-to-image/
│   ├── layout.tsx        # Root layout with header/footer
│   ├── page.tsx          # Main page with tool sections
│   └── globals.css       # Global styles with gradient themes
├── components/           # React components (22 tools)
│   ├── BackgroundRemover.tsx
│   ├── BarcodeTools.tsx
│   ├── Base64Tool.tsx
│   ├── BatchImageProcessor.tsx
│   ├── CollageMaker.tsx
│   ├── ColorPalette.tsx
│   ├── DocumentScanner.tsx
│   ├── ExcelCSVTools.tsx
│   ├── IconGenerator.tsx
│   ├── ImageConverter.tsx
│   ├── ImageEditor.tsx
│   ├── ImageOptimizer.tsx
│   ├── ImageToPDF.tsx
│   ├── ImageToText.tsx
│   ├── MemeGenerator.tsx
│   ├── PDFToImage.tsx
│   ├── PDFTools.tsx
│   ├── PlaceholderGenerator.tsx
│   ├── QRCodeTools.tsx
│   ├── ScreenshotTool.tsx
│   ├── SVGConverter.tsx
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

