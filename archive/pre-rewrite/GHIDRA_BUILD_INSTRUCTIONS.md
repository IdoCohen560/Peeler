# Building Ghidra Locally

## Overview

While Ghidra is available at C:\Users\Owner\ghidra, it's a source clone that requires building before use. This document outlines the steps to build Ghidra locally using the provided JDK 25.

## Prerequisites

- Java Development Kit (JDK) 25 installed (already present in C:\Program Files\Microsoft\jdk-25.0.4.101-hotspot)
- Git client
- Gradle build system
- At least 4GB RAM for the build process
- Approximately 1GB disk space for build artifacts

## Building Ghidra

### 1. Set Up Environment

Ensure JDK 25 is in your PATH:
```
set JAVA_HOME=C:\Program Files\Microsoft\jdk-25.0.4.101-hotspot
set PATH=%JAVA_HOME%\bin;%PATH%
```

### 2. Navigate to Ghidra Directory

```
cd C:\Users\Owner\ghidra
```

### 3. Build Ghidra

Ghidra uses Gradle for building:
```
.\gradlew.bat build
```

or on Unix-like systems:
```
./gradlew build
```

### 4. Create Local Installation (Optional)

To create a runnable installation:
```
.\gradlew.bat installDist
```

## Notes About This Project

Since we have Java 25 available but can't install additional software or require admin rights, the following approach would be suitable:

1. Build Ghidra in-place within this project directory to avoid system-wide installations
2. Create a local tools directory for the build:
   ```
   mkdir .\tools\ghidra
   ```
3. Copy necessary components and build there instead of the main ghidra directory

## Toolchain Integration with reference utility Project

Once built, Ghidra can be used for:
- Importing actual reference utility binary files (once they become available)
- Analyzing native code
- Extracting symbols and building decompilation databases
- Capturing platform-specific behavior as outlined in the project plan

## Troubleshooting

If you encounter build issues, consider:
1. Ensuring your system has enough memory (Gradle builds can be memory-intensive)
2. Checking for network connectivity (dependencies need to be downloaded)
3. Confirming that Gradle can use the proper JDK 25 installation
4. Verifying that all environment variables are properly set

## Future Work

When reference utility binaries become available, you'll be able to:
1. Import them into Ghidra for analysis
2. Run automated scripts against the binaries
3. Generate cross-platform reports using the REA framework
4. Iterate on the API design based on actual binary behavior