---
name: capacitor-vite-nextjs-backend
description: Setup and patterns for a Vite + React frontend with Capacitor and Ionic React, plus a separate Next.js backend in a monorepo. Use when creating or modifying a Capacitor mobile app with a Vite frontend and Next.js API, or when adding Capacitor to an existing Vite app with a Next.js backend.
---

# Capacitor + Vite Frontend + Next.js Backend

## Purpose

This skill provides a comprehensive guide for setting up a Vite + React frontend with Capacitor for native mobile support and Ionic React for UI components, paired with a separate Next.js backend API. This architecture separates concerns: the frontend is a pure SPA built with Vite, and the backend is a Next.js API server.

## When to Use

Use this skill when:
- Setting up a new Capacitor mobile app with Vite + React frontend and Next.js backend
- Adding Capacitor to an existing Vite + React app that calls a Next.js API
- Configuring API base URLs for Capacitor apps (critical: native apps can't use localhost)
- Understanding the monorepo structure for frontend/backend separation
- Troubleshooting Capacitor build or sync issues with Vite

## Architecture Overview

### Monorepo Structure

```
your-project/
├── frontend/              # Vite + React + Capacitor + Ionic
│   ├── src/
│   │   ├── main.tsx       # Entry point with Ionic setup
│   │   ├── App.tsx        # Root component with routing
│   │   ├── lib/
│   │   │   └── apiConfig.ts  # API base URL configuration
│   │   └── ...
│   ├── capacitor.config.ts
│   ├── vite.config.mts
│   ├── package.json
│   └── index.html
├── backend/               # Next.js API
│   ├── src/
│   │   └── app/
│   │       └── api/       # API routes
│   └── package.json
└── package.json           # Optional root package.json
```

### Key Concepts

- **Vite Frontend**: Pure SPA that builds to static `dist/` directory
- **Capacitor Integration**: Wraps the static Vite build (`frontend/dist`) into native iOS/Android apps
- **Next.js Backend**: Separate API server (runs on port 3000, frontend on 3001)
- **API Configuration**: Critical distinction - native apps must use deployed backend URL, not localhost
- **Ionic React**: Mobile-optimized UI components that work on web and native

## Core Setup Instructions

### Step 1: Create Vite Frontend

```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
```

### Step 2: Install Capacitor and Ionic Dependencies

```bash
# Capacitor Core
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# Ionic React
npm install @ionic/react ionicons

# Optional but recommended
npm install @capacitor/preferences
```

### Step 3: Initialize Capacitor

```bash
npx cap init
```

When prompted:
- **App name**: YourAppName
- **App ID**: com.yourcompany.yourapp (use reverse domain notation)
- **Web dir**: `dist` (Vite outputs to `dist/` by default)

This creates `capacitor.config.ts` in the `frontend/` directory.

### Step 4: Configure Capacitor

Update `frontend/capacitor.config.ts`:

```typescript
import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.yourcompany.yourapp",
  appName: "YourAppName",
  webDir: "dist",
  bundledWebRuntime: false,
};

export default config;
```

**Important**: `webDir` must be `"dist"` to match Vite's output directory. `bundledWebRuntime: false` is recommended for better performance.

### Step 5: Configure Vite

Update `frontend/vite.config.mts`:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allows access from network (useful for testing on devices)
  },
});
```

No special Capacitor-specific configuration needed - Vite always produces static assets.

### Step 6: Create HTML Entry Point

Create `frontend/index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Your App Name</title>
    <base href="/" />
    <meta name="color-scheme" content="light dark" />
    <meta
      name="viewport"
      content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <meta name="format-detection" content="telephone=no" />
    <meta name="msapplication-tap-highlight" content="no" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**Key viewport settings**: `viewport-fit=cover` ensures content extends under notches/safe areas on mobile devices.

### Step 7: Create Main Entry Point with Ionic Setup

Create `frontend/src/main.tsx`:

```typescript
import React from 'react';
import { createRoot } from 'react-dom/client';
import { setupIonicReact } from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import App from './App';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

// Optional: Platform detection for logging/config
const platform = Capacitor.isNativePlatform() ? 'native' : 'web';
const platformName = Capacitor.getPlatform();
console.log('Platform:', platform, platformName);

const container = document.getElementById('root');
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

**Critical**: `setupIonicReact()` must be called before rendering any Ionic components.

### Step 8: Create App Component with Routing

Create `frontend/src/App.tsx`:

```typescript
import { IonApp } from '@ionic/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Settings from './pages/Settings';

