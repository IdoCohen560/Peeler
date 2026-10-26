# Progress

## 2026-10-26 - Linux CI follow-up

User asked about failed macOS/Linux pushes. Verified those platform files were present remotely: the failures were Actions verification jobs, not missing uploads. Windows and Apple silicon jobs passed; Intel Mac progressed past the refreshed Office setup into packaging. Linux core/conversion checks passed but three desktop cases failed.

Confirmed from installed Playwright source that its Linux launcher adds --no-sandbox, while the separately spawned quit peer omitted that test-only flag; aligned the peer launch without changing the shipped app's sandbox settings. Added bounded peer stderr/signal diagnostics and per-file conversion errors to desktop failure reports. Headless Office jobs on Linux now explicitly select the software backend and clear inherited desktop displays; Office errors retain bounded engine diagnostics even when the engine exits without creating a file. Added branch/ref concurrency so newer verification runs cancel obsolete runs for the same ref. These changes require fresh remote Linux verification; no failed test was disabled or relabeled as passing.

## 2026-10-26 - Windows preview uploaded and repository verified

Published the complete 797,323,781-byte Windows development app/resources ZIP and SHA256SUMS.txt at https://github.com/IdoCohen560/Peeler/releases/tag/v0.2.0-dev.1. Archive integrity passed before upload; local SHA-256 is 2d6c27c0856dae71944955bff52b877bba2c4e0f8d3616b10a640ef8f2651e29. All ten packaged desktop cases passed again after the branding/package metadata cleanup. This is a marked development prerelease, not a claim of finished product readiness.

Verified all 138 tracked project files are present remotely, scanned every tracked file's bytes for retired branding with zero matches, and verified GitHub author/committer profiles and the contributors list identify only IdoCohen560. No co-author credits were introduced. The user's selected distribution split keeps all project source/assets/docs/scripts in Git, built application resources in Releases, and generated caches/dependencies/private credentials and history backups local.

The first Apple silicon CI job completed successfully. Linux core/conversion checks passed, but three desktop cases failed (quit peer, ten-category batch and Office/RAR integration); those are open cross-platform work rather than hidden successes. Windows/Intel Mac jobs were still running during publication. Current CI links and readiness limits are visible in README and docs/RELEASE_READINESS.md.

## 2026-10-26 - public repository publication and distribution choice

Published https://github.com/IdoCohen560/Peeler as a public repository. Verified GitHub's API reports IdoCohen560 as both author and committer, with no co-author trailers, and verified every one of the 138 tracked project files matches the remote tree. The initial public source history contains no retired branding in file contents, filenames or commit messages. All old history remains private in the ignored local backup bundle. No force push was used.

The user selected project files in Git and large builds as Release downloads. Rebuilt the Windows package with current Peeler-only notices/license/package metadata and prepared the complete app/resources archive separately. Credentials, local Git internals, temporary test profiles and reproducible installed dependencies remain out of the public source tree. The first four-host GitHub CI run started; an Intel Mac Office install failed because runner Homebrew metadata referenced a removed old download, so the workflow now explicitly refreshes metadata before installing the cask. CI results remain separate from native manual validation.

## 2026-10-26 - GitHub ownership and Peeler-only public source

User requested a public repository under IdoCohen560 with sole commit attribution, then requested removal of the previous product name from all published project content and filenames. Authenticated the actual GitHub account through Git Credential Manager's device flow and verified the API identity before creating IdoCohen560/Peeler. Configured only this repository's author/committer identity and GitHub credential username; the no-reply address avoids exposing the supplied Gmail address in public commits.

Preserved original local history in an ignored Git bundle, verified all 17 original commit trees during author-metadata cleanup, and prepared a clean initial public history so retired names and old author metadata are not exposed. Scrubbed the former branding from active and archived text, renamed six legacy files, updated README to current capabilities, retained dependency licenses and set the original-source copyright/package author to IdoCohen560. This explicit user cleanup request superseded local restrictions on editing the named documentation/instruction files; unrelated instruction content was preserved.

Preflight scanned 264 historical source blobs for common credential/private-key patterns and oversized Git blobs, with no findings. All ordinary source/assets/docs/configuration/tests are prepared for publication. Generated dependencies, downloaded engine trees, builds, caches, credential data and private backups remain separate; the user's large-file inclusion preference is still pending. Repository contents and reproducibility are documented in docs/REPOSITORY_CONTENTS.md. No account credentials were written into project files or Git history.

## 2026-10-26 - Office rendering, 37 additional reference routes, options and recovery

