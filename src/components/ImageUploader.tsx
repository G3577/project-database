'use client';

import { useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';

interface ImageUploaderProps {
  onImageLoad?: (dataUrl: string) => void;
  className?: string;
}

export default function ImageUploader({ onImageLoad, className = '' }: ImageUploaderProps) {
  const { uploadedImage, setUploadedImage } = useAppStore();

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setUploadedImage(dataUrl);
        onImageLoad?.(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [setUploadedImage, onImageLoad]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (!file || !file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setUploadedImage(dataUrl);
        onImageLoad?.(dataUrl);
      };
      reader.readAsDataURL(file);
    },
    [setUploadedImage, onImageLoad]
  );

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div
      className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors ${className}`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
    >
      {uploadedImage ? (
        <div className="space-y-4">
          <img
            src={uploadedImage}
            alt="Uploaded document"
            className="max-h-48 mx-auto rounded shadow"
          />
          <p className="text-sm text-gray-500">Image loaded successfully</p>
          <button
            onClick={() => setUploadedImage(null)}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
          >
            Remove Image
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-4xl text-gray-400">📄</div>
          <p className="text-gray-600">Drag & drop an image here, or click to browse</p>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg cursor-pointer hover:bg-blue-600 transition-colors"
          >
            Choose File
          </label>
        </div>
      )}
    </div>
  );
}
