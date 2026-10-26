# Peeler

Peeler is a free, offline, open-source file converter for Windows, Linux, and macOS. It runs in the background and keeps original files unchanged. The Windows executable is `peeler.exe`. Original source is MIT licensed and maintained by [IdoCohen560](https://github.com/IdoCohen560).

**Status: working development build, not full feature parity.** Verified locally on Windows. Other operating systems have build targets and a CI matrix; they have not been tested in this session.

The product covers **Images, Video, Audio, PDF, Documents, Slides, Spreadsheets, EPUB, Subtitles, and Archives**. The current Windows audit passes 258 conversion checks and verifies 235 of 275 planned routes. Forty routes and additional tools remain unfinished. See [current support](docs/CURRENT_SUPPORT.md) and [release readiness](docs/RELEASE_READINESS.md).

## Run

Use Node.js 24 LTS and npm. From this directory:

```powershell
cd C:\Users\Owner\Peeler
npm install
npm start
```

Normal startup runs in the tray/menu bar with no window. Start dragging a file, then tap Left Shift for conversions; use Left Alt for tools on Windows/Linux, or Command on macOS. Drop the files onto the wheel and release the mouse. The menu stays open: choose a format, switch between Formats and Tools, open More options, or cancel. Dropping alone never starts conversion. Results save beside the originals or in the chosen output folder, with numbered names on collision. Escape cancels. Image tools include metadata removal and size/quality configuration.

Windows Explorer selection hints can refine the wheel before drop. When the source cannot be identified, the wheel starts with common formats and validates the actual dropped files. After drop, choices are filtered to the actual files and remain available until an explicit choice or cancellation. Actual Explorer drag behavior still needs manual verification. Linux global keys currently require X11; Wayland uses the tray picker. macOS needs Accessibility access and separate validation.

The tray offers an optional file picker/history window. `npm run start:window` opens it directly. Closing that window leaves the tray host running. Quit Peeler from the tray or the visible Quit Peeler button to stop the entire app. If the icon is hidden, run `dist\win-unpacked\peeler.exe --quit`; `--window` opens the optional converter. No launch-on-login or system configuration changes are made. Installation downloads development dependencies; conversions stay local.

A Windows unpacked development build, when generated, is at `dist/win-unpacked/peeler.exe`. It is unsigned and uses the Peeler banana-and-peeler silhouette icon.

## Working features

- Real image, video/audio, PDF, document, slide, spreadsheet-value, EPUB-text, subtitle, and archive conversions, including HEIC input, RTF, ODS output, legacy PPT/XLS and RAR input. See the [current support table](docs/CURRENT_SUPPORT.md).
- Background tray host, a radial drop menu, and optional picker/history window.
- Separate conversion workers, batch cancellation, deadlines, progress where available, and per-file errors.
- Original files preserved and collision-safe outputs. No uploads, account, telemetry, or conversion allowance.
- Image size/quality/background controls, same-format edited copies, a session destination picker, and abandoned-job recovery.

The optional local Office engine renders document and slide PDFs/page images; fonts and complex layouts can differ from the original application. Other text-oriented document/book exports and workbook-value exports have explicit fidelity limits. PDF-to-PPTX embeds page images. HEIC encoding, Apple document formats, OCR, PDF table reconstruction and many advanced editing tools remain unfinished. The app describes conversion limits before processing.

For project-local Windows Office/media setup and pinned dependency downloads, see [local engines](docs/OFFICE_ENGINE.md). `npm run test:fixtures` prepares the optional HEIC test sample. Generated dependencies and builds are reproducible from the lockfile and setup scripts; build downloads, when published, belong in Releases.

## Development

```powershell
npm test
npm run test:formats
npm run test:desktop
npm run pack
npm run convert -- "C:\path\photo.png" webp
```

The optional third CLI argument selects an existing output directory. `npm run dist` builds a host-platform distributable (Windows portable, Linux AppImage, macOS DMG). Build and verify on each target OS. Linux GUI tests require a display or `xvfb-run`.

## Project map

- [Quitting and cross-platform verification](docs/PLATFORM_VERIFICATION.md)
- [Conversion audit results: 258 checks](docs/CONVERSION_TEST_RESULTS.md)
- [Current implemented support](docs/CURRENT_SUPPORT.md)
- [Engine research](docs/ENGINE_RESEARCH.md)
- [Background architecture decision](docs/architecture/adr-001-background-host.md)
- [Research and source coverage](docs/RESEARCH.md)
- [Product specification and feature inventory](docs/PRODUCT_SPEC.md)
- [All ten categories and input/output conversion matrix](docs/CONVERSION_MATRIX.md)
- [Architecture and platform constraints](docs/ARCHITECTURE.md)
- [Roadmap](docs/ROADMAP.md)
- [Current checklist](TODO.md)
- [Validation record](docs/VALIDATION.md)
- [Third-party licenses](THIRD_PARTY_NOTICES.md)

The next major work is native drag validation, macOS/Linux verification, broader Office fidelity, missing formats, and advanced tools. Sharing, the floating shelf, file-manager extensions, and editors remain unfinished. Electron alone does not guarantee identical drag behavior on every OS.

The archive contains retired prototypes and historical notes, not the active application. Current implementation lives in `src/`; current test evidence and remaining work live in `docs/` and `TODO.md`.
