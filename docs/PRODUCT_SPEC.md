# Peeler product specification

Peeler is an independent, free, open-source file utility for Windows, Linux, and macOS, named by the user. It is inspired by the public workflow of reference utility for Mac. It is not a port, binary reconstruction, or affiliated product.

## Product contract

Convert and edit local files with few interruptions. No account, subscription, artificial conversion allowance, uploads, or telemetry. Save a separate result beside the input unless the user explicitly chooses another destination. Never overwrite the original. Unsupported operations must be unavailable or explained, never simulated as successful.

## Interaction model

The long-term interaction begins in a file manager. The user starts dragging files, taps a configurable modifier, and selects an operation from an overlay at the pointer. Releasing the modifier keeps the menu open. Dropping stages the files and keeps the menu open. After releasing the mouse, the user browses Formats/Tools and clicks a choice to execute; Cancel or Escape discards the staged selection. No conversion runs solely because a file was dropped. Only operations supported by the whole selection appear. Batch-only operations such as joining clips appear when appropriate. Keep ordinary file dragging intact when no gesture is triggered.

User-confirmed bindings: Left Shift for conversions, Left Alt for tools on Windows/Linux, Command for tools on macOS. Control for file actions remains a future design option. These are Peeler bindings, not claims about a reference utility Windows build. Test collisions with native copy/move drag modifiers before shipping. Provide keyboard navigation, ordinary buttons, and a file-picker fallback from the beginning.

The development build now starts in the tray/menu bar and lazily opens a radial overlay during a drag gesture. An optional file picker/history window remains available. The native hook, drop bridge, and conversion paths have automated coverage, but actual OS file-manager dragging and non-Windows behavior need manual validation. Current support and fidelity limits are maintained in CURRENT_SUPPORT.md.

## Conversion scope

All ten categories are required for the intended product. These are target capabilities derived from the reference product, not claims of completed parity. Each path needs fixture tests, dependency availability checks, and platform verification before being enabled. See [CONVERSION_MATRIX.md](CONVERSION_MATRIX.md) for every input/output route observed in the website's public demo and [format-inventory.json](format-inventory.json) for the machine-readable inventory.

| Family | Target scope |
| --- | --- |
| Images | JPG, PNG, WebP, HEIC, TIFF, AVIF, BMP; rasterize SVG; image-to-PDF |
| Audio | MP3, M4A, WAV, FLAC, OGG, Opus, AIFF, WMA |
| Video | MP4, MOV, MKV, WebM, AVI, WMV; GIF and audio extraction |
| PDF | Page rasterization; text/Markdown; editable office exports; EPUB; local OCR for scanned content |
| Documents | DOCX, Pages, Markdown, TXT, EPUB; rich-text imports; HTML/PDF/image exports |
| Slides | PPT/PPTX inputs to PDF and page images; PDF to PPTX |
| Spreadsheets | XLSX, ODS, CSV, TSV; XLS input; PDF export |
| EPUB | EPUB to PDF, DOCX, Pages, TXT, Markdown, HTML; PDF to EPUB |
| Subtitles | SRT/VTT interchange and plain-text export |
| Archives | ZIP/TAR/GZIP interchange; RAR extraction |

Current image operations process one raster image, auto-orient where supported, strip metadata, and default to quality 85. The optional converter now provides proportional maximum dimensions, lossy quality, and JPG/BMP background choices, reachable through More options after a wheel drop. HEIC input uses a separately tested decoder; HEIC output is still unavailable. Animated/multipage preservation, exact-size compression, and metadata retention settings remain unimplemented. Subtitle conversion drops cue identifiers/settings and skips VTT NOTE/STYLE/REGION blocks; it is not a full styling-preserving subtitle editor.

## Advanced tools inventory

The reference demo defines 26 distinct tool identifiers. Peeler should implement and test them incrementally:

| Area | Tools to build |
| --- | --- |
| Shared | Compression; metadata inspection/editing/removal |
| Images | Color/exposure adjustments; annotations; background composition; cropping; collage; redaction; images to PDF |
| Video | Mute; trim; crop; speed changes; join; frame export; split; redaction |
| Audio | Loudness normalization; trim; channel conversion; waveform video; bleep ranges |
| PDF | Split; organize pages; merge |
| Archives | Extract |

Only image metadata removal is included in the starter. It re-encodes the image; it is not lossless tag surgery. Future redaction must remove underlying content, including PDF text and image data, rather than merely adding a visual layer. OCR and face detection must run locally and remain optional.

Detailed editor requirements from the tools catalog: frame stepping and typed timecodes for video trims; first-clip canvas selection for joins; custom or evenly spaced split points; pitch preservation for speed changes; loudness range and peak controls for normalization; independent left/right gain and channel preview; silence trimming limited to recording boundaries; time-scoped video redaction; original-versus-bleep audio preview; and selectable page order before PDF merge. Image editors include correction controls, freehand/shape annotations, composited backgrounds, exact crop dimensions, and configurable collage layouts. These remain future acceptance cases, not controls in the starter.

## File actions

Reference actions comprise system sharing, a floating shelf, clipboard file copy, move, path copy, and opening a containing directory in a terminal. Peeler needs adapters: AirDrop is macOS-specific; Windows/Linux alternatives depend on available sharing facilities. A floating shelf should support drag-out and optional edge pinning. Actions must support folders and heterogeneous selections independently of conversion capability. Starter only implements revealing completed results in the native file manager.

## Acceptance criteria

- Output decodes as the requested format, rather than being an extension rename.
- Source bytes remain unchanged; output collisions produce new numbered names, including concurrent jobs.
- Invalid inputs produce visible per-file errors; other batch jobs continue.
- Menus disclose only available capabilities; missing engines produce actionable messages.
- UI works with keyboard and narrow windows, reports busy states, and prevents accidental exit during a batch.
- Runtime conversion does not contact a network service. Installer/dependency downloads during development are separate.
- A release is verified on each supported OS; packaging configuration alone is not cross-platform validation.
