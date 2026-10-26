# Validation record - Peeler 0.2, 2026-10-26

Environment: Windows 11, Node 24.22.1, npm 11.19.1, Electron 45.0.0. Exact dependencies are locked in package-lock.json.

## Latest implementation checkpoint

- 26 core/gesture/engine/recovery tests passed after the Office, HEIC/RTF/ODS/RAR, FFmpeg 9.0.2 and image-options changes.
- 258 conversion checks passed across 47 fixtures: 235/275 reference routes verified; 40 unavailable, zero available-but-untested routes in this Windows run. See CONVERSION_TEST_RESULTS.md and the committed JSON snapshot.
- Ten desktop cases passed against the rebuilt Windows executable: output folder persistence/reset, image options, staged-wheel options handoff, bundled Office/RAR workers, exits/cancellation, ten-category coverage and host-crash recovery. The actual host was killed during Office work; its marked workspace was recovered on restart without changing the source or publishing output. Nine non-crash cases also passed in development; the crash case was verified against the packaged executable.
- Office geometry and embedded DOCX images are checked through rendered pixels; ODS values/whitespace are independently read through Office. RAR bytes match a separate Windows tar/libarchive decode. These extend, rather than replace, the earlier content fixtures.
- Source lint: zero failures/warnings. Browser inspection at 1440/768/390: zero failures, one intentional 41px drop-target spacing warning. Impeccable's live Electron CDP scan found only the retained Geist face and the bordered drop target inside the workspace; paragraph stragglers were corrected with pretty wrapping. The nested region distinguishes the actual file drop target; it is not an ornamental card.
- Windows Office/media setup used pinned package-manager downloads and hash checks, with project-local extraction and no system installation. Non-Windows CI requests engines but has not run remotely.

The earlier table below is historical evidence for the foundation, not the current test count. Remaining readiness gates are in RELEASE_READINESS.md.

## Checks executed

| Check | Result |
| --- | --- |
| npm test | 19 tests passed: real image codecs/dimensions/source preservation; concurrent collision-safe outputs; subtitle timing; metadata; documents/EPUB/spine order; PDF text/all-page images/raster PPTX; slide text; spreadsheet values and multi-sheet loss prevention; ODS import; safe archive repacking; every offered audio/video output from fixture sources; cancellation/deadlines; left-side gesture mappings |
| npm run test:desktop | 3 tests passed: optional-window workflow/error isolation; ten-category batch through renderer/preload/worker; normal background startup with no window, native hook startup, synthetic hook gesture, radial selection, and real local File through the DOM drop/preload/conversion boundary |
| npm run pack | Windows x64 development package generated at dist/win-unpacked/peeler.exe |
| Packaged desktop test | All 6 tests passed against peeler.exe, including conversion workers, persistent drop choices, explicit exit controls, and quit-during-conversion cleanup |
| npm audit | Zero package advisories after scoped uuid/image-size overrides. This does not audit native FFmpeg security |
| Design-taste source lint | Zero failures/warnings |
| Design-taste browser inspection | Zero failures at 1440/768/390; one justified 41px blank-band warning in the large pointer drop target |
| Impeccable mechanical detector | Four warning records, all identifying inherited Geist usage in HTML/CSS. No other findings; retain the existing local face to preserve visual continuity |

## What was actually exercised

Core tests decode real generated outputs and verify text/value/archive contents. Audio/video fixtures are generated and every offered target from those fixture formats is decoded with FFmpeg. This is not exhaustive testing of all 275 reference paths or every third-party encoder's input cases.

Optional-window tests mock the native file-picker response. The background test starts the real Windows input-hook library, emits synthetic events to its registered callbacks, opens the real wheel, loads a real local file via Chromium's native file input, then dispatches a DOM drop through the actual renderer/preload/IPC/conversion path. It verifies a real JPG result and that no window remains visible. This caught a real FileList/contextBridge mismatch; callers now pass arrays of File objects.

