# Category actions and parity plan

This inventory separates **format conversions**, **advanced file tools**, and **file actions**. Tangerine's public site is the behavior reference; it demonstrates a macOS app and its in-page file operations are explicitly simulated. The category names, action labels, keyboard instructions, and selection-dependent menus below are observed in the public website demo, not verified against Tangerine's packaged application. Peeler is an independent project; its Linux/Windows behavior and action availability must be implemented and verified separately. README category panels show Peeler's own wheel component; actions marked planned are not implemented.

## Evidence and limits

- The public category demo was opened and each of its ten tabs was selected. The observed key labels are Shift for conversions, Command for advanced tools, and Control for file actions. The demo says to start dragging, tap the key, keep dragging, then drop to stage; Enter opens the format menu and Escape cancels. The site says the demo operations are simulated.
- The public `/tools` catalog exposes 22 detailed tool pages. The category wheels show 26 tool identifiers; the other four are Create PDF, Mute Video, Split PDF, and Extract Archive. The count difference is inferred by comparing the two public lists.
- Site copy advertises 275 conversion options. Those are not all independently exercised here; Peeler tracks route-level fixtures in `PARITY_PLAN.md` and `CONVERSION_TEST_RESULTS.md`.
- No Tangerine app binary or private code was inspected. Radare2 and Ghidra were used only on the MIT-licensed `uiohook-napi@1.5.5` native dependency that Peeler itself declares. This confirms compiled hook interfaces, not Tangerine behavior and not successful real file-manager drags.

## Platform decision: Windows and Linux first

Peeler's current bindings remain Left Shift for formats and Left Alt for tools on Windows/Linux. Keep those as Peeler-specific bindings while adding the file-actions mode. The reference's Control key must not be copied into Peeler without resolving its collision with the standard Ctrl-drag copy behavior in Windows Explorer and many Linux file managers. Prototype the third mode with an explicit, configurable binding and test ordinary drag-copy/move behavior before settling the default. Provide a visible wheel button and tray/picker path so a modifier conflict or unsupported session does not strand an action.

The current hook adapter uses `uiohook-napi` keycode values 42 (Left Shift), 56 (Left Alt), and 3675/3676 (Meta keys). The dependency's public constants agree with those values; Radare2 identified Windows `SetWindowsHookExA`/`GetMessageA` imports and the Linux artifact as ELF; Ghidra successfully analyzed the Linux x64 `.node` build. This is static package evidence only. It does not prove the hook can read a drag payload or that Explorer, X11 file managers, or Wayland sessions complete the staged drop. Linux Wayland currently has no global gesture path and must retain the picker fallback.

Priority order: (1) Windows Explorer end-to-end drag and stage behavior; (2) Linux X11 with at least one GTK and one KDE file manager; (3) Linux Wayland picker fallback and clear status; (4) only after these pass, macOS permissions/runtime. Keep CI results separate from hands-on OS acceptance.

## Peeler keys by operating system

Start dragging a file, tap a modifier, then drop it onto the wheel to stage the file and choose an action.

| Platform | Formats wheel | Tools wheel | Status |
| --- | --- | --- | --- |
| Windows | Left Shift | Left Alt | Windows preview available; physical Explorer drag still needs manual validation. |
| Linux on X11 | Left Shift | Left Alt | Global hook is configured; native file-manager behavior needs validation. |
| Linux on Wayland | Tray picker | Tray picker | Global drag-key capture is unavailable. |
| macOS | Left Shift | Command | Accessibility permission required; native behavior needs validation. |

Peeler has no file-actions wheel or assigned key for one. Tangerine's Mac demo uses Shift for conversions, Command for file tools, and Control for file actions.

## Category comparison and planned work

### Images

**Tangerine conversions:** JPG/PNG/WebP/HEIC/TIFF/AVIF/BMP inputs to supported image formats or PDF; SVG is input only. The visible target set depends on the source; the example JPG wheel shows PNG, WEBP, HEIC, TIFF, AVIF, BMP, and PDF.

**Tangerine tools for one image:** Compress; Edit Metadata; Edit Photo; Annotate; Add Background; Crop; Redact.

