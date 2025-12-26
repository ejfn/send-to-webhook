function escapeJsonValue(value: string | undefined) {
  const o: string[] = [value || ''];
  const str = JSON.stringify(o);
  return str.substring(2, str.length - 2);
}

// src/background.ts
console.log('Send to WebHook service worker loaded.');

// Function to create or update context menus
async function updateContextMenus() {
  await chrome.contextMenus.removeAll(); // Clear existing menus

  const data: StoredData = {
    webhooks: '[]'
  };
  const items: StoredData = await chrome.storage.sync.get(data) as StoredData;
  const webhooks: WebHook[] = JSON.parse(items.webhooks);

  for (const webhook of webhooks) {
    const { name, documentUrlPatterns, targetUrlPatterns } = webhook;

    const contexts: chrome.contextMenus.ContextType[] = [];
    if (targetUrlPatterns && targetUrlPatterns.length > 0) {
      contexts.push("link", "image");
    } else {
      contexts.push("selection", "page"); // For selected text and right-click on empty space
    }

    chrome.contextMenus.create({
      id: name, // Use webhook name as ID for easy retrieval
      title: name,
      contexts: contexts,
      documentUrlPatterns: documentUrlPatterns && documentUrlPatterns.length > 0 ? documentUrlPatterns : undefined,
      targetUrlPatterns: targetUrlPatterns && targetUrlPatterns.length > 0 ? targetUrlPatterns : undefined
    });
  }
}

chrome.runtime.onInstalled.addListener(() => {
  console.log('Service worker installed.');
  updateContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  console.log('Browser startup.');
  updateContextMenus();
});

// Listen for storage changes to update menus dynamically
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes.webhooks) {
    console.log('Webhooks changed, updating context menus.');
    updateContextMenus();
  }
});

// Function to set the browser action icon and text
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
      chrome.action.setTitle({ title: '' });
      break;
  }
}

// Listen for clicks on the extension icon
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({ url: chrome.runtime.getURL('src/options.html') });
});

// Listen for context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const data: StoredData = {
    webhooks: '[]'
  };
  const items: StoredData = await chrome.storage.sync.get(data) as StoredData;
  const webhooks: WebHook[] = JSON.parse(items.webhooks);

  const clickedWebhook = webhooks.find(wh => wh.name === info.menuItemId);

  if (clickedWebhook && clickedWebhook.action) {
    let content = '';
    if (info.selectionText) {
      content = info.selectionText;
    } else if (info.linkUrl) {
      content = info.linkUrl;
    } else if (info.srcUrl) {
      content = info.srcUrl;
    } else if (tab?.url) {
      // If no specific element was clicked, send the page URL
      content = tab.url;
    }

    await sendWebhook(clickedWebhook.action, content);
  }
});

// Listen for messages from popup/options page to set browser icon
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SET_BROWSER_ICON') {
    setBrowserIcon(message.status, message.title);
  }
});

// Function to send the webhook request
async function sendWebhook(action: WebHookAction, content: string) {
  const { method, url, payload, headers } = action;
  let body;

  if (payload !== undefined) {
    const now = new Date();
    const isoDateTime = now.toISOString();
    const localDateTime = now.toLocaleString();
    body = JSON.stringify(payload)
      .replace('{{content}}', escapeJsonValue(content))
      .replace('{{isoDateTime}}', isoDateTime)
      .replace('{{localDateTime}}', localDateTime);
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