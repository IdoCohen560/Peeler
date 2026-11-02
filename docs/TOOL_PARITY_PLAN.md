# Editing-tool parity plan

This plan tracks editing operations separately from Peeler's format conversion routes. Tangerine is the inspiration and source for the reference tool inventory; this plan is for Peeler's independently implemented features. A tool is not considered complete until it appears in the interface, produces a verified output, preserves the source, handles cancellation/errors, and is checked on target operating systems.

## Current status

Implemented Peeler tools:

- **Images:** proportional resize, lossy quality, JPG/BMP background choice, same-format edited copies, and metadata removal by re-encoding.

All other entries below are planned. Tangerine's feature names and descriptions are a comparison reference, not a claim that Peeler already includes them.

## Inventory

| Category | Planned tools | Implementation notes |
| --- | --- | --- |
| Images | Compress; inspect/edit/remove metadata; adjust color and exposure; annotate; add background; crop; make collage; permanently redact; combine images into PDF | Compression should allow target size or reduction percentage and verify the result. Redaction must alter exported pixels, not add a reversible overlay. Face/text detection is optional and local. |
| Video | Mute; trim; crop; change speed; join clips; export frames; split; permanently redact regions over time | Use FFmpeg with explicit stream mapping, time ranges, preview, cancellation, and disclosures for re-encoding. Join must handle mixed dimensions and audio tracks predictably. Redaction must cover every affected frame. |
| Audio | Normalize loudness; trim; convert channels; create waveform/still-image video; bleep selected ranges | Use measured loudness and peak limits, waveform/time selection, independent channel controls, and preview. Preserve or disclose channel/layout changes. |
| PDF | Split; reorder/rotate/duplicate/delete pages; merge; OCR; reconstruct tables | Page operations should preserve vector/text content where possible. OCR and table extraction are local, opt-in, and report confidence or unsupported scans. |
| Documents | Compress; inspect/edit/remove metadata | Define which embedded properties are supported per format. Keep originals unchanged and report unsupported properties. |
| Slides | Compress; inspect/edit/remove metadata | Preserve slide content and ordering. Use real office rendering/processing where needed; avoid claiming editable results when output is rasterized. |
| Spreadsheets | Compress; inspect/edit/remove metadata | Preserve formulas, sheets, and workbook structure when possible. Warn before any lossy conversion. |
| EPUB | Compress; inspect/edit/remove metadata | Preserve spine order, navigation, and assets; reject DRM/encrypted files with a clear reason. |
| Subtitles | Inspect/edit metadata and cue settings; richer cue editing | Preserve identifiers, styling, NOTE/STYLE/REGION blocks, and timing where formats support them. |
| Archives | Extract; inspect entries; create/modify archives | Enforce traversal, symlink, expansion size, entry count, and encryption policies. Offer extraction to a chosen directory without overwriting files. |

The reference also offers six file actions: AirDrop/system sharing, a floating shelf, copy files to clipboard, move, copy path, and open in Terminal. None of these six actions is implemented in Peeler. Peeler can reveal a completed output in the native file manager and lets the user select a session output directory; these are workflow controls, not implementations of the reference actions. File actions operate on file selections rather than transforming file contents, so they are tracked separately in [PRODUCT_SPEC.md](PRODUCT_SPEC.md#file-actions).

## Delivery order

1. **Image editing foundation:** exact-size compression, crop, color/exposure adjustments, and background composition. Add a preview/confirm/export workflow and keep source files unchanged.
2. **PDF page tools:** merge, split, reorder, rotate, duplicate, and delete pages. Use a maintained PDF library and verify text/vector preservation and metadata behavior.
3. **Audio controls:** trim, channel conversion, loudness normalization, and bleep ranges using the existing FFmpeg worker.
4. **Video controls:** mute, trim, crop, speed, frame export, split, and join, with explicit time/frame selection and codec/stream disclosures.
5. **Image composition:** annotations, collages, permanent redaction, and images-to-PDF. Build a preview, undo/reset, and flattened export path before permanent edits.
6. **Remaining categories:** archive extraction and metadata tools for documents, slides, spreadsheets, EPUB, and subtitles; then local OCR, table reconstruction, and time-scoped video redaction.

Each slice should ship independently after passing the acceptance checks. Cross-platform UI availability must be verified before a tool is marked available on Windows, Linux, or macOS.

## Acceptance checks

- Show only operations applicable to the selected file types and current platform.
- Preview destructive edits and require an explicit user action to export.
- Save a separate output; never overwrite the input. Resolve name collisions safely.
- Preserve source bytes on success, failure, and cancellation.
- Test representative valid, malformed, large, and boundary-case files.
- Verify output contents with an independent decoder/parser where practical.
- Clearly label re-encoding, metadata loss, layout changes, flattened output, and format limitations.
- Keep processing local and avoid network requests during operation.
