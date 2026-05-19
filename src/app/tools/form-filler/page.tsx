'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import ImageUploader from '@/components/ImageUploader';
import { FormField } from '@/types';

export default function FormFillerPage() {
  const { uploadedImage, canvasData, setCanvasData } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fields, setFields] = useState<FormField[]>([]);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [fieldType, setFieldType] = useState<'text' | 'checkbox'>('text');
  const [fontSize, setFontSize] = useState(16);
  const [isPlacing, setIsPlacing] = useState(false);

  const backgroundImage = canvasData || uploadedImage;

  useEffect(() => {
    if (!backgroundImage || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      renderFields(ctx);
    };
    img.src = backgroundImage;
  }, [backgroundImage, fields]);

  const renderFields = (ctx: CanvasRenderingContext2D) => {
    fields.forEach((field) => {
      if (field.type === 'text') {
        // Draw text field background
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fillRect(field.x, field.y, field.width, field.height);
        ctx.strokeStyle = activeField === field.id ? '#3B82F6' : '#9CA3AF';
        ctx.lineWidth = activeField === field.id ? 2 : 1;
        ctx.strokeRect(field.x, field.y, field.width, field.height);

        // Draw text
        if (field.value) {
          ctx.fillStyle = '#1F2937';
          ctx.font = `${field.fontSize || 16}px sans-serif`;
          ctx.fillText(field.value, field.x + 4, field.y + (field.height / 2) + 5);
        }
      } else if (field.type === 'checkbox') {
        // Draw checkbox
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(field.x, field.y, 20, 20);
        ctx.strokeStyle = activeField === field.id ? '#3B82F6' : '#4B5563';
        ctx.lineWidth = 2;
        ctx.strokeRect(field.x, field.y, 20, 20);

        if (field.checked) {
          ctx.fillStyle = '#3B82F6';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText('✓', field.x + 3, field.y + 16);
        }
      }
    });
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (isPlacing) {
      // Place new field
      const newField: FormField = {
        id: `field-${Date.now()}`,
        type: fieldType,
        x,
        y: y - (fieldType === 'text' ? 15 : 10),
        width: fieldType === 'text' ? 200 : 20,
        height: fieldType === 'text' ? 30 : 20,
        value: '',
        checked: false,
        fontSize,
      };
      setFields([...fields, newField]);
      setActiveField(newField.id);
      setIsPlacing(false);
    } else {
      // Check if clicking on existing field
      const clickedField = fields.find((f) => {
        const fw = f.type === 'checkbox' ? 20 : f.width;
        const fh = f.type === 'checkbox' ? 20 : f.height;
        return x >= f.x && x <= f.x + fw && y >= f.y && y <= f.y + fh;
      });

      if (clickedField) {
        if (clickedField.type === 'checkbox') {
          setFields(
            fields.map((f) =>
              f.id === clickedField.id ? { ...f, checked: !f.checked } : f
            )
          );
        }
        setActiveField(clickedField.id);
      } else {
        setActiveField(null);
      }
    }
  };

  const updateFieldValue = (id: string, value: string) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, value } : f)));
  };

  const deleteField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
    setActiveField(null);
  };

  const saveCanvas = () => {
    if (!canvasRef.current) return;
    setCanvasData(canvasRef.current.toDataURL());
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Interactive Form Filler</h2>
        <p className="text-gray-500 mt-1">
          Click to place text inputs or checkboxes on the document
        </p>
      </div>

      {!backgroundImage ? (
        <ImageUploader className="max-w-2xl" />
      ) : (
        <div className="grid grid-cols-4 gap-4">
          <div className="col-span-3 space-y-4">
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg shadow-sm flex-wrap">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Field Type:</label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as 'text' | 'checkbox')}
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm"
                >
                  <option value="text">Text Input</option>
                  <option value="checkbox">Checkbox</option>
                </select>
              </div>

              {fieldType === 'text' && (
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Size:</label>
                  <input
                    type="range"
                    min="10"
                    max="32"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-20"
                  />
                  <span className="text-xs text-gray-400">{fontSize}px</span>
                </div>
              )}

              <button
                onClick={() => setIsPlacing(true)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  isPlacing
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isPlacing ? '📍 Click on canvas to place' : '+ Add Field'}
              </button>

              <button
                onClick={saveCanvas}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Save Canvas
              </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm overflow-auto max-h-[65vh]">
              <canvas
                ref={canvasRef}
                onClick={handleCanvasClick}
                className={`max-w-full border border-gray-200 rounded ${
                  isPlacing ? 'cursor-crosshair' : 'cursor-pointer'
                }`}
              />
            </div>
          </div>

          {/* Field editor panel */}
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="font-semibold text-gray-800 mb-3">Fields ({fields.length})</h3>
              <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                {fields.length === 0 ? (
                  <p className="text-sm text-gray-400">
                    No fields yet. Click &quot;Add Field&quot; then click on the canvas.
                  </p>
                ) : (
                  fields.map((field) => (
                    <div
                      key={field.id}
                      className={`p-2 rounded border text-sm ${
                        activeField === field.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-700">
                          {field.type === 'text' ? '📝' : '☑️'} {field.type}
                        </span>
                        <button
                          onClick={() => deleteField(field.id)}
                          className="text-red-500 hover:text-red-700 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                      {field.type === 'text' && (
                        <input
                          type="text"
                          value={field.value}
                          onChange={(e) => updateFieldValue(field.id, e.target.value)}
                          placeholder="Enter text..."
                          className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-xs text-yellow-800">
                💡 Tip: Use the Eraser or Handwriting Remover first to clear the document, then fill in the form here.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