Continued the user's full-completion request with CStack ARCHITECT/REVIEW, Ponytail, the retained design-taste Achromatic ledger direction, Impeccable audit/polish and UI/UX Pro Max palette/type/dragging lookups. Kept the native background-first model. No sub-agents, system installs/settings changes, or external publishing were used.

Provisioned hash-pinned LibreOffice 26.8.1.1 and Gyan FFmpeg 9.0.2 entirely inside tools using winget downloads and extraction; Windows packaging includes managed engines and their retained notices. Added isolated Office rendering for DOCX/RTF/slides/sheets, legacy PPT/XLS import, document/slide page-image ZIPs, local HEIC decoding, RTF content import, ODS output, and bounded RAR repacking. The audit now verifies 235/275 reference routes (40 missing), with 258 passing checks from 47 fixtures. Added pinned HEIC fixture fetching, provenance-retained libarchive fixtures, honest available-but-untested reporting and engine provisioning to CI; remote jobs still have not run because no Git remote exists.

The expanded fixtures caught and fixed lost RTF final paragraphs, ODS numeric entities/whitespace, a new FFmpeg GIF/VP9 pixel-format incompatibility, and Windows Office failures under long output-folder paths. Conversion work now uses short managed job folders and parent leases; startup recovers marked abandoned jobs while retaining active/unrelated data. A real packaged host-kill/restart test confirms scratch recovery and source preservation.

Added proportional image bounds, lossy quality and JPG/BMP background controls, a per-session output-folder picker/reset, and More options from the staged wheel into the optional converter. Conversion still requires explicit activation. Adjusted queue height after a desktop test caught an inaccessible footer; retained visible Cancel/Quit controls, keyboard input, readable disabled states, and bounded scrollable wheel notes.

Also added Save image copy so resizing/quality changes do not require changing formats. The Resize / quality wheel tool opens configuration; the validated same-format operation publishes a separate edited copy. Core and desktop tests verify same-format PNG resizing and unchanged source dimensions/bytes. This is not a promise of exact-size compression.

Final screenshot polish shortened the repeated image note and reduced format buttons to 44 pixels, making every image choice fit in the tested desktop dialog without scrolling. Reviewed the actual rendered result, passed the affected desktop case, and rebuilt the executable. Source lint remains clean; Impeccable source findings remain limited to the retained Geist family.

Verification: 26 core/gesture/engine/recovery tests pass; all 258 current conversion checks pass; all 10 packaged desktop cases pass (including actual engine resource paths, options handoff, output destination, crash/restart, and shutdown). Nine non-crash cases also pass in development. Source lint has zero failures/warnings; responsive inspection has zero failures and one intentional drop-target spacing warning. Reviewed all responsive screenshots and the narrow image-options dialog. Impeccable's live base-window scan found retained Geist/drop-target exceptions; source scan retains only Geist warnings after polishing paragraph wraps and the borderless options fieldset. npm production audit reports zero package advisories; it does not audit native/WASM binaries. All test app/Office processes are closed afterward.

Updated CURRENT_SUPPORT, architecture/review, roadmap/checklist, engine setup, committed audit evidence and RELEASE_READINESS.md. No DONE.md was created: 40 routes, most advanced tools/actions, real native macOS/Linux/Explorer validation, binary/source redistribution review, libarchive WASM maintenance, and final-copy crash atomicity remain open. Next: genuine Apple-format/HEIC-encoding backend research, the remaining tool/action flows and native platform gates; do not call this build 100% complete.

## 2026-10-26 - missing-route diagnosis and professional parity gates

Explained the 77 unimplemented reference routes: documents 44, HEIC images 14, spreadsheets 8, slides 5, archives 3, PDF 2, EPUB 1. Distinguished content fixture success from layout fidelity, editable reconstruction, complete tool coverage, and native platform validation. Reviewed primary LibreOffice, libheif, and libarchive documentation. Added docs/PARITY_PLAN.md with engine priorities, tradeoffs, unresolved Pages export, per-route acceptance evidence, and release gates; corrected stale roadmap items already implemented. No runtime or dependency changes were made and no conversion tests were rerun for this documentation-only change. Next: isolated office-engine rendering/compatibility proof with real DOCX/PPTX/XLS fixtures. Mac/Linux behavior and candidate engines remain unverified.

## 2026-10-26 ? independent implementation reset

Reviewed the original folder and public website. Original prototypes fabricated or simulated conversion results; old plans also incorrectly checked binary acquisition/analysis as completed. Preserved root originals in archive/pre-rewrite before replacing active material. Preserved the existing .git directory and agent instruction file.

