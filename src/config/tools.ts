import { ToolInfo } from '@/types';

export const tools: ToolInfo[] = [
  {
    id: 'eraser',
    name: 'Printed Text Eraser',
    description: 'Erase printed text using AI inpainting',
    icon: '🧹',
    path: '/tools/eraser',
  },
  {
    id: 'handwriting-remover',
    name: 'Handwriting Remover',
    description: 'Remove handwritten ink strokes',
    icon: '✍️',
    path: '/tools/handwriting-remover',
  },
  {
    id: 'layout-extractor',
    name: 'Layout Extractor',
    description: 'Extract document structure and tables',
    icon: '📐',
    path: '/tools/layout-extractor',
  },
  {
    id: 'ocr',
    name: 'Handwriting OCR',
    description: 'Recognize handwritten text',
    icon: '🔍',
    path: '/tools/ocr',
  },
  {
    id: 'text-to-handwriting',
    name: 'Text to Handwriting',
    description: 'Convert digital text to handwriting style',
    icon: '🖊️',
    path: '/tools/text-to-handwriting',
  },
  {
    id: 'form-filler',
    name: 'Form Filler',
    description: 'Interactive form filling on canvas',
    icon: '📝',
    path: '/tools/form-filler',
  },
  {
    id: 'exporter',
    name: 'Multi-format Exporter',
    description: 'Export to JPEG, PNG, PDF, or DOCX',
    icon: '📤',
    path: '/tools/exporter',
  },
];
