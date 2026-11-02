<div align="center">

<img src="assets/branding/peeler-512.png" width="104" alt="Peeler banana and peeler logo" />

# Peeler

### A free, offline file converter for Windows, Linux, and macOS.

Convert files from a quick keyboard-driven menu. Your files stay on your device, your originals stay untouched, and there is no account, upload, telemetry, or conversion allowance.

[Get the Windows preview](https://github.com/IdoCohen560/Peeler/releases/tag/v0.2.0-dev.1) · [See what works](docs/CURRENT_SUPPORT.md) · [Read the roadmap](docs/ROADMAP.md) · [Report a bug](https://github.com/IdoCohen560/Peeler/issues/new?template=bug_report.yml)

![Peeler conversion wheel](docs/assets/conversion-wheel.png)

</div>

> **Development preview:** Peeler is actively being built and does not yet have full feature parity. The current downloadable preview is Windows-only. Linux and macOS support is in development and still needs hands-on validation. Review [validation results](docs/VALIDATION.md) and [release readiness](docs/RELEASE_READINESS.md) before relying on it.

## Convert without breaking your flow

Start dragging a file, tap **Left Shift**, choose a format, and drop. Use **Left Alt** for tools on Windows and Linux, or **Command** on macOS. Dropping a file alone never starts a conversion; you confirm the action in the menu.

![Peeler drop then choose flow](docs/assets/drop-then-choose.png)

The quick drag-and-keyboard workflow is inspired by [Tangerine for Mac](https://tangerineformac.com/), whose product site and [press kit](https://tangerineformac.com/press) show the interaction that informed Peeler. The image below is Tangerine's original product screenshot, included as a credited reference; it is not a Peeler screenshot. Watch [Tangerine's product demo](docs/assets/references/tangerine-demo.mp4) for the reference interaction. Peeler's current implementation and platform status are described below and in the linked support docs.

<details>
<summary>View the Tangerine interaction reference</summary>

![Tangerine conversion wheel screenshot, shown as an inspiration reference and not a Peeler screenshot](docs/assets/references/tangerine-conversion-wheel.png)

Screenshot and video: [Tangerine for Mac](https://tangerineformac.com/), provided in its [public press kit](https://tangerineformac.com/press). Used here to identify the product inspiration; Peeler is a separate project.

</details>

Peeler runs in the tray or menu bar. Results are saved beside the originals or in a folder you choose, with collision-safe names. Original files are never overwritten. You can also open the optional picker and conversion history window.

## What it can do

| Area | Current scope |
| --- | --- |
| File types | Images, video, audio, PDF, documents, slides, spreadsheets, EPUB, subtitles, and archives |
| Conversions | 258 checks pass in the current Windows audit; 235 of 275 planned routes are verified |
| File tools | Image resize and quality controls, metadata removal, and additional tools in progress |
| Workflow | Background tray host, radial conversion menu, batch jobs, cancellation, progress where available, and per-file errors |
| Privacy | Local processing; no uploads, accounts, telemetry, or conversion allowance |

Formats and fidelity vary by conversion route. Some routes and advanced tools are unfinished, and certain exports have known layout or fidelity limits. Check the [current support table](docs/CURRENT_SUPPORT.md) and [conversion matrix](docs/CONVERSION_MATRIX.md) for exact input/output details. Peeler explains known limits before processing. Feature counts and tools advertised by Tangerine are not Peeler capabilities unless they appear in Peeler's support documentation.

### Explore the categories

Choose a category to expand its visual wheel preview, actions, and Peeler status. Screenshots are from Tangerine’s Mac website and show its Shift/Command menus; they are inspiration references, not Peeler UI. Peeler’s own shortcuts vary by operating system:

| Peeler platform | Drag + key | Opens | Availability |
| --- | --- | --- | --- |
| Windows | **Left Shift** | Formats | Development preview; physical Explorer drag still needs manual validation. |
| Windows | **Left Alt** | Tools | Development preview; physical Explorer drag still needs manual validation. |
| Linux on X11 | **Left Shift** | Formats | Global gesture hook; native file-manager behavior still needs validation. |
| Linux on X11 | **Left Alt** | Tools | Global gesture hook; native file-manager behavior still needs validation. |
| Linux on Wayland | — | Use the tray picker | Global drag-key capture is unavailable. |
| macOS | **Left Shift** | Formats | Accessibility permission required; native behavior still needs validation. |
| macOS | **Command** | Tools | Accessibility permission required; native behavior still needs validation. |

Start dragging a file, tap the listed key, and drop it onto the wheel to stage the file. Choose an action in the wheel. Peeler’s file-actions wheel is not implemented and has no assigned Peeler shortcut. The Mac reference site uses Control for its separate file-actions wheel.

<details>
<summary>Images</summary>

![Tangerine Images category preview showing Shift conversion and Command tools wheels](docs/assets/references/categories/images.png)

**Tangerine actions:** Shift converts raster images to JPG, PNG, WebP, HEIC, TIFF, AVIF, BMP, or PDF (choices depend on the input). Command, for one image: Compress, Metadata, Edit Photo, Annotate, Add Background, Crop, Redact. For a selection: Compress, Metadata, Crop, Create PDF, Make a collage.

**Peeler now:** Shift converts supported image inputs to available formats/PDF. Left Alt (Windows/Linux X11) or Command (macOS) opens image options or metadata removal. Resize, quality, and JPG/BMP background settings are available in conversion or a same-format edited copy; metadata removal re-encodes supported images.

**Peeler planned:** Target-size/percentage compression, general metadata inspection/editing, photo adjustment, annotations, background composition, crop UI, redaction, multi-image PDF creation, and collage. [Details](docs/TOOL_PARITY_PLAN.md#images)

</details>

<details>
<summary>Video</summary>

![Tangerine Video category preview showing Shift conversion and Command tools wheels](docs/assets/references/categories/video.png)

**Tangerine actions:** Shift converts video among supported containers, exports GIF, or extracts MP3. Command, for one video: Compress, Metadata, Mute, Trim, Crop, Change Speed, Save Frames, Split, Redact. For a selection: Compress, Metadata, Mute, Join.

**Peeler now:** Shift converts MP4, MOV, MKV, WebM, AVI, WMV, GIF, and audio extraction to MP3 when available. No video editing tools are implemented.

**Peeler planned:** Compression controls, metadata editing/removal, mute, trim, crop, speed, frame export, split, join, and permanent time-scoped redaction. [Details](docs/TOOL_PARITY_PLAN.md#video)

</details>

<details>
<summary>Audio</summary>

![Tangerine Audio category preview showing Shift conversion and Command tools wheels](docs/assets/references/categories/audio.png)

**Tangerine actions:** Shift converts among MP3, M4A, WAV, FLAC, OGG, Opus, AIFF, and WMA. Command, for one recording: Compress, Metadata, Normalize Volume, Visualize, Trim, Convert Channels, Bleep. For a selection: Compress, Metadata, Normalize Volume.

**Peeler now:** Shift converts the supported audio formats. No audio editing tools are implemented.

**Peeler planned:** Compression controls, metadata editing/removal, loudness normalization, waveform video, trim, channel conversion, and bleep ranges. [Details](docs/TOOL_PARITY_PLAN.md#audio)

</details>

<details>
<summary>PDF</summary>

![Tangerine PDF category preview showing Shift conversion and Command tools wheels](docs/assets/references/categories/pdf.png)

**Tangerine actions:** Shift exports DOCX, Pages, PPTX, XLSX, JPG/PNG pages, EPUB, TXT, or Markdown. Command, for one PDF: Compress, Metadata, Split, Organize Pages. For a selection: Compress, Metadata, Split, Merge. The showcase also includes page-image export, text/Markdown extraction, Word/Pages/slides/spreadsheet exports, and EPUB creation.

**Peeler now:** Shift exports text/Markdown, DOCX, EPUB, page images, and image-based PPTX. Selectable text is required; OCR and PDF page editing are not implemented.

**Peeler planned:** PDF compression, metadata editor, split, merge, page organization (reorder/rotate/duplicate/delete), OCR, and table reconstruction. [Details](docs/TOOL_PARITY_PLAN.md#pdf)

</details>

<details>
<summary>Documents</summary>

![Tangerine Documents category preview showing its format wheel](docs/assets/references/categories/documents.png)

**Tangerine actions:** Shift converts DOCX/Pages and text-based formats; exports documents as PDF, HTML, EPUB, JPG, or PNG; imports RTF, RTFD, and Finder text clippings. The category showcase does not show a separate Command tools wheel for documents.

**Peeler now:** Shift converts DOCX, RTF, Markdown, TXT, and HTML among implemented text/document formats, PDF, EPUB, and page-image output. Fidelity varies by route and local Office engine availability.

**Peeler planned:** Remaining document conversion routes and measured layout fidelity. No category-specific document editor appears in Tangerine’s category showcase. [Conversion gaps](docs/CONVERSION_TEST_RESULTS.md)

</details>

<details>
<summary>Slides</summary>

![Tangerine Slides category preview showing its format wheel](docs/assets/references/categories/slides.png)

**Tangerine actions:** Shift exports PPT/PPTX to PDF or JPG/PNG slide images and converts PDF to PPTX. The category showcase does not show a separate Command tools wheel for slides.

**Peeler now:** Shift converts PPT/PPTX to PDF; page images require the local Office engine. PDF-to-PPTX is image-based in Peeler.

**Peeler planned:** Remaining slide conversion routes and editable PDF-to-PPTX reconstruction. No category-specific slide editor appears in Tangerine’s category showcase. [Conversion gaps](docs/CONVERSION_TEST_RESULTS.md)

</details>

<details>
<summary>Spreadsheets</summary>

![Tangerine Spreadsheets category preview showing its format wheel](docs/assets/references/categories/spreadsheets.png)

**Tangerine actions:** Shift converts XLSX, ODS, CSV, and TSV; imports XLS; exports spreadsheets as PDF; and exports PDF to Excel. The category showcase does not show a separate Command tools wheel for spreadsheets.

**Peeler now:** Shift converts XLSX, ODS, CSV, and TSV; XLS support and PDF rendering use the local Office engine where required. PDF-to-XLSX reconstruction is not implemented.

**Peeler planned:** PDF table extraction to XLSX and improved formula/style fidelity. No category-specific spreadsheet editor appears in Tangerine’s category showcase. [Conversion gaps](docs/CONVERSION_TEST_RESULTS.md)

</details>

<details>
<summary>EPUB</summary>

![Tangerine EPUB category preview showing its format wheel](docs/assets/references/categories/epub.png)

**Tangerine actions:** Shift converts EPUB to PDF, DOCX, Pages, TXT, Markdown, or HTML, and PDF to EPUB. The category showcase does not show a separate Command tools wheel for EPUB.

**Peeler now:** Shift exports EPUB reading-order text to TXT, Markdown, HTML, DOCX, or PDF. Book images/layout and DRM files are unsupported.

**Peeler planned:** EPUB-to-Pages, PDF-to-EPUB, and layout/asset-preserving book conversion. No category-specific EPUB editor appears in Tangerine’s category showcase. [Conversion gaps](docs/CONVERSION_TEST_RESULTS.md)

</details>

<details>
<summary>Subtitles</summary>

![Tangerine Subtitles category preview showing its format wheel](docs/assets/references/categories/subtitles.png)

**Tangerine actions:** Shift converts SRT and VTT or extracts TXT. The category showcase does not show a separate Command tools wheel for subtitles.

**Peeler now:** Shift converts SRT/VTT and exports TXT; styling and some cue settings are not preserved.

**Peeler planned:** Preserve/edit cue identifiers, styling, and settings. No category-specific subtitle editor appears in Tangerine’s category showcase. [Details](docs/TOOL_PARITY_PLAN.md#subtitles)

</details>

<details>
<summary>Archives</summary>

![Tangerine Archives category preview showing Shift conversion and Command extraction](docs/assets/references/categories/archives.png)

**Tangerine actions:** Shift converts archives to ZIP, TAR, or GZIP and imports RAR. Command extracts ZIP, TAR, GZIP, and RAR files beside the original.

**Peeler now:** Shift converts ZIP, TAR, GZIP, and RAR input to supported archive outputs. Peeler does not yet extract an archive to a folder.

**Peeler planned:** Safe extraction UI with destination choice, collision handling, cancellation, and archive safety checks. [Details](docs/TOOL_PARITY_PLAN.md#archives)

</details>

The live Tangerine screenshots are credited references. Peeler’s current support and planned parity are tracked separately in the [tool parity plan](docs/TOOL_PARITY_PLAN.md).

<details>
<summary>File actions — planned</summary>

Peeler does **not** currently include the six reference file actions below. It can reveal a completed output in the file manager and choose a session output folder; those controls do not provide these actions.

| Reference action | Peeler status |
| --- | --- |
| AirDrop / system sharing | Not implemented; AirDrop is macOS-specific, and Windows/Linux sharing needs separate integrations. |
| Float / drag-out shelf | Not implemented. |
| Copy files to clipboard | Not implemented. |
| Move files | Not implemented. |
| Copy paths | Not implemented. |
| Open in Terminal | Not implemented. |

These planned native integrations are tracked separately from file conversion and editing in [PRODUCT_SPEC.md](docs/PRODUCT_SPEC.md#file-actions), the [roadmap](docs/ROADMAP.md#next-file-actions), and [release readiness](docs/RELEASE_READINESS.md).

</details>

## Get started

### Download the preview

[Download Peeler v0.2.0-dev.1 for Windows](https://github.com/IdoCohen560/Peeler/releases/tag/v0.2.0-dev.1). Extract the complete ZIP and keep `peeler.exe` beside its resources. The build is unsigned and is not a stable release. Verify the published SHA-256 checksum if you download it.

### Run from source

Install [Node.js 24 LTS](https://nodejs.org/) and npm, then run:

```bash
git clone https://github.com/IdoCohen560/Peeler.git
cd Peeler
npm install
npm start
```

Normal startup runs in the tray with no window. Use `npm run start:window` to open the optional converter window. To quit, use the tray menu or the Quit Peeler button. Linux global keys currently require X11; under Wayland, use the tray picker. macOS requires Accessibility permission for keyboard shortcuts and still needs separate validation.

## Build and develop

```bash
npm test
npm run test:formats
npm run test:desktop
npm run pack
```

Build a distributable for the current host OS with `npm run dist`. Build and verify separately on each target platform. Linux GUI tests need a display or `xvfb-run`. See [local engine setup](docs/OFFICE_ENGINE.md) for project-local Office and media dependencies.

## Platform status

| Platform | Current status |
| --- | --- |
| Windows | Development preview available; unsigned. Physical Explorer drag behavior still needs manual verification. |
| Linux | Development work in progress. Global keyboard hooks currently require X11; Wayland users can use the tray picker. |
| macOS | Development work in progress. Accessibility permission is required for shortcuts; separate platform validation remains. |

Automated builds and packaged-app checks have passed on Windows, Linux X11, Intel Mac, and Apple silicon in recorded CI runs. That does not confirm all native file-manager behavior or permissions. See the [validation record](docs/VALIDATION.md) for the scope of those checks.

## Project docs

- [Current support and known limits](docs/CURRENT_SUPPORT.md)
- [Editing-tool parity plan](docs/TOOL_PARITY_PLAN.md)
- [Conversion matrix](docs/CONVERSION_MATRIX.md)
- [Conversion audit results](docs/CONVERSION_TEST_RESULTS.md)
- [Architecture and platform constraints](docs/ARCHITECTURE.md)
- [Design and product specification](docs/PRODUCT_SPEC.md)
- [Roadmap](docs/ROADMAP.md)
- [Validation record](docs/VALIDATION.md)
- [Release readiness](docs/RELEASE_READINESS.md)
- [Third-party notices and licenses](THIRD_PARTY_NOTICES.md)

## Contributing

Contributions are welcome, especially platform validation, conversion coverage, and improvements to documentation. Start with a focused issue or pull request and include the operating system, steps to reproduce, expected behavior, and actual behavior for bugs. Please avoid sharing private files; small synthetic samples are best for conversion reports.

- [Open an issue](https://github.com/IdoCohen560/Peeler/issues)
- [Suggest a feature](https://github.com/IdoCohen560/Peeler/issues/new?template=feature_request.yml)
- [Review the source license](LICENSE)
- [Review third-party notices](THIRD_PARTY_NOTICES.md)

## License

Peeler's original source is licensed under the [MIT License](LICENSE). Bundled dependencies have their own licenses, listed in [third-party notices](THIRD_PARTY_NOTICES.md) and `THIRD_PARTY_LICENSES.txt`.
