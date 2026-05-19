'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { HandwritingSettings } from '@/types';

export default function TextToHandwritingPage() {
  const { setCanvasData } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [settings, setSettings] = useState<HandwritingSettings>({
    text: 'The quick brown fox jumps over the lazy dog.\n\nThis is a sample handwriting output with realistic variations in angle and position.',
    fontSize: 24,
    lineHeight: 1.8,
    angleVariation: 3,
    verticalShift: 2,
    color: '#1a1a2e',
    fontFamily: 'cursive',
  });
  const [isRendering, setIsRendering] = useState(false);

  const renderHandwriting = async () => {
    if (!canvasRef.current) return;
    setIsRendering(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;

    // Set canvas size
    canvas.width = 800;
    canvas.height = 1100;

    // White background
    ctx.fillStyle = '#FFFFF8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw ruled lines
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    const lineSpacing = settings.fontSize * settings.lineHeight;
    for (let y = 60; y < canvas.height - 40; y += lineSpacing) {
      ctx.beginPath();
      ctx.moveTo(40, y);
      ctx.lineTo(canvas.width - 40, y);
      ctx.stroke();
    }

    // Draw margin line
    ctx.strokeStyle = '#ffcccc';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(70, 0);
    ctx.lineTo(70, canvas.height);
    ctx.stroke();

    // Render text with handwriting effect
    ctx.fillStyle = settings.color;
    ctx.font = `${settings.fontSize}px ${settings.fontFamily}`;

    const lines = settings.text.split('\n');
    let currentY = 60;
    const startX = 80;

    for (const line of lines) {
      if (line === '') {
        currentY += lineSpacing;
        continue;
      }

      let currentX = startX;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];

        // Random angle variation
        const angle = (Math.random() - 0.5) * settings.angleVariation * (Math.PI / 180);
        // Random vertical shift
        const vShift = (Math.random() - 0.5) * settings.verticalShift;
        // Random horizontal spacing variation
        const hVariation = (Math.random() - 0.5) * 2;

        ctx.save();
        ctx.translate(currentX, currentY + vShift);
        ctx.rotate(angle);

        // Slight opacity variation for natural look
        ctx.globalAlpha = 0.85 + Math.random() * 0.15;

        ctx.fillText(char, 0, 0);
        ctx.restore();

        const charWidth = ctx.measureText(char).width;
        currentX += charWidth + hVariation;

        // Line wrap
        if (currentX > canvas.width - 60) {
          currentX = startX;
          currentY += lineSpacing;
        }
      }

      currentY += lineSpacing;
    }

    setCanvasData(canvas.toDataURL());
    setIsRendering(false);
  };

  useEffect(() => {
    renderHandwriting();
  }, []);

  const downloadImage = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = 'handwriting-output.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Text to Handwriting</h2>
        <p className="text-gray-500 mt-1">
          Convert digital text to realistic handwriting with natural variations
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Left: Settings */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-800">Input Text</h3>
            <textarea
              value={settings.text}
              onChange={(e) => setSettings({ ...settings, text: e.target.value })}
              rows={8}
              className="w-full p-3 border border-gray-200 rounded-lg resize-none text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type your text here..."
            />
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
            <h3 className="font-semibold text-gray-800">Settings</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Font Size</label>
                <input
                  type="range"
                  min="14"
                  max="40"
                  value={settings.fontSize}
                  onChange={(e) => setSettings({ ...settings, fontSize: Number(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{settings.fontSize}px</span>
              </div>

              <div>
                <label className="text-sm text-gray-600">Line Height</label>
                <input
                  type="range"
                  min="12"
                  max="30"
                  value={settings.lineHeight * 10}
                  onChange={(e) => setSettings({ ...settings, lineHeight: Number(e.target.value) / 10 })}
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{settings.lineHeight.toFixed(1)}</span>
              </div>

              <div>
                <label className="text-sm text-gray-600">Angle Variation (°)</label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={settings.angleVariation}
                  onChange={(e) => setSettings({ ...settings, angleVariation: Number(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{settings.angleVariation}°</span>
              </div>

              <div>
                <label className="text-sm text-gray-600">Vertical Shift</label>
                <input
                  type="range"
                  min="0"
                  max="8"
                  value={settings.verticalShift}
                  onChange={(e) => setSettings({ ...settings, verticalShift: Number(e.target.value) })}
                  className="w-full"
                />
                <span className="text-xs text-gray-400">{settings.verticalShift}px</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div>
                <label className="text-sm text-gray-600">Ink Color</label>
                <input
                  type="color"
                  value={settings.color}
                  onChange={(e) => setSettings({ ...settings, color: e.target.value })}
                  className="block w-10 h-8 rounded cursor-pointer"
                />
              </div>

              <div className="flex-1">
                <label className="text-sm text-gray-600">Font Style</label>
                <select
                  value={settings.fontFamily}
                  onChange={(e) => setSettings({ ...settings, fontFamily: e.target.value })}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                >
                  <option value="cursive">Cursive</option>
                  <option value="'Comic Sans MS', cursive">Comic Sans</option>
                  <option value="'Segoe Script', cursive">Segoe Script</option>
                  <option value="fantasy">Fantasy</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={renderHandwriting}
              disabled={isRendering}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {isRendering ? 'Rendering...' : 'Generate Handwriting'}
            </button>
            <button
              onClick={downloadImage}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Download PNG
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="bg-white p-4 rounded-lg shadow-sm overflow-auto max-h-[75vh]">
          <h3 className="font-semibold text-gray-800 mb-3">Preview</h3>
          <canvas
            ref={canvasRef}
            className="w-full border border-gray-200 rounded shadow-inner"
          />
        </div>
      </div>
    </div>
  );
}
