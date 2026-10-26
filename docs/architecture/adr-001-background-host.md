# ADR-001: Background host, native drag adapter, disposable conversion workers

## Status

Accepted for the development build, based on the user's explicit background-first workflow requirement.

## Context

The reference product works at the pointer during an OS file drag. A large converter window alone does not satisfy that behavior. Ten conversion categories also need different parsers/codecs and must not block input handling. One desktop repository owns this app; no cloud service or multi-repository split is warranted.

## Decision

Keep a single Electron main process as the tray/menu-bar host. Do not create a window at normal startup. Create the radial overlay lazily on a drag gesture. Create the larger file picker/history window only from the tray or explicit `--window` mode; closing it destroys the window without quitting the background host.

Use a native input hook to recognize only the required drag/modifier state transitions: Left Shift converts; Left Alt selects tools on Windows/Linux; Command selects tools on macOS. The hook does not read drag payloads. Actual files enter through Electron's native drop-to-File mechanism, pass through the narrow preload bridge, and are revalidated by the shared converter. On Windows, a bounded read-only Explorer selection query can refine the menu before drop. When source selection cannot be read, actual drop data determines the usable choices; a second selection may be necessary.

Each conversion gets a disposable Node process with cancellation, a deadline, bounded diagnostics, and parent-owned temporary-output cleanup. FFmpeg runs with explicit stream maps, muxers, and no shell. The original converters remain shared by background and optional-window workflows.

## Consequences

### Positive

- Normal startup has no converter window, overlay renderer, conversion worker, polling timer, or file scan.
- A codec/parser crash is isolated from the tray/UI process.
- Both interfaces use the same capability checks, path validation, exclusive output naming, and tests.
- Accessibility and unsupported-platform fallback remain available through the tray picker.

### Negative

- Electron still has a larger baseline than a small native application; memory/idle CPU must be measured before making efficiency claims.
- Native input permissions and drag behavior vary by OS. X11 support is not Wayland support.
- A Windows Explorer selection hint is not universal access to drag contents. Desktop, third-party file managers, and other source apps can require drop-then-select fallback.
- The wheel is cached hidden after first use; renderer memory can remain allocated. The optional converter window is destroyed when closed.

### Risks

Native global hook startup and actual Explorer OLE drag behavior need physical/manual validation. Integration tests start the native hook and exercise its registered callbacks with synthesized hook events, then pass real local File objects through the preload/IPC conversion path. They do not prove an actual Explorer drag session.

Wayland capture is explicitly disabled rather than falsely advertised. macOS requires Accessibility permission and separate real-machine checks. Worker heap limits do not constrain all native allocations, and native parsers are not sandboxed at the OS level.

## Interaction amendment: drop, release, then choose

The user requested a persistent post-drop choice instead of holding the mouse while browsing. All accepted drops now stage files only. The overlay becomes focusable, exposes Formats/Tools controls, and has no post-drop expiry timer. Only an explicit apply click/key activation converts. Cancel/Escape clears the paths. Native mouse release cannot dismiss a staged selection. File conversion validation/publication remain in the shared engine.
