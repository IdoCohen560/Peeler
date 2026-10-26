# Peeler 0.2: current working support

This is the implemented scope, distinct from the reference website's 275-path requirements. A mixed ten-file batch has passed through the desktop app and the packaged Windows executable.

| Category | Inputs | Available outputs | Current fidelity |
| --- | --- | --- | --- |
| Images | JPG/JPEG, PNG, WebP, TIFF/TIF, AVIF, SVG, BMP, HEIC | PNG, JPG, WebP, AVIF, TIFF, BMP, PDF | One raster frame/page; metadata removed; default quality 85; optional size/quality and JPG/BMP background controls. HEIC: first decoded 8-bit image, no HDR/depth/sequence preservation |
| Video | MP4, MOV, MKV, WebM, AVI, WMV, GIF | MP4, MOV, MKV, WebM, AVI, WMV; GIF and MP3 from video containers | Re-encodes first video/audio streams; MP3 requires an audio track; GIF input cannot produce audio |
| Audio | MP3, M4A, WAV, FLAC, OGG, Opus, AIFF, WMA | Other formats in the same list | Actual FFmpeg encoding; codec defaults explicit in media adapter |
| PDF | PDF | TXT, MD, DOCX, EPUB, PNG, JPG, PPTX | Text exports lose layout and require selectable text; PNG/JPG export every page at 300 DPI into a ZIP; PPTX contains rendered page images |
| Documents | DOCX, RTF, Markdown, TXT, HTML | TXT, Markdown, HTML, DOCX, PDF, EPUB, PNG/JPG page ZIPs | DOCX/RTF PDF/page images use Office rendering when available; other exports preserve text only. Missing fonts can change layout |
| Slides | PPT/PPTX with Office; PPTX without it | PDF and PNG/JPG page ZIPs with Office; PDF without it | Office renders real slide graphics/layout, with possible font substitution. Without Office, PPTX PDF contains text only; legacy PPT and slide image routes are unavailable |
| Spreadsheets | XLSX, ODS, CSV, TSV; XLS with Office | XLSX, ODS, CSV, TSV, PDF | Workbook/text exports preserve values and cached formula results, not formulas/styles. Office renders PDF from XLS/XLSX/ODS when available; fallback PDF is a text table. Multi-sheet CSV/TSV is rejected |
| EPUB | EPUB | TXT, Markdown, HTML, DOCX, PDF | Text in spine/reading order. No book images/layout or DRM/encryption support |
| Subtitles | SRT, VTT | Other subtitle format or TXT | Cue timing; not styling, identifiers, or settings |
| Archives | ZIP, TAR, TAR.GZ, TGZ, GZIP, RAR | ZIP, TAR, TAR.GZ | Regular file contents/names and directories. No links, special files, encryption, or archive metadata preservation. RAR repacking uses WebAssembly libarchive |

Same-format conversions are hidden. JPEG/TIFF aliases and TGZ map to their canonical extensions. Output saves beside the input or in the chosen session destination, with collision-safe numbered names. Sources are not overwritten. PDF/document/slide page-image archives use `.png.zip` or `.jpg.zip` filenames. See OFFICE_ENGINE.md for setup and exact engine availability.

## Use

Run `npm start` for the background tray host. During a drag, tap Left Shift for formats; use Left Alt for tools on Windows/Linux, Command on macOS. Drop onto the wheel and release the mouse. The staged files remain available while you browse Formats/Tools, choose a format, or cancel. Clicking a choice starts conversion; dropping alone does not. Escape cancels. Use the tray picker or `npm run start:window` for the optional larger converter. Cancel batch stops the current job and skips remaining jobs. Progress is reported as phases, media output time, or PDF page counts when available. This is not a percentage estimate.

The category list and per-file fidelity notes are part of the interface. Keyboard Shift on a focused format button opens its dialog; Escape closes it. A long queue scrolls inside the workspace so the conversion action stays accessible. More options on a staged wheel opens the optional converter without converting. Image options keep proportions, never enlarge, and accept maximum dimensions up to 16,384 pixels and lossy quality 1-100. Quality applies to JPG/WebP/AVIF; JPG/BMP transparency uses the chosen background. Destination choice lasts until quit/reset and applies to wheel jobs too.

For supported raster formats, Save image copy applies those options while retaining the source format and using a separate ` - edited` filename. The wheel's Resize / quality tool opens configuration rather than immediately re-encoding. Re-encoding does not guarantee a smaller file; exact-size compression remains a separate unfinished requirement.

CLI example: `npm run convert -- "C:\path\clip.mov" mp4`. Optional third argument is an existing output directory. Programmatic callers can supply `AbortSignal` and a progress callback to `convert`.

## Still missing

HEIC encoding, Pages import/export, RTFD/text clippings, scanned-document OCR, editable PDF table/slide reconstruction, full Office fidelity and much of the reference tool inventory. Text-to-PDF uses bundled Liberation Sans; scripts absent from that font are not faithfully rendered. Video defaults do not preserve HDR/transparency or additional streams. The complete remaining reference gap is 40 routes; see CONVERSION_TEST_RESULTS.md and RELEASE_READINESS.md.

The background drag wheel is implemented with an initial Windows/X11 hook adapter. Actual file-manager drag behavior, macOS permissions/runtime, and Linux runtime need native verification; Wayland capture is unavailable. File-manager extensions, sharing/shelf actions, advanced editors, settings, custom output folder UI, and signed releases remain future work. The source is portable, but this session verified Windows only.

## Input bounds

Media: 4 GB; other files: 100 MB; subtitles: 10 MB. Images: 80 million pixels. PDF: 200 pages and 40 million pixels per rendered page. Archive/package expansion: 200 MB and 10,000 entries. Workbook import: 100,000 rows and 1,000 columns; large or unusually repeated ODS files may be rejected. Each job has a five-minute deadline and a 768 MB V8 heap limit. Native allocations are not strictly bounded by the V8 limit.
