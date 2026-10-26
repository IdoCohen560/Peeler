# Conversion and product parity plan

Reviewed 2026-10-26 using the capability audit and CStack/Ponytail guidance. This is an implementation and acceptance plan, not a claim that the remaining engines are installed or verified.

Follow-up: Office rendering/import, HEIC decoding, RTF import, ODS output and RAR repacking now pass Windows fixture checks. Coverage is 235/275; 40 routes remain. The 77-route breakdown below records the initial gap diagnosis. Current engine evidence is in OFFICE_ENGINE.md and current release gates in RELEASE_READINESS.md.

## Why 77 routes are missing

A route is one input/output pair, such as HEIC to JPG. The current development milestone implemented working conversions across ten categories before completing every format, rendering engine, and editing tool. The reference inventory contains 275 routes; 198 currently have passing fixture checks and 77 have no implementation. There are 219 passing checks because aliases and additional formats extend beyond that inventory.

| Missing family | Routes | Practical use |
| --- | ---: | --- |
| Documents | 44 | Apple Pages interoperability, RTF/RTFD/text-clipping import, and document pages exported as JPG/PNG for sharing and previews. |
| Images | 14 | HEIC input/output, especially exchanging phone photos with other software. |
| Spreadsheets | 8 | Older XLS workbooks and ODS output for open-format spreadsheet workflows. |
| Slides | 5 | Older PPT decks and exporting PPT/PPTX slides as JPG/PNG. |
| Archives | 3 | Repacking RAR downloads into ZIP/TAR/GZIP-compatible outputs. |
| PDF | 2 | Extracting tables into XLSX and exporting content to Pages. |
| EPUB | 1 | Editing book content in Pages. |
| Total | 77 | See CONVERSION_TEST_RESULTS.md for every pair. |

These are grouped engine gaps, not 77 independent features. The document count includes 14 JPG/PNG page-export routes. Sixteen routes across the inventory involve Pages as input or output. Counts overlap across these observations and must not be added together.

Audio, video, and subtitle format-route coverage is complete for the reference inventory, but that does not certify all input variants, advanced editing tools, stream preservation, or quality settings.

## Existing routes also need fidelity work

Current document and EPUB exports are content-oriented and omit original layout/images. PPTX to PDF currently exports slide text. Spreadsheet conversions preserve values rather than full formatting or recalculated formulas. PDF to PPTX embeds page images rather than reconstructing editable objects. The current audit proves basic content/decodability and unchanged sources on small generated fixtures; it does not prove visual equivalence or professional document fidelity.

## Implementation sequence

1. **Office rendering and compatibility.** Evaluate a local LibreOffice worker for DOCX/RTF/PPT/PPTX/XLS/XLSX/ODS import/export and real page rendering. Use rendered PDF pages for document/slide JPG and PNG exports where appropriate. Replace text-only rendering paths when the engine meets acceptance checks. Reuse disposable jobs, cancellation, deadlines, diagnostics, and safe output publication. Each job needs an isolated engine profile so concurrent work cannot attach to a user's office session. A larger download/package is a real tradeoff; start the engine only for a conversion, not at background startup. Font substitution and Office-specific features require explicit fixtures; LibreOffice is a candidate, not a guarantee of pixel-identical Microsoft Office output.
2. **HEIC and RAR.** Evaluate libheif with explicitly selected HEVC decoding/encoding plugins and libarchive for RAR reading. Verify the exact shipped builds on each OS, including color profiles, orientation, transparency policies, RAR variants, and malicious archives. Preserve existing expansion limits and path/link rejection. Review codec licenses and redistribution requirements before selecting binaries.
3. **Apple formats.** Investigate Pages import and export separately, along with RTFD packages and text clippings. Pages export remains an unresolved portable-backend choice; no extension renaming, text-only substitute, or Mac-only automation can count as verified cross-platform Pages support. Inspect representative format versions and document bundles, attachments, and metadata. Prove a real backend before advertising any route.
4. **PDF reconstruction.** Add local OCR for scans and table extraction for PDF to XLSX, with independently verified cells, reading order, and merged-cell behavior. These are reconstruction problems; a page renderer alone cannot solve them. Distinguish appearance-preserving output from editable reconstructed output. Reject unsupported inputs or disclose limits instead of silently returning incomplete results.
5. **Tools and native workflow.** Track the reference's 26 tools and six actions independently of its 275 format routes. Complete compression/resize and metadata policies, PDF operations, media editing, sharing/shelf/file actions, and permanent redaction against PRODUCT_SPEC.md. Validate the release-after-drop workflow, cancellation, keyboard use, tray/quit access, multi-display scaling, and native file-manager behavior on each supported OS.

## Acceptance gate for every route

Track these evidence levels separately: implementation available; content verified; fidelity reviewed; packaged OS verified. A passing format smoke test must not imply all four.

- Representative fixtures: real application-generated inputs as well as synthetic boundary cases; multiple pages/sheets/slides, embedded images, fonts, tables, Unicode, formulas, and format versions where relevant. Record fixture origin and permission to redistribute.
- Output checks: decode with an independent reader where practical; compare text, cells, stream counts, dimensions, timing, and archive entries. Compare rendered pages visually for layout routes and manually review changes to baselines. Do not use a universal pixel threshold that hides font or layout regressions.
- Failure checks: invalid, encrypted, oversized, truncated, and unsupported files; cancellation during processing; worker crashes; name collisions; unwritable destinations. Source bytes must remain unchanged, and cancelled/failed jobs must not publish success outputs.
- Operational checks: measured peak memory, idle background footprint, startup/first-use latency, conversion time, and cleanup after parent-process crashes. Set budgets from measured representative workloads before release.
- Platform checks: run the same route corpus against packaged Windows, Linux, Intel Mac, and Apple silicon builds. Perform native drag, permissions, tray, and display checks on real OS sessions. Define and test the Linux Wayland fallback explicitly.
- Release checks: maintained engine versions, reproducible dependency/source provenance, redistribution notices and corresponding source obligations, accessible UI, signing/distribution checks, and privacy/network verification.

## Completion rule

Full parity requires the entire reference route inventory, tool/action inventory, and native workflows to pass the appropriate acceptance gates. If a format remains technically unresolved, report the gap and platform availability explicitly; do not reduce the reference inventory to make coverage appear complete. Current macOS/Linux CI configuration has not yet produced remote results, and Windows tests cannot certify those platforms.

## Primary engine references

- [LibreOffice conversion filters](https://help.libreoffice.org/latest/en-US/text/shared/guide/convertfilters.html): supported filters and command-line conversion contract.
- [libheif](https://github.com/strukturag/libheif): HEIF/AVIF codec library and plugin/build choices.
- [libarchive](https://www.libarchive.org/): RAR reading and archive output support across Windows and POSIX systems.

The initial Office proof is complete for generated DOCX/PPTX/XLS fixtures. Continue with broader fidelity fixtures, genuine Pages import/export and HEIC encoding research, followed by the remaining tools/actions and platform gates. Do not treat generated fixtures as universal Office compatibility.
