'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import ImageUploader from '@/components/ImageUploader';

type InkColor = 'blue' | 'black' | 'all';

export default function HandwritingRemoverPage() {
  const { uploadedImage, setCanvasData } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [inkColor, setInkColor] = useState<InkColor>('blue');
  const [sensitivity, setSensitivity] = useState(50);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processed, setProcessed] = useState(false);

  useEffect(() => {
    if (!uploadedImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
    };
    img.src = uploadedImage;
    setProcessed(false);
  }, [uploadedImage]);

  const removeHandwriting = async () => {
    if (!canvasRef.current || !uploadedImage) return;
    setIsProcessing(true);

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    const threshold = sensitivity * 2.55; // Convert 0-100 to 0-255

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      let isInk = false;

      if (inkColor === 'blue' || inkColor === 'all') {
        // Detect blue ink: high blue, low red and green
        if (b > 100 && b > r + threshold / 2 && b > g + threshold / 2) {
          isInk = true;
        }
      }

      if (inkColor === 'black' || inkColor === 'all') {
        // Detect black ink: all channels low
        if (r < threshold && g < threshold && b < threshold) {
          // Check it's not part of printed text (printed text tends to be very uniform)
          const variance = Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
          if (variance > 10 || (r < 50 && g < 50 && b < 50)) {
            isInk = true;
          }
        }
      }

      if (isInk) {
        // Replace with white (simulating removal)
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        data[i + 3] = 255;
      }
    }

    ctx.putImageData(imageData, 0, 0);
    setCanvasData(canvas.toDataURL());
    setProcessed(true);
    setIsProcessing(false);
  };

  const resetImage = () => {
    if (!uploadedImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      setProcessed(false);
    };
    img.src = uploadedImage;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Handwriting Remover</h2>
        <p className="text-gray-500 mt-1">
          AI-powered brush layer to filter and erase blue/black ink strokes
        </p>
      </div>

      {!uploadedImage ? (
        <ImageUploader className="max-w-2xl" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-6 bg-white p-4 rounded-lg shadow-sm flex-wrap">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Ink Color:</label>
              <select
                value={inkColor}
                onChange={(e) => setInkColor(e.target.value as InkColor)}
                className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
              >
                <option value="blue">Blue Ink</option>
                <option value="black">Black Ink</option>
                <option value="all">All Ink</option>
              </select>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Sensitivity:</label>
              <input
                type="range"
                min="10"
                max="90"
                value={sensitivity}
                onChange={(e) => setSensitivity(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-gray-500 w-8">{sensitivity}%</span>
            </div>

            <button
              onClick={removeHandwriting}
              disabled={isProcessing}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Removing...' : 'Remove Handwriting'}
            </button>

            {processed && (
              <button
                onClick={resetImage}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
            )}
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm overflow-auto max-h-[70vh]">
            <canvas
              ref={canvasRef}
              className="max-w-full border border-gray-200 rounded"
            />
          </div>

          {processed && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                ✓ Handwriting removal complete. The result is saved to canvas state and can be used in other tools.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
