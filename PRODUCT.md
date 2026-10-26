# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

The interface is rendered locally by Electron on Windows, Linux, and macOS. The product is a desktop utility, not a hosted website or a mobile app. Native OS adapters supply drag gestures and the tray/menu bar.

## Users

People converting local files while working in their desktop file manager. The user is developing on Windows and explicitly requires free, open-source support for Windows, Linux, and macOS.

## Product Purpose

Convert files locally without opening a conventional application workflow for each conversion. The full target includes Images, Video, Audio, PDF, Documents, Slides, Spreadsheets, EPUB, Subtitles, and Archives.

## Operating Context

Confirmed by the user: once opened, the app should run minimally in the background. Its primary interface should resemble the reference product's pointer-centered drag conversion menu. The larger conversion window is secondary.

Start a file drag, then tap Left Shift for conversion. Windows/Linux use Left Alt for the tools menu; macOS uses Command. Drop files onto the wheel, release the mouse, then browse formats/tools and explicitly click a choice. Dropping stages files without converting. The menu stays open until a choice or cancellation. Results remain beside the originals.

## Capabilities and Constraints

Conversions run offline. Sources must be preserved. Unsupported routes must not be presented as working. Actual support and fidelity limits are documented in docs/CURRENT_SUPPORT.md; target routes are separately recorded in docs/CONVERSION_MATRIX.md. Native Linux Wayland global capture and macOS permission behavior require separate validation.

## Brand Commitments

The user explicitly requests a workflow and style similar to the reference app. Original implementation and assets are required. The user confirmed the name Peeler and Windows executable peeler.exe. Its logo uses shadow silhouettes of a peeled banana and a distinct handheld peeler.

## Evidence on Hand

Public reference research in docs/RESEARCH.md; engine research in docs/ENGINE_RESEARCH.md; local conversion fixtures and desktop integration tests; packaged Windows development build. No proprietary application binaries were inspected. No macOS/Linux execution evidence has been collected here.

## Product Principles

- Stay out of the user's way until a conversion gesture is requested.
- Keep files and processing local.
- Preserve originals and avoid overwriting existing results.
- State actual conversion fidelity and availability.
- Keep a picker/keyboard alternative for unsupported desktop environments.
