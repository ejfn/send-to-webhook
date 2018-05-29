function getWebhooksTextArea(): HTMLTextAreaElement {
  return document.getElementById('webhooks') as HTMLTextAreaElement;
}

function getSaveStatus(): HTMLSpanElement {
  return document.getElementById('save-status') as HTMLSpanElement;
}

function getSaveButton(): HTMLButtonElement {
  return document.getElementById('save') as HTMLButtonElement;
}

// Saves options to chrome.storage
function save_options() {
  const webhooksTa = getWebhooksTextArea();
  let webhooks;
  try {
    webhooks = JSON.parse(webhooksTa.value);
  } catch (error) {
    const status = getSaveStatus();
    status.textContent = 'Invalid json.';
    return;
  }
  chrome.storage.sync.set({
    webhooks: JSON.stringify(webhooks)
  }, () => {
    // reload extension
    chrome.runtime.reload();
    const status = getSaveStatus();
    status.textContent = 'Options saved.';
    setTimeout(() => {
      status.textContent = '';
      window.close();
    }, 750);
  });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
  chrome.storage.sync.get({
    webhooks: '[]'
  }, (items) => {
    const webhooks = JSON.parse(items.webhooks);
    const webhooksTa = getWebhooksTextArea();
    webhooksTa.value = JSON.stringify(webhooks, null, 2);
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
const saveButton = getSaveButton();
saveButton.addEventListener('click', save_options);