Chose a provisional independent name, Peel, and MIT licensing. Built an Electron shell with Sharp image encoding, subtitle parsing/serialization, collision-safe outputs, local file picker/drop handling, and sequential batches. Added tests, packaging targets, CI, source-linked research, a product specification, and a roadmap.

Fixed a Windows handle-retention issue found by the real image tests by disabling Sharp's file-handle cache. The foundation has a deliberately limited capability set. The global drag gesture, all broader format engines, and advanced tools remain unfinished. See docs/VALIDATION.md for final evidence and docs/ROADMAP.md for next steps.

Final checks passed: five core tests; desktop integration with valid image/subtitle files and an invalid image; Windows packaging; the same integration test against the packaged executable; production dependency audit; source lint; and responsive browser inspection (zero failures, one justified drop-target spacing warning). Read the client-rendered tools detail catalog as well as the home demo so future editor requirements include precise timing, audio channel/loudness controls, and redaction ranges. macOS/Linux remain unverified locally.

## 2026-10-26 — full category follow-up

User emphasized all ten conversion categories. Revisited the live home/tools pages and category declarations; wrote an explicit input/output matrix and structured reference inventory; separated EPUB in the product specification; expanded TODO into ten category-specific requirements; and made full scope visible in README. Runtime support is still limited to the implemented image/subtitle subset. This was a research/documentation correction, not implementation of the remaining conversion engines.

## 2026-10-26 - cross-category engines and background workflow

Implemented local adapters spanning all ten categories and disposable conversion processes with cancellation, deadlines, output cleanup, bounded archives, and progress. Added real codec/decode, document/EPUB/spreadsheet roundtrip, PDF page/raster-slide, and safety tests. Patched transitive dependency advisories with scoped overrides and verified their callers.

User clarified the primary product must be a minimal background utility. Normal launch now creates a tray host and native hook, with no window. A radial drop menu is created lazily; the larger picker is optional and its renderer is destroyed on close. Added Left Shift / Left Alt Windows/Linux bindings and Left Shift / Command Mac logic. Windows selection hints are read-only; actual dropped File objects determine processing. Automated drop testing caught and fixed a FileList/context-bridge serialization bug.

Applied Ponytail and CStack architecture/security guidance from the supplied skills-review folder, plus design-taste-frontend direction, Impeccable audit/polish guidance, and UI/UX Pro Max lookups. No skill was installed globally and no OS startup/system settings were changed. Actual Explorer/OLE dragging, macOS runtime/permissions, X11 runtime, and Wayland alternatives remain validation work. See docs/VALIDATION.md for final checks.

Final verification: 19 core/gesture tests and 3 desktop tests pass. The final packaged Windows executable passes all 3 desktop tests, including normal zero-window startup and the DOM drop path. Source lint reports zero failures/warnings; responsive inspection has zero failures and one justified pointer-target spacing warning; Impeccable source findings are limited to the inherited Geist face. Production npm audit reports zero advisories. The native Node-API hook package is used without redundant rebuilding, avoiding a Visual Studio requirement. Preserved the user's existing AGENT_INSTRUCTIONS.md modification.

## 2026-10-26 - Peeler name, silhouette logo, and canonical folder

User confirmed Peeler / peeler.exe and requested a shadow-only peeled-banana-plus-peeler logo. Created the original transparent master using the built-in image generation tool, saved it under assets/branding, and generated 16-1024 PNG sizes, a nine-resolution Windows ICO, macOS ICNS, and black/reversed tray variants. Integrated the mark in app UI, native window, tray, and executable resources. Stored the exact prompt and provenance in assets/branding/BRAND.md.

Moved the complete repository (including .git, dependencies, archives, assets, tests, and build outputs) from the original project folder to the user's requested C:\Users\Owner\Peeler. The previous source folder no longer exists. Updated active name/path references and regenerated the Windows package. Verified the executable filename, Windows product metadata, ICO/ICNS containers, and embedded icon extraction. All 19 core tests passed after the rename; all 3 packaged desktop tests passed from the relocated directory. Existing uncommitted AGENT_INSTRUCTIONS.md changes were preserved.

## 2026-10-26 - persistent choices, explicit exits, platform verification

User requested releasing dropped files before choosing a format. Changed the wheel to stage every valid drop, keep it open without a pending-file timeout, and require explicit click/key activation to convert. Added Formats/Tools controls and tests proving mouse release leaves the selection intact, browsing works, and cancellation creates no output.