**Tangerine tools for a selection:** Compress; Edit Metadata; Crop; Create PDF; Make a Collage. The site describes PDF creation as one page per selected image, and collage layouts as grid/row/column/featured with ordering and spacing controls. Actions vary by source type and selection size.

**Peeler now:** The Formats wheel converts supported image inputs. The Tools wheel exposes metadata removal and image options. Proportional resize, lossy quality, and JPG/BMP background settings are available during conversion or for a same-format edited copy. Metadata removal re-encodes supported images.

**Peeler planned:** Target-size/percentage compression; general metadata inspection/editing; photo/color/exposure editing; annotations; background composition; crop UI; permanent redaction; multi-image PDF creation; collage. Existing resize/quality controls do not provide exact-size compression. Add these as distinct Tools wheel actions: **Compress**, **Edit Metadata**, **Photo Adjust**, **Annotate**, **Background**, **Crop**, **Redact**, **Create PDF**, and **Collage**. Retain the existing **Remove Metadata** and **Resize / Quality** actions.

### Video

**Tangerine conversions:** Video containers to MP4/MOV/MKV/WebM/AVI/WMV, GIF output, and MP3 audio extraction when available.

**Tangerine tools for one video:** Compress; Edit Metadata; Remove Audio; Trim; Crop; Change Speed; Save Frames; Split; Redact.

**Tangerine tools for a selection:** Compress; Edit Metadata; Remove Audio; Join. Joining accepts multiple clips and lets the user arrange playback order. Other tools depend on a single selected video.

**Peeler now:** Format conversion and MP3 audio extraction through the local FFmpeg worker. The Tools wheel includes **Mute video** for non-GIF video; it copies the first video stream, removes audio, and saves a separate file.

**Peeler planned:** Compression controls; metadata inspection/editing/removal; trim; crop; speed changes; frame export; split; join; permanent time-scoped redaction. Add Tools wheel actions: **Compress**, **Metadata**, **Trim**, **Crop**, **Change Speed**, **Save Frames**, **Split**, **Join**, and **Redact**.

### Audio

**Tangerine conversions:** MP3, M4A, WAV, FLAC, OGG, Opus, AIFF, and WMA interchange.

**Tangerine tools for one recording:** Compress; Edit Metadata; Normalize Volume; Visualize; Trim; Convert Channels; Bleep.

**Tangerine tools for a selection:** Compress; Edit Metadata; Normalize Volume. Single-file trim is described as waveform/timecode-based and automatic silence removal applies to recording ends only; channel conversion supports mono/stereo and independent left/right levels; bleeping selects time ranges. Other tools depend on a single selected recording.

**Peeler now:** Audio format conversion through the local FFmpeg worker. The Tools wheel includes **Normalize Volume**, using FFmpeg loudnorm with a fixed local target and saving a separate copy.

**Peeler planned:** Compression controls; metadata inspection/editing/removal; adjustable loudness controls; waveform video; trim; channel conversion; bleep ranges. Add Tools wheel actions: **Compress**, **Metadata**, **Visualize**, **Trim**, **Channels**, and **Bleep**.

### PDF

**Tangerine conversions and exports:** PDF to DOCX, Pages, PPTX, XLSX, JPG/PNG pages, EPUB, TXT, or Markdown. Its showcase describes OCR for scanned-page text and PDF exports.

**Tangerine tools for one PDF:** Compress; Edit Metadata; Split; Organize Pages.

**Tangerine tools for a selection:** Compress; Edit Metadata; Split; Merge. Merge supports reordering the selected PDFs; split exports each page to its own PDF in a new folder. The showcase also describes OCR-backed text extraction for scanned pages.

**Peeler now:** Export selectable text/Markdown, DOCX, EPUB, page images, and image-based PPTX. No OCR, PDF page editor, metadata editor, or compression tool is implemented.

**Peeler planned:** Compression; metadata inspection/editing/removal; split; merge; reorder/rotate/duplicate/delete pages; local OCR; table reconstruction; PDF-to-Pages and PDF-to-XLSX routes; permanent redaction. Add Tools wheel actions: **Compress**, **Metadata**, **Split**, **Organize Pages**, **Merge**, **OCR**, **Extract Tables**, and **Redact**.

