export type ToolId =
  | 'eraser'
  | 'handwriting-remover'
  | 'layout-extractor'
  | 'ocr'
  | 'text-to-handwriting'
  | 'form-filler'
  | 'exporter';

export interface ToolInfo {
  id: ToolId;
  name: string;
  description: string;
  icon: string;
  path: string;
}

export interface AppState {
  activeTool: ToolId;
  uploadedImage: string | null;
  canvasData: string | null;
  documentStructure: DocumentStructure | null;
  ocrText: string;
  setActiveTool: (tool: ToolId) => void;
  setUploadedImage: (image: string | null) => void;
  setCanvasData: (data: string | null) => void;
  setDocumentStructure: (structure: DocumentStructure | null) => void;
  setOcrText: (text: string) => void;
}

export interface DocumentStructure {
  tables: TableBlock[];
  paragraphs: ParagraphBlock[];
  headers: HeaderBlock[];
}

export interface TableBlock {
  id: string;
  rows: number;
  cols: number;
  position: { x: number; y: number; width: number; height: number };
}

export interface ParagraphBlock {
  id: string;
  position: { x: number; y: number; width: number; height: number };
}

export interface HeaderBlock {
  id: string;
  level: number;
  position: { x: number; y: number; width: number; height: number };
}

export interface BrushSettings {
  size: number;
  opacity: number;
  color: string;
}

export interface ExportOptions {
  format: 'jpeg' | 'png' | 'pdf' | 'docx';
  quality: number;
  includeAnnotations: boolean;
}

export interface FormField {
  id: string;
  type: 'text' | 'checkbox';
  x: number;
  y: number;
  width: number;
  height: number;
  value: string;
  checked?: boolean;
  fontSize?: number;
}

export interface HandwritingSettings {
  text: string;
  fontSize: number;
  lineHeight: number;
  angleVariation: number;
  verticalShift: number;
  color: string;
  fontFamily: string;
}
