'use client';

import { useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ExportOptions } from '@/types';

export default function ExporterPage() {
  const { canvasData, uploadedImage } = useAppStore();
  const [options, setOptions] = useState<ExportOptions>({
    format: 'png',
    quality: 95,
    includeAnnotations: true,
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  const sourceImage = canvasData || uploadedImage;

  const exportDocument = async () => {
    if (!sourceImage) return;
    setIsExporting(true);
    setExportStatus(null);

    try {
      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, 1500));

      switch (options.format) {
        case 'jpeg':
          await exportAsJpeg();
          break;
        case 'png':
          await exportAsPng();
          break;
        case 'pdf':
          await exportAsPdf();
          break;
        case 'docx':
          await exportAsDocx();
          break;
      }

      setExportStatus(`Successfully exported as ${options.format.toUpperCase()}`);
    } catch {
      setExportStatus('Export failed. Please try again.');
    }

    setIsExporting(false);
  };

  const exportAsJpeg = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    await new Promise<void>((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.src = sourceImage!;
    });

    const dataUrl = canvas.toDataURL('image/jpeg', options.quality / 100);
    downloadFile(dataUrl, 'blankcraft-export.jpg');
  };

  const exportAsPng = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const img = new Image();

    await new Promise<void>((resolve) => {
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        resolve();
      };
      img.src = sourceImage!;
    });

    const dataUrl = canvas.toDataURL('image/png');
    downloadFile(dataUrl, 'blankcraft-export.png');
  };

  const exportAsPdf = async () => {
    // Dynamic import for jsPDF
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();

    const img = new Image();
    await new Promise<void>((resolve) => {
      img.onload = () => resolve();
      img.src = sourceImage!;
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const imgRatio = img.width / img.height;
    const pageRatio = pageWidth / pageHeight;

    let drawWidth: number, drawHeight: number;
    if (imgRatio > pageRatio) {
      drawWidth = pageWidth - 20;
      drawHeight = drawWidth / imgRatio;
    } else {
      drawHeight = pageHeight - 20;
      drawWidth = drawHeight * imgRatio;
    }

    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;

    doc.addImage(sourceImage!, 'PNG', x, y, drawWidth, drawHeight);
    doc.save('blankcraft-export.pdf');
  };

  const exportAsDocx = async () => {
    const { Document, Packer, Paragraph, ImageRun } = await import('docx');

    // Convert data URL to buffer
    const base64 = sourceImage!.split(',')[1];
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [
                new ImageRun({
                  data: bytes,
                  transformation: { width: 600, height: 800 },
                  type: 'png',
                }),
              ],
            }),
          ],
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const url = URL.createObjectURL(blob);
    downloadFile(url, 'blankcraft-export.docx');
    URL.revokeObjectURL(url);
  };

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Multi-format Exporter</h2>
        <p className="text-gray-500 mt-1">
          Export your canvas output as JPEG, PNG, PDF, or DOCX
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Preview */}
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-3">Preview</h3>
          {sourceImage ? (
            <img
              src={sourceImage}
              alt="Export preview"
              className="w-full rounded border border-gray-200"
            />
          ) : (
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded border border-gray-200">
              <p className="text-gray-400 text-center">
                No image to export.<br />
                Use other tools first to process a document.
              </p>
            </div>
          )}
        </div>

        {/* Right: Export options */}
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
            <h3 className="font-semibold text-gray-800">Export Settings</h3>

            {/* Format selection */}
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Format</label>
              <div className="grid grid-cols-2 gap-3">
                {(['jpeg', 'png', 'pdf', 'docx'] as const).map((format) => (
                  <button
                    key={format}
                    onClick={() => setOptions({ ...options, format })}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      options.format === format
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                    }`}
                  >
                    <div className="text-lg mb-1">
                      {format === 'jpeg' && '🖼️'}
                      {format === 'png' && '🎨'}
                      {format === 'pdf' && '📄'}
                      {format === 'docx' && '📝'}
                    </div>
                    <div className="text-sm font-medium uppercase">{format}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality slider (for JPEG) */}
            {options.format === 'jpeg' && (
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Quality: {options.quality}%
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={options.quality}
                  onChange={(e) => setOptions({ ...options, quality: Number(e.target.value) })}
                  className="w-full"
                />
              </div>
            )}

            {/* Include annotations */}
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={options.includeAnnotations}
                onChange={(e) =>
                  setOptions({ ...options, includeAnnotations: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-sm text-gray-700">Include annotations and overlays</span>
            </label>

            {/* Export button */}
            <button
              onClick={exportDocument}
              disabled={!sourceImage || isExporting}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isExporting ? 'Exporting...' : `Export as ${options.format.toUpperCase()}`}
            </button>

            {/* Status */}
            {exportStatus && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  exportStatus.includes('Successfully')
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : 'bg-red-50 text-red-800 border border-red-200'
                }`}
              >
                {exportStatus}
              </div>
            )}
          </div>

          {/* Format info */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Format Details</h4>
            <div className="text-xs text-gray-500 space-y-1">
              {options.format === 'jpeg' && (
                <p>JPEG: Compressed raster image. Best for photos and web use. Smaller file size.</p>
              )}
              {options.format === 'png' && (
                <p>PNG: Lossless raster image with transparency support. Best for documents with text.</p>
              )}
              {options.format === 'pdf' && (
                <p>PDF: Portable document format. Best for printing and sharing. Vector-compatible.</p>
              )}
              {options.format === 'docx' && (
                <p>DOCX: Microsoft Word format. Best for further editing in word processors.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
