# All ten conversion categories

Reviewed against the live website on 2026-10-26, including its client-rendered category tabs and format declarations. This is the target scope for Peeler. Current runtime support spans all ten categories; exact implemented routes and fidelity limits are separately documented in [CURRENT_SUPPORT.md](CURRENT_SUPPORT.md).

The website advertises 275 conversion options. Counting its public demo declarations yields 275 directed input/output paths. This count describes the demo, not a verified native-app capability test. Same-format conversion is excluded. Editing tools such as audio visualization are counted separately from these format paths.

| Category | Observed demo paths | Peeler runtime status |
| --- | ---: | --- |
| Images | 57 | Partial implementation; see current support |
| Video | 48 | Partial implementation; see current support |
| Audio | 56 | Partial implementation; see current support |
| PDF | 9 | Partial implementation; see current support |
| Documents | 59 | Partial implementation; see current support |
| Slides | 6 | Partial implementation; see current support |
| Spreadsheets | 21 | Partial implementation; see current support |
| EPUB | 6 | Partial implementation; see current support |
| Subtitles | 4 | Partial implementation; see current support |
| Archives | 9 | Partial implementation; see current support |

## Images

| Input | Offered outputs |
| --- | --- |
| jpg | png, webp, heic, tiff, avif, bmp, pdf |
| png | jpg, webp, heic, tiff, avif, bmp, pdf |
| webp | jpg, png, heic, tiff, avif, bmp, pdf |
| heic | jpg, png, webp, tiff, avif, bmp, pdf |
| tiff | jpg, png, webp, heic, avif, bmp, pdf |
| svg | jpg, png, webp, heic, tiff, avif, bmp, pdf |
| avif | jpg, png, webp, heic, tiff, bmp, pdf |
| bmp | jpg, png, webp, heic, tiff, avif, pdf |

- SVG is input only.
- Image-to-PDF export is included.

## Video

| Input | Offered outputs |
| --- | --- |
| mp4 | mov, mkv, webm, avi, wmv, gif, mp3 |
| mov | mp4, mkv, webm, avi, wmv, gif, mp3 |
| mkv | mp4, mov, webm, avi, wmv, gif, mp3 |
| webm | mp4, mov, mkv, avi, wmv, gif, mp3 |
| avi | mp4, mov, mkv, webm, wmv, gif, mp3 |
| wmv | mp4, mov, mkv, webm, avi, gif, mp3 |
| gif | mp4, mov, mkv, webm, avi, wmv |

- Video containers can export GIF or MP3.
- GIF inputs export video containers; the demo does not offer GIF-to-MP3.

## Audio

| Input | Offered outputs |
| --- | --- |
| mp3 | m4a, wav, flac, ogg, opus, aiff, wma |
| m4a | mp3, wav, flac, ogg, opus, aiff, wma |
| wav | mp3, m4a, flac, ogg, opus, aiff, wma |
| flac | mp3, m4a, wav, ogg, opus, aiff, wma |
| ogg | mp3, m4a, wav, flac, opus, aiff, wma |
| opus | mp3, m4a, wav, flac, ogg, aiff, wma |
| aiff | mp3, m4a, wav, flac, ogg, opus, wma |
| wma | mp3, m4a, wav, flac, ogg, opus, aiff |

- Audio visualization to MP4 is a separate editing tool.

## PDF

| Input | Offered outputs |
| --- | --- |
| pdf | docx, pages, pptx, xlsx, jpg, png, epub, txt, md |

- The site specifies all-page image exports at 300 DPI.
- Scanned-document text conversion uses local OCR according to the category descriptions.
- Editable office reconstruction and layout fidelity require separate implementation work.

## Documents

| Input | Offered outputs |
| --- | --- |
| docx | pages, pdf, txt, md, html, epub, png, jpg |
| pages | docx, pdf, txt, md, html, epub, png, jpg |
| md | docx, pages, pdf, txt, html, epub, png, jpg |
| txt | docx, pages, pdf, md, html, epub, png, jpg |
| rtf | docx, pages, pdf, txt, md, html, epub, png, jpg |
| rtfd | docx, pages, pdf, txt, md, html, epub, png, jpg |
| textClipping | docx, pages, pdf, txt, md, html, epub, png, jpg |

- RTF, RTFD, and Finder text clippings are input only.
- HTML is an output in the demo; no HTML-input conversion route is defined.

## Slides

| Input | Offered outputs |
| --- | --- |
| ppt | pdf, jpg, png |
| pptx | pdf, jpg, png |

- PPT is input only.
- PDF-to-PPTX belongs to the PDF input category.

## Spreadsheets

| Input | Offered outputs |
| --- | --- |
| xlsx | ods, csv, tsv, pdf |
| xls | xlsx, ods, csv, tsv, pdf |
| ods | xlsx, csv, tsv, pdf |
| csv | xlsx, ods, tsv, pdf |
| tsv | xlsx, ods, csv, pdf |

- XLS is input only.
- PDF-to-XLSX belongs to the PDF input category.

## EPUB

| Input | Offered outputs |
| --- | --- |
| epub | pdf, docx, pages, txt, md, html |

- EPUB is its own category on the website.
- PDF-to-EPUB offers reflowable-text or fixed-page approaches according to the category descriptions.

## Subtitles

| Input | Offered outputs |
| --- | --- |
| srt | vtt, txt |
| vtt | srt, txt |

- Interchange preserves cue timing; plain-text export removes subtitle timing.

## Archives

| Input | Offered outputs |
| --- | --- |
| zip | tar, gz |
| tar | zip, gz |
| gz | zip, tar |
| rar | zip, tar, gz |

- RAR is input only.
- The demo labels gz as GZIP and gives generated outputs a .tar.gz suffix.
- Extraction is a separate tool; single-stream gzip versus tar.gz semantics need native-app validation.

## Development contract

All ten categories are required for the intended product. A foundation milestone covering two categories does not complete the full app. Implement each path using a real local engine, verify output contents and error handling, and enable it only when available on the host platform. Native-format limitations must be disclosed rather than replaced with renamed files or simulated success.

The machine-readable inventory is [format-inventory.json](format-inventory.json). It is documentation data, intentionally separate from the runtime capability registry until engines exist. See [PRODUCT_SPEC.md](PRODUCT_SPEC.md) for advanced tools and file actions, and [ROADMAP.md](ROADMAP.md) for the implementation sequence.
