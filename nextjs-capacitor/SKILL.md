---
name: nextjs-capacitor
description: Project-agnostic guide for setting up Next.js with Capacitor for native mobile support and Ionic React for UI components. Includes core setup, optional enhancements, and complete push notifications implementation.
---

# Next.js + Capacitor + Ionic React Setup

## Purpose

This skill provides a comprehensive, project-agnostic guide for setting up a Next.js application with Capacitor for native mobile support and Ionic React for UI components. It covers core setup requirements, optional enhancements, and complete push notification implementation.

## When to Use

Use this skill when:
- Setting up a new Next.js project with Capacitor and Ionic React
- Adding Capacitor to an existing Next.js application
- Configuring push notifications for a Capacitor app
- Troubleshooting Capacitor build or sync issues
- Understanding the conditional static export pattern for Next.js + Capacitor

## Architecture Overview

### Project Structure Options

You can organize your project in two ways:

**Option A: Root-level `src/` directory** (Single app)
```
your-project/
├── src/              # Next.js frontend at root
│   └── app/
├── backend/          # Optional backend (if monorepo)
├── capacitor.config.ts
└── package.json
```
- Capacitor `webDir`: `"dist"`
- Common for single-app projects

**Option B: Separate `frontend/` directory** (Monorepo)
```
your-project/
├── frontend/         # Next.js frontend
│   └── src/
│       └── app/
├── backend/          # Backend API
├── capacitor.config.ts
└── package.json
```
- Capacitor `webDir`: `"frontend/dist"`
- Better for projects with separate frontend/backend

### Key Concepts

- **Conditional Static Export**: Next.js only exports statically when `CAPACITOR_BUILD=true`, allowing normal Next.js development
- **Capacitor Integration**: Capacitor wraps the static Next.js build into native iOS/Android apps
- **Ionic React**: Provides mobile-optimized UI components that work on web and native

## Core Setup Instructions

### Step 1: Create Next.js Project

```bash
npx create-next-app@latest . --typescript --app --tailwind --eslint --src-dir
```

When prompted:
- Choose **TypeScript** (recommended)
- Choose **App Router** (required)
- Choose **Tailwind CSS** (optional but recommended)
- Choose **ESLint** (recommended)

### Step 2: Install Core Dependencies

```bash
# Capacitor Core
npm install @capacitor/core @capacitor/cli @capacitor/android @capacitor/ios

# Ionic React
npm install @ionic/react ionicons

# Optional but recommended Capacitor plugins
npm install @capacitor/splash-screen @capacitor/status-bar @capacitor/app
```

### Step 3: Initialize Capacitor

```bash
npx cap init
```

When prompted:
- **App name**: YourAppName
- **App ID**: com.yourcompany.yourapp (use reverse domain notation)
- **Web dir**: `dist` (for root `src/`) or `frontend/dist` (for monorepo)

This creates `capacitor.config.ts` at the root level.

### Step 4: Configure Capacitor

Update `capacitor.config.ts`:

```typescript
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.yourcompany.yourapp",
  appName: "YourAppName",
  webDir: "dist", // or "frontend/dist" for monorepo
  plugins: {
    SplashScreen: {
      launchAutoHide: false, // Control manually for better UX
    },
    StatusBar: {
      style: "DARK",
      overlaysWebView: false,
      backgroundColor: "#000000",
    },
  },
};

export default config;
```

### Step 5: Configure Next.js

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use static export when building for Capacitor
  ...(process.env.CAPACITOR_BUILD === "true" && {
    output: "export",
    images: {
      unoptimized: true, // Required for static export
    },
    trailingSlash: true,
    distDir: "dist", // Must match Capacitor's webDir
  }),
  transpilePackages: ["@ionic/react", "@ionic/core", "@stencil/core"],
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (config, { isServer }) => {
    // Handle Stencil dynamic imports and Node.js polyfills
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        crypto: false,
        stream: false,
        util: false,
        path: false,
        os: false,
        tls: false,
        net: false,
        dns: false,
        child_process: false,
        http: false,
        https: false,
        zlib: false,
        querystring: false,
        url: false,
        buffer: false,
        timers: false,
        "timers/promises": false,
        diagnostics_channel: false,
      };
    }

    // Ignore dynamic import warnings for Stencil
    config.module = {
      ...config.module,
      unknownContextCritical: false,
      unknownContextRegExp: /^\.\/.*$/,
      unknownContextRequest: ".",
    };

    return config;
  },
};