### Documents

**Tangerine conversions:** DOCX/Pages interchange; export document formats to PDF, HTML, EPUB, JPG, or PNG; import RTF, RTFD, and Finder text clippings.

**Tangerine category tools:** The category showcase has a Formats wheel and conversion cards; it does not show a separate document Tools wheel.

**Peeler now:** Convert DOCX, RTF, Markdown, TXT, and HTML among supported text/document formats, PDF, EPUB, and page images. Layout fidelity varies by route and Office engine availability.

**Peeler planned:** Pages input/output, RTFD and text-clipping import, remaining documented conversion routes, and measured layout fidelity. The public category showcase does **not** show a separate Documents Tools wheel. Additional document actions such as **Page Range**, **Watermark**, **Redact**, and **Extract Images** are Peeler roadmap ideas, not observed Tangerine category actions. The missing routes are listed in [conversion audit results](CONVERSION_TEST_RESULTS.md).

### Slides

**Tangerine conversions:** PPT/PPTX to PDF or JPG/PNG slide images; PDF to PPTX.

**Tangerine category tools:** The category showcase has a Formats wheel and conversion cards; it does not show a separate slide Tools wheel.

**Peeler now:** PPT/PPTX to PDF and page images when the local Office engine is available; PPTX has a text-only PDF fallback. PDF-to-PPTX embeds page images.

**Peeler planned:** Improve rendering fidelity and evaluate editable PDF-to-PPTX reconstruction. The public category showcase does **not** show a separate Slides Tools wheel. **Reorder Slides**, **Extract Media**, **Watermark**, and **Speaker Notes** are Peeler roadmap ideas; the reference category showcase does not demonstrate slide-specific tools.

### Spreadsheets

**Tangerine conversions:** XLSX, ODS, CSV, and TSV interchange; XLS import; PDF export; PDF to XLSX.

**Tangerine category tools:** The category showcase has a Formats wheel and conversion cards; it does not show a separate spreadsheet Tools wheel.

**Peeler now:** XLSX, ODS, CSV, TSV, and PDF conversion; XLS support and Office PDF rendering depend on the local Office engine. Workbook/text exports preserve values and cached formula results, not formulas/styles.

**Peeler planned:** PDF table extraction to XLSX and stronger formula/style fidelity. The public category showcase does **not** show a separate Spreadsheets Tools wheel. **Remove Hidden Data**, **Formula Values**, **Split Sheets**, **Merge Sheets**, and **CSV Options** are Peeler roadmap ideas; they are not observed reference actions.

### EPUB

**Tangerine conversions:** EPUB to PDF, DOCX, Pages, TXT, Markdown, or HTML; PDF to EPUB.

**Tangerine category tools:** The category showcase has a Formats wheel and conversion cards; it does not show a separate EPUB Tools wheel.

**Peeler now:** Export EPUB reading-order text to TXT, Markdown, HTML, DOCX, or PDF. Book images/layout and DRM-protected files are unsupported.

**Peeler planned:** EPUB-to-Pages, PDF-to-EPUB, and asset/layout-preserving conversion. The public category showcase does **not** show a separate EPUB Tools wheel. **Edit Cover**, **Organize Chapters**, **Extract Images**, and **Accessibility Check** are Peeler roadmap ideas, not observed reference actions.

### Subtitles

**Tangerine conversions:** SRT/VTT interchange and TXT text export.

**Tangerine category tools:** The category showcase has a Formats wheel and conversion cards; it does not show a separate subtitle Tools wheel.

**Peeler now:** Convert SRT/VTT and export TXT. Cue styling and some settings are not preserved.

**Peeler planned:** Preserve/edit cue identifiers, styling, and settings. The public category showcase does **not** show a separate Subtitles Tools wheel. **Shift Timing**, **Sync Cues**, **Edit Cues**, **Merge Files**, **Split File**, and **Format Settings** are Peeler roadmap ideas, not observed reference actions.

### Archives

**Tangerine conversions:** Convert archives to ZIP, TAR, or GZIP; import RAR.