User could not find the tray icon and explicitly asked to quit the running app. Verified no media worker was active and stopped its identified Windows process tree. Added a visible Quit Peeler button and --quit single-instance command; tested that window close keeps the host alive while both explicit exits stop it. Isolated test profiles avoid competing with a real running app. CStack test-plan and Ponytail scope guidance informed the changes. CI now covers Windows, Ubuntu X11, Intel Mac, and Apple silicon, with packaged tests and diagnostic artifacts. No remote is configured, so remote jobs remain unexecuted.

Exit hardening: six desktop cases now pass in development, including quitting during an active real PDF rendering job without leaving output/temp files or changing the source. Added explicit --quit handling before startup and for second-instance requests, visible Quit UI, and suppression of completion notifications during shutdown. User's running app was closed as requested and is not restarted automatically.

User requested checking all types/conversions. Added a reproducible two-worker matrix checker with independent output decoders/content checks, unchanged-source assertions, all advertised source-to-target combinations, aliases, and archive variants. Initial result: 217 passed and 2 PDF image dimension failures; corrected floating-point ceiling noise and reran all 219 checks successfully. Coverage matches 198 reference paths; 77 reference paths remain unimplemented. Added full JSON and readable results, plus the check to each CI host.

Final checks after the fixes: all 19 core/gesture regressions passed; all 219 current-capability conversion checks passed; all six desktop cases passed against the rebuilt peeler.exe. Reviewed the persistent-choice screenshot and all six responsive inspection renderings, with zero inspection failures. The running app remains closed at the user's request. No macOS/Linux remote jobs were run or claimed as passed.

## 2026-10-26 - isolate Linux native image libraries

Both Intel and Apple silicon Mac jobs passed in remote CI. Linux quit integration now passes; its remaining desktop failures reported native worker exits after the Sharp/Electron Linux warning. Moved Sharp loading/cache setup into image jobs so PDF and Office workers do not load conflicting libvips/GLib symbols. Worker crashes now report exit signal/code and desktop failures identify the input row. Windows regression verification: all 26 core tests and all 10 development desktop cases passed. Remote Linux verification remains pending for this change.


## 2026-10-26 - asynchronous close verification and bounded Linux provisioning

Latest remote Windows and Apple silicon jobs passed all checks including packaged tests. Intel Mac passed all 258 conversions but exposed a timing race in the close-window test: page.close can resolve before BrowserWindow destruction finishes. The assertion now polls the same required zero-window/ready state; five repeated Windows runs passed. Linux dependency provisioning stalled, so CI now installs only the Writer/Calc/Impress components used by Peeler, omits optional recommended packages, and bounds network retries/timeouts and the installation step. No conversion or platform test is disabled.


Linux provisioning diagnosis: the cancelled runner log shows Azure's Ubuntu mirror taking more than five minutes for a 20 MB package, with continued small transfers preventing ordinary connection timeouts. CI now prefers Ubuntu's official HTTPS archive/security mirrors and retains Azure as fallback; signed-package verification remains enabled. This addresses the observed runner bottleneck without changing users' machines.


Focused Linux diagnosis: the new row/signal diagnostics identify PDF text extraction and Office PDF-to-PNG rendering as SIGTRAP crashes even without Sharp loaded. Added a direct Electron native canvas/PDF.js probe before lengthy provisioning, with a Linux gdb backtrace on failure. Windows probe passes. Also corrected Office cancellation regression timing to abort on rendering progress rather than after an arbitrary 500 ms delay; its targeted Windows check passes.


Linux native root cause isolated: canvas import SIGTRAP occurs during automatic system-font discovery under Electron. The otherwise identical probe passes with DISABLE_SYSTEM_FONTS_LOAD=1 (run 40384738454). Applied this flag to Linux conversion workers only; PDF.js already uses embedded fonts and bundled standard fonts with useSystemFonts=false. Native smoke verification now matches the actual worker environment on each OS. Full Linux desktop/package validation is required next; the direct import probe alone is not claimed as complete verification.


## 2026-10-26 - Linux verification passed and cross-platform source confirmed

Run 40384978490 on 251b8c3 completed the Linux job successfully: all 26 core cases, 258 conversion checks, nine applicable development desktop cases, packaging, and nine applicable packaged-app cases passed. The Windows-only native-hook case remains correctly excluded on Linux/Mac. The failing PDF extraction and Office page-image workers now pass without disabling their tests. Updated README, validation evidence and readiness gates with direct remote links, retaining the requirement for physical native drag/permission checks. Intel Mac/Apple silicon/Windows previously passed complete packaged checks; their latest reruns are still monitored independently. Source was never missing remotely: the original red checks were CI verification failures. All fixes are committed and pushed solely as IdoCohen560, with no co-author trailers.

