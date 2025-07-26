# Project Upgrade and Modernization Plan

This document outlines the plan to upgrade the "Send To WebHook" Chrome Extension to the latest platform standards.

## 1. Build System and Dependency Upgrade

- **Upgrade npm Packages:** Update all dependencies in `package.json` to their latest stable versions.
- **Replace Build Tool:** Replace the deprecated `react-scripts-ts` with a modern build tool like Vite or Create React App with TypeScript.
- **Configure Build System:** Configure the new build system to produce a Manifest V3 compatible extension bundle.

## 2. Manifest V3 Migration

- **Update Manifest Version:** Change `manifest_version` from 2 to 3 in `public/manifest.json`.
- **Update Action Key:** Replace the `browser_action` key with the `action` key.
- **Update Background Script:** Modify the `background` script definition to use `background.service_worker`.
- **Update Content Security Policy:** Convert the `content_security_policy` string to an object under `content_security_policy.extension_pages`.

## 3. Refactor Background Script to Service Worker

- **Rewrite Logic:** Adapt the background script from `src/components/Background.tsx` to a service worker context.
- **Remove DOM Access:** Replace any direct DOM or window object access with appropriate service worker APIs.
- **Manage Context Menus:** Ensure context menu creation and event handling are managed by the service worker.

## 4. Refactor React Components

- **Convert to Functional Components:** Refactor all class-based components (`Options.tsx`, `Popup.tsx`, `App.tsx`) to functional components using React Hooks.
- **State Management:** Replace `this.setState` with `useState` and `useEffect` for state and side-effect management.

## 5. UI/UX Modernization

- **Update Styling:** Refresh the UI of the Options and Popup pages with a more modern look and feel.
- **Improve Responsiveness:** Ensure the UI is responsive and works well on different screen sizes.
- **Enhance Accessibility:** Implement accessibility best practices.

## 6. Testing Strategy

- **Set up Testing Framework:** Integrate a testing framework like Jest and React Testing Library.
- **Write Unit Tests:** Develop unit tests for critical components and utility functions.
- **Plan for E2E Testing:** Outline a strategy for end-to-end testing of the extension's core features.
