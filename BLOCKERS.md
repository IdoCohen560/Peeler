# External validation and release needs

No blocker prevents local development. The original reference utility binary is unnecessary for this independent implementation.

macOS/Linux runtime and packaging checks must run on their platforms or in CI; they were not executed from this Windows machine. Native global drag payload access, especially under Wayland, requires platform experiments. Signed public releases need signing infrastructure and dependency/license review. These do not block the current foundation.