const App: React.FC = () => {
  return (
    <IonApp style={{
      margin: 0,
      padding: 0,
      height: '100vh',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path="/home" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
    </IonApp>
  );
};

export default App;
```

**Key points**:
- Wrap entire app in `<IonApp>` (required for Ionic components)
- Use `react-router-dom` for client-side routing (not file-based like Next.js)
- All routes defined in one place

### Step 9: Create API Configuration (Critical)

Create `frontend/src/lib/apiConfig.ts`:

```typescript
import { Capacitor } from "@capacitor/core";

const DEFAULT_DEV = "http://localhost:3000";
const DEFAULT_PROD = "https://your-api.com";

/**
 * Get the API base URL for making API calls.
 * 
 * CRITICAL: In Capacitor native apps (iOS/Android), always use deployed backend.
 * Localhost on device is the device itself, not your development machine.
 */
export function getApiBaseUrl(): string {
  const fromEnv = import.meta.env.VITE_API_URL;

  // Environment variable override (highest priority)
  if (fromEnv && typeof fromEnv === "string") {
    return fromEnv.replace(/\/$/, "");
  }

  // Native platform: always use production/deployed URL
  if (Capacitor.isNativePlatform()) {
    const prodUrl = import.meta.env.VITE_PROD_API_URL ?? DEFAULT_PROD;
    return (typeof prodUrl === "string" ? prodUrl : DEFAULT_PROD).replace(/\/$/, "");
  }

  // Web platform: use localhost in dev, production in prod
  const apiUrl = import.meta.env.DEV ? DEFAULT_DEV : DEFAULT_PROD;
  return apiUrl;
}

/**
 * Get the full API URL for a given endpoint.
 */
export function getApiUrl(endpoint: string): string {
  const base = getApiBaseUrl();
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  return `${base}${path}`;
}
```

**Critical rule**: Native apps (iOS/Android) **must** use a deployed backend URL. Localhost on a device refers to the device itself, not your development machine.

### Step 10: Configure TypeScript

Update `frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Key differences from Next.js**: Uses `jsx: "react-jsx"` (not `"preserve"`), no Next.js TypeScript plugin, `moduleResolution: "bundler"` for Vite.

### Step 11: Update Package Scripts

Update `frontend/package.json` scripts:

```json
{
  "scripts": {
    "dev": "vite --port 3001",
    "build": "vite build",
    "preview": "vite preview",
    "cap:sync": "npm run build && npx cap sync",
    "cap:open:ios": "npx cap open ios",
    "cap:open:android": "npx cap open android",
    "cap:run:ios": "npx cap run ios"
  }
}
```

**Important**: `cap:sync` runs `npm run build` first to ensure `dist/` exists before syncing to native platforms.

### Step 12: Add Native Platforms

```bash
# iOS
npx cap add ios
npx cap sync

# Android
npx cap add android
npx cap sync
```

All Capacitor commands run from the `frontend/` directory.

## Environment Variables

Create `frontend/.env` files:

**`.env.development`**:
```
VITE_API_URL=http://localhost:3000
VITE_PROD_API_URL=https://your-api.com
```

**`.env.production`**:
```
VITE_API_URL=https://your-api.com
VITE_PROD_API_URL=https://your-api.com
```

**Important**: Use `VITE_` prefix for all environment variables that should be accessible in the frontend code. Variables without this prefix are not exposed to the client.

## Backend Setup (Next.js)

The backend is a standard Next.js API. Key points:

1. **CORS Configuration**: Backend must allow requests from:
   - `http://localhost:3001` (web dev)
   - Capacitor's origin (varies by platform)
   - Your production frontend domain

2. **API Routes**: Create routes in `backend/src/app/api/`:

```typescript
// backend/src/app/api/example/route.ts
export async function GET() {
  return Response.json({ message: 'Hello from Next.js API' });
}
```

3. **Port**: Backend typically runs on port 3000, frontend on 3001.

## Optional Enhancements

### Theme Variables

Create `frontend/src/theme/variables.css`:

```css
:root {
  --ion-color-primary: #3880ff;
  --ion-color-primary-rgb: 56, 128, 255;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-shade: #3171e0;
  --ion-color-primary-tint: #4c8dff;
}

@media (prefers-color-scheme: dark) {
  :root {
    --ion-color-primary: #428cff;
    /* ... other dark mode variables ... */
  }
}
```

### Tab Bar Navigation

Example tab bar that only shows on certain routes:

```typescript
import { IonTabBar, IonTabButton, IonIcon, IonLabel } from '@ionic/react';
import { useLocation, useNavigate } from 'react-router-dom';
import { home, settings } from 'ionicons/icons';

const TabBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAppRoute = location.pathname.startsWith('/app');

  if (!isAppRoute) {
    return null;
  }

  return (
    <IonTabBar style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      zIndex: 1000
    }}>
      <IonTabButton onClick={() => navigate('/app/home')}>
        <IonIcon icon={home} />
        <IonLabel>Home</IonLabel>
      </IonTabButton>
      <IonTabButton onClick={() => navigate('/app/settings')}>
        <IonIcon icon={settings} />
        <IonLabel>Settings</IonLabel>
      </IonTabButton>
    </IonTabBar>
  );
};
```

### Optional Capacitor Plugins

```bash
npm install @capacitor/splash-screen @capacitor/status-bar @capacitor/app
```

These are optional - the minimal setup works without them.

## Development Workflow

### Running Development Server

```bash
# Frontend (from frontend/)
npm run dev
# Runs on http://localhost:3001

# Backend (from backend/)
npm run dev
# Runs on http://localhost:3000
```

### Building for Capacitor

```bash
# Build and sync to both platforms
npm run cap:sync

# Build and sync to iOS only
npm run build && npx cap sync ios

# Build and sync to Android only
npm run build && npx cap sync android
```

**Important**: Always run `npm run build` before `cap sync` to ensure `dist/` is up to date.

### Opening Native Projects

```bash
# Open iOS project in Xcode
npm run cap:open:ios

# Open Android project in Android Studio
npm run cap:open:android
```

### Testing on Devices

1. **iOS**: Connect device, select it in Xcode, click Run
2. **Android**: Connect device, enable USB debugging, click Run in Android Studio

**Note**: For API testing on devices, ensure your backend is deployed and accessible (not localhost).

## Common Patterns

### Platform Detection

```typescript
import { Capacitor } from '@capacitor/core';

if (Capacitor.isNativePlatform()) {
  // Native iOS/Android code
} else {
  // Web code
}

const platform = Capacitor.getPlatform(); // "ios", "android", or "web"
```

### API Client Usage

```typescript
import { getApiUrl } from './lib/apiConfig';

async function fetchData() {
  const response = await fetch(getApiUrl('/api/data'));
  return response.json();
}
```

### Client Components

All components using Capacitor APIs or Ionic components should be client components (no SSR concerns with Vite, but good practice):

```typescript
import { Capacitor } from '@capacitor/core';

export default function MyComponent() {
  // Can use Capacitor APIs directly
  const platform = Capacitor.getPlatform();
  return <div>Platform: {platform}</div>;
}
```

## Troubleshooting

### Build Errors

**Issue**: `dist/` directory not found during `cap sync`
- **Solution**: Run `npm run build` first, then `cap sync`

**Issue**: API calls failing on device
- **Solution**: Ensure `getApiBaseUrl()` uses production URL for native platforms. Check that backend CORS allows Capacitor origins.

### Capacitor Sync Issues

**Issue**: Changes not appearing in native app
- **Solution**: 
  1. Run `npm run build` to rebuild frontend
  2. Run `npx cap sync` to copy files to native projects
  3. Rebuild native app in Xcode/Android Studio

**Issue**: Native dependencies not updating
- **Solution**: 
  1. Delete `ios/Pods` and `android/.gradle`
  2. Run `npx cap sync` again

### API Configuration Issues

**Issue**: API calls work on web but fail on device
- **Solution**: This is almost always because the device is trying to use localhost. Ensure `getApiBaseUrl()` returns production URL when `Capacitor.isNativePlatform()` is true.

**Issue**: CORS errors
- **Solution**: Backend must allow requests from:
  - `http://localhost:3001` (web dev)
  - `capacitor://localhost` (iOS)
  - `http://localhost` (Android)
  - Your production frontend domain

## Differences from Next.js + Capacitor

This architecture differs from the `nextjs-capacitor` skill:

| Aspect | Next.js Frontend | Vite Frontend |
|--------|------------------|---------------|
| **Framework** | Next.js (App Router) | Vite + React |
| **Build** | Conditional static export (`CAPACITOR_BUILD=true`) | Always static (`vite build`) |
| **Routing** | File-based (app/page.tsx) | react-router-dom (Routes/Route) |
| **Entry** | layout.tsx → IonicApp.tsx | index.html → main.tsx → App.tsx |
| **Config** | next.config.js (webpack, conditional) | vite.config.mts (simple) |
| **Backend** | Optional monorepo sibling | Separate Next.js API server |
| **API URL** | process.env.NEXT_PUBLIC_* | import.meta.env.VITE_* |

## Additional Resources

- [Vite Documentation](https://vitejs.dev/)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Ionic React Documentation](https://ionicframework.com/docs/react)
- [React Router Documentation](https://reactrouter.com/)
