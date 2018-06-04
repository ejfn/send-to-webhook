function send(param: string | undefined, action: WebhookAction) {
  if (param !== undefined && action !== undefined) {
    const { method, url, payload } = action;
    let body;
    if (payload !== undefined) {
      body = JSON.stringify(payload).replace('%s', param);
    }
    fetch(url, {
      method: method || 'POST',
      body,
      mode: 'no-cors'
    }).then((resp) => {
      alert(resp.status >= 400 ? `Error: ${resp.status}` : 'Successfully Sent!');
    }).catch((reason) => {
      alert(`Error: ${reason}`);
    });
    // @see: http://stackoverflow.com/a/22152353/1958200
    ga('set', 'checkProtocolTask', () => { /* do nothing */ });
    ga('send', {
      hitType: 'event',
      eventCategory: 'contextMenu',
      eventAction: 'webhook'
    });
  } else {
    alert('Error: Webhook action is not defined.');
  }
}

chrome.storage.sync.get({
  webhooks: '[]'
}, (items) => {
  const webhooks: Webhook[] = JSON.parse(items.webhooks);
  webhooks.forEach((webhook) => {
    const isLink = webhook.targetUrlPatterns !== undefined && webhook.targetUrlPatterns.length > 0;
    if (isLink) {
      // Add context menu
      chrome.contextMenus.create({
        documentUrlPatterns: webhook.documentUrlPatterns,
        title: `Send Link to ${webhook.name}`,
        contexts: ['link'],
        targetUrlPatterns: webhook.targetUrlPatterns,
        onclick: (info) => {
          send(info.linkUrl, webhook.action);
        }
      });
      chrome.contextMenus.create({
        documentUrlPatterns: webhook.documentUrlPatterns,
        title: `Send Image to ${webhook.name}`,
        contexts: ['image'],
        targetUrlPatterns: webhook.targetUrlPatterns,
        onclick: (info) => {
          send(info.srcUrl, webhook.action);
        }
      });
    } else {
      chrome.contextMenus.create({
        documentUrlPatterns: webhook.documentUrlPatterns,
        title: `Send "%s" to ${webhook.name}`,
        contexts: ['selection'],
        onclick: (info) => {
          send(escapeJsonValue(info.selectionText), webhook.action);
        }
      });
    }
  });
});
