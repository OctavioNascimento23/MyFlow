# MyFlow

A comprehensive productivity desktop application built with Electron, React, and TypeScript.

## Features

MyFlow is designed to boost your productivity with the following modules:

- **Dashboard**: Overview of your productivity metrics and quick access to all features
- **Launcher/Workspace**: Quick access to frequently used applications and URLs
- **Clock & Pomodoro**: Time tracking and Pomodoro timer for focused work sessions
- **Tasks**: Task management with priorities and deadlines
- **Reminders**: Set reminders for important events and tasks
- **Notes**: Quick note-taking with rich text support
- **Automations**: Automate repetitive tasks and workflows
- **Settings**: Customize the application to your preferences

## Tech Stack

- **Desktop Framework**: Electron 28+
- **Frontend**: React 18+ with TypeScript
- **UI Framework**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Database**: SQLite with better-sqlite3
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite
- **Code Quality**: ESLint + Prettier

## Project Structure

```
myflow/
├── src/
│   ├── main/              # Electron main process
│   │   ├── index.ts       # Main entry point
│   │   ├── preload.ts     # Preload script (IPC bridge)
│   │   ├── services/      # Main process services
│   │   ├── ipc/           # IPC handlers
│   │   └── database/      # Database setup
│   │
│   ├── renderer/          # React renderer process
│   │   ├── main.tsx       # React entry point
│   │   ├── App.tsx        # Root component
│   │   ├── components/    # Reusable components
│   │   ├── features/      # Feature modules
│   │   ├── stores/        # Zustand stores
│   │   ├── hooks/         # Custom React hooks
│   │   ├── utils/         # Utility functions
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # Global styles
│   │
│   └── shared/            # Shared between main and renderer
│       └── types/         # Shared TypeScript types
│
├── public/                # Static assets
├── build/                 # Build resources (icons, etc.)
└── docs/                  # Documentation
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Windows 10/11 (primary target platform)
- **Windows Build Tools** (required for better-sqlite3):
  - Option 1: Install Visual Studio 2022 with "Desktop development with C++" workload
  - Option 2: Install Windows Build Tools via npm (run as Administrator):
    ```bash
    npm install --global windows-build-tools
    ```
  - Option 3: Install Visual Studio Build Tools 2022 from [Microsoft](https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022)

**Note:** The `better-sqlite3` package requires native compilation. If you encounter build errors during `npm install`, ensure you have the Windows Build Tools installed.

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd myflow
```

2. Install dependencies:
```bash
npm install
```

### Development

Run the application in development mode with hot reload:

```bash
npm run dev
```

This will:
1. Start the Vite dev server for the React app (port 5173)
2. Launch Electron with the app

### Building

Build the application for production:

```bash
npm run build
```

This will:
1. Compile TypeScript and build the React app
2. Compile the Electron main process

### Packaging

Create a distributable package:

```bash
npm run package
```

This will create installers in the `release` directory.

### Available Scripts

- `npm run dev` - Start development mode
- `npm run build` - Build for production
- `npm run package` - Create distributable package
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint and Prettier configurations
- Use functional components with hooks in React
- Keep components small and focused
- Use Zustand for state management
- Follow the feature-based folder structure

### IPC Communication

The app uses a type-safe IPC bridge defined in `src/main/preload.ts`. All communication between the main and renderer processes should go through the exposed `window.electronAPI`.

Example:
```typescript
// In renderer process
const version = await window.electronAPI.getVersion();
```

### Adding New Features

1. Create a new folder in `src/renderer/features/`
2. Implement components, hooks, and stores within the feature folder
3. Add routes in `src/renderer/App.tsx`
4. Add IPC handlers in `src/main/ipc/` if needed

## Architecture

The application follows a clean architecture with clear separation between:

- **Main Process**: System integration, IPC handlers, database operations
- **Renderer Process**: UI components, state management, user interactions
- **Shared**: Type definitions and utilities used by both processes

For detailed architecture information, see [docs/TECHNICAL_ARCHITECTURE.md](docs/TECHNICAL_ARCHITECTURE.md).

## Contributing

1. Create a feature branch
2. Make your changes
3. Run linting and type checking
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
