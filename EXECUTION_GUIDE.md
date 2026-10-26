# Execution guide

From this folder with Node.js 24 and npm installed:

```powershell
npm install
npm start
npm test
npm run test:desktop
npm run pack
```

CLI: `npm run convert -- "C:\path\photo.png" webp`. Output is a real converted file beside the original. Unsupported formats fail.

Do not execute Markdown documents or archived scripts. If Electron launches as Node in a customized terminal, unset ELECTRON_RUN_AS_NODE for that launch. Linux desktop tests need an active display or Xvfb. Cross-platform release packages should be built on their target OS.
