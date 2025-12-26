## Send To WebHook

A browser extension for **Chrome** and **Firefox** to send links, images, or selected text to configurable webhooks.

[View on Chrome Web Store](https://goo.gl/kbwRVB) | [View on Firefox Add-ons](https://addons.mozilla.org/firefox/addon/send-to-webhook/)

### Key Features
- **Multi-browser support**: Unified codebase for Chrome and Firefox.
- **Manifest V3**: Modern extension architecture.
- **Form-based editor**: Easy-to-use configuration for multiple webhooks.
- **Dynamic placeholders**: Inject content, dates, and times into your webhook requests.

---

### How to Configure
Configure your webhooks to quickly send page information to predefined endpoints. Each webhook configuration includes the following fields:

*   **Webhook Name**: A descriptive name for your webhook (e.g., "My Slack Channel", "Bitrise iOS Upload"). This name will appear in the extension's popup menu.

*   **Document URL Patterns**: (Optional) One pattern per line. Use this to restrict when the webhook appears. The webhook will only be available on pages whose URLs match one of these patterns. For details on pattern format, refer to [Match Patterns](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns).

*   **Target URL Patterns**: (Optional) One pattern per line. Similar to Document URL Patterns, but applies when you right-click on a link or image. The webhook will only be available for links or images whose URLs match one of these patterns. If not provided, the webhook will apply to selected text. For details on pattern format, refer to [Match Patterns](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns).

*   **HTTP Method**: Choose the HTTP method for the request: `POST` (for sending data) or `GET` (for retrieving data). Defaults to `POST`.

*   **Webhook Endpoint URL**: The full URL of the target endpoint where the data will be sent (e.g., `https://hooks.slack.com/services/...`).

*   **Request Body (JSON)**: (Optional) Define the request body as a JSON object or a plain string. You can use the following placeholders to dynamically insert content:
    *   `{{content}}`: Inserts the selected text, link URL, image URL, or current page URL/title depending on the context.
    *   `{{isoDateTime}}`: Inserts the current date and time in ISO format.
    *   `{{localDateTime}}`: Inserts the current date and time in locale format.

    Example JSON body with templates:
    ```json
    {
      "content": "{{content}}",
      "isoDate": "{{isoDateTime}}",
      "localeDate": "{{localDateTime}}"
    }
    ```

*   **Request Headers**: (Optional) Add custom HTTP headers as key-value pairs. Click "Add Header" to add new fields, and "Remove" to delete them.

---

### Development & Build

This project uses **Vite** and **TypeScript** for a modern development experience.

#### Prerequisites
- Node.js (v18 or later recommended)
- npm

#### Installation
```bash
npm install
```

#### Build Commands
- `npm run build`: Build for both Chrome and Firefox.
- `npm run build:chrome`: Build Chrome extension (outputs to `dist-chrome/`).
- `npm run build:firefox`: Build Firefox extension (outputs to `dist-firefox/`).
- `npm run package`: Build and create ZIP files for both browsers.

#### Loading into Browser
1. **Chrome**: Go to `chrome://extensions/`, enable "Developer mode", and click "Load unpacked". Select the `dist-chrome` folder.
2. **Firefox**: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in the `dist-firefox` folder (e.g., `manifest.json`).

---

### Examples

#### Example 1: Send selected text to Slack
*   **Webhook Name**: MySlack#random
*   **Document URL Patterns**: (empty)
*   **Target URL Patterns**: (empty)
*   **HTTP Method**: POST
*   **Webhook Endpoint URL**: `<YOUR-SLACK-CHANNELS-INCOMING-WEBHOOK-URL>`
*   **Request Body (JSON)**:
    ```json
    {
      "selectedText": "{{content}}"
    }
    ```
*   **Request Headers**: (empty)

#### Example 2: Bitrise iOS Upload
*   **Webhook Name**: Bitrise iOS Upload
*   **Document URL Patterns**: (empty)
*   **Target URL Patterns**: `https://*.amazonaws.com/ios%2F%40username%2Ftestapp-*-archive.ipa`
*   **HTTP Method**: POST
*   **Webhook Endpoint URL**: `https://app.bitrise.io/app/xxxxxxxxxx/build/start.json`
*   **Request Body (JSON)**:
    ```json
    {
      "hook_info": {
        "type": "bitrise",
        "api_token": "<BITRISE_API_TOKEN>"
      },
      "build_params": {
        "workflow_id": "ios"
      },
      "environments": [
        {
          "mapped_to": "IPA_URL",
          "value": "{{content}}",
          "is_expand": true
        }
      ],
      "triggered_by": "send-to-webhook"
    }
    ```
*   **Request Headers**: (empty)

---

### What's New
| Date       | Description                                 |
| ---------- | ------------------------------------------- |
| 2025-12-26 | Added Firefox support (v1.0.0) and migrated building system to Vite. Unified codebase for multi-browser support. |
| 2025-07-26 | Upgraded to Manifest V3. Improved UI/UX for options page with form-based editor and dynamic header fields. Removed Google Analytics. |
| 2022-08-10 | Allow http headers to be set in the request |
| 2018-06-02 | Add ability to send arbitrary text          |
| 2018-05-29 | First published                             |