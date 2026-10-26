# Repository contents

Repository: https://github.com/IdoCohen560/Peeler

The Git repository contains Peeler's complete source project: desktop host, conversion engines/adapters, renderer, logo masters/icons, fonts and their licenses, test fixtures, architecture/product documentation, dependency lockfile, packaging configuration, local engine setup scripts and cross-platform CI workflow. Historical prototypes remain in `archive/` with neutral filenames and explicit retired status.

Commit author and committer identity is `IdoCohen560`, using GitHub's account-linked no-reply email. Third-party component/license notices remain intact. Local credential stores, Git internals and private history backups are not project source and must never be published.

The owner selected all project files in Git and large built applications as Release downloads. Generated directories have separate roles:

The complete Windows app/resources ZIP and SHA256SUMS.txt are published in [the development release](https://github.com/IdoCohen560/Peeler/releases/tag/v0.2.0-dev.1). The source tree contains every tracked project file, including assets, tests and historical prototypes; installed dependencies and engine downloads remain reproducible from the lockfile/setup scripts.

| Directory | Purpose |
| --- | --- |
| `node_modules/` | Installed dependencies; reconstruct with `npm ci`. |
| `tools/` | Downloaded/extracted native engines; reconstruct with the pinned setup scripts. |
| `dist/` | Generated Windows app/resources and other host builds. Large downloadable builds are distributed separately from source Git history. |
| `.tmp/`, `test-results/`, `playwright-report/` | Temporary conversion/audit data, test profiles and local diagnostics. |
| `research/`, `.taste-skill/inspect/` | Local research/screenshot working material. |

Ordinary GitHub files cannot exceed 100 MiB. Large builds need Release assets or an explicitly selected large-file storage workflow. The complete public-source inventory is verifiable using `git ls-files`; dependency/source provenance and current development limits are described in OFFICE_ENGINE.md and RELEASE_READINESS.md.
