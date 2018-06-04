const textArea = document.getElementById('webhooks') as HTMLTextAreaElement;
const saveStatus = document.getElementById('save-status') as HTMLSpanElement;
const saveButton = document.getElementById('save') as HTMLButtonElement;

// Saves options to chrome.storage
function save_options() {
  let webhooks: Webhook[];
  try {
    webhooks = JSON.parse(textArea.value);
  } catch (error) {
    saveStatus.className = 'error';
    saveStatus.textContent = 'Invalid json!';
    return;
  }
  chrome.storage.sync.set({
    webhooks: JSON.stringify(webhooks)
  }, () => {
    // reload extension
    chrome.runtime.reload();
    saveStatus.className = '';
    saveStatus.textContent = 'Options saved.';
    setTimeout(() => {
      saveStatus.textContent = '';
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
    const webhooks: Webhook[] = JSON.parse(items.webhooks);
    textArea.value = JSON.stringify(webhooks, null, 2);
  });
}

document.addEventListener('DOMContentLoaded', restore_options);
saveButton.addEventListener('click', save_options);
