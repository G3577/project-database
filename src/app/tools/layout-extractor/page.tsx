'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import ImageUploader from '@/components/ImageUploader';
import { DocumentStructure } from '@/types';

export default function LayoutExtractorPage() {
  const { uploadedImage, setDocumentStructure, setCanvasData } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [structure, setStructure] = useState<DocumentStructure | null>(null);
  const [showOverlay, setShowOverlay] = useState(true);

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
  }, [uploadedImage]);

  const extractLayout = async () => {
    if (!canvasRef.current || !uploadedImage) return;
    setIsProcessing(true);

    // Mock AI layout extraction
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const canvas = canvasRef.current;

    // Generate mock structure based on image dimensions
    const mockStructure: DocumentStructure = {
      headers: [
        {
          id: 'h1',
          level: 1,
          position: { x: 50, y: 30, width: canvas.width - 100, height: 40 },
        },
        {
          id: 'h2',
          level: 2,
          position: { x: 50, y: 200, width: canvas.width / 2, height: 30 },
        },
      ],
      paragraphs: [
        {
          id: 'p1',
          position: { x: 50, y: 80, width: canvas.width - 100, height: 100 },
        },
        {
          id: 'p2',
          position: { x: 50, y: 250, width: canvas.width - 100, height: 120 },
        },
      ],
      tables: [
        {
          id: 't1',
          rows: 4,
          cols: 3,
          position: { x: 50, y: 400, width: canvas.width - 100, height: 200 },
        },
      ],
    };

    setStructure(mockStructure);
    setDocumentStructure(mockStructure);

    // Draw overlay
    if (showOverlay) {
      drawOverlay(mockStructure);
    }

    setIsProcessing(false);
  };

  const drawOverlay = (struct: DocumentStructure) => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d')!;

    // Redraw original image
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);

      // Draw headers
      ctx.strokeStyle = '#EF4444';
      ctx.lineWidth = 2;
      struct.headers.forEach((h) => {
        ctx.strokeRect(h.position.x, h.position.y, h.position.width, h.position.height);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.1)';
        ctx.fillRect(h.position.x, h.position.y, h.position.width, h.position.height);
      });

      // Draw paragraphs
      ctx.strokeStyle = '#3B82F6';
      struct.paragraphs.forEach((p) => {
        ctx.strokeRect(p.position.x, p.position.y, p.position.width, p.position.height);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
        ctx.fillRect(p.position.x, p.position.y, p.position.width, p.position.height);
      });

      // Draw tables
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 3;
      struct.tables.forEach((t) => {
        ctx.strokeRect(t.position.x, t.position.y, t.position.width, t.position.height);
        ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
        ctx.fillRect(t.position.x, t.position.y, t.position.width, t.position.height);
      });
    };
    img.src = uploadedImage!;
  };

  const wipeContent = async () => {
    if (!canvasRef.current || !structure) return;
    setIsProcessing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // Fill content areas with white while preserving structure lines
    ctx.fillStyle = '#FFFFFF';
    structure.paragraphs.forEach((p) => {
      ctx.fillRect(p.position.x + 2, p.position.y + 2, p.position.width - 4, p.position.height - 4);
    });
    structure.headers.forEach((h) => {
      ctx.fillRect(h.position.x + 2, h.position.y + 2, h.position.width - 4, h.position.height - 4);
    });

    // For tables, wipe cell contents but keep grid
    structure.tables.forEach((t) => {
      const cellW = t.position.width / t.cols;
      const cellH = t.position.height / t.rows;
      for (let r = 0; r < t.rows; r++) {
        for (let c = 0; c < t.cols; c++) {
          ctx.fillRect(
            t.position.x + c * cellW + 3,
            t.position.y + r * cellH + 3,
            cellW - 6,
            cellH - 6
          );
        }
      }
      // Redraw grid
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 1;
      for (let r = 0; r <= t.rows; r++) {
        ctx.beginPath();
        ctx.moveTo(t.position.x, t.position.y + r * cellH);
        ctx.lineTo(t.position.x + t.position.width, t.position.y + r * cellH);
        ctx.stroke();
      }
      for (let c = 0; c <= t.cols; c++) {
        ctx.beginPath();
        ctx.moveTo(t.position.x + c * cellW, t.position.y);
        ctx.lineTo(t.position.x + c * cellW, t.position.y + t.position.height);
        ctx.stroke();
      }
    });

    setCanvasData(canvas.toDataURL());
    setIsProcessing(false);
  };

  const exportStructure = () => {
    if (!structure) return;
    const json = JSON.stringify(structure, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'document-structure.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Document Layout Extractor</h2>
        <p className="text-gray-500 mt-1">
          Extract document structure and tables while wiping content
        </p>
      </div>

      {!uploadedImage ? (
        <ImageUploader className="max-w-2xl" />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 space-y-4">
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
              <button
                onClick={extractLayout}
                disabled={isProcessing}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                {isProcessing ? 'Processing...' : 'Extract Layout'}
              </button>
              {structure && (
                <>
                  <button
                    onClick={wipeContent}
                    disabled={isProcessing}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                  >
                    Wipe Content
                  </button>
                  <button
                    onClick={exportStructure}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Export JSON
                  </button>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showOverlay}
                      onChange={(e) => setShowOverlay(e.target.checked)}
                    />
                    Show Overlay
                  </label>
                </>
              )}
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm overflow-auto max-h-[65vh]">
              <canvas
                ref={canvasRef}
                className="max-w-full border border-gray-200 rounded"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Detected Structure</h3>
              {structure ? (
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="inline-block w-3 h-3 bg-red-500 rounded mr-2"></span>
                    <span className="font-medium">Headers:</span> {structure.headers.length}
                  </div>
                  <div>
                    <span className="inline-block w-3 h-3 bg-blue-500 rounded mr-2"></span>
                    <span className="font-medium">Paragraphs:</span> {structure.paragraphs.length}
                  </div>
                  <div>
                    <span className="inline-block w-3 h-3 bg-green-500 rounded mr-2"></span>
                    <span className="font-medium">Tables:</span> {structure.tables.length}
                  </div>
                  {structure.tables.map((t) => (
                    <div key={t.id} className="ml-5 text-gray-500">
                      Table: {t.rows}×{t.cols}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">
                  Click &quot;Extract Layout&quot; to analyze the document structure.
                </p>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-800 mb-2">Legend</h4>
              <div className="space-y-1 text-xs text-blue-700">
                <p>🔴 Red = Headers</p>
                <p>🔵 Blue = Paragraphs</p>
                <p>🟢 Green = Tables</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
