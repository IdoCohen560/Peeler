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

## Native workflow

8. Manually validate the initial radial menu and native drag state machine in Explorer and on native macOS/X11. Improve source identification and drag fallback before claiming parity.
9. Add opt-in file-manager actions and tray/menu-bar access on each OS. Prove native drag payload access in a minimal Windows experiment before designing a full global overlay around it.
10. Implement platform-specific global gestures and file actions, including a shelf. Keep Linux Wayland fallback explicit. Sharing adapters must disclose availability.
11. Add advanced editors and permanent redaction only after preview, undo, export, and failure behavior are tested.

## Release gate

Test on real Windows, macOS, and Linux machines; test high-DPI/multiple displays and restricted folders; audit codec/dependency licenses; verify accessibility and network inactivity; produce unsigned development builds first, then reproducible signed releases where possible. Public release is not part of the foundation milestone.

No fixed schedule is promised. Complete and verify vertical slices rather than counting mock handlers as features.