module.exports = nextConfig;
```

**Important**: The conditional static export allows normal Next.js development while enabling Capacitor builds when needed.

### Step 6: Update TypeScript Config

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": false,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "next-env.d.ts",
    "dist/types/**/*.ts"
  ],
  "exclude": ["node_modules"]
}
```

### Step 7: Create Root Layout

Create `src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/ionic.bundle.css";
import "@ionic/react/css/palettes/dark.css";
import "./globals.css";
import IonicApp from "./IonicApp";

export const metadata: Metadata = {
  title: "YourAppName",
  description: "Your app description",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="viewport-fit=cover, width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no"
        />
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#31d53d" />
      </head>
      <body className="" style={{ overflow: "hidden" }}>
        <IonicApp>{children}</IonicApp>
      </body>
    </html>
  );
}
```

### Step 8: Create Basic IonicApp Component

Create `src/app/IonicApp.tsx`:

```tsx
"use client";

import { IonApp, setupIonicReact } from "@ionic/react";

setupIonicReact();

export default function IonicApp({ children }: { children: React.ReactNode }) {
  return <IonApp>{children}</IonApp>;
}
```

### Step 9: Create Global Styles

Create `src/app/globals.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --ion-color-primary: #31d53d;
  --ion-color-primary-rgb: 49, 213, 61;
  --ion-color-primary-contrast: #ffffff;
  --ion-color-primary-contrast-rgb: 255, 255, 255;
  --ion-color-primary-shade: #2bbb36;
  --ion-color-primary-tint: #46d954;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### Step 10: Update Package Scripts

Update `package.json` scripts:

```json
{
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "cap:sync": "CAPACITOR_BUILD=true next build && cap sync",
    "cap:ios": "CAPACITOR_BUILD=true next build && cap sync ios",
    "cap:android": "CAPACITOR_BUILD=true next build && cap sync android",
    "cap:open:ios": "cap open ios",
    "cap:open:android": "cap open android"
  }
}
```

### Step 11: Add Native Platforms

```bash
# iOS
npx cap add ios
npx cap sync

# Android
npx cap add android
npx cap sync
```

## Optional Enhancements

### Enhanced IonicApp Component

You can enhance the basic `IonicApp.tsx` with additional features:

```tsx
"use client";

import { useEffect } from "react";
import { IonApp, setupIonicReact } from "@ionic/react";
import { Capacitor } from "@capacitor/core";
import { SplashScreen } from "@capacitor/splash-screen";
import { StatusBar, Style } from "@capacitor/status-bar";
import { App, AppState } from "@capacitor/app";

setupIonicReact();

