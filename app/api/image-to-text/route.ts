import { NextRequest, NextResponse } from "next/server";
import Tesseract from "tesseract.js";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const language = (formData.get("language") as string) || "eng";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Perform OCR
    const result = await Tesseract.recognize(buffer, language, {
      logger: (m) => console.log(m),
    });

    return NextResponse.json({
      text: result.data.text,
      confidence: result.data.confidence,
      language: language,
    });
  } catch (error) {
    console.error("OCR error:", error);
    return NextResponse.json(
      { error: "Failed to extract text from image" },
      { status: 500 }
    );
  }
}
