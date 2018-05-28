## Send to WebHook

A Chrome Extension [link](), which can send selected text or link to webhooks by filters


### How to Configure

Simply paste your json config into Options page and save.
> Sorry for no Editor, I will make one when I have time.

JSON config is a list of WebHook definitions:
- `name`: Required. The name of the webhook, will be displayed in the context menu title.
- `documentUrlPatterns`: Optional. Lets you restrict the item to apply only to documents whose URL matches one of the given patterns. For details on the format of a pattern, see [Match Patterns](https://developer.chrome.com/extensions/match_patterns).
- `targetUrlPatterns`: Optional. Similar to `documentUrlPattern`, but lets you filter based on the src attribute of image tags and the href of anchor tags. If not provided, the item will be applied to selected text.
- `action`: Required. Lets you define webhook endpoint.
  - `method`: Required. `GET` or `POST`
  - `url`: Required. The url of the webhook
  - `payload`: Only for `POST`, the json payload of the webhook data. you can use `%s` within the payload to represent the matched selected text, src or href values.

Here is a sample from my actual scenario, I want to send a matched .ipa link to Bitrise, which has a build job defined to upload ipa to iTunesConnect TestFlight.
```
[
  {
    "name": "Bitrise iOS upload",
    "targetUrlPatterns": [
      "https://*.amazonaws.com/ios%2F%40username%2Ftestapp-*-archive.ipa"
    ],
    "action": {
      "method": "POST",
      "url": "https://app.bitrise.io/app/xxxxxxxxxx/build/start.json",
      "payload": {
        "hook_info": {
          "type": "bitrise",
          "api_token": "<BITRISE_API_TOKEN>"
        },
        "build_params": {
        },
        "triggered_by": "curl"
      }
    }
  }
]
```

### What's New
| Date | Description |
| ---- | ----------- |
| 2018-05-31 | First published |
