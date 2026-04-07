# DevSync Hub

A comprehensive developer productivity and project management platform built with modern web technologies.

## Overview

DevSync Hub is a full-featured application designed to help developers manage their projects, track goals, organize tasks, and maintain their professional development. It provides a centralized dashboard for all development activities, from project planning to skill tracking and job applications.

## Features

### 🏠 Dashboard
- Overview of all projects and activities
- Quick stats and progress indicators
- Recent updates and notifications

### 📋 Projects
- Create and manage development projects
- Track project status and milestones
- Organize project documentation

### 📊 Board
- Kanban-style task management
- Drag-and-drop functionality for task organization
- Visual project workflow management

### 🎯 Goals
- Set and track personal and professional goals
- Monitor progress and achievements
- Goal categorization and prioritization

### 🛠️ Skills
- Track technical skills and competencies
- Skill level assessment and progress tracking
- Learning path management

### 💼 Jobs
- Job application tracking
- Interview scheduling and follow-ups
- Application status management

### 📅 Calendar
- Integrated calendar for scheduling
- Event management and reminders
- Timeline view of projects and deadlines

### ⚙️ Settings
- Application preferences
- Theme customization
- User profile management

## Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts
- **Drag & Drop**: @hello-pangea/dnd
- **Date Handling**: date-fns
- **Theming**: next-themes

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm, yarn, or bun package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/sairaja-pyse/devsync-hub.git
cd devsync-hub
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
bun install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
# or
bun dev
```

The application will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

### Testing

```bash
npm run test
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── ...             # Custom components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── ...
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is private and proprietary.

## Contact

For questions or support, please contact the development team.
