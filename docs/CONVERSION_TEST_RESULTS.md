# Conversion audit results

Run: 2026-10-26T17:36:59.390Z on Windows x64, Node v24.22.1.

**258 checks passed; 0 failed. 235/275 reference routes verified; 40 remain unimplemented.**

The checker exercised 47 source fixtures across all ten categories, including a hash-verified upstream HEIC sample and libarchive RAR test data. Extra checks cover aliases and formats outside the reference inventory. Passing content fixtures does not certify every input variant or full visual fidelity.

| Category | Passed checks | Reference routes verified | Not implemented |
| --- | ---: | ---: | ---: |
| Images | 62 | 50 | 7 |
| Video | 48 | 48 | 0 |
| Audio | 56 | 56 | 0 |
| PDF | 7 | 7 | 2 |
| Documents | 36 | 29 | 30 |
| Slides | 6 | 6 | 0 |
| Spreadsheets | 21 | 21 | 0 |
| EPUB | 5 | 5 | 1 |
| Subtitles | 4 | 4 | 0 |
| Archives | 13 | 9 | 0 |

## What is verified

- Images decode with expected dimensions/colors; conversions from HEIC decode at the first image dimensions. Original input bytes remain unchanged.
- Every advertised audio/video pair is decoded for tone/frame content. Windows uses FFmpeg 9.0.2. A GIF-to-WebM pixel-format incompatibility found during the upgrade was fixed with explicit YUV420P output.
- Text/Unicode, EPUB reading order, cell values, subtitle timing, archive filenames/bytes, and all-page PDF image output are checked.
- Additional core regressions verify Office slide geometry and embedded DOCX images, RTF final paragraphs, ODS whitespace/typed values and independent Office reading, and RAR links/encryption/truncation rejection.
- The separate desktop suite exercises native-hook startup, staged drops, options handoff, resize/quality, destination selection, shutdown and packaged Office/RAR workers.

## Remaining reference paths

| Input | Missing outputs |
| --- | --- |
| Images / jpg | heic |
| Images / png | heic |
| Images / webp | heic |
| Images / tiff | heic |
| Images / svg | heic |
| Images / avif | heic |
| Images / bmp | heic |
| PDF / pdf | pages, xlsx |
| Documents / docx | pages |
| Documents / pages | docx, pdf, txt, md, html, epub, png, jpg |
| Documents / md | pages |
| Documents / txt | pages |
| Documents / rtf | pages |
| Documents / rtfd | docx, pages, pdf, txt, md, html, epub, png, jpg |
| Documents / textClipping | docx, pages, pdf, txt, md, html, epub, png, jpg |
| EPUB / epub | pages |

## Reproduce and limits

Run `npm run test:fixtures` once to download the pinned, SHA-256-verified HEIC sample, then `npm run test:formats`. Provision the Office engine as described in [OFFICE_ENGINE.md](OFFICE_ENGINE.md). The audit fails when an available route has no fixture rather than calling it unimplemented. Detailed outputs are under the directory recorded in [conversion-audit-results.json](conversion-audit-results.json).

The fixtures remain a limited corpus. Complex document layouts, HDR/animation, encrypted inputs, OCR/table reconstruction, long-running load, and all native macOS/Linux behavior require further acceptance work. Windows results do not certify other platforms. See [RELEASE_READINESS.md](RELEASE_READINESS.md).