**Tangerine tools:** Extract ZIP, TAR, GZIP, or RAR into a folder beside the original.

**Peeler now:** Convert ZIP, TAR, GZIP, and RAR input to supported archive outputs; reject unsafe paths, links, encryption, or expansion beyond configured bounds. No extraction-to-folder UI is implemented.

**Peeler now:** **Extract Archive** appears in the Archives Tools wheel and writes regular files into a separate collision-safe folder. Extraction rejects unsafe paths, links, special files, encrypted entries, and Windows-invalid names, and respects the 200 MB / 10,000-entry bound.

**Peeler planned:** Add a destination picker and deeper cancellation coverage. **Inspect Contents**, **Test Archive**, **Create Archive**, and **Encrypt Archive** are additional Peeler roadmap ideas, not observed reference actions.

## File actions

Tangerine also has a separate Control-key wheel for AirDrop, Float, Copy, Move, Copy Path, and Terminal. Peeler implements none of those six actions. It can reveal a completed result in the file manager and select a session output folder; these are different operations. See [PRODUCT_SPEC.md](PRODUCT_SPEC.md#file-actions) and [the roadmap](ROADMAP.md#next-file-actions).

Windows/Linux parity requires platform equivalents rather than macOS service names: **Share** opens supported system sharing UI (AirDrop is macOS-only); **Float** is an always-on-top shelf with drag-out and optional edge pinning; **Copy** places file objects on the native file clipboard; **Move** chooses a destination and moves originals with collision handling; **Copy Path** copies full paths, one per line; **Terminal** opens the selected folder or containing folder in the configured terminal. Define unsupported-provider behavior and test folders and mixed selections. Avoid shell-string execution. The reference's Control binding is a discovery fact, not a safe cross-platform default.

## Delivery order

1. **Windows interaction proof:** run Explorer file and folder drags through modifier-down, wheel-open, modifier-up, staged drop, selection, cancellation, multi-select, high DPI, multi-monitor, and ordinary Ctrl-drag copy/move. Fix the OS-level workflow before broad feature work.
2. **Linux X11 interaction proof:** validate the same flows in GNOME Files and Dolphin, and ensure startup/status/fallback behavior. Keep Wayland explicitly picker-based until a supported native mechanism is implemented.
3. **Image vertical slice:** crop plus metadata display/removal and a crop UI with preview and safe export; then add target-size compression, adjustments, annotations, backgrounds, redaction, PDF creation, and collage.
4. **PDF slice:** metadata, compression, split/merge, page organization, then OCR, redaction, and table extraction with independently checked results.
5. **Audio then video slices:** implement actions from the observed lists in small complete groups, sharing tested FFmpeg transforms where sensible; add preview, cancellation, audio/video sync and preservation checks before redaction.
6. **Archive tools:** add a destination picker and deeper cancellation coverage for the implemented extraction action. Keep additional archive utilities as separate Peeler roadmap items.
7. **Complete remaining conversion coverage and fidelity** for documents, slides, spreadsheets, EPUB, and subtitles. Keep new editor ideas in a separately labeled Peeler roadmap; do not imply they are reference parity requirements.
8. **File actions and third mode:** settle a configurable Windows/Linux key after drag conflict tests, then deliver Copy Path and Terminal, followed by Move and native file Copy; build Float and per-platform Share adapters after their native UX and availability are proven.
9. macOS permissions/runtime verification follows the Windows/Linux milestones.

## Acceptance checks

- Show only operations applicable to the file type, selection size, and platform.
- Keep planned tool concepts labeled as unavailable until they are implemented; the wheel must not present roadmap previews as working actions.
- Use mode-appropriate pagination labels (for example, “More tools” in the Tools wheel).
- Preview destructive edits and require explicit confirmation to export.
- Save a separate result; never overwrite the source. Resolve collisions safely.
- Preserve the source on success, failure, and cancellation.
- Verify outputs with an independent decoder/parser and representative real fixtures.
- Disclose re-encoding, metadata loss, layout changes, and unsupported format details.
- Keep processing local and verify no runtime network requests.
- Exercise real native file managers on each advertised OS; unit tests, CI packaging, static analysis, and a website demo do not substitute for this gate.
