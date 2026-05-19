'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '@/store/useAppStore';
import ImageUploader from '@/components/ImageUploader';

export default function EraserPage() {
  const { uploadedImage, setCanvasData } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [maskPaths, setMaskPaths] = useState<{ x: number; y: number }[][]>([]);
  const currentPath = useRef<{ x: number; y: number }[]>([]);

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
      drawMask(ctx);
    };
    img.src = uploadedImage;
  }, [uploadedImage, maskPaths]);

  const drawMask = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
    ctx.fillStyle = 'rgba(255, 0, 0, 0.2)';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    maskPaths.forEach((path) => {
      if (path.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      path.forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.stroke();
    });
  };

  const getCanvasCoords = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const coords = getCanvasCoords(e);
    currentPath.current = [coords];
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const coords = getCanvasCoords(e);
    currentPath.current.push(coords);

    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.4)';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.beginPath();
    const path = currentPath.current;
    if (path.length >= 2) {
      ctx.moveTo(path[path.length - 2].x, path[path.length - 2].y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();
    }
  };

  const handleMouseUp = () => {
    if (currentPath.current.length > 0) {
      setMaskPaths((prev) => [...prev, [...currentPath.current]]);
    }
    currentPath.current = [];
    setIsDrawing(false);
  };

  const handleInpaint = useCallback(async () => {
    if (!canvasRef.current || maskPaths.length === 0) return;
    setIsProcessing(true);

    // Mock inpainting API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // Simulate inpainting by filling masked areas with white
    ctx.fillStyle = '#FFFFFF';
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    maskPaths.forEach((path) => {
      if (path.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      path.forEach((point) => ctx.lineTo(point.x, point.y));
      ctx.stroke();
    });

    // Fill with white using composite operation
    const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.putImageData(imgData, 0, 0);

    setMaskPaths([]);
    setCanvasData(canvas.toDataURL());
    setIsProcessing(false);
  }, [maskPaths, brushSize, setCanvasData]);

  const handleClear = () => {
    setMaskPaths([]);
    if (uploadedImage && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')!;
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0);
      img.src = uploadedImage;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Printed Text Eraser</h2>
          <p className="text-gray-500 mt-1">
            Paint over text to erase it using AI inpainting
          </p>
        </div>
      </div>

      {!uploadedImage ? (
        <ImageUploader className="max-w-2xl" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-6 bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-gray-700">Brush Size:</label>
              <input
                type="range"
                min="5"
                max="100"
                value={brushSize}
                onChange={(e) => setBrushSize(Number(e.target.value))}
                className="w-32"
              />
              <span className="text-sm text-gray-500 w-8">{brushSize}px</span>
            </div>
            <button
              onClick={handleInpaint}
              disabled={isProcessing || maskPaths.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isProcessing ? 'Processing...' : 'Erase Text'}
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Mask
            </button>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm overflow-auto max-h-[70vh]">
            <canvas
              ref={canvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="max-w-full cursor-crosshair border border-gray-200 rounded"
            />
          </div>
        </div>
      )}
    </div>
  );
}
