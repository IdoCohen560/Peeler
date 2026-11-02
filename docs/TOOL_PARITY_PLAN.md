# Category actions and parity plan

This inventory separates **format conversions** from **file tools**. Tangerine is the product reference; its website demonstrates a macOS app. Peeler is a separate project with its own controls and incomplete cross-platform native validation. The reference screenshots in `docs/assets/references/categories/` are credited visual references, not Peeler screenshots.

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

**Tangerine conversions:** JPG/PNG/WebP/HEIC/TIFF/AVIF/BMP input to supported image formats or PDF; SVG is input only. Available formats depend on the source.

**Tangerine tools for one image:** Compress; Edit Metadata; Edit Photo; Annotate; Add Background; Crop; Redact.

**Tangerine tools for a selection:** Compress; Edit Metadata; Crop; Create PDF; Make a Collage. Actions vary by source type and selection size.

**Peeler now:** The Formats wheel converts supported image inputs. The Tools wheel exposes metadata removal and image options. Proportional resize, lossy quality, and JPG/BMP background settings are available during conversion or for a same-format edited copy. Metadata removal re-encodes supported images.

**Peeler planned:** Target-size/percentage compression; general metadata inspection/editing; photo/color/exposure editing; annotations; background composition; crop UI; permanent redaction; multi-image PDF creation; collage. Existing resize/quality controls do not provide exact-size compression.

### Video

**Tangerine conversions:** Video containers to MP4/MOV/MKV/WebM/AVI/WMV, GIF output, and MP3 audio extraction when available.

**Tangerine tools for one video:** Compress; Edit Metadata; Remove Audio; Trim; Crop; Change Speed; Save Frames; Split; Redact.

**Tangerine tools for a selection:** Compress; Edit Metadata; Remove Audio; Join. Other tools depend on a single selected video.

**Peeler now:** Format conversion and MP3 audio extraction through the local FFmpeg worker. No video editing tools are implemented.

**Peeler planned:** Compression controls; metadata inspection/editing/removal; mute; trim; crop; speed changes; frame export; split; join; permanent time-scoped redaction.

### Audio

**Tangerine conversions:** MP3, M4A, WAV, FLAC, OGG, Opus, AIFF, and WMA interchange.

**Tangerine tools for one recording:** Compress; Edit Metadata; Normalize Volume; Visualize; Trim; Convert Channels; Bleep.

**Tangerine tools for a selection:** Compress; Edit Metadata; Normalize Volume. Other tools depend on a single recording.

**Peeler now:** Audio format conversion through the local FFmpeg worker. No audio editing tools are implemented.

**Peeler planned:** Compression controls; metadata inspection/editing/removal; loudness normalization; waveform video; trim; channel conversion; bleep ranges.

### PDF

**Tangerine conversions and exports:** PDF to DOCX, Pages, PPTX, XLSX, JPG/PNG pages, EPUB, TXT, or Markdown. Its showcase describes OCR for scanned-page text and PDF exports.

**Tangerine tools for one PDF:** Compress; Edit Metadata; Split; Organize Pages.

**Tangerine tools for a selection:** Compress; Edit Metadata; Split; Merge.

**Peeler now:** Export selectable text/Markdown, DOCX, EPUB, page images, and image-based PPTX. No OCR, PDF page editor, metadata editor, or compression tool is implemented.

**Peeler planned:** Compression; metadata inspection/editing/removal; split; merge; reorder/rotate/duplicate/delete pages; local OCR; table reconstruction; PDF-to-Pages and PDF-to-XLSX routes.

### Documents

**Tangerine conversions:** DOCX/Pages interchange; export document formats to PDF, HTML, EPUB, JPG, or PNG; import RTF, RTFD, and Finder text clippings.

**Tangerine category tools:** The category showcase has a Formats wheel and conversion cards; it does not show a separate document Tools wheel.

**Peeler now:** Convert DOCX, RTF, Markdown, TXT, and HTML among supported text/document formats, PDF, EPUB, and page images. Layout fidelity varies by route and Office engine availability.

**Peeler planned:** Pages input/output, RTFD and text-clipping import, remaining documented conversion routes, and measured layout fidelity. The missing routes are listed in [conversion audit results](CONVERSION_TEST_RESULTS.md).