The background test does not perform a physical Windows Explorer/OLE drag and does not establish that modifier gestures, source selection hints, display scaling, and drag/drop all work in every file manager. Native Windows manual checks are still required. macOS Accessibility behavior, X11 operation, Wayland alternatives, signing, long-running load, hostile-input fuzzing, idle CPU measurement, and packet capture are unverified here.

Packaging initially tried to rebuild a stable Node-API hook and required Visual Studio. Reusing the provided native prebuilds removed that unnecessary compiler dependency; packaged tests verify they load and run. No administrator installation or system settings changes were needed.

## Visual and skill review

Opened all six final design-taste fold/page sheets at desktop/tablet/narrow widths, plus the conversion wheel and ten-category batch screenshots. The native wheel is fixed to its 390px utility window; the optional converter has responsive layouts. No borrowed branding, screenshots, photography, or illustrations are included in the app.

ROUND 1 - optional converter

- Seen in one second: file conversion workspace and Add files action.
- Idea: source-to-output choices beside real files; the utility's normal entry stays in the background.
- Live thing: genuine conversions, queue state, and file-manager reveal.
- Layout: optional window=drop/rows; primary workflow=pointer-centered sectors; guidance=support list.
- Subjective scores: design 7.5, usability 8, creativity 6, content 8; weighted 7.4/10. Marketing photography/motion requirements do not apply to this Operate utility.
- Largest limits: native drag not physically checked; the optional empty drop target deliberately keeps extra pointer space; faithful office rendering is still missing.

ROUND 2 - background wheel and architecture

- Normal launch: no window or conversion worker; the overlay is created lazily.
- The wheel exposes explicit hover/pressed states, Escape, pagination, keyboard fallback, and concise content-loss notes. The larger picker remains the alternative to dragging.
- CStack/Ponytail review fixed source/FileList transfer, foreground-first lifecycle, and blocking parser execution. See ARCHITECTURE_REVIEW.md and architecture/adr-001-background-host.md.
- Impeccable audit/polish guidance and UI/UX Pro Max lookups informed context, focus, drag alternatives, state clarity, and continuity with the reference.
- This is a working development build, not a production-readiness certification or complete reference utility parity.

## Peeler rename and folder migration

The user confirmed Peeler as the app name and C:\Users\Owner\Peeler as the canonical project folder. Renamed package/app IDs, preload namespace, environment variables, notifications, metadata, and executable. The Windows build is now dist/win-unpacked/peeler.exe and embeds the generated banana/peeler silhouette icon. ICO has nine resolutions; ICNS signature and master alpha were checked. Extracted the executable icon with Windows APIs and visually confirmed it. Core tests: 19 passed after renaming. Packaged tests: all 3 passed from the new folder. The original generated master and all icon exports live under assets/branding.

## Persistent post-drop menu and exit regression checks

The wheel now stages every accepted file drop. A desktop regression test drops onto a format, releases the native gesture, waits past the dismissal timer, verifies no result exists, browses Tools/Formats, cancels without output, and then repeats with an explicit conversion click. Staged files have no auto-close timeout.

Six desktop tests cover this flow plus visible Quit, window-close-to-background, --quit of the existing instance, and quitting an active PDF job with source preservation and temporary-output cleanup. Test profiles are isolated from the normal user profile so a personal running copy does not take over test launches. CStack/Ponytail review informed the explicit lifecycle and native-versus-automated verification boundaries. Four-host CI and its still-unexecuted status are documented in PLATFORM_VERIFICATION.md.

## Exhaustive current-capability fixture matrix

`npm run test:formats` enumerated all advertised targets for 42 source fixtures and verified 219/219 conversions. It verifies 198/275 reference paths, with 77 explicitly unimplemented. Initial PDF PNG/JPG checks exposed a one-pixel floating-point ceiling error at 300 DPI; the renderer was corrected and the full matrix rerun passed. Details and remaining paths: CONVERSION_TEST_RESULTS.md and conversion-audit-results.json. This is fixture-level Windows evidence, not universal document-fidelity or cross-platform certification.
