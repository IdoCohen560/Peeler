# Cross-platform architecture

The current architecture, security boundaries, output semantics, engine candidates, and native integration constraints are documented in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

Current stack: Electron, Node.js, Sharp, and a bounded subtitle parser. Native global drag interception is future platform-specific work. Windows packaging has a local verification path; macOS/Linux require their own runs.
