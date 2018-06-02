const developersUrl = 'https://github.com/ericvan76/send-to-webhook';
const contentTa = document.getElementById('content') as HTMLTextAreaElement;
const webhookSel = document.getElementById('webhooks') as HTMLSelectElement;
const sendBtn = document.getElementById('send') as HTMLSelectElement;
const sendStatus = document.getElementById('send-status') as HTMLSpanElement;
const optionsMenu = document.getElementById('options') as HTMLAnchorElement;
const devMenu = document.getElementById('developers') as HTMLAnchorElement;
const issueMenu = document.getElementById('issues') as HTMLAnchorElement;

let webhooks: Webhook[];

function load_webhooks() {
  chrome.storage.sync.get({
    webhooks: '[]'
  }, (items) => {
    webhooks = JSON.parse(items.webhooks);
    for (let i = 0; i < webhooks.length; i++) {
      const opt = document.createElement('option');
      opt.value = i.toString();
      opt.text = webhooks[i].name;
      webhookSel.add(opt);
    }
  });
}

function sendArbitrary() {
  const content = contentTa.value;
  if (webhookSel.selectedIndex !== -1) {
    const webhook = webhooks[webhookSel.selectedIndex];
    const webaction = webhook.action;
    sendStatus.className = '';
    sendStatus.textContent = '';
    if (webaction !== undefined) {
      const { method, url, payload } = webaction;
      let body;
      if (payload !== undefined) {
        body = JSON.stringify(payload).replace('%s', content);
      }
      sendStatus.className = '';
      sendStatus.textContent = 'Sending...';
      fetch(url, {
        method: method || 'POST',
        headers: {
          'content-type': 'application/json'
        },
        body
      }).then((resp) => {
        if (resp.status >= 400) {
          sendStatus.className = 'error';
          sendStatus.textContent = `${resp.status}`;
        } else {
          sendStatus.className = '';
          sendStatus.textContent = 'Sent!';
          setTimeout(() => {
            sendStatus.className = '';
            sendStatus.textContent = '';
          }, 750);
        }
      }).catch((reason) => {
        sendStatus.className = 'error';
        sendStatus.textContent = reason;
      });
      // @see: http://stackoverflow.com/a/22152353/1958200
      ga('set', 'checkProtocolTask', () => { /* do nothing */ });
      ga('send', {
        hitType: 'event',
        eventCategory: 'arbitrary',
        eventAction: 'webhook'
      });

    } else {
      sendStatus.className = 'error';
      sendStatus.textContent = 'Action not defined.';
    }
  }
}

sendBtn.addEventListener('click', sendArbitrary);
optionsMenu.addEventListener('click', () => chrome.runtime.openOptionsPage());
devMenu.addEventListener('click', () => chrome.tabs.create({ url: developersUrl }));
issueMenu.addEventListener('click', () => chrome.tabs.create({ url: `${developersUrl}/issues` }));

document.addEventListener('DOMContentLoaded', load_webhooks);
