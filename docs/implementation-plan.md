# Project Upgrade and Modernization Plan

This document outlines the plan to upgrade the "Send To WebHook" Chrome Extension to the latest platform standards.

## 1. Build System and Dependency Upgrade

- **Initial State:** Project used React and `react-scripts-ts` (deprecated) with outdated npm packages.
- **Upgrade:** Migrated to vanilla TypeScript with `tsc` for compilation. Removed all previous build tools (Vite, Parcel, `react-scripts-ts`).
- **Dependency Management:** `package.json` now uses `typescript` and `@types/chrome` as primary dev dependencies.

## 2. Manifest V3 Migration

- **Initial State:** Manifest V2 with background page, `browser_action`, and `content_security_policy` as a string.
- **Migration:** Updated `manifest_version` to 3. Replaced `browser_action` with `action`. Converted background page to a non-persistent service worker (`background.js`). Updated `content_security_policy` to object format.

## 3. Refactor Background Script to Service Worker

- **Initial State:** Background logic was in `src/components/Background.tsx`.
- **Refactoring:** Rewrote background logic into `src/background.ts` as a Manifest V3 service worker. Implemented event-driven architecture. Replaced `chrome.browserAction` with `chrome.action`. Implemented message passing for UI-to-background communication (e.g., setting browser icon).

## 4. Refactor React Components to Vanilla JavaScript

- **Initial State:** UI components (`App.tsx`, `Options.tsx`, `Popup.tsx`) were React class components.
- **Refactoring:** Re-implemented `src/options.ts` and `src/popup.ts` using vanilla JavaScript and DOM manipulation. Removed React dependencies. `src/App.tsx` was removed as its routing logic is now handled by distinct HTML files.

## 5. UI/UX Modernization

- **Initial State:** Basic UI with a raw JSON editor for webhook configuration.
- **Modernization:** Implemented a form-based editor for webhook configuration in `src/options.ts` with dynamic fields for patterns and headers. Improved styling for both options and popup pages (`public/css/options.css`, `public/css/popup.css`). Added descriptive labels and placeholders for form fields. Consolidated buttons for better space utilization.

## 6. Testing Strategy

- **Initial State:** Project had `jest` and `react-testing-library` dependencies.
- **Update:** Removed all test-related code and dependencies as per user request for a minimal setup.

## 7. Project Structure and Build Process

- **Initial State:** Mixed structure with `src/` and `public/` and complex build scripts.
- **New Structure:**
    ```
    project-root/
    ├── public/                 # Source for static assets (HTML, CSS, images, manifest.json)
    │   ├── popup.html
    │   ├── options.html
    │   ├── css/
    │   │   ├── popup.css
    │   │   └── options.css
    │   ├── images/
    │   │   ├── icon-16.png
    │   │   ├── icon-48.png
    │   │   └── icon-128.png
    │   └── manifest.json
    ├── src/                    # Source for TypeScript logic
    │   ├── background.ts
    │   ├── popup.ts
    │   ├── options.ts
    │   ├── constants.ts
    │   ├── utils.ts
    │   └── typings/
    │       ├── storedData.ts
    │       └── webhook.ts
    ├── tsconfig.json
    ├── package.json
    └── dist/                   # Build output
        ├── popup.html
        ├── options.html
        ├── manifest.json
        ├── css/
        │   ├── popup.css
        │   └── options.css
        ├── images/
        │   ├── icon-16.png
        │   ├── icon-48.png
        │   └── icon-128.png
        └── scripts/
            ├── background.js
            ├── popup.js
            ├── options.js
            ├── constants.js
            ├── utils.js
            ├── typings/
            │   ├── storedData.js
            │   └── webhook.js
    ```
- **Build Script (`package.json`):** Simplified to `tsc && cp -r public/. dist/`. `tsc` compiles TypeScript to `dist/scripts/` (configured via `tsconfig.json`), and `cp -r public/. dist/` copies all public assets to `dist/` maintaining their relative paths.

## How to Build and Load the Extension

1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Build the Extension:**
    ```bash
    npm run build
    ```
3.  **Load in Chrome:**
    *   Open `chrome://extensions`.
    *   Enable "Developer mode".
    *   Click "Load unpacked".
    *   Select the `dist` folder from your project directory.

## Known Issues / Next Steps

-   Full testing of all webhook functionalities (sending, matching, icon updates) is required.
-   Consider adding a more robust error handling and user feedback mechanism for network requests.
