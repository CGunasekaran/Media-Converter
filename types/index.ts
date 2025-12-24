export interface ConversionResult {
  success: boolean;
  data?: any;
  error?: string;
}

export type ImageFormat = "png" | "jpg" | "jpeg" | "webp";

export type TabType =
  | "image-to-text"
  | "text-to-image"
  | "image-to-pdf"
  | "pdf-to-image"
  | "image-converter"
  | "image-editor"
  | "batch-processor"
  | "background-remover"
  | "pdf-tools"
  | "document-scanner"
  | "qrcode-tools"
  | "barcode-tools"
  | "svg-converter"
  | "excel-csv-tools";
