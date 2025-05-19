# jarvis-frontend: React Frontend for Document Management and RAG-based Q&A Application

This component ([GitHub repository](https://github.com/raks07/jarvis-frontend)) provides the user interface for user management, document management, ingestion management, and RAG-based Q&A.

## Features

- User authentication interface
- User management for admins
- Document upload and management
- Ingestion process management
- Q&A interface with RAG-based answers

## Technology Stack

- React: UI library
- TypeScript: Typed JavaScript
- Redux Toolkit: State management
- React Router: Routing
- Material-UI: UI components
- Axios: API client
- React Hook Form: Form handling
- Vite: Build tool
- Jest and React Testing Library: Testing

## Setup

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn
```

2. Configure environment variables:

```bash
cp .env.example .env.local
# Edit .env.local file with your settings
```

### Running the Application

#### Development

```bash
npm run dev
# or
yarn dev
```

#### Production Build

```bash
npm run build
# or
yarn build
```

The development server will be available at <http://localhost:5173>.

## Project Structure

```
react-frontend/
├── public/                 # Static assets
├── src/                    # Source code
│   ├── components/         # Reusable UI components
│   │   ├── common/         # Common UI components
│   │   ├── layout/         # Layout components
│   │   └── ui/             # Basic UI components
│   ├── features/           # Feature-specific components
│   │   ├── auth/           # Authentication features
│   │   ├── users/          # User management features
│   │   ├── documents/      # Document management features
│   │   ├── ingestion/      # Ingestion management features
│   │   └── qa/             # Q&A features
│   ├── services/           # API service integration
│   │   ├── api.ts          # Base API setup
│   │   ├── auth.service.ts # Authentication service
│   │   ├── users.service.ts # User service
│   │   ├── documents.service.ts # Document service
│   │   ├── ingestion.service.ts # Ingestion service
│   │   └── qa.service.ts   # Q&A service
│   ├── store/              # Redux state management
│   │   ├── slices/         # Redux slices
│   │   └── store.ts        # Redux store configuration
│   ├── utils/              # Utility functions
│   │   ├── auth.ts         # Auth utilities
│   │   ├── format.ts       # Formatting utilities
│   │   └── validation.ts   # Validation utilities
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   ├── routes.tsx          # Application routes
│   └── vite-env.d.ts       # Vite type declarations
├── .eslintrc.js            # ESLint configuration
├── .prettierrc             # Prettier configuration
├── index.html              # HTML entry point
├── jest.config.js          # Jest configuration
├── package.json            # Node.js dependencies
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite configuration
├── Dockerfile              # Docker configuration
└── .env.example            # Example environment variables
```

## Development

### Code Quality

```bash
# Lint code
npm run lint
# or
yarn lint

# Format code
npm run format
# or
yarn format
```

### Running Tests

```bash
# Run tests
npm run test
# or
yarn test

# Run tests in watch mode
npm run test:watch
# or
yarn test:watch
```

### Building for Production

```bash
# Build
npm run build
# or
yarn build

# Preview production build
npm run preview
# or
yarn preview
```
