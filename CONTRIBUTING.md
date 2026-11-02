# Contributing to Peeler

Thanks for helping improve Peeler. The project is in active development, so platform reports and focused fixes are especially useful.

## Before opening an issue

- Check [current support](docs/CURRENT_SUPPORT.md), the [conversion matrix](docs/CONVERSION_MATRIX.md), and existing [issues](https://github.com/IdoCohen560/Peeler/issues).
- For conversion problems, include the source type, requested output type, Peeler version or commit, operating system, and the exact error or observed result.
- Use synthetic or public sample files. Do not attach private documents, photos, or other sensitive data.

## Development setup

Use Node.js 24 LTS and npm:

```bash
git clone https://github.com/IdoCohen560/Peeler.git
cd Peeler
npm install
npm start
```

Useful checks:

```bash
npm test
npm run test:formats
npm run test:desktop
```

Build and verify desktop packages on their target operating systems. Linux GUI checks need a display or `xvfb-run`. Review [platform constraints](docs/PLATFORM_VERIFICATION.md) before changing native input, tray, or drag behavior.

## Pull requests

- Keep each change focused and describe the user-visible result.
- Include steps to reproduce and the checks you ran.
- Call out any platform you could not verify.
- Update support or setup documentation when behavior or format coverage changes.
- Preserve original files and local-only processing behavior.

By contributing, you agree that your contributions to Peeler's original source are offered under the [MIT License](LICENSE). Third-party components remain under their respective licenses.
