## Send To WebHook

A Chrome Extension to send links, images, or selected text to configurable webhooks. [View on Chrome Web Store](https://goo.gl/kbwRVB)
### How to Configure
Configure your webhooks to quickly send page information to predefined endpoints. Each webhook configuration includes the following fields:
*   **Webhook Name**: A descriptive name for your webhook (e.g., "My Slack Channel", "Bitrise iOS Upload"). This name will appear in the extension's popup menu.

*   **Document URL Patterns**: (Optional) One pattern per line. Use this to restrict when the webhook appears. The webhook will only be available on pages whose URLs match one of these patterns. For details on pattern format, refer to [Match Patterns](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns).

*   **Target URL Patterns**: (Optional) One pattern per line. Similar to Document URL Patterns, but applies when you right-click on a link or image. The webhook will only be available for links or images whose URLs match one of these patterns. If not provided, the webhook will apply to selected text. For details on pattern format, refer to [Match Patterns](https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns).

*   **HTTP Method**: Choose the HTTP method for the request: `POST` (for sending data) or `GET` (for retrieving data). Defaults to `POST`.

*   **Webhook Endpoint URL**: The full URL of the target endpoint where the data will be sent (e.g., `https://hooks.slack.com/services/...`).

*   **Request Body (JSON)**: (Optional) Define the request body as a JSON object or a plain string. You can use the following placeholders to dynamically insert content:
    *   `%s`: Inserts the selected text.
    *   `%d`: Inserts the current date and time in ISO format.
    *   `%l`: Inserts the current date and time in locale format.

    Example JSON body with templates:
    ```json
    {
      "selectedText": "%s",
      "isoDate": "%d",
      "localeDate": "%l"
    }
    ```

*   **Request Headers**: (Optional) Add custom HTTP headers as key-value pairs. Click "Add Header" to add new fields, and "Remove" to delete them.





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
      "selectedText": "%s"
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
          "value": "%s",
          "is_expand": true
        }
      ],
      "triggered_by": "send-to-webhook"
    }
    ```
*   **Request Headers**: (empty)

### What's New
| Date       | Description                                 |
| ---------- | ------------------------------------------- |
| 2025-07-26 | Upgraded to Manifest V3. Improved UI/UX for options page with form-based editor and dynamic header fields. Removed Google Analytics. |
| 2022-08-10 | Allow http headers to be set in the request |
| 2018-06-02 | Add ability to send arbitrary text          |
| 2018-05-29 | First published                             |