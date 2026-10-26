# reference utility App Analysis

## Overview
Based on the information provided, reference utility is a Mac-only offline file converter that works exclusively on Apple Silicon Macs running macOS 13+. The site mentions no Windows or Linux build, and any attempts to download platform-specific binaries were guesses that resulted in 0-byte files.

## Public Features (from website)
- Convert images, video, audio, PDF, documents, slides, spreadsheets, EPUB, subtitles, archives
- Offline functionality
- Drag-and-drop interface

## Toolchain Status
- REA repository is available at C:\Users\Owner\rea - Node.js project 
- GHIDRA repository is available at C:\Users\Owner\ghidra - Java-based reverse engineering tool
- Java 25 is installed on the system, but Ghidra cannot be built without building it locally first
- No actual reference utility binary to analyze (since downloads are 0-byte files)

## Analysis Plan
1. Document the toolchain and current state
2. Create an architecture and API specification for a cross-platform converter  
3. Build a prototype that demonstrates core functionality using open source tools
4. Validate that our approach can work on all platforms