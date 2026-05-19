'use client';

import { create } from 'zustand';
import { AppState, ToolId, DocumentStructure } from '@/types';

export const useAppStore = create<AppState>((set) => ({
  activeTool: 'eraser',
  uploadedImage: null,
  canvasData: null,
  documentStructure: null,
  ocrText: '',
  setActiveTool: (tool: ToolId) => set({ activeTool: tool }),
  setUploadedImage: (image: string | null) => set({ uploadedImage: image }),
  setCanvasData: (data: string | null) => set({ canvasData: data }),
  setDocumentStructure: (structure: DocumentStructure | null) =>
    set({ documentStructure: structure }),
  setOcrText: (text: string) => set({ ocrText: text }),
}));
