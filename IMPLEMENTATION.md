# Implementation entry points

- src/core/converter.cjs: real image/subtitle conversion, capability lookup, source preservation, unique outputs.
- src/core/subtitles.cjs: bounded timed-cue parser and serializers.
- src/desktop/main.cjs and preload.cjs: isolated desktop boundary and sequential batch jobs.
- src/renderer/: original interface and local fonts.
- src/cli.cjs: CLI conversion.
- tests/: real output decoding, failure/concurrency safety, metadata, and Electron workflow checks.

Run npm start for the UI, npm test for core checks, and npm run test:desktop for the desktop smoke test. See docs/ARCHITECTURE.md for limitations. Markdown files are documentation, not executables.
