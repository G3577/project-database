'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/store/useAppStore';
import ImageUploader from '@/components/ImageUploader';

export default function OcrPage() {
  const { uploadedImage, ocrText, setOcrText } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const performOcr = async () => {
    if (!uploadedImage) return;
    setIsProcessing(true);

    // Mock OCR API call
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Simulated OCR result
    const mockResult = `# Recognized Handwriting

## Page Content

Dear Professor Johnson,

I am writing to submit my research proposal for the upcoming semester. The topic I have chosen focuses on the intersection of machine learning and natural language processing.

### Key Points:

1. The methodology involves training a transformer-based model on handwritten text datasets.
2. Expected outcomes include improved accuracy in cursive text recognition.
3. Timeline: 12 weeks from approval date.

### Notes:
- Meeting scheduled for Tuesday at 3 PM
- Bring printed copies of the draft
- Review chapters 5-7 before next class

Best regards,
Student Name
Student ID: 2024-0512`;

    setOcrText(mockResult);
    setConfidence(87.5);
    setIsProcessing(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ocrText);
  };

  const downloadAsMarkdown = () => {
    const blob = new Blob([ocrText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ocr-result.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Handwriting OCR</h2>
        <p className="text-gray-500 mt-1">
          Recognize handwritten text and convert to editable markdown
        </p>
      </div>

      {!uploadedImage ? (
        <ImageUploader className="max-w-2xl" />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm">
            <button
              onClick={performOcr}
              disabled={isProcessing}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {isProcessing ? 'Recognizing...' : 'Run OCR'}
            </button>
            {ocrText && (
              <>
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Copy Text
                </button>
                <button
                  onClick={downloadAsMarkdown}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Download .md
                </button>
                {confidence && (
                  <span className="text-sm text-gray-500">
                    Confidence: <span className="font-medium text-green-600">{confidence}%</span>
                  </span>
                )}
              </>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 h-[65vh]">
            {/* Left: Image viewer */}
            <div className="bg-white p-4 rounded-lg shadow-sm overflow-auto">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Source Image</h3>
              <img
                src={uploadedImage}
                alt="Document"
                className="w-full rounded border border-gray-200"
              />
            </div>

            {/* Right: Text output */}
            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-col">
              <h3 className="text-sm font-medium text-gray-700 mb-3">Recognized Text (Markdown)</h3>
              <textarea
                ref={textAreaRef}
                value={ocrText}
                onChange={(e) => setOcrText(e.target.value)}
                placeholder="OCR results will appear here..."
                className="flex-1 w-full p-3 border border-gray-200 rounded-lg resize-none font-mono text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
