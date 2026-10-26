# Development checklist

## Foundation

- [x] Review discoverable website pages and interactive feature inventory.
- [x] Replace inaccurate documentation and retain a historical snapshot.
- [x] Write product specification, architecture, and staged roadmap.
- [x] Implement real image and subtitle conversions with source preservation.
- [x] Add desktop file picking, in-window drop, per-file formats, batch states, and errors.
- [x] Add core regression tests and Electron workflow test.
- [x] Configure host packaging and a Windows/macOS/Linux CI matrix.

## Cross-category development milestone

- [x] Real local conversion adapters spanning all ten categories.
- [x] Actual audio/video output codec fixtures and decodability checks.
- [x] PDF text/page-image/raster-PPTX exports.
- [x] Text-content DOCX/EPUB/slides and spreadsheet-value conversions.
- [x] Bounded ZIP/TAR/GZIP repacking and traversal/link rejection.
- [x] Ten-category batch through the UI and packaged Windows executable (development milestone).
- [ ] Complete the full reference format/fidelity/tool scope below.

## Product work remaining

- [ ] Run CI and real-machine validation on macOS and Linux.
- [x] Disposable workers, cancellation, deadlines, and bounded diagnostics.
- [x] Managed job workspaces and recovery of abandoned leases; active jobs/unrelated files retained.
- [ ] Recovery/atomicity if the host dies during final output publication; broader hostile-input and native allocation controls.
- [x] Image size/quality/JPG-background controls and session output-folder picker, including wheel handoff.
- [ ] Exact-size compression, animation/multipage policies, metadata retention settings and persisted preferences.
- [ ] Images: finish HEIC/BMP/SVG/PDF routes and quality/animation policies.
- [x] Video: container conversion, GIF export, and MP3 extraction with decoded fixture checks.
- [x] Audio: MP3/M4A/WAV/FLAC/OGG/Opus/AIFF/WMA conversions with decoded fixture checks.
- [ ] PDF: page images, office exports, text/Markdown, EPUB, and local OCR.
- [ ] Documents: DOCX/Pages/Markdown/TXT and rich-text imports/exports.
- [x] Slides: PPT/PPTX to PDF/JPG/PNG using available Office rendering; geometry/image fixtures verified.
- [x] Spreadsheets: XLSX/ODS/CSV/TSV, XLS import, PDF export; values-oriented workbook exports.
- [ ] Preserve workbook formulas/styles and validate real-world Office layout/fidelity across platforms.
- [ ] EPUB: PDF/DOCX/Pages/TXT/Markdown/HTML exports.
- [ ] Subtitles: extend current SRT/VTT/TXT subset with stronger syntax/fidelity handling.
- [ ] Archives: ZIP/TAR/GZIP interchange and RAR input/extraction.
- [x] RAR input to ZIP/TAR/GZIP repacking with byte checks and link/encryption rejection.
- [x] Background tray/menu-bar host with no normal startup window.
- [ ] Native file-manager context actions.
- [x] Radial overlay and initial Left Shift / Left Alt (Command on Mac) gesture state machine.
- [ ] Manual Explorer drag, macOS and X11 validation; Wayland-compatible alternative.
- [ ] Sharing, floating shelf, clipboard copy, move, copy path, terminal actions.
- [ ] Advanced editing tools and content-removing redaction.
- [ ] Per-platform release QA, dependency/license review, custom app icon, signing and distribution.
