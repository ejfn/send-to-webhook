## Send To WebHook

[![CircleCI](https://circleci.com/gh/ericvan76/send-to-webhook/tree/master.svg?style=svg)](https://circleci.com/gh/ericvan76/send-to-webhook/tree/master)

A Chrome Extension, send link, image or selected text to webhooks by filters

See [Extension Page](https://goo.gl/kbwRVB)

### How to Configure

Simply paste your json config into Options page and save.
> Sorry for no editor, I will make one when I have time.

The JSON config is a list of config which defines page/link matching rules and WebHook definition:

|Field name|Required|Description|
|--|--|--|
|`name`| Required| The name of the webhook, will be displayed in the context menu title.|
|`documentUrlPatterns`| Optional| Lets you restrict the item to apply only to documents whose URL matches one of the given patterns. For details on the format of a pattern, see [Match Patterns](https://developer.chrome.com/extensions/match_patterns).|
|`targetUrlPatterns`|Optional|Similar to `documentUrlPatterns`, but lets you filter based on the src attribute of img tags and the href of anchor tags. If not provided, the item will be applied to selected text.|
|`action`| Required| Lets you define webhook endpoint.|
|`action.method`| Optional| Default `POST`.|
|`action.url`| Required| The url of the webhook|
|`action.payload`| Optional|The json payload of the webhook data. You can use following templates to do some simple payload composing|

|Templates||
|--|:--|
|`%s`|selected text|
|`%d`|current date time in ISO format |
|`%l`|current date time in Locale format |

### Example 1

Send selected text to my slack's #random channel
```
[
  {
    "name": "MySlack#random",
    "action": {
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
| 2018-06-02 | Add ability to send arbitrary text |
| 2018-05-29 | First published |

### Buy me a coffee!

[![](https://www.paypalobjects.com/en_AU/i/btn/btn_donate_LG.gif)](https://www.paypal.com/donate?business=RBUDZ9FDP8MFY&no_recurring=0&currency_code=AUD)
