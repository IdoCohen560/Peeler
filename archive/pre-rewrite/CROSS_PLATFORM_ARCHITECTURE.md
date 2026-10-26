# Cross-Platform reference utility Architecture

## Overview
This document outlines the architecture for a cross-platform file converter application that mimics the functionality of reference utility, supporting Windows, macOS, and Linux.

## Architecture Design

### 1. Core Components

#### Converter Engine
A modular core that handles:
- File format detection 
- Format conversion logic
- Cross-platform file I/O operations
- Error handling and logging

#### Platform Adapters
Separate modules for each platform to handle:
- Native file system integrations
- Platform-specific UI elements
- Localized user experience
- System integration (drag-drop, context menus)

#### Format Handlers
Individual modules for each supported format:
- Images (JPG, PNG, etc.)
- Audio (MP3, WAV, etc.)
- Video (MP4, MOV, etc.)
- Documents (PDF, DOCX, etc.)
- Spreadsheets (XLSX, etc.)
- EPUB, Subtitles (.srt), Archives (.zip, .tar)

### 2. API Design

#### Entry Points
```
convert(inputFile, outputFile, options)
resolveFormat(inputFile)  
getSupportedFormats()
```

#### Data Models
```json
{
  "input": {
    "path": "/path/to/input/file",
    "format": "pdf"
  },
  "output": {
    "path": "/path/to/output/file",
    "format": "docx"
  },
  "options": {
    "quality": "high",
    "preserveMetadata": true,
    "timeout": 30000
  }
}
```

### 3. Technology Stack

- Language: Node.js (cross-platform compatibility)
- Core modules: 
  - `fs` for file system operations
  - Format-specific libraries like:
    - Image conversion: Sharp
    - PDF handling: PDFKit
    - Video processing: FFmpeg
    - Document formats: Mammoth, Pptxtemplater
- Cross-platform UI framework (optional): Electron or Tauri

### 4. Development Approach

1. Build the core converter engine with unit tests
2. Implement platform-specific adapters for Windows, macOS, and Linux
3. Add support for all required format handlers
4. Create integration tests across platforms
5. Document the usage and API for developers

## Design Decisions

1. **Modular Architecture**: Separates concerns for easier maintenance and expansion
2. **Format Abstraction**: Each format handler is a separate module  
3. **Cross-Platform Compatibility**: Uses Node.js standard libraries where possible
4. **Extensibility**: Easy to add new formats or features
5. **Error Handling**: Comprehensive error reporting and recovery

## Next Steps

1. Create prototype implementation of the core converter engine
2. Test with common file formats 
3. Validate cross-platform functionality