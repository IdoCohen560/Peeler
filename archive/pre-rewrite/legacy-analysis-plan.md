# Reverse Engineering Plan – reference utility App

## 1. Overview
The reference utility App is a cross‑platform desktop application (macOS, Windows, Linux).  The goal is to reverse engineer the binary and expose a clean, maintainable architecture that works uniformly on all three platforms.  We will leverage the **Ghidra** (native binary analysis) and **REA** (workflow & analysis framework) repositories we already cloned.

## 2. Objectives
1. **Identify the executable binaries** for mac, win and linux.
2. **Reverse engineer native code** with Ghidra – analyze the binary, extract symbols, build a decompilation database.
3. **Capture platform‑specific behavior** with REA – run automated analysis scripts, gather metrics, and generate a cross‑platform report.
4. **Architect a unified API** that abstracts platform differences.
5. **Iterate & validate**: build a minimal working example on each OS.

## 3. Milestones
| Milestone | Deliverable | Owner | Due |
|---|---|---|---|
| 1.1 | Import binary into Ghidra | me | 2026‑10‑23 |
| 2 | Run REA analysis scripts, export results | me | 2026‑10‑26 |
| 3 | Draft cross‑platform API & build prototype | me | 2026‑10‑30 |
| 4 | Validation on win/mac/linux | me | 2026‑11‑02 |

## 4. Toolchain
* **Ghidra** – native binary reverse engineering.
* **REA** – automated workflow, analysis & reporting.
* **Node.js** (for REA scripts) – ensure it’s available on all OSes.

## 5. Next Actions
- [x] Verify Ghidra environment on Windows.
- [ ] Configure REA workspace.
- [ ] Document the binary paths for each platform.
- [ ] Fetch reference utility binary from reference utilityformac.com.
- [ ] Import binary into Ghidra.

---

*Author:* <you>
*Last updated:* 2026‑10‑22