export default function IonicApp({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Add platform class to body for CSS targeting
    if (Capacitor.isNativePlatform()) {
      document.body.classList.add('native-platform');
    } else {
      document.body.classList.add('web-platform');
      // Add debug safe area indicators for Chrome DevTools testing
      document.documentElement.style.setProperty('--safe-area-inset-top', '44px');
      document.documentElement.style.setProperty('--safe-area-inset-bottom', '34px');
    }

    // Configure StatusBar on native platforms
    if (Capacitor.isNativePlatform()) {
      try {
        StatusBar.setStyle({ style: Style.Dark });
        StatusBar.setOverlaysWebView({ overlay: false });
        StatusBar.setBackgroundColor({ color: "#000000" });
      } catch (error) {
        console.warn("Failed to configure status bar:", error);
      }

      try {
        // Hide splash screen after app loads
        setTimeout(() => {
          SplashScreen.hide({ fadeOutDuration: 200 });
        }, 100);
      } catch (error) {
        console.warn("Failed to hide splash screen:", error);
      }

      // Listen for app state changes
      const stateListener = App.addListener("appStateChange", (state: AppState) => {
        if (state.isActive) {
          // Handle app becoming active
          console.log("App became active");
        }
      });

      return () => {
        document.body.classList.remove('native-platform', 'web-platform');
        stateListener.remove();
      };
    }
  }, []);

  return <IonApp>{children}</IonApp>;
}
```

**Features you can add:**
- StatusBar configuration (style, background color, overlay behavior)
- SplashScreen management (auto-hide with fade animations)
- Platform detection (different behavior for native vs web)
- Safe area handling (CSS classes for platform targeting)
- App lifecycle listeners (handle app state changes)

### Enhanced Global Styles with Safe Areas

You can add safe area handling to `globals.css`:

```css
html {
  overscroll-behavior: none;
}

:root {
  --ion-color-primary: #31d53d;
  /* ... other Ionic theme variables ... */
}

/* Safe area insets for mobile devices */
body.native-platform {
  --safe-area-inset-top: env(safe-area-inset-top, 0px);
  --safe-area-inset-bottom: env(safe-area-inset-bottom, 0px);
  --safe-area-inset-left: env(safe-area-inset-left, 0px);
  --safe-area-inset-right: env(safe-area-inset-right, 0px);
}

/* Web platform - uses debug fallback values for testing */
body.web-platform {
  --safe-area-inset-top: 44px; /* Status bar height */
  --safe-area-inset-bottom: 34px; /* Home indicator area */
  --safe-area-inset-left: 0px;
  --safe-area-inset-right: 0px;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica,
    Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  overscroll-behavior: none;
}

/* Ionic toolbar should account for safe area at the top */
ion-toolbar {
  padding-top: var(--safe-area-inset-top) !important;
  min-height: calc(56px + var(--safe-area-inset-top)) !important;
}

/* Optional: Visual debug overlay for safe area testing */
body.web-platform::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--safe-area-inset-top);
  background: rgba(255, 0, 0, 0.3);
  z-index: 9999;
  pointer-events: none;
}

body.web-platform::after {
  content: '';
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--safe-area-inset-bottom);
  background: rgba(0, 255, 0, 0.3);
  z-index: 9999;
  pointer-events: none;
}
```

### Additional Capacitor Plugins

You may want to add these optional plugins:

```bash
npm install @capacitor/camera @capacitor/device @capacitor/haptics @capacitor/browser
```

- `@capacitor/camera` - Camera access
- `@capacitor/device` - Device information
- `@capacitor/haptics` - Haptic feedback
- `@capacitor/browser` - In-app browser functionality

## Push Notifications Setup

### Step 1: Install Push Notifications Plugin

```bash
npm install @capacitor/push-notifications
```

### Step 2: Configure Capacitor

Update `capacitor.config.ts` to include push notification configuration:

```typescript
import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.yourcompany.yourapp",
  appName: "YourAppName",
  webDir: "dist",
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
    // ... other plugins
  },
};

export default config;
```

### Step 3: iOS Setup

#### 3.1: Enable Push Notifications Capability

1. Open your iOS project: `npx cap open ios`
2. In Xcode, select your project in the navigator
3. Select your app target
4. Go to "Signing & Capabilities"
5. Click "+ Capability" and add "Push Notifications"

#### 3.2: Configure APNs (Apple Push Notification service)

1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Create an APNs Key or Certificate:
   - **APNs Key** (recommended): Create a new key with "Apple Push Notifications service (APNs)" enabled
   - Download the `.p8` key file (you can only download once!)
   - Note the Key ID and Team ID
4. Or create an **APNs Certificate**:
   - Create a new certificate for "Apple Push Notifications service (APNs)"
   - Download and install the certificate

#### 3.3: Update Info.plist (if needed)

Usually not required, but you can add:

```xml
<key>UIBackgroundModes</key>
<array>
  <string>remote-notification</string>
