const MATCH_PATTERNS_URL = 'https://developer.chrome.com/docs/extensions/develop/concepts/match-patterns';

// Helper function to escape HTML special characters
const escapeHtml = (str: string): string => {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
};

// Extended webhook type to track raw payload string for editing
interface WebHookWithRawPayload extends WebHook {
  rawPayload?: string;
}

document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('root');
  if (!root) {
    console.error('Root element not found');
    return;
  }

  let webhooks: WebHookWithRawPayload[] = [];
  let saveStatus: string = '';
  let error: boolean = false;

  const loadConfig = async () => {
    const data: StoredData = {
      webhooks: '[]',
    };
    const items: StoredData = await chrome.storage.sync.get(data) as StoredData;
    webhooks = JSON.parse(items.webhooks).map((wh: WebHook) => ({
      ...wh,
      action: {
        method: wh.action?.method || 'POST',
        url: wh.action?.url || '',
        payload: wh.action?.payload,
        headers: wh.action?.headers || {},
      },
      // Store raw payload string for editing
      rawPayload: wh.action?.payload ? JSON.stringify(wh.action.payload, null, 2) : '',
    }));
    render();
  };

  const onSave = () => {
    const webhookElements = document.querySelectorAll('.webhook-entry');
    const newWebhooks: WebHook[] = [];
    let hasError = false;

    webhookElements.forEach(element => {
      if (hasError) return; // Skip remaining if error occurred

      const name = (element.querySelector('.webhook-name') as HTMLInputElement)?.value || '';
      const documentUrlPatterns = (element.querySelector('.document-url-patterns') as HTMLTextAreaElement)?.value.split('\n').filter(p => p.trim() !== '') || [];
      const targetUrlPatterns = (element.querySelector('.target-url-patterns') as HTMLTextAreaElement)?.value.split('\n').filter(p => p.trim() !== '') || [];
      const method = (element.querySelector('.action-method') as HTMLSelectElement)?.value as 'GET' | 'POST' || 'POST';
      const url = (element.querySelector('.action-url') as HTMLInputElement)?.value || '';
      const payload = (element.querySelector('.action-payload') as HTMLTextAreaElement)?.value || '';

      const headers: { [key: string]: string } = {};
      element.querySelectorAll('.header-entry').forEach(headerElement => {
        const key = (headerElement.querySelector('.header-key') as HTMLInputElement)?.value.trim();
        const value = (headerElement.querySelector('.header-value') as HTMLInputElement)?.value.trim();
        if (key && value) {
          headers[key] = value;
        }
      });

      const action: WebHookAction = {
        url,
        method,
      };

      if (payload) {
        try {
          action.payload = JSON.parse(payload);
        } catch (e) {
          saveStatus = `Invalid JSON payload for webhook: ${name || '(unnamed)'}`;
          error = true;
          hasError = true;
          render();
          return;
        }
      }
      if (Object.keys(headers).length > 0) {
        action.headers = headers;
      }

      newWebhooks.push({
        name,
        documentUrlPatterns,
        targetUrlPatterns,
        action,
      });
    });

    // Don't save if there was a JSON parsing error
    if (hasError) return;

    const data: Partial<StoredData> = {
      webhooks: JSON.stringify(newWebhooks)
    };

    chrome.storage.sync.set(data, () => {
      saveStatus = 'Options saved.';
      error = false;
      webhooks = newWebhooks.map(wh => ({
        ...wh,
        rawPayload: wh.action?.payload ? JSON.stringify(wh.action.payload, null, 2) : '',
      })); // Update local state after saving
      render();
      setTimeout(() => {
        saveStatus = '';
        render();
      }, 750);
    });
  };

  const addWebhook = () => {
    webhooks.push({
      name: '',
      action: { url: '', method: 'POST', headers: {} },
      rawPayload: '',
    });
    render();
  };

  const removeWebhook = (index: number) => {
    webhooks.splice(index, 1);
    render();
  };

  const addHeader = (webhookIndex: number) => {
    if (!webhooks[webhookIndex].action.headers) {
      webhooks[webhookIndex].action.headers = {};
    }
    // Add a dummy key to trigger re-render and new input fields
    const newKey = `new-header-${Date.now()}`;
    webhooks[webhookIndex].action.headers[newKey] = '';
    render();
  };

  const removeHeader = (webhookIndex: number, headerKey: string) => {
    if (webhooks[webhookIndex].action.headers) {
      delete webhooks[webhookIndex].action.headers[headerKey];
    }
    render();
  };

  const render = () => {
    root.innerHTML = `
      <div class='options'>
        <h3>WebHooks Configuration</h3>
        <div id="webhookList">
          ${webhooks.map((webhook, index) => `
            <div class="webhook-entry">
              <h4>Webhook ${index + 1}: ${escapeHtml(webhook.name) || '(New Webhook)'}</h4>
              <label>Webhook Name:</label>
              <input type="text" class="webhook-name" value="${escapeHtml(webhook.name || '')}" data-index="${index}" placeholder="e.g., My Slack Channel, Bitrise iOS Upload" />

              <label>Document URL Patterns: <a href="${MATCH_PATTERNS_URL}" target="_blank">(Match Patterns)</a></label>
              <textarea class="document-url-patterns" data-index="${index}" placeholder="One pattern per line. Webhook appears on pages matching these URLs.">${escapeHtml((webhook.documentUrlPatterns || []).join('\n'))}</textarea>

              <label>Target URL Patterns: <a href="${MATCH_PATTERNS_URL}" target="_blank">(Match Patterns)</a></label>
              <textarea class="target-url-patterns" data-index="${index}" placeholder="One pattern per line. Webhook applies to links/images matching these URLs.">${escapeHtml((webhook.targetUrlPatterns || []).join('\n'))}</textarea>

              <label>HTTP Method:</label>
              <select class="action-method" data-index="${index}">
                <option value="POST" ${webhook.action?.method === 'POST' ? 'selected' : ''}>POST</option>
                <option value="GET" ${webhook.action?.method === 'GET' ? 'selected' : ''}>GET</option>
              </select>

              <label>Webhook Endpoint URL:</label>
              <input type="text" class="action-url" value="${escapeHtml(webhook.action?.url || '')}" data-index="${index}" placeholder="e.g., https://hooks.slack.com/services/..." />

              <label>Request Body (JSON):</label>
              <textarea class="action-payload" data-index="${index}" placeholder="JSON payload. {{content}}, {{isoDateTime}}, {{localDateTime}} are supported.">${escapeHtml(webhook.rawPayload || '')}</textarea>

              <label>Request Headers:</label>
              <div class="headers-container" data-webhook-index="${index}">
                ${Object.entries(webhook.action?.headers || {}).map(([key, value]) => `
                  <div class="header-entry">
                    <input type="text" class="header-key" value="${escapeHtml(key)}" data-webhook-index="${index}" data-header-key="${escapeHtml(key)}" placeholder="Header Name" />
                    <input type="text" class="header-value" value="${escapeHtml(value)}" data-webhook-index="${index}" data-header-key="${escapeHtml(key)}" placeholder="Header Value" />
                    <button class="remove-header" data-webhook-index="${index}" data-header-key="${escapeHtml(key)}">Remove</button>
                  </div>
                `).join('')}
                <button class="add-header" data-webhook-index="${index}">Add Header</button>
              </div>

              <button class="remove-webhook" data-index="${index}">Remove Webhook</button>
            </div>
          `).join('')}
        </div>
        <div class="bottom-buttons">
          <button id="addWebhook">Add New Webhook</button>
          <div class='buttons'>
            <span class="${error ? 'error' : ''}">${saveStatus}</span>
            <button id="saveButton">Save Settings</button>
          </div>
        </div>
      </div>
    `;

    document.getElementById('addWebhook')?.addEventListener('click', addWebhook);
    document.getElementById('saveButton')?.addEventListener('click', onSave);

    document.querySelectorAll('.remove-webhook').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt((e.target as HTMLButtonElement).dataset.index || '0');
        removeWebhook(index);
      });
    });

    document.querySelectorAll('.add-header').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = parseInt((e.target as HTMLButtonElement).dataset.webhookIndex || '0');
        addHeader(index);
      });
    });

    document.querySelectorAll('.remove-header').forEach(button => {
      button.addEventListener('click', (e) => {
        const webhookIndex = parseInt((e.target as HTMLButtonElement).dataset.webhookIndex || '0');
        const headerKey = (e.target as HTMLButtonElement).dataset.headerKey || '';
        removeHeader(webhookIndex, headerKey);
      });
    });

    // Re-attach input listeners for dynamic fields
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('.webhook-name, .document-url-patterns, .target-url-patterns, .action-method, .action-url, .action-payload').forEach(input => {
      input.addEventListener('input', (e) => {
        const index = parseInt((e.target as HTMLElement).dataset.index || '0');
        const className = (e.target as HTMLElement).className; // Use className directly
        const value = (e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;

        // Update the webhook object in the array directly
        const currentWebhook = webhooks[index];
        if (!currentWebhook) return;

        // Use classList.contains for more robust class checking
        if (className.includes('webhook-name')) {
          currentWebhook.name = value;
        } else if (className.includes('document-url-patterns')) {
          currentWebhook.documentUrlPatterns = value.split('\n').filter(p => p.trim() !== '');
        } else if (className.includes('target-url-patterns')) {
          currentWebhook.targetUrlPatterns = value.split('\n').filter(p => p.trim() !== '');
        } else if (className.includes('action-method')) {
          currentWebhook.action.method = value as 'GET' | 'POST';
        } else if (className.includes('action-url')) {
          currentWebhook.action.url = value;
        } else if (className.includes('action-payload')) {
          // Store raw payload string, don't parse during typing
          // JSON will be validated on save
          currentWebhook.rawPayload = value;
        }
      });
    });

    document.querySelectorAll<HTMLInputElement>('.header-key, .header-value').forEach(input => {
      input.addEventListener('input', (e) => {
        const webhookIndex = parseInt((e.target as HTMLElement).dataset.webhookIndex || '0');
        const oldHeaderKey = (e.target as HTMLElement).dataset.headerKey || '';
        const newHeaderValue = (e.target as HTMLInputElement).value;
        const isKeyField = (e.target as HTMLElement).classList.contains('header-key');

        const currentWebhook = webhooks[webhookIndex];
        if (!currentWebhook || !currentWebhook.action.headers) return;

        if (isKeyField) {
          const newKey = newHeaderValue;
          const existingValue = currentWebhook.action.headers[oldHeaderKey];
          delete currentWebhook.action.headers[oldHeaderKey];
          currentWebhook.action.headers[newKey] = existingValue;
          (e.target as HTMLElement).dataset.headerKey = newKey; // Update data-header-key
        } else {
          currentWebhook.action.headers[oldHeaderKey] = newHeaderValue;
        }
      });
    });
  };

  await loadConfig();
});