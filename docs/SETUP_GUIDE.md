# MyFlow - Setup Guide

This guide will help you set up the MyFlow development environment on Windows.

## Prerequisites

### 1. Node.js and npm

Download and install Node.js 18+ from [nodejs.org](https://nodejs.org/)

Verify installation:
```bash
node --version
npm --version
```

### 2. Windows Build Tools (Required for better-sqlite3)

The `better-sqlite3` package requires native compilation. You need Visual Studio Build Tools installed.

#### Option A: Visual Studio 2022 (Recommended)

1. Download [Visual Studio 2022 Community](https://visualstudio.microsoft.com/downloads/)
2. During installation, select "Desktop development with C++"
3. This includes:
   - MSVC v143 - VS 2022 C++ x64/x86 build tools
   - Windows 10/11 SDK
   - C++ CMake tools for Windows

#### Option B: Visual Studio Build Tools Only

1. Download [Build Tools for Visual Studio 2022](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)
2. Run the installer
3. Select "Desktop development with C++"
4. Install

#### Option C: windows-build-tools (Legacy)

**Note:** This package is deprecated but may work:

```bash
# Run PowerShell as Administrator
npm install --global windows-build-tools
```

### 3. Git (Optional but Recommended)

Download from [git-scm.com](https://git-scm.com/)

## Installation Steps

### 1. Clone or Download the Project

```bash
git clone <repository-url>
cd myflow
```

Or download and extract the ZIP file.

### 2. Install Dependencies

```bash
npm install
```

**If you encounter errors:**

1. **better-sqlite3 build error**: Ensure Visual Studio Build Tools are installed (see Prerequisites)
2. **Python not found**: Install Python 3.x from [python.org](https://www.python.org/)
3. **Permission errors**: Run PowerShell/Command Prompt as Administrator

### 3. Verify Installation

Check that node_modules folder was created and contains packages.

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
npm run dev
```

This will:
1. Start Vite dev server on http://localhost:5173
2. Launch Electron with the application
3. Open DevTools automatically

### Building for Production

Build the application:

```bash
npm run build
```

This creates optimized production files in the `dist` folder.

### Creating Distributable Package

Create an installer:

```bash
npm run package
```

The installer will be created in the `release` folder.

## Troubleshooting

### Issue: "Cannot find module 'electron'"

**Solution:** Run `npm install` to install dependencies.

### Issue: "gyp ERR! find VS"

**Solution:** Install Visual Studio Build Tools (see Prerequisites section).

### Issue: "Port 5173 is already in use"

**Solution:** 
1. Close any other Vite dev servers
2. Or change the port in `vite.config.ts`

### Issue: Electron window doesn't open

**Solution:**
1. Check the terminal for errors
2. Ensure Vite dev server started successfully
3. Try running `npm run dev:vite` and `npm run dev:electron` separately

### Issue: TypeScript errors in IDE

**Solution:**
1. Ensure dependencies are installed: `npm install`
2. Restart your IDE/editor
3. Run `npm run type-check` to verify

### Issue: Styles not loading

**Solution:**
1. Ensure Tailwind CSS is configured correctly
2. Check that `src/renderer/styles/index.css` is imported in `main.tsx`
3. Clear browser cache and restart dev server

## Development Tips

### Hot Reload

- **Renderer Process**: Changes to React components reload automatically
- **Main Process**: Requires manual restart (Ctrl+C and `npm run dev` again)

### DevTools

Press `Ctrl+Shift+I` (or `Cmd+Option+I` on Mac) to open Chrome DevTools.

### Debugging

1. **Renderer Process**: Use Chrome DevTools (opens automatically in dev mode)
2. **Main Process**: Add `--inspect` flag to electron command in package.json

### Code Quality

Run linting:
```bash
npm run lint
```

Run type checking:
```bash
npm run type-check
```

## Project Structure Overview

```
myflow/
├── src/
│   ├── main/           # Electron main process (Node.js)
│   ├── renderer/       # React app (Browser)
│   └── shared/         # Shared types and utilities
├── public/             # Static assets
├── dist/               # Build output
└── release/            # Packaged installers
```

## Next Steps

After successful setup:

1. Explore the codebase structure
2. Read [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
3. Start implementing features
4. Run tests (when available)

## Getting Help

- Check existing issues on GitHub
- Review the [TECHNICAL_ARCHITECTURE.md](TECHNICAL_ARCHITECTURE.md)
- Consult Electron and React documentation

## Common Commands Reference

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Build for production
npm run build

# Create installer
npm run package

# Lint code
npm run lint

# Type check
npm run type-check
```

## System Requirements

- **OS**: Windows 10/11 (primary), macOS and Linux (future support)
- **RAM**: 4GB minimum, 8GB recommended
- **Disk Space**: 500MB for development environment
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher

## Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Vite Documentation](https://vitejs.dev/)