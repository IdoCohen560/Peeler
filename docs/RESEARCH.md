# Reference website review

Reviewed 2026-10-26. Public-site review only; the installed Mac app was not available for behavioral testing. The original local project contained mock conversions, unsupported completion claims, and guessed download URLs. These are not evidence of product behavior.

## Coverage and provenance

| Source | Review |
| --- | --- |
| Home | Full rendered page, format families, drag demo instructions, footer, and dynamically rendered category descriptions |
| Tools | Tools landing page and full client-rendered catalog of 22 detailed tool windows, their feature descriptions, and screenshot references |
| Press | Product description, requirements, pricing, version, and six linked editorial images |
| Privacy | Local-processing, storage, analytics, and permission statements |
| Sitemap | Lists home, tools, and press; privacy additionally found in the footer |
| Home demo definitions | Reviewed the site's public client-side capability maps to identify all 26 tool identifiers and selection restrictions. No code copied into Peeler. |
| Press screenshots | Reviewed image links for advanced tools, conversion menu, image editing, background composition, and audio tools. Branding/assets are excluded from the implementation. |
| Support / feature request | Email links, not additional product documentation. No messages sent. |
| App Store / press download / video | Linked distribution and media resources, not additional site pages. No purchase, app download, or video playback performed. |

The website has four discoverable content pages. Coverage includes those pages, their interactive feature definitions, the press screenshot links, and the tools catalog's feature text and screenshot references. This does not mean access to private pages, source repositories, or undocumented native app behavior. The site's tools page exposes little server-rendered detail; its public client script supplies the complete detail catalog. The 22 tool-window image files themselves were not individually visually audited.

## Findings

The core design is a context-dependent menu at the dragged file. Format conversion, editing, and file actions use separate modifier gestures. Native integration and managing file-manager permissions matter as much as codec support.

The detailed tools catalog adds useful requirements beyond the home demo: precise timing controls, independently previewed audio channels, loudness/peak settings, timeline-specific redaction ranges, and choosing an output canvas when joining clips. Those are editor requirements, not mere format conversions. The home inventory includes additional simpler tools that have no detailed window page.

The public home advertises 275 conversion options, 26 tools, and six actions. Treat the total conversion count as a vendor claim, not a verified pairwise graph: the demo and the actual app may differ. Peeler should count only tested conversion paths.

The press page currently identifies a $29.99 USD one-time price, version 1.4, Apple silicon, and macOS 13+. The user's $15 observation may reflect a different date or storefront; this review did not verify App Store regional pricing. Pricing does not affect the independent project's license or scope.

The privacy page says conversion takes place on-device, results are saved alongside inputs, permissions remain local, and analytics are absent. Peeler adopts local processing as its own explicit product requirement. No claims about native internals, memory usage, implementation language, or specific libraries can be derived from those statements.

## Decisions and remaining unknowns

Follow-up category audit: all ten website tabs were rechecked directly in the live home HTML, and their offered input/output routes were enumerated from the public demo declarations. EPUB is now represented as a separate category rather than only nested under Documents. The detailed results are in [CONVERSION_MATRIX.md](CONVERSION_MATRIX.md) and [format-inventory.json](format-inventory.json). This audit does not imply the missing engines have been implemented.

- Build original code and assets from observed behavior. Binary analysis is unnecessary for this phase.
- Use a distinct provisional product name and MIT license. Reference features are inputs to design, not copied UI artwork or marketing prose.
- Do not equate PDF export with editable office reconstruction. Scanned PDFs, layout retention, and tables require separate engines and quality tests.
- Pages/RTFD support, DRM-protected documents, archive edge cases, cloud placeholder files, precise save semantics, and native drag interception need experiments.
- [PRODUCT_SPEC.md](PRODUCT_SPEC.md) captures the intended behavior; [ROADMAP.md](ROADMAP.md) separates implementation from planned work.
