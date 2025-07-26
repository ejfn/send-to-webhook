import { StoredData } from "./typings/storedData.js";
import { WebHook, WebHookAction } from "./typings/webhook.js";
import { escapeJsonValue } from "./utils.js";

// src/background.ts
console.log('Bare-bones service worker loaded.');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Bare-bones service worker installed.');
});

// Function to set the browser action icon and text (from original background.ts)
function setBrowserIcon(status: 'Default' | 'OK' | 'Error' | 'Sending', title?: string) {
  switch (status) {
    case 'OK':
      chrome.action.setBadgeText({ text: '✓' });
      chrome.action.setBadgeBackgroundColor({ color: '#00C851' });
      chrome.action.setTitle({ title: title || 'Sent.' });
      break;
    case 'Error':
      chrome.action.setBadgeText({ text: '!' });
      chrome.action.setBadgeBackgroundColor({ color: '#ff4444' });
      chrome.action.setTitle({ title: title || 'Error' });
      break;
    case 'Sending':
      chrome.action.setBadgeText({ text: '…' });
      chrome.action.setBadgeBackgroundColor({ color: '#ffbb33' });
      chrome.action.setTitle({ title: title || 'Sending...' });
      break;
    default:
      chrome.action.setBadgeText({ text: '' });
      chrome.action.setTitle({ title: title || '' });
      break;
  }
}

// On installation, create the context menu (from original background.ts)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "sendToWebhook",
    title: "Send to WebHook",
    contexts: ["selection", "link", "image"]
  });
});

// Listen for context menu clicks (from original background.ts)
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "sendToWebhook") {
    const data: StoredData = {
      webhooks: '[]',
      previousIndex: -1
    };
    const items: StoredData = await chrome.storage.sync.get(data) as StoredData;
    const webhooks: WebHook[] = JSON.parse(items.webhooks);

    // Determine the content to send based on the context menu click
    let content = '';
    if (info.selectionText) {
      content = info.selectionText;
    } else if (info.linkUrl) {
      content = info.linkUrl;
    } else if (info.srcUrl) {
      content = info.srcUrl;
    }

    // Find matching webhooks and send data
    for (const webhook of webhooks) {
      const { documentUrlPatterns, targetUrlPatterns, action } = webhook;

      const documentUrlMatch = documentUrlPatterns ? documentUrlPatterns.some(pattern => tab?.url && new RegExp(pattern.replace(/\*/g, '.*')).test(tab.url)) : true;
      const targetUrlMatch = targetUrlPatterns ? targetUrlPatterns.some(pattern => info.linkUrl && new RegExp(pattern.replace(/\*/g, '.*')).test(info.linkUrl)) : true;

      if (documentUrlMatch && targetUrlMatch) {
        await sendWebhook(action, content);
      }
    }
  }
});

// Listen for messages from popup/options page to set browser icon (from original background.ts)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_BROWSER_ICON') {
    setBrowserIcon(message.status, message.title);
  }
});

// Function to send the webhook request (from original background.ts)
async function sendWebhook(action: WebHookAction, content: string) {
  const { method, url, payload, headers } = action;
  let body;

  if (payload !== undefined) {
    body = JSON.stringify(payload).replace('%s', escapeJsonValue(content));
  }

  setBrowserIcon('Sending');

  try {
    const resp = await fetch(url, {
      method: method || 'POST',
      headers: headers || {},
      body,
      mode: 'no-cors' // Consider changing this to 'cors' if you control the webhook endpoint and want to handle errors
    });

    if (resp.status >= 400) {
      setBrowserIcon('Error', `Error: ${resp.status}`);
    } else {
      setBrowserIcon('OK');
      setTimeout(() => {
        setBrowserIcon('Default');
      }, 750);
    }
  } catch (err: any) {
    setBrowserIcon('Error', `Error: ${err.message}`);
  }
}