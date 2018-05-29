## Send To WebHook

A Chrome Extension, send link, image or selected text to webhooks by filters

See [Extension page](https://chrome.google.com/webstore/detail/send-to-webhook/hoglpfllfgiennflpdodjpaaecpfodpe)

### How to Configure

Simply paste your json config into Options page and save.
> Sorry for no editor, I will make one when I have time.

The JSON config is a list of WebHook definitions:
- `name`: Required. The name of the webhook, will be displayed in the context menu title.
- `documentUrlPatterns`: Optional. Lets you restrict the item to apply only to documents whose URL matches one of the given patterns. For details on the format of a pattern, see [Match Patterns](https://developer.chrome.com/extensions/match_patterns).
- `targetUrlPatterns`: Optional. Similar to `documentUrlPatterns`, but lets you filter based on the src attribute of img tags and the href of anchor tags. If not provided, the item will be applied to selected text.
- `action`: Required. Lets you define webhook endpoint.
  - `method`: Required. `GET` or `POST`
  - `url`: Required. The url of the webhook
  - `payload`: Only for `POST`, the json payload of the webhook data. you can use `%s` within the payload to represent the matched selected text, src or href values.

### Example 1

Send selected text to my slack's #random channel
```
[
  {
    "name": "MySlack#random",
    "action": {
      "method": "POST",
      "url": "<YOUR-SLACK-CHANNELS-INCOMING-WEBHOOK-URL>",
      "payload": {
        "text": "%s"
      }
    }
  }
]
```


### Example 2

I want to grab a matched .ipa or .apk link from Expo's build page, and send to Bitrise triggering a job to upload build assets to TestFlight or PlayStore. (because Expo doesn't support build webhook, not yet)
```
[
  {
    "name": "Bitrise iOS Upload",
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
    }
  },
  {
    "name": "Bitrise Android Upload",
    "targetUrlPatterns": [
      "https://*.amazonaws.com/android%2F%40username%2Ftestapp-*-signed.apk"
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
          "workflow_id": "android"
        },
        "environments": [
          {
            "mapped_to": "APK_URL",
            "value": "%s",
            "is_expand": true
          }
        ],        
        "triggered_by": "send-to-webhook"
      }
    }
  }  
]
```

### What's New
| Date | Description |
| ---- | ----------- |
| 2018-05-29 | First published |

### Help us

[![](https://www.paypalobjects.com/en_AU/i/btn/btn_donateCC_LG.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=YQC5T9DVNEHPU)
