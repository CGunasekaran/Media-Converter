import { NextRequest, NextResponse } from 'next/server';
import sharp from 'sharp';
import { removeBackground } from '@imgly/background-removal';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const replaceWithColor = formData.get('replaceWithColor') === 'true';
    const bgColor = formData.get('bgColor') as string || '#ffffff';
    const backgroundImage = formData.get('backgroundImage') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Remove background using @imgly/background-removal
    const blob = new Blob([buffer]);
    const result = await removeBackground(blob);
    
    // Convert result to buffer
    const resultArrayBuffer = await result.arrayBuffer();
    const processedBuffer = Buffer.from(resultArrayBuffer);

    // If replacing with color or image
    if (replaceWithColor || backgroundImage) {
      const metadata = await sharp(processedBuffer).metadata();
      const width = metadata.width || 800;
      const height = metadata.height || 600;

      if (replaceWithColor) {
        // Create solid color background
        const bgBuffer = await sharp({
          create: {
            width,
            height,
            channels: 4,
            background: bgColor,
          },
        })
          .png()
          .toBuffer();

        // Composite foreground over background
        const compositedBuffer = await sharp(bgBuffer)
          .composite([{ input: processedBuffer }])
          .png()
          .toBuffer();
        
        return new NextResponse(new Uint8Array(compositedBuffer), {
          headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': 'attachment; filename="no-background.png"',
          },
        });
      } else if (backgroundImage) {
        // Replace with custom background image
        const bgBytes = await backgroundImage.arrayBuffer();
        const bgBuffer = Buffer.from(bgBytes);

        // Resize background to match foreground
        const resizedBg = await sharp(bgBuffer)
          .resize(width, height, { fit: 'cover' })
          .toBuffer();

        // Composite foreground over background
        const compositedBuffer = await sharp(resizedBg)
          .composite([{ input: processedBuffer }])
          .png()
          .toBuffer();
        
        return new NextResponse(new Uint8Array(compositedBuffer), {
          headers: {
            'Content-Type': 'image/png',
            'Content-Disposition': 'attachment; filename="no-background.png"',
          },
        });
      }
    }

    return new NextResponse(new Uint8Array(processedBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="no-background.png"',
      },
    });
  } catch (error) {
    console.error('Background removal error:', error);
    return NextResponse.json(
      { error: 'Failed to remove background' },
      { status: 500 }
    );
  }
}
