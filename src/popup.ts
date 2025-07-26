import { StoredData } from './typings/storedData.js';
import { WebHook, WebHookAction } from './typings/webhook.js';
import { escapeJsonValue } from './utils.js';

const PROJECT_PAGE_URL = 'https://github.com/ejfn/send-to-webhook';

document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('root');
  if (!root) {
    console.error('Root element not found');
    return;
  }

  let webhooks: WebHook[] = [];
  let previousIndex: number = -1;
  let content: string = '';
  let selectedIndex: number = -1;
  let sendStatus: string = '';
  let error: boolean = false;

  const loadConfig = async () => {
    const data: StoredData = {
      webhooks: '[]',
      previousIndex: -1
    };
    const items: StoredData = await chrome.storage.sync.get(data) as StoredData;
    webhooks = JSON.parse(items.webhooks);
    previousIndex = items.previousIndex;

    if (previousIndex >= 0 && previousIndex < webhooks.length) {
      selectedIndex = previousIndex;
    } else if (webhooks.length > 0) {
      selectedIndex = 0;
    }
    render();
  };

  const openOptionsPage = () => {
    chrome.runtime.openOptionsPage();
  };

  const openProjectPage = () => {
    chrome.tabs.create({ url: PROJECT_PAGE_URL });
  };

  const onTextChange = (e: Event) => {
    content = (e.target as HTMLTextAreaElement).value;
  };

  const onSelectChange = (e: Event) => {
    selectedIndex = (e.target as HTMLSelectElement).selectedIndex;
  };

  const onSend = async () => {
    const escapedContent = escapeJsonValue(content);
    if (selectedIndex === -1) {
      return;
    }
    const webhook = webhooks[selectedIndex];
    const webaction = webhook.action;
    if (webaction !== undefined) {
      const { method, url, payload, headers } = webaction;
      let body;
      if (payload !== undefined) {
        body = JSON.stringify(payload).replace('%s', escapedContent);
      }

      chrome.runtime.sendMessage({ type: 'SET_BROWSER_ICON', status: 'Sending' });
      sendStatus = 'Sending...';
      error = false;
      render();

      try {
        const resp = await fetch(url, {
          method: method || 'POST',
          headers: headers || {},
          body,
          mode: 'no-cors'
        });

        if (resp.status >= 400) {
          chrome.runtime.sendMessage({ type: 'SET_BROWSER_ICON', status: 'Error', title: `Error: ${resp.status}` });
          sendStatus = `${resp.status}`;
          error = true;
        } else {
          chrome.runtime.sendMessage({ type: 'SET_BROWSER_ICON', status: 'OK' });
          sendStatus = 'Sent.';
          error = false;
          setTimeout(() => {
            chrome.runtime.sendMessage({ type: 'SET_BROWSER_ICON', status: 'Default' });
            sendStatus = '';
            error = false;
            render();
          }, 750);
        }
      } catch (err: any) {
        chrome.runtime.sendMessage({ type: 'SET_BROWSER_ICON', status: 'Error', title: `Error: ${err.message}` });
        sendStatus = `${err.message}`;
        error = true;
      }
      render();

      // save last hook
      const data: Partial<StoredData> = {
        previousIndex: selectedIndex
      };
      chrome.storage.sync.set(data);
    }
  };

  const render = () => {
    root.innerHTML = `
      <div class='popup'>
        <div class='arbitrary'>
          <label class='title'>Send arbitrary</label>
          <textarea id="contentInput">${content}</textarea>
          <div class='buttons'>
            <select id="webhookSelect">
              ${webhooks.map((wh, i) => `<option value="${i}" ${i === selectedIndex ? 'selected' : ''}>${wh.name}</option>`).join('')}
            </select>
            <button id="sendButton">Send</button>
          </div>
          <div class="status-message ${error ? 'error' : ''}">${sendStatus}</div>
        </div>
        <hr />
        <div class="nav-links">
          <a href='#' id="optionsPageLink">Options</a>
          <a href="${PROJECT_PAGE_URL}" target="_blank">Project page</a>
        </div>
      </div>
    `;

    document.getElementById('contentInput')?.addEventListener('input', onTextChange);
    document.getElementById('webhookSelect')?.addEventListener('change', onSelectChange);
    document.getElementById('sendButton')?.addEventListener('click', onSend);
    document.getElementById('optionsPageLink')?.addEventListener('click', openOptionsPage);
    document.getElementById('projectPageLink')?.addEventListener('click', openProjectPage);
  };

  await loadConfig();
});