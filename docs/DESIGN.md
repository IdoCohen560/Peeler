# Interface direction

Achromatic ledger, seed 486597856; no redraws. Selected for a small utility used in short sessions: a quiet monochrome shell keeps attention on filenames, output formats, and conversion outcomes. Stone ground (#f4f3f1), white workspace, near-black action, locally bundled Geist at 400/500. No stock photography, borrowed artwork, or sample jobs.

The screen answers: “Which files am I converting, and to what?” Its largest block is the actual drop area and queue. The product-specific element is the per-file source-to-output choice. The user-confirmed Peeler mark is a pair of peeled-banana and handheld-peeler silhouettes. No financial metrics or irrelevant dashboard navigation.

Objects: selected local files, sizes in bytes/KB, available output formats, queued/running/failed/completed states, and generated output paths. All counts derive from the current queue; new sessions begin at zero. No persistence yet. Primary job: add files, select outputs, convert. Completed rows reveal output in the file manager. Failure rows explain the error and can be retried. The app prevents concurrent batches.

One centered column with 24px gutters; workspace rows use flexible filename + 150px format + 90px outcome columns and 16px gaps. At narrow widths format shares the first row and outcome moves below. Secondary explanatory text becomes a single column. Focus rings, disabled states, native dialog Escape behavior, reduced-motion support, and live error/status text are included.

The format dialog is currently a button grid, not a radial overlay. This is an explicit foundation limitation, so the user can operate real conversions while native interaction research continues.

Follow-up: the user explicitly made the reference drag-wheel workflow binding. Normal launch has no window. The wheel is fixed to its native utility window rather than a responsive website; its geometry is clamped to the active display work area. The optional window remains responsive at 1440/768/390. Impeccable detected only the inherited Geist popularity warning; the font remains deliberately consistent. UI/UX Pro Max lookups informed drag alternatives and focus/feedback, without overriding the reference palette.
