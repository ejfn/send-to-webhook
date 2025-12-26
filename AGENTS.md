# Agents

This project contains configuration and documentation for AI agents working on the codebase.

## Project Details

This project is a Chrome/Firefox Extension that has been upgraded to Manifest V3 and re-implemented using vanilla JavaScript/TypeScript. The build process uses Vite to support multi-browser builds.

**Key features:**
- **Manifest V3**: Modern extension API with service workers
- **Multi-browser support**: Single codebase builds for both Chrome and Firefox
- **Vite build system**: Modern bundling with browser-specific manifest output
- **Form-based editor**: Vanilla JavaScript UI for webhook configuration

## Build Commands

- `npm run build` - Build for both Chrome and Firefox
- `npm run build:chrome` - Build Chrome extension only (outputs to `dist-chrome/`)
- `npm run build:firefox` - Build Firefox extension only (outputs to `dist-firefox/`)
- `npm run package` - Build and create ZIP files for both browsers

## Project Structure

- `src/` - TypeScript source files (background.ts, options.ts, options.html)
- `public/assets/` - Icons and CSS
- `public/manifest.chrome.json` - Chrome-specific manifest
- `public/manifest.firefox.json` - Firefox-specific manifest (includes gecko settings)