</array>
```

### Step 4: Android Setup

#### 4.1: Set Up Firebase Cloud Messaging (FCM)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select existing
3. Add Android app to your project:
   - Package name: `com.yourcompany.yourapp` (must match your app ID)
   - Download `google-services.json`
4. Place `google-services.json` in `android/app/`

#### 4.2: Update Android Build Files

**Update `android/build.gradle`:**

```gradle
buildscript {
    dependencies {
        // Add Google Services classpath
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

**Update `android/app/build.gradle`:**

```gradle
apply plugin: 'com.android.application'
apply plugin: 'com.google.gms.google-services' // Add this line

android {
    // ... your config
}
```

**Update `android/settings.gradle`:**

```gradle
pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
```

#### 4.3: Sync Android Project

```bash
npx cap sync android
```

### Step 5: Create Push Notifications Hook

Create `src/app/hooks/usePushNotifications.ts`:

```typescript
import { useState, useCallback } from "react";
import { PushNotifications } from "@capacitor/push-notifications";
import { Capacitor } from "@capacitor/core";

export function usePushNotifications() {
  const [pushEnabled, setPushEnabled] = useState<boolean | null>(null);
  const [pushError, setPushError] = useState<string | null>(null);
  const [pushStatus, setPushStatus] = useState("Enable Push Notifications");
  const [pushLoading, setPushLoading] = useState(false);

  const subscribeToPush = useCallback(async () => {
    setPushLoading(true);
    setPushStatus("Subscribing…");
    setPushError(null);

    try {
      // Check if we're on a native platform
      if (!Capacitor.isNativePlatform()) {
        setPushError("Push notifications are only available on mobile devices.");
        setPushStatus("Enable Push Notifications");
        return;
      }

      // Request permissions
      const permission = await PushNotifications.requestPermissions();

      if (permission.receive === "denied") {
        setPushError("Notification permission denied.");
        setPushStatus("Enable Push Notifications");
        return;
      }

      // Set up listeners BEFORE calling register()
      const registrationListener = await PushNotifications.addListener(
        "registration",
        async (token) => {
          if (!token || !token.value) {
            setPushError("Received invalid registration token.");
            setPushStatus("Enable Push Notifications");
            return;
          }

          // Send token to your backend
          try {
            const response = await fetch("https://your-api.com/api/push/subscribe", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ token: token.value }),
            });

            if (response.ok) {
              setPushEnabled(true);
              setPushStatus("Push notifications enabled!");
            } else {
              setPushError("Failed to save notification token.");
              setPushStatus("Enable Push Notifications");
            }
          } catch (err) {
            setPushError("Failed to send token to server.");
            setPushStatus("Enable Push Notifications");
          }
        }
      );

      const registrationErrorListener = await PushNotifications.addListener(
        "registrationError",
        (error) => {
          const errorMessage = (error as any)?.error || String(error) || "Unknown error";
          setPushError(`Failed to register: ${errorMessage}`);
          setPushStatus("Enable Push Notifications");
        }
      );

      // Listen for received notifications
      const receivedListener = await PushNotifications.addListener(
        "pushNotificationReceived",
        (notification) => {
          console.log("Push notification received:", notification);
          // Handle notification received while app is in foreground
        }
      );

      // Listen for notification actions
      const actionListener = await PushNotifications.addListener(
        "pushNotificationActionPerformed",
        (notification) => {
          console.log("Push notification action:", notification);
          // Handle notification tap/action
        }
      );

      // Create notification channel for Android (required for Android 8.0+)
      try {
        await PushNotifications.createChannel({
          id: "default",
          name: "Default Channel",
          description: "General notifications",
          importance: 5, // High importance
          visibility: 1, // Public visibility
          lights: true,
          vibration: true,
        });
      } catch (channelError) {
        console.warn("Failed to create notification channel:", channelError);
        // Continue anyway - channel might already exist
      }

      // Register for push notifications AFTER listeners are set up
      await PushNotifications.register();
    } catch (err) {
      const errorMessage = (err as Error).message.toLowerCase();
      let userFriendlyError = "Failed to enable push notifications.";

      if (errorMessage.includes("simulator") || errorMessage.includes("emulator")) {
        userFriendlyError = "Push notifications are not available in the simulator. Please test on a physical device.";
      } else if (errorMessage.includes("permission") || errorMessage.includes("denied")) {
        userFriendlyError = "Notification permission was denied. Please enable notifications in your device settings.";
      }

      setPushError(userFriendlyError);
      setPushStatus("Enable Push Notifications");
    } finally {
      setPushLoading(false);
    }
  }, []);

  const unsubscribeFromPush = async () => {
    setPushLoading(true);
    setPushError(null);
    setPushStatus("Unsubscribing…");

    try {
      // Remove token from your backend
      const response = await fetch("https://your-api.com/api/push/unsubscribe", {
        method: "POST",
      });

      if (response.ok) {
        setPushEnabled(false);
        setPushStatus("Enable Push Notifications");
      } else {
        setPushError("Failed to unsubscribe.");
        setPushStatus("Disable Push Notifications");
      }
    } catch (err) {
      setPushError("Failed to unsubscribe from push notifications.");
      setPushStatus("Disable Push Notifications");
    } finally {
      setPushLoading(false);
    }
  };

  return {
    pushEnabled,
    pushError,
    pushStatus,
    pushLoading,
    subscribeToPush,
    unsubscribeFromPush,
  };
}
```

### Step 6: Use Push Notifications in Components

```tsx
"use client";

import { usePushNotifications } from "@/app/hooks/usePushNotifications";
import { IonButton } from "@ionic/react";

export default function SettingsPage() {
  const {
    pushEnabled,
    pushError,
    pushStatus,
    pushLoading,
    subscribeToPush,
    unsubscribeFromPush,
  } = usePushNotifications();

  return (
    <div>
      <h1>Push Notifications</h1>
      {pushError && <p style={{ color: "red" }}>{pushError}</p>}
      <IonButton
        onClick={pushEnabled ? unsubscribeFromPush : subscribeToPush}
        disabled={pushLoading}
      >
        {pushStatus}
      </IonButton>
    </div>
  );
}
```

### Step 7: Backend Integration

Your backend needs to:

1. **Store push tokens** when users subscribe
2. **Send push notifications** using:
   - **iOS**: APNs (using your APNs key/certificate)
   - **Android**: FCM (using Firebase Admin SDK)

Example backend endpoint (Node.js):

```typescript
// Store token
app.post("/api/push/subscribe", async (req, res) => {
  const { token, userId } = req.body;
  // Store token in database associated with userId
  await db.pushTokens.create({ userId, token, platform: "ios" });
  res.json({ success: true });
});

// Send notification (example using firebase-admin for Android)
import admin from "firebase-admin";

app.post("/api/push/send", async (req, res) => {
  const { userId, title, body } = req.body;
  const tokens = await db.pushTokens.findAll({ where: { userId } });
  
  const messages = tokens.map(token => ({
    token: token.token,
    notification: { title, body },
  }));

  await admin.messaging().sendAll(messages);
  res.json({ success: true });
});
```

### Step 8: Badge Management (Optional)

You can clear notification badges when the app becomes active:

```typescript
import { App, AppState } from "@capacitor/app";
import { PushNotifications } from "@capacitor/push-notifications";

useEffect(() => {
  if (Capacitor.isNativePlatform()) {
    const clearBadge = async () => {
      try {
        await PushNotifications.removeAllDeliveredNotifications();
      } catch (error) {
        console.warn("Failed to clear badge:", error);
      }
    };

    // Clear badge on app launch
    clearBadge();

    // Clear badge when app becomes active
    const stateListener = App.addListener("appStateChange", (state: AppState) => {
      if (state.isActive) {
        clearBadge();
      }
    });

    return () => {
      stateListener.remove();
    };
  }
}, []);
```

## Development Workflow

### Running Development Server

```bash
npm run dev
```

This runs Next.js normally (not static export) for development.

### Building for Capacitor

```bash
# Build and sync to both platforms
npm run cap:sync

# Build and sync to iOS only
npm run cap:ios

# Build and sync to Android only
npm run cap:android
```

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

**Important**: Push notifications only work on physical devices, not simulators/emulators.

## Common Patterns

### Client Components

Always use `"use client"` for components that:
- Use Capacitor APIs
- Use Ionic components that access `window`
- Use browser-only APIs
- Handle user interactions

```tsx
"use client";

import { Capacitor } from "@capacitor/core";

export default function MyComponent() {
  // Can use Capacitor APIs here
}
```

### SSR-Safe Patterns

Check for client-side mounting before accessing `window`:

```tsx
"use client";

import { useState, useEffect } from "react";

export default function MyComponent() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // or a loading state
  }

  // Now safe to use window
  return <div>{window.location.pathname}</div>;
}
```

### Platform Detection

```tsx
import { Capacitor } from "@capacitor/core";

if (Capacitor.isNativePlatform()) {
  // Native iOS/Android code
} else {
  // Web code
}

// Get specific platform
const platform = Capacitor.getPlatform(); // "ios", "android", or "web"
```

### API Client Configuration

For Capacitor apps, use absolute URLs:

```typescript
import { Capacitor } from "@capacitor/core";

export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (Capacitor.isNativePlatform()) {
    return process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://your-api.com";
  }

  return process.env.NODE_ENV === "development"
    ? "http://localhost:3000"
    : "https://your-api.com";
}
```

## Troubleshooting

### Build Errors

**Issue**: "window is not defined"
- **Solution**: Ensure components using `window` are client components (`"use client"`) and check for mounting

**Issue**: Capacitor build fails
- **Solution**: 
  - Ensure `CAPACITOR_BUILD=true` is set during build
  - Check that all Node.js polyfills are included in `next.config.js`
  - Verify `dist` directory exists and contains built files

**Issue**: TypeScript errors with Capacitor
- **Solution**: Ensure `strict: false` in `tsconfig.json` and `ignoreBuildErrors: true` in `next.config.js`

### Capacitor Sync Issues

**Issue**: Sync fails with "webDir not found"
- **Solution**: 
  - Run `CAPACITOR_BUILD=true npm run build` first
  - Verify `capacitor.config.ts` `webDir` matches `next.config.js` `distDir`

**Issue**: Native dependencies not updating
- **Solution**: 
  - Delete `ios/Pods` and `android/.gradle`
  - Run `npx cap sync` again

### Push Notification Issues

**Issue**: Push notifications not working on iOS
- **Solution**:
  - Verify APNs key/certificate is configured correctly
  - Check that Push Notifications capability is enabled in Xcode
  - Ensure testing on physical device (not simulator)
  - Check that token is being sent to backend correctly

**Issue**: Push notifications not working on Android
- **Solution**:
  - Verify `google-services.json` is in `android/app/`
  - Check that Firebase project is configured correctly
  - Ensure testing on physical device (not emulator)
  - Verify notification channel is created (Android 8.0+)

**Issue**: "Registration event did not fire"
- **Solution**:
  - This often indicates APNs configuration issue on iOS
  - Verify APNs key/certificate is valid
  - Check that app is properly signed with correct provisioning profile

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Ionic React Documentation](https://ionicframework.com/docs/react)
- [Capacitor Push Notifications Plugin](https://capacitorjs.com/docs/apis/push-notifications)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notification Service](https://developer.apple.com/documentation/usernotifications)
