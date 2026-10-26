# Local conversion engines

Windows development engines live entirely under `C:\Users\Owner\Peeler\tools`. Setup downloads official packages through Windows Package Manager, verifies pinned SHA-256 hashes, and extracts files without running a system installer. Neither engine starts at normal Peeler launch.

## Windows setup

After `npm ci`, run:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/setup-office.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/setup-media.ps1
npm run test:fixtures
```

The pinned engines are LibreOffice 26.8.1.1 (MSI SHA-256 `c6298b10cfa1748bcbedad94c62ce771e240e5021bfd6d7a967cd571b04b5312`) and Gyan FFmpeg 9.0.2 (ZIP SHA-256 `759d0a9831c436a0eb331ad36f236c06cb04aaa0005da46571f0e9d3d9206f6b`). The Office setup reads MSI file/directory tables through Windows Installer's read-only database API; 7-Zip extracts the cabinet. MSI actions and system registration are not executed. Packages and extracted development files stay under `tools/`, which is excluded from Git.

`npm run pack` includes provisioned Office files and FFmpeg, its license, and build README under `dist/win-unpacked/resources`. The build does not need the development `tools` folder at runtime. The Office suite adds substantial disk/download size; only conversion jobs start it, so it adds no resident Office process at idle. Unused ffprobe is retained in the development download but excluded from the app package.

## Resolution and other platforms

Office resolution checks an explicit `PEELER_OFFICE_PATH`, packaged resources, project-managed files, then standard installed locations. `PEELER_OFFICE_PATH=disabled` explicitly exercises the fallback. On macOS the expected entry point is `LibreOffice.app/Contents/MacOS/soffice`; on Linux it is `/usr/bin/libreoffice` or `/usr/bin/soffice`. Provisioning and packaged Office distribution on these systems are not yet verified locally. CI now requests LibreOffice from each runner's package manager; those remote jobs have not run.

Media resolution checks `PEELER_FFMPEG_PATH`, packaged resources, and project-managed files before the npm `ffmpeg-static` fallback. The fallback still reports 6.1.1 on this machine and must not be mistaken for the new Windows bundle. A maintained macOS/Linux media binary supply chain remains a release gate.

## Runtime behavior and limits

Office jobs copy inputs into a short, unique managed workspace with a private user profile and separate output folder. Macros and active OLE/DDE content are disabled in that profile. OOXML packages are checked for expansion limits, VBA, and linked external resources before import; RTF fields/objects/binary payloads are rejected. This is defense in depth, not an OS sandbox or proof that all parser/network behavior has been contained. Hostile-file and network-observation testing remain required.

Cancellation stops the Office process tree. The parent owns workspace cleanup, and startup recovers marked workspaces whose owner process no longer exists. Active process leases, unmarked folders, symlinks, and invalid markers are retained. Sources and unrelated files are never recovery targets. This also avoids the Windows profile path-length failure found when work was nested under long output directories.

Office provides PDF rendering for DOCX/RTF, PPT/PPTX, and XLS/XLSX/ODS; PDF pages then become ZIP-contained PNG/JPG images. Legacy XLS is imported through XLSX before value exports. Fonts may be substituted, layout can differ from Microsoft Office, and macros/animations are not preserved. Ordinary document/EPUB exports remain text-oriented. Workbook exports through Peeler remain values-oriented; direct LibreOffice exports can represent logical cells numerically. These distinctions are exposed in the file notes.

HEIC decoding uses heic-decode/libheif-js WebAssembly; only the first decoded 8-bit image is exported, with no HDR/depth/sequence preservation or HEIC encoding. RAR reading uses libarchive-wasm, which reports libarchive 3.7.7; its binary version/security/source provenance needs a release review independently of npm audit.

## Primary references and redistribution

- [LibreOffice CLI and private profile parameter](https://help.libreoffice.org/latest/en-US/text/shared/guide/start_parameters.html), [conversion filters](https://help.libreoffice.org/latest/en-US/text/shared/guide/convertfilters.html), and [licenses](https://www.libreoffice.org/about-us/licenses/).
- [Gyan's FFmpeg builds](https://www.gyan.dev/ffmpeg/builds/) and the package's bundled README: exact version, source revision `946fcce07b`, build configuration, external libraries, and GPLv3 license.
- [libheif-js](https://github.com/catdad-experiments/libheif-js), [heic-decode](https://github.com/catdad-experiments/heic-decode), and [libarchive-wasm](https://github.com/ofk/libarchive-wasm).

Retaining license files does not itself fulfill all corresponding-source obligations. Public distribution requires completing the dependency/source review in RELEASE_READINESS.md.