### Slides

**Tangerine conversions:** PPT/PPTX to PDF or JPG/PNG slide images; PDF to PPTX.

**Tangerine category tools:** The category showcase has a Formats wheel and conversion cards; it does not show a separate slide Tools wheel.

**Peeler now:** PPT/PPTX to PDF and page images when the local Office engine is available; PPTX has a text-only PDF fallback. PDF-to-PPTX embeds page images.

**Peeler planned:** Improve rendering fidelity and evaluate editable PDF-to-PPTX reconstruction. No slide-specific editor appears in the reference category showcase.

### Spreadsheets

**Tangerine conversions:** XLSX, ODS, CSV, and TSV interchange; XLS import; PDF export; PDF to XLSX.

**Tangerine category tools:** The category showcase has a Formats wheel and conversion cards; it does not show a separate spreadsheet Tools wheel.

**Peeler now:** XLSX, ODS, CSV, TSV, and PDF conversion; XLS support and Office PDF rendering depend on the local Office engine. Workbook/text exports preserve values and cached formula results, not formulas/styles.

**Peeler planned:** PDF table extraction to XLSX and stronger formula/style fidelity. No spreadsheet-specific editor appears in the reference category showcase.

### EPUB

**Tangerine conversions:** EPUB to PDF, DOCX, Pages, TXT, Markdown, or HTML; PDF to EPUB.

**Tangerine category tools:** The category showcase has a Formats wheel and conversion cards; it does not show a separate EPUB Tools wheel.

**Peeler now:** Export EPUB reading-order text to TXT, Markdown, HTML, DOCX, or PDF. Book images/layout and DRM-protected files are unsupported.

**Peeler planned:** EPUB-to-Pages, PDF-to-EPUB, and asset/layout-preserving conversion. No EPUB-specific editor appears in the reference category showcase.

### Subtitles

**Tangerine conversions:** SRT/VTT interchange and TXT text export.

**Tangerine category tools:** The category showcase has a Formats wheel and conversion cards; it does not show a separate subtitle Tools wheel.

**Peeler now:** Convert SRT/VTT and export TXT. Cue styling and some settings are not preserved.

**Peeler planned:** Preserve/edit cue identifiers, styling, and settings. No subtitle-specific editor appears in the reference category showcase.

### Archives

**Tangerine conversions:** Convert archives to ZIP, TAR, or GZIP; import RAR.

**Tangerine tools:** Extract ZIP, TAR, GZIP, or RAR into a folder beside the original.

**Peeler now:** Convert ZIP, TAR, GZIP, and RAR input to supported archive outputs; reject unsafe paths, links, encryption, or expansion beyond configured bounds. No extraction-to-folder UI is implemented.

**Peeler planned:** Safe extraction with destination choice, collision handling, cancellation, and archive safety checks.

## File actions

Tangerine also has a separate Control-key wheel for AirDrop, Float, Copy, Move, Copy Path, and Terminal. Peeler implements none of those six actions. It can reveal a completed result in the file manager and select a session output folder; these are different operations. See [PRODUCT_SPEC.md](PRODUCT_SPEC.md#file-actions) and [the roadmap](ROADMAP.md#next-file-actions).

## Delivery order

1. Image tools: target-size compression, crop, editing, background composition, annotation, redaction, PDF creation, and collage.
2. PDF tools: compression, metadata, split/merge, and page organization; then local OCR and table reconstruction.
3. Audio tools: normalization, trim, channels, waveform visualization, and bleep ranges.
4. Video tools: compression, metadata, mute, trim, crop, speed, frames, split/join, and permanent redaction.
5. Archive extraction with a safe destination workflow.
6. Remaining format coverage and fidelity for documents, slides, spreadsheets, EPUB, and subtitles.
7. Implement the separate file-actions wheel after native drag validation on each OS.

## Acceptance checks

- Show only operations applicable to the file type, selection size, and platform.
- Preview destructive edits and require explicit confirmation to export.
- Save a separate result; never overwrite the source. Resolve collisions safely.
- Preserve the source on success, failure, and cancellation.
- Verify outputs with an independent decoder/parser and representative real fixtures.
- Disclose re-encoding, metadata loss, layout changes, and unsupported format details.
- Keep processing local and verify no runtime network requests.
