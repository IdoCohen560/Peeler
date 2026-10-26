# Peeler identity

Confirmed name: **Peeler**. Windows executable: **peeler.exe**.

Canonical project folder: `C:\Users\Owner\Peeler`.

The mark is a compact pair of black shadow silhouettes: a half-peeled banana and a separate Y-shaped handheld peeler, with negative space distinguishing their contours. It has no lettering, color fills, gradients, or background plate. The PNG master has genuine alpha transparency.

## Assets

- `peeler-logo-master.png`: original generated master, 1254 x 1254, transparent RGBA.
- `peeler-1024.png` through `peeler-16.png`: deterministic size exports.
- `peeler.ico`: multiresolution Windows executable icon.
- `peeler.icns`: macOS icon container.
- `src/renderer/branding/`: app UI and window icon copies.
- `src/desktop/tray.png` and `tray-light.png`: black and reversed-white silhouettes for tray contrast; macOS uses a template icon.

Run `npm run icons` to regenerate format/size exports from the master. The generated artwork is preserved; sizing and icon encoding use Sharp/png2icons. No generation API key is needed to rebuild icons.

## Generation provenance

Created with the built-in image generation tool on 2026-10-26. No third-party logo or reference artwork was used. Generation requested a 1024-square image; the tool returned a 1254-square master, retained intact. Normalized 1024 and application-size exports are provided separately.

Final prompt:

> Use case: logo-brand. Create one professional, exceptionally clean app icon mark for a desktop utility named Peeler. NO TEXT or lettering. Only solid black shadow silhouettes on a genuinely transparent background. Subject: a recognizably half-peeled banana, its curved fruit upright and three broad peel flaps curling downward, paired with a recognizably separate Y-shaped handheld vegetable peeler with an open rectangular blade slot and a short stout handle. Both objects should be clearly distinguishable by their outer contours and generous negative space, with the peeler slightly diagonal beside the banana rather than merging into it. This is an iconic graphic silhouette, not a photograph of objects or physically cast shadows: flat pure black filled shapes, no outlines, no gradients, no gray shading, no texture, no ground plane, no drop shadow, no background shape. Refined geometric/organic balance, simple bold rounded contours, no fine detail. Design for excellent recognition at 32 and 64 pixels, centered balanced compact square composition with about 12 percent clear padding around the mark. High resolution 1024 square transparent PNG master. Exactly one combined mark, no variations sheet, no mockup, no border.
