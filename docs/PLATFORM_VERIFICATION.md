# Exit behavior and cross-platform verification

## Background lifecycle

Peeler is intended to be forgettable while idle, not impossible to close. Closing the optional converter window destroys that window and keeps the tray/menu-bar host running. It does not respawn the window.

There are three explicit exits:

- Tray/menu-bar menu: **Quit Peeler**. On Windows the tray icon can be hidden behind the overflow arrow near the clock.
- Optional converter window: the visible **Quit Peeler** button stops the entire app.
- Command line: `peeler.exe --quit` asks the existing instance to exit. It exits immediately if no instance is running. `peeler.exe --window` opens the optional window when the tray is hard to find.

Quitting requests cancellation of an active conversion, waits for worker cleanup, stops the native input hook, destroys the tray, and exits. Original files are never deliberately rewritten. No automatic launch-on-login, persistent service, scheduled task, or app restart has been installed.

Tests use isolated user-data profiles, so a running personal copy does not silently capture test launches through the single-instance lock or share browser caches.

## What Windows-only access can establish

Local tests cover format decoding/encoding, source preservation, cancellation, gesture state-machine mappings for each OS, DOM/preload/IPC behavior, and the Windows executable. These tests cannot establish macOS Accessibility behavior, native X11 dragging, or compositor/desktop integration on hardware that was not exercised.

The GitHub Actions workflow now defines four hosted environments: Windows x64, Ubuntu X11 x64, Intel macOS, and Apple silicon macOS. Each runs the core tests, development UI tests, a native-host build, and tests of that packaged app. The lifecycle tests cover window closing, explicit quit, and the CLI quit request. The physical Windows hook/drop callback test is Windows-only; ordinary CI UI tests disable native input capture to avoid permission or shared-desktop interference.

No Git remote is currently configured, so these jobs have not been submitted or passed remotely. A workflow file is a verification plan until real run results exist. Windows cannot certify the other platforms just because the same source compiles.

## Manual release checks

| Platform | Required native checks | Current status |
| --- | --- | --- |
| Windows | Actual Explorer drag; drop/release then browse; Left Shift/Left Alt; tray visibility on light/dark themes; visible/CLI quit; mixed selections; display scaling | Automated local checks available; physical Explorer drag still needs validation |
| macOS Intel and Apple silicon | Install/launch; Accessibility denial and grant; Finder drag; Left Shift/Command; menu-bar visibility; quitting; high-DPI/multiple displays; signed/notarized distribution | Unverified; hosted build/UI tests configured |
| Linux X11 | File-manager drag; Left Shift/Left Alt; tray integration in the target desktop; X11 window focus; cancellation; native library loading | Unverified; Ubuntu/Xvfb build/UI tests configured |
| Linux Wayland | Picker/quit fallback; tray visibility; investigate supported compositor/portal workflow for native drag gestures | Global drag capture is not supported; do not advertise parity |

On every platform, use real fixtures from all ten categories and verify contents, not just filenames. Test read-only folders, non-ASCII paths, missing/invalid formats, existing output names, cancellation during media encoding, and quitting with an active batch. Verify output fidelity notes against results. An external tester or native machine/VM should record OS/architecture, app version, actions, expected/actual results, and logs/screenshots for failures.

macOS runners help test macOS builds, but interactive permission and Finder behavior still need a real macOS desktop session. Linux desktop environments differ, and Xvfb is a test display rather than proof of every desktop/compositor. No claim of completed cross-platform support should precede those results.
