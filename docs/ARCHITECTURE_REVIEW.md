# Codebase diagnosis

Review mode: CStack ARCHITECT/REVIEW at the product/runtime boundary, with Ponytail's smallest-complete-change standard. Assumed load: one desktop user, one sequential batch, up to 500 selected files. This is not a multi-tenant service.

## Follow-up review: Office engines and completion gates

The Windows package now includes LibreOffice 26.8.1.1 and FFmpeg 9.0.2. Worker-local HEIC/RAR decoding, RTF import, ODS output, image options and a session destination picker are implemented. Ten packaged desktop cases, 26 core cases and 258 conversion checks provide scoped evidence; the older diagnosis below records the foundation state.

- **High, fixed:** long output-folder paths prevented Office profile initialization. Work now uses short managed paths independent of the chosen destination, with per-job profiles and parent-owned leases. Killing the actual host during an Office job and restarting recovers its workspace without changing the source or publishing a result.
- **High, fixed:** unsupported default VP9 pixel format after upgrading FFmpeg. Explicit YUV420P restores GIF-to-WebM conversion; the complete conversion matrix passes again.
- **High, open:** 40 reference routes, most advanced tools/actions, physical native gestures and non-Windows runtime evidence remain incomplete. RELEASE_READINESS.md is the completion gate; no claim of 100% readiness is justified.
- **High, open:** corresponding-source and native/WASM provenance review, an updated libarchive WASM binary, and maintained macOS/Linux media packaging. A zero npm audit does not resolve these.
- **Medium, open:** final exclusive-copy publication can be interrupted; managed scratch cleanup does not make that copy atomic. Native allocations are not strictly bounded or OS-sandboxed.
- **Medium, open:** Office font substitution and document complexity require a real-world corpus. Workbook/text exports remain content/value-oriented. A larger on-disk Office bundle is an explicit tradeoff; no Office process runs at idle.

Boundary review: renderer image settings are validated before reaching a worker; the native folder picker owns destination paths; the wheel's More options action stages rather than executes; external engine paths come from trusted configuration, not renderer input. No speculative plugin/service layer or extra resident engine was introduced.

## System overview

A background file-conversion utility with a native input listener, an on-demand radial overlay, an optional picker/history window, and disposable conversion processes. The original source folder's fake conversions were replaced; the full 275-path reference scope remains distinct from current working support.

## Architecture pattern

Single product repository. Thin OS/UI host, shared conversion boundary, format adapters, and isolated job processes. No cloud services, databases, cross-repository framework, account system, or speculative plugin architecture.

## Technology stack

Electron/Node, uiohook-napi, Sharp, FFmpeg, PDF.js/canvas/PDFKit, bounded document/book/spreadsheet/archive adapters. npm lockfile and host packaging are in place. Native Node-API prebuilds are used; unnecessary Electron native rebuilds are disabled. Packaged-binary tests exercise the actual modules.

## Tier / repo placement

Everything belongs in this desktop product repository. `src/core` owns reusable conversion behavior; `src/desktop` owns process/OS integration; `src/renderer` owns display and input feedback. This project has no separate organizational repo map or cloud platform, so none is invented.

## Critical findings and resolution

- **High, fixed:** DOM FileList did not reliably cross the isolated preload boundary. Both drop callers now pass arrays of File objects; a real local-file browser input through the overlay bridge verifies the path and generated output.
- **High, fixed:** starting as a conventional window contradicted the requested product. Normal startup now has no window. Converter UI is optional; closing it destroys its renderer and keeps the tray host running.
- **High, fixed:** codec/document work could block or destabilize the main process. Jobs now run in disposable child processes with cancellation, deadlines, bounded diagnostics, and parent-owned temporary cleanup.
- **High, open release gate:** actual Windows Explorer OLE dragging, source selection timing, multi-display scaling, and all non-Windows native behavior need manual checks. Callback simulation is not physical drag verification. Wayland global capture is explicitly unavailable.
- **High, open release gate:** the npm FFmpeg binary reports 6.1.1. Package audit results do not certify native binary security; update binary/source provenance and complete native dependency redistribution review before public production distribution.
- **Medium, fixed:** transitive package advisories in uuid/image-size were resolved with scoped patched overrides. Spreadsheet/raster-slide tests verify their actual callers.
- **Medium, explicit limitation:** content-based office/book/slide conversions lose formatting/images. Limits are shown in UI and CURRENT_SUPPORT.md. They are not represented as faithful page reconstruction.
- **Medium, open:** forced-process limits do not strictly cap native allocations. Parent-process crashes can leave temporary files. General malicious-format fuzzing and crash recovery remain future work.

No critical defect was reproduced in the tested conversion/drop paths after the fixes. That is a scoped observation, not a production-readiness certification.

## Structural strengths

One conversion implementation serves the CLI, drop wheel, and optional UI. Main/overlay IPC authenticate the exact sender/document. File actions do not accept arbitrary shell commands. Publication uses exclusive filenames and preserves sources. Bounded ZIP validation is reused for EPUB and office packages. History is transient, without background filename logging or persistent tracking.

## Recommended actions

1. Validate a physical Explorer drag end to end, including modifier release, Escape, supported/unsupported files, and mixed selections.
2. Verify macOS Accessibility behavior and X11 operation on their native machines; design a viable Wayland fallback around supported compositor/portal capabilities.
3. Update FFmpeg and complete signed-release/third-party source redistribution requirements.
4. Add faithful office/slides rendering through a validated local engine, then missing import formats and advanced tools.
5. Add crash recovery, structured runtime diagnostics without file-content logging, and adversarial input coverage.

## Risk map

| Boundary | Current protection | Remaining evidence needed |
| --- | --- | --- |
| Global input to menu | Left-side key state tests, movement threshold, explicit unsupported platforms | Physical file-manager drag/permission checks |
| Drop to filesystem | File objects resolved in preload, absolute-path/count/size checks, shared capabilities | Native OLE/Xdnd payload variation |
| Input to codec | Child processes, deadlines, V8 bounds, protocol restriction | Native-memory limits and fuzzing |
| Output publication | Temporary encode, exclusive numbered output, source preservation tests | Parent-crash recovery; atomic publication refinement |
| Package to user | Host packaging and packaged integration tests | macOS/Linux results, signing, native engine update and source compliance |

## Applied skills

- CStack core architect guidance plus `adr-writer` and `security-review`, from `C:/Users/Owner/skills-review/CStack`.
- Ponytail implementation and review guidance, from the local Ponytail plugin and `skills-review/ponytail`.
- design-taste-frontend: retained Achromatic ledger direction, seed 486597856, for a precise neutral Operate surface.
- impeccable: context, craft-floor, audit, and polish references; mechanical source detector and rendered visual review. Existing Geist warning is an intentional continuity choice, not a reason to rebrand the requested utility.
- ui-ux-pro-max: verified dragging-alternative, utility palette, typography, and accessibility/performance lookups. The exact productivity palette match proposed teal/orange; neutral wheel colors were retained to respect the user's reference and existing direction. Lookup results did not override product truth.

The skills were read in place. No global skill installation or unrelated OS changes were performed.
