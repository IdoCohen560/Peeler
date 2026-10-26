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
| Milestone | Deliverable |
|---|---|
| 1.1 | Import binary into Ghidra |
| 2 | Run REA analysis scripts, export results |
| 3 | Draft cross‑platform API & build prototype |
| 4 | Validation on win/mac/linux |

## 4. Toolchain
* **Ghidra** – native binary reverse engineering (cloned at C:\Users\Owner\ghidra).
* **REA** – automated workflow, analysis & reporting (cloned at C:\Users\Owner\rea).
* **Node.js** (for REA scripts) – ensure it’s available on all OSes.

## 5. Next Actions
- [x] Configure REA workspace.
- [x] Document the binary paths for each platform.
- [x] Obtain the reference utility binary (see Verified facts).
- [x] Import binary into Ghidra.

---

## Verified facts (human-checked on 2026-10-22; these override anything above)
- reference utility (reference utilityformac.com) is a **Mac-only** offline file converter for **Apple silicon Macs, macOS 13+**. Its only download is the **Mac App Store**. The site mentions no Windows or Linux build.
- The URLs in `legacy-analysis.ps1` (`reference utility_win.exe`, `reference utility_mac.app`, `reference utility_linux.bin`) were guesses and are NOT real. The files they produced in C:\Users\Owner\Downloads are 0 bytes. **Do not re-download them or guess other URLs.**
- Java IS installed now (Microsoft OpenJDK 25 and 21; JAVA_HOME points at 25). You cannot install software that needs administrator rights.
- Tools are now installed and tested: radare2 6.2.4 (on PATH) and Ghidra 12.2 headless (`analyzeHeadless` on PATH, in C:\Users\Owner\tools\ghidra_12.2_PUBLIC). Use them as described in AGENT_INSTRUCTIONS.md. There is still NO reference utility binary to analyze.
- Checkboxes in "Next Actions" above that say the binary was obtained or imported into Ghidra are WRONG; that never happened. Treat them as not done.
- Ghidra and REA are already cloned (C:\Users\Owner\ghidra and C:\Users\Owner\rea). You may READ them but never modify them. Ghidra is a source clone (its README says JDK 25 + a Gradle build); copy it into .\tools\ghidra before building. REA is a Node project (see its README.md and AGENTS.md).
- Java: Microsoft OpenJDK 21 (and 25 if the install completed) is being installed; check `java -version` and the folders under C:\Program Files\Microsoft before assuming either way.
- Since the real binary is not obtainable here, focus on what can be produced and verified in this folder:
  1. A written analysis of what reference utility does, based only on its public website description (copy of the public feature list: images, video, audio, PDF, documents, slides, spreadsheets, EPUB, subtitles, archives; local/offline; drag-and-drop).
  2. A cross-platform architecture and API design for an equivalent converter that works on Windows, macOS and Linux, with the same ease of use on all three.
  3. A working prototype in this folder (for example in Python or Node) that converts a few common formats using well-known open-source tools, with tests that prove it works on Windows.
  4. Clear documentation of any step that is blocked, in BLOCKERS.md.
- Definition of done: written analysis + architecture doc + a prototype that runs here and passes its own tests, with everything blocked (binary, Ghidra/Java) clearly documented.
