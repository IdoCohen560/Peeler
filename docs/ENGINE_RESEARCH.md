# Conversion engine research and decisions

Reviewed 2026-10-26. These are implementation decisions for Peeler, not claims about which libraries reference utility uses. Runtime adapters are original code.

Follow-up implementation: project-local LibreOffice 26.8.1.1 now renders Office PDFs/page images and imports legacy XLS/PPT. Windows packaging includes FFmpeg 9.0.2; the npm fallback remains 6.1.1. HEIC decoding uses heic-decode/libheif-js; RTF text uses rtf-parser; ODS output is real OpenDocument XML; RAR input uses libarchive-wasm (embedded libarchive 3.7.7). The older selection table below records the initial content-adapter decisions; current behavior/risks are authoritative in [OFFICE_ENGINE.md](OFFICE_ENGINE.md) and [CURRENT_SUPPORT.md](CURRENT_SUPPORT.md).

| Area | Selected implementation | Why and boundaries |
| --- | --- | --- |
| Images | Sharp/libvips; bmp-js for BMP | Existing tested image encoder. SVG raster input and image-to-PDF added. No HEIC codec promise. |
| Video/audio | FFmpeg via npm `ffmpeg-static` | Actual codecs and containers with explicit stream maps and output muxers. No shell interpolation. |
| PDF input | Mozilla PDF.js + @napi-rs/canvas | Text extraction and page rasterization; handles every page. No OCR or semantic table/office reconstruction. |
| PDF output | PDFKit | Generates PDFs from decoded images or extracted text. PDFKit is not an arbitrary PDF importer. |
| Documents | Mammoth, docx, marked, html-to-text | Decode DOCX/Markdown/HTML content; generate real DOCX and other text formats. Intentionally content-oriented rather than layout-preserving. |
| Slides | OOXML relationship/spine reader; PDFKit | PPTX-to-PDF exports actual slide text in presentation order. Original slide graphics/layout are not rendered. |
| PDF to slides | PptxGenJS | Each PDF page is rasterized and embedded into a real PPTX slide. Page appearance rather than editability is retained. |
| Spreadsheets | ExcelJS, CSV parser/stringifier, bounded ODS value reader | XLSX/CSV/TSV values and ODS input. No formula calculation, style retention, or legacy XLS engine. |
| EPUB | Bounded ZIP reader, XML package/spine parsing, HTML text decoder | Read chapters in declared order. Generate an EPUB 3 container with navigation and a valid package. DRM/encryption is rejected. |
| Subtitles | Existing bounded cue parser | SRT/VTT/timing and text export; not complete styling support. |
| Archives | yauzl, tar-stream, JSZip, Node zlib | Decode and repack regular files/directories. Expansion and entry-count bounds, path validation, symlink rejection. No RAR engine yet. |

## Primary references

- [FFmpeg CLI documentation](https://ffmpeg.org/ffmpeg.html): codecs, stream selection, filters, and explicit muxers. Network protocols are restricted to file/pipe for imported media jobs.
- [ffmpeg-static](https://github.com/eugeneware/ffmpeg-static): npm dependency providing host-platform binaries. The installed Windows binary reports **6.1.1**, an older upstream version. The npm audit does not assess vulnerabilities in this binary. Update the source/binary supply chain before a public production release.
- [Sharp output API](https://sharp.pixelplumbing.com/api-output/): formats supported by the shipped codec build matter; an extension alone does not establish codec availability.
- [PDF.js examples](https://mozilla.github.io/pdf.js/examples/) and its installed distribution source: text/page APIs, scale-based rendering, and the current loading-task destruction API.
- [PDFKit](https://pdfkit.org/): document generation, text, images, and embedded fonts. PDF text output uses the bundled Liberation Sans font; source UI uses Geist.
- [Mammoth](https://github.com/mwilliamson/mammoth.js): DOCX text extraction. Its layout goals differ from Word's page rendering.
- [ExcelJS](https://github.com/exceljs/exceljs): workbook read/write and cached values. Formula computation requires another engine and is deliberately absent.
- [yauzl](https://github.com/thejoshwolfe/yauzl): lazy entry processing and size validation, used before loading OOXML/EPUB packages as well as ordinary ZIP files.
- [tar-stream](https://github.com/mafintosh/tar-stream): streaming tar headers and data. Special entries are refused instead of materialized on disk.
- [LibreOffice CLI](https://help.libreoffice.org/latest/en-US/text/shared/guide/pdf_params.html): candidate for later layout-preserving office/slides conversion. No LibreOffice, Pandoc, or system FFmpeg executable was found on this machine. A project-managed npm FFmpeg dependency was installed; no system office suite was installed.

## Reliability and supply chain

Each conversion runs in a disposable Node child process. The Electron renderer never parses input documents. Jobs have a five-minute deadline and cancellation; graceful cancellation is followed by process-tree termination when necessary. Parent-side cleanup removes the worker's temporary output after termination. A V8 heap limit is applied, but this is not a strict native-memory limit or an OS sandbox.

Native integration references: [Electron Tray](https://www.electronjs.org/docs/latest/api/tray), [BrowserWindow](https://www.electronjs.org/docs/latest/api/browser-window), and [uiohook-napi](https://github.com/SnosMe/uiohook-napi). Bare left-side modifier transitions require the native listener; Electron global shortcuts alone do not identify a native drag payload. The published hook has Node-API prebuilds for Windows/macOS/Linux architectures. Packaging uses those prebuilds without a redundant native rebuild, verified in the packaged Windows integration test.

Dependency audit initially reported transitive `uuid` and `image-size` advisories. Scoped overrides select patched versions. Spreadsheet and raster-slide roundtrip/integration tests exercise the affected callers, and `npm audit` reports zero package advisories with the resolved dependency tree. Lockfile versions and the bundled FFmpeg build still need continued maintenance.

No tool name is evidence of full parity. The tested support table is [CURRENT_SUPPORT.md](CURRENT_SUPPORT.md); the reference target remains the separate 275-path inventory.
