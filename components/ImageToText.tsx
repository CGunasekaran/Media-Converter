'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Tesseract from 'tesseract.js';
import { MAX_FILE_SIZE, formatFileSize } from '@/lib/utils';

export default function ImageToText() {
  const [image, setImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp']
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    onDrop: async (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        setImage(imageUrl);
        setExtractedText('');
        await extractText(imageUrl);
      };
      
      reader.readAsDataURL(file);
    }
  });

  const extractText = async (imageUrl: string) => {
    setLoading(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(imageUrl, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        }
      });

      setExtractedText(result.data.text);
    } catch (error) {
      console.error('Error extracting text:', error);
      alert('Failed to extract text from image');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(extractedText);
    alert('Text copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragActive
            ? 'border-indigo-500 bg-indigo-50'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          <div className="text-4xl">📷</div>
          <p className="text-lg font-medium text-white dark:text-white">
            {isDragActive ? 'Drop the image here' : 'Drag & drop an image'}
          </p>
          <p className="text-sm text-white/70 dark:text-white/70">
            or click to select (Max size: {formatFileSize(MAX_FILE_SIZE)})
          </p>
        </div>
      </div>

      {image && (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Uploaded Image</h3>
            <img src={image} alt="Uploaded" className="w-full rounded-lg border" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">Extracted Text</h3>
              {extractedText && (
                <button
                  onClick={copyToClipboard}
                  className="px-3 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Copy
                </button>
              )}
            </div>
            
            {loading ? (
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Extracting text... {progress}%
                </p>
              </div>
            ) : (
              <textarea
                value={extractedText}
                onChange={(e) => setExtractedText(e.target.value)}
                className="w-full h-64 p-4 border rounded-lg text-white dark:text-white bg-gray-800 dark:bg-gray-800 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Extracted text will appear here..."
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
