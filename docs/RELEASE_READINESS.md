# Peeler release readiness

Status: **development build; not 100% complete or release-ready**. Reviewed 2026-10-26. Completion means the full reference formats, tools, actions, and native workflows, plus credible release evidence. Do not equate a passing fixture suite with that outcome.

| Gate | Current evidence | Remaining work |
| --- | --- | --- |
| Reference conversions | 235/275 routes pass; 258 total content/decode checks | 40 unavailable routes: 7 HEIC outputs, 30 document routes, PDF to Pages/XLSX, EPUB to Pages. |
| Document fidelity | Office slide geometry and embedded DOCX images verified on generated fixtures; real page rendering replaces text-only PDF where available | Real-world document corpus, fonts, tables, charts, formula/style preservation, Apple formats, editable PDF reconstruction. |
| Advanced tools | Image metadata removal; image resize/quality/background options during conversion | Most of the reference's 26 tools, including editors, PDF operations, media controls and permanent redaction. Options are not completion of the entire compression/editor scope. |
| File actions | Reveal output; choose destination; stage and cancel native-drop payload | Sharing, shelf, clipboard files/path, move, terminal and file-manager integrations. |
| Job reliability | Isolated workers, cancellation/deadlines, safe names, bounded parsers, short workspaces and abandoned-job recovery | Larger hostile-input corpus, OS sandbox/native memory limits, safe publication recovery if the host dies during output copy. |
| Native workflow | Windows native-hook startup and synthetic gesture plus real local File/DOM drop | Physical Explorer/OLE drag; macOS permissions/menu bar; X11 environments; Wayland alternative; multiple displays/DPI and accessibility checks. |
| Platform evidence | Windows, Intel Mac and Apple silicon passed full host builds/packaged tests; Linux X11 passed 26 core tests, 258 conversion checks and nine applicable desktop cases in both development and packaged builds. Links in VALIDATION.md. | Physical OS sessions: native dragging, permissions/menu bar/tray, multiple desktop environments and Wayland. Track current reruns in Actions; automated fixture success does not establish native workflow readiness. |
| Dependencies | Project-local LibreOffice 26.8.1.1 and FFmpeg 9.0.2 in Windows package; generated package notices | Audit native/WASM builds and corresponding source; update libarchive 3.7.7 WASM; maintained macOS/Linux codecs and packaging. npm audit does not assess these binaries. |
| Distribution | Public source repository; unsigned Windows development ZIP and checksum in Releases | Finished release artifacts, installer/update/uninstall behavior, signing/notarization where applicable and complete native-engine redistribution/source review. |
| Performance/privacy | Office runs only per job; no normal startup renderer; no upload feature | Measure idle/peak memory, conversion latency, long-running load and actual network traffic, including third-party parsers. |

The detailed remaining conversion list is in [CONVERSION_TEST_RESULTS.md](CONVERSION_TEST_RESULTS.md). Next engine research: genuine Pages import/export and HEIC encoding; next product work: complete tool configuration/editing flows and native platform evidence. Keep unresolved items open in TODO.md and do not create DONE.md while these gates remain unmet.
