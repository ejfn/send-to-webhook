
function send(param: string | undefined, action: WebhookAction) {
  if (param !== undefined && action !== undefined) {
    const { method, url, payload } = action;
    let body;
    if (payload !== undefined) {
      body = JSON.stringify(payload).replace('%s', param);
    }
    fetch(url, { method: method || 'POST', body })
      .then((resp) => {
        alert(`Status: ${resp.status} - ${resp.statusText}`);
      })
      .catch((reason) => {
        alert(`Error: ${reason}}`);
      });
    // @see: http://stackoverflow.com/a/22152353/1958200
    ga('set', 'checkProtocolTask', () => { /* do nothing */ });
    ga('require', 'displayfeatures');
    ga('send', 'pageview', '/');
  } else {
    alert('Could not send webhook, please check you configuration.');
  }
}

chrome.storage.sync.get({
  webhooks: '[]'
}, (items) => {
  const webhooks = JSON.parse(items.webhooks) as Webhook[];
  webhooks.forEach((webhook) => {
    const isLink = webhook.targetUrlPatterns !== undefined && webhook.targetUrlPatterns.length > 0;
    if (isLink) {
      // Add context menu
      chrome.contextMenus.create({
        documentUrlPatterns: webhook.documentUrlPatterns,
        title: `Send link to ${webhook.name}`,
        contexts: ['link'],
        targetUrlPatterns: webhook.targetUrlPatterns,
        onclick: (info) => {
          send(info.linkUrl, webhook.action);
        }
      });
      chrome.contextMenus.create({
        documentUrlPatterns: webhook.documentUrlPatterns,
        title: `Send image to ${webhook.name}`,
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
          send(info.selectionText, webhook.action);
        }
      });
    }
  });
});
