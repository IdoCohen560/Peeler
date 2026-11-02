# Roadmap

Current evidence: 235/275 reference routes have passing fixtures; 40 remain unimplemented. See [CONVERSION_TEST_RESULTS.md](CONVERSION_TEST_RESULTS.md), [PARITY_PLAN.md](PARITY_PLAN.md), and [RELEASE_READINESS.md](RELEASE_READINESS.md). Route counts alone do not establish fidelity or full product parity.

## Foundation (current milestone)

Background tray host, lazy radial overlay, optional picker, local conversion adapters across all ten categories, disposable workers, safe outputs, cancellation/deadlines, tests, and Windows packaging. This is a working development build, not full format/fidelity/tool parity. See CURRENT_SUPPORT.md and VALIDATION.md.

## Next: reliable conversion jobs

1. Harden final output publication, native allocation limits and adversarial fixtures. Managed workspaces, abandoned-job recovery, cancellation, deadlines, diagnostics, and progress already exist.
2. Add exact-size compression, metadata retention policy and animated/multipage handling. Resize, lossy quality and JPG/BMP background choices already exist.
3. Add persisted preferences (opt-in history; filenames are sensitive). A session output folder picker and staged-wheel options handoff already exist.
4. Maintain/update the bundled FFmpeg source and binary supply chain; extend tested conversions with trim, mute, normalize, and channel transforms before timelines and redaction.
5. Add PDF merge/split/organize and optional local OCR/table reconstruction. Page rasterization and text extraction already have passing fixtures.
6. Upgrade document/slides/sheets adapters from text/value conversion to measured layout fidelity; add missing office formats and assess Pages import/export separately. See the office-engine proof in PARITY_PLAN.md.
7. Extend bounded archive repacking with RAR input. Traversal/link rejection and expanded-size/entry-count bounds already exist; extend adversarial fixtures and engine-specific limits.

Track editing actions independently from format conversion. The per-category comparison with Tangerine's public, simulated wheel demo, Peeler's current gaps, and evidence limits is in [TOOL_PARITY_PLAN.md](TOOL_PARITY_PLAN.md#evidence-and-limits). The Windows/Linux sequence starts with real Explorer and X11 file-manager validation, then a complete image slice, PDF operations, audio/video controls, and archive extraction. Tangerine's Control key is not adopted as Peeler's third-mode default until Windows/Linux native drag-copy conflicts are tested.

## Native workflow

8. Manually validate the initial radial menu and native drag state machine in Windows Explorer, GNOME Files, and Dolphin on X11. Improve source identification and drag fallback before claiming parity.
9. Add opt-in file-manager actions and tray/menu-bar access on each OS. Prove native drag payload access in a minimal Windows experiment before designing a full global overlay around it.
10. Implement platform-specific global gestures and file actions, including a shelf. Keep Linux Wayland fallback explicit. Sharing adapters must disclose availability. Defer macOS runtime/permission validation until Windows/Linux gates pass.
11. Add advanced editors and permanent redaction only after preview, undo, export, and failure behavior are tested.

The complete category-by-category reference actions, Peeler status, shortcuts, and acceptance gates are tracked in [TOOL_PARITY_PLAN.md](TOOL_PARITY_PLAN.md). Conversion routes and editing tools are separate parity measures.

### Category actions to add

- **Images:** target-size compression, metadata editing, photo adjustments, annotations, composited backgrounds, crop, permanent redaction, multi-image PDF, and collage.
- **Video:** compression/metadata, mute, trim, crop, speed, frame export, split, join, and permanent redaction.
- **Audio:** compression/metadata, loudness normalization, waveform video, trim, channel conversion, and bleep ranges.
- **PDF:** compression/metadata, split, merge, page organization, OCR, and table reconstruction.
- **Archives:** safe extract-to-folder workflow.
- **Documents, Slides, Spreadsheets, EPUB, and Subtitles:** close remaining conversion/fidelity gaps; the reference category showcase does not display separate editing wheels for these categories.

Build and verify these actions as file-type-aware flows. Actions can differ between a single file and a multi-file selection. Use the modifier keys in the parity plan for each OS; Linux Wayland uses the tray picker until global drag capture is available.

## Next: file actions

Peeler currently has no counterparts for the reference's six file actions. After validating native drag behavior on each platform, add these as platform-aware actions for files, folders, and mixed selections:

1. **Copy Path** — copy one or more full paths as text, one path per line.
2. **Terminal** — open the containing directory (or selected folder) in the platform's configured terminal.
3. **Copy** — place selected files on the native file clipboard for paste into the file manager.
4. **Move** — choose a destination and move files without overwriting existing files.
5. **Share / AirDrop** — use each platform's native sharing UI; AirDrop is macOS-only and Windows/Linux need their own adapters.
6. **Float** — build a small drag-out shelf, then add optional edge pinning after basic transfer behavior is proven.

Each action must be optional when unsupported on a platform, avoid shell-string execution, handle mixed selections and failure/cancel states, and be verified with native file managers. See [PRODUCT_SPEC.md](PRODUCT_SPEC.md#file-actions) and [RELEASE_READINESS.md](RELEASE_READINESS.md).

## Release gate

Test on real Windows, macOS, and Linux machines; test high-DPI/multiple displays and restricted folders; audit codec/dependency licenses; verify accessibility and network inactivity; produce unsigned development builds first, then reproducible signed releases where possible. Public release is not part of the foundation milestone.

No fixed schedule is promised. Complete and verify vertical slices rather than counting mock handlers as features.
