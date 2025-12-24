'use client';

import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { ImageFormat } from '@/types';
import { MAX_FILE_SIZE, formatFileSize, downloadFile } from '@/lib/utils';

export default function ImageConverter() {
  const [image, setImage] = useState<string | null>(null);
  const [fileName, setFileName] = useState('');
  const [outputFormat, setOutputFormat] = useState<ImageFormat>('png');
  const [convertedImage, setConvertedImage] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp']
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length === 0) return;
      
      const file = acceptedFiles[0];
      setFileName(file.name.split('.')[0]);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
        setConvertedImage(null);
      };
      reader.readAsDataURL(file);
    }
  });

  const convertImage = () => {
    if (!image) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);
      
      const mimeType = `image/${outputFormat === 'jpg' ? 'jpeg' : outputFormat}`;
      const quality = outputFormat === 'png' ? undefined : 0.9;
      
      const convertedUrl = canvas.toDataURL(mimeType, quality);
      setConvertedImage(convertedUrl);
    };
    
    img.src = image;
  };

  const downloadConverted = () => {
    if (!convertedImage) return;
    
    fetch(convertedImage)
      .then(res => res.blob())
      .then(blob => {
        downloadFile(blob, `${fileName}.${outputFormat}`);
      });
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
          <div className="text-4xl">🔄</div>
          <p className="text-lg font-medium text-white dark:text-white">
            {isDragActive ? 'Drop the image here' : 'Drag & drop an image'}
          </p>
          <p className="text-sm text-white/70 dark:text-white/70">
            or click to select (Max size: {formatFileSize(MAX_FILE_SIZE)})
          </p>
        </div>
      </div>

      {image && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Original Image</h3>
              <img src={image} alt="Original" className="w-full rounded-lg border" />
            </div>

            {convertedImage && (
              <div>
                <h3 className="font-semibold mb-2">Converted Image ({outputFormat.toUpperCase()})</h3>
                <img src={convertedImage} alt="Converted" className="w-full rounded-lg border" />
              </div>
            )}
          </div>

          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Output Format
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['png', 'jpg', 'jpeg', 'webp'] as ImageFormat[]).map((format) => (
                  <button
                    key={format}
                    onClick={() => setOutputFormat(format)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      outputFormat === format
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-gray-700 border hover:border-indigo-400'
                    }`}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={convertImage}
                className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Convert to {outputFormat.toUpperCase()}
              </button>
              
              {convertedImage && (
                <button
                  onClick={downloadConverted}
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Download
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
