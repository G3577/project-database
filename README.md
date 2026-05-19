# BlankCraft - Multi-Tool Document Editor

A production-ready multi-tool web application for document processing, built with Next.js, TypeScript, TailwindCSS, and Fabric.js.

## Features

BlankCraft provides 7 powerful document processing tools:

| # | Tool | Description |
|---|------|-------------|
| 1 | **Printed Text Eraser** | Canvas interface with brush sizing, AI inpainting to remove printed text |
| 2 | **Handwriting Remover** | AI brush layer to filter and erase blue/black ink strokes |
| 3 | **Document Layout Extractor** | Saves document structure/tables while wiping content |
| 4 | **Handwriting OCR** | Side-by-side view: image loader + markdown text output |
| 5 | **Text to Handwriting** | Converts digital input to realistic handwriting with random variations |
| 6 | **Interactive Form Filler** | HTML5 Canvas editor for placing text inputs/checkboxes dynamically |
| 7 | **Multi-format Exporter** | Export to JPEG, PNG, PDF, or editable DOCX |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS
- **Canvas**: Fabric.js + HTML5 Canvas API
- **State Management**: Zustand
- **Export**: jsPDF, docx, file-saver

## Project Structure

```
├── docs/                          # Project documentation database
│   ├── 01_epics/                  # Epic-level feature descriptions
│   │   └── auth.md               # Example: Authorization module
│   ├── 02_tasks/                  # Task-level work items
│   │   └── task-01-frontend.md   # Example: Frontend layout task
│   └── 03_specs/                  # Technical specifications
│       └── spec-template.md      # Specification template
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Root layout with sidebar
│   │   ├── page.tsx              # Dashboard entry point
│   │   ├── globals.css           # Global styles
│   │   └── tools/
│   │       ├── eraser/           # Tool 1: Text Eraser
│   │       ├── handwriting-remover/  # Tool 2: Handwriting Remover
│   │       ├── layout-extractor/    # Tool 3: Layout Extractor
│   │       ├── ocr/                 # Tool 4: Handwriting OCR
│   │       ├── text-to-handwriting/ # Tool 5: Text to Handwriting
│   │       ├── form-filler/         # Tool 6: Form Filler
│   │       └── exporter/            # Tool 7: Multi-format Exporter
│   ├── components/
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   └── ImageUploader.tsx     # Reusable image upload component
│   ├── config/
│   │   └── tools.ts              # Tool configuration
│   ├── store/
│   │   └── useAppStore.ts        # Zustand state management
│   └── types/
│       └── index.ts              # TypeScript interfaces
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.mjs
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Documentation Structure (docs/)

The `docs/` folder contains the project management database:

- **01_epics/** — High-level feature modules with YAML frontmatter metadata
- **02_tasks/** — Individual development tasks with status tracking
- **03_specs/** — Technical specification templates and documents

All documentation files include YAML metadata headers with `type`, `status`, `priority`, and `tags` fields.

## Architecture Notes

- **State Continuity**: Uploaded documents flow seamlessly between tools via Zustand store
- **Canvas Pipeline**: Image → Eraser/Remover → Form Filler → Exporter
- **Mock AI Integrations**: AI processing steps use mock implementations ready for real API endpoints
- **Modular Components**: Each tool is an independent page with shared state access
