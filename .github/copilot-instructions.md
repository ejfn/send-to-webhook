# Copilot Instructions for AI Agents

## Project Overview
- This is a Chrome Extension (Manifest V3) for sending links, images, or selected text to user-configurable webhooks.
- The extension is implemented in TypeScript (see `src/`), with a form-based UI for editing webhook configurations.
- The UI and logic are written in vanilla JS/TS (no React or frameworks).
- The build process uses `tsc` (TypeScript compiler) and basic shell commands (e.g., `cp`).

## Key Components
- `src/background.ts`: Main background script, handles context menu, message passing, and webhook dispatch.
- `src/options.ts`: Handles the options page UI and logic for managing webhook configurations.
- `public/manifest.json`: Chrome extension manifest (Manifest V3).
- `public/options.html`, `public/css/options.css`: Options page markup and styles.
- `public/scripts/options.js`: Built JS for options page (output from `tsc`).

## Build & Development Workflow
- **Build:** Run `tsc` to compile TypeScript to JavaScript. Copy assets from `public/` to `dist/` as needed.
- **No bundler:** There is no Webpack or similar; all scripts are loaded as modules.
- **Testing:** No automated tests are present; manual testing is done via Chrome's extension loader.
- **Debugging:** Use Chrome DevTools for background and options pages.
- **Branching:** Use feature branches (e.g., `ejfn/feature-name`). Do not commit to `main` directly.

## Project-Specific Patterns
- Webhook configuration is stored and managed via the options page, using Chrome's storage APIs.
- Request bodies support template placeholders (e.g., `{{content}}`, `{{isoDateTime}}`).
- All UI is vanilla JS/TS; avoid introducing frameworks.
- Follow the structure and conventions in `src/options.ts` for new UI or config logic.

## Integration Points
- Communicates with external webhooks via HTTP(S) requests.
- Uses Chrome extension APIs for context menus, storage, and messaging.

## Examples
- See `README.md` for example webhook configurations and usage patterns.

---

**If you are an AI agent, follow these conventions and reference the files above for implementation details.**
