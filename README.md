<div align="center">

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
