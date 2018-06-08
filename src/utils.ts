export function escapeJsonValue(value: string | undefined) {
  const o: string[] = [value || ''];
  const str = JSON.stringify(o);
  return str.substring(2, str.length - 2);
}

export function setBrowserIcon(status: 'Default' | 'OK' | 'Error' | 'Sending', title?: string) {
  switch (status) {
    case 'OK':
      chrome.browserAction.setBadgeText({ text: '✓' });
      chrome.browserAction.setBadgeBackgroundColor({ color: '#00C851' });
      chrome.browserAction.setTitle({ title: title || 'Sent.' })
      break;
    case 'Error':
      chrome.browserAction.setBadgeText({ text: '!' });
      chrome.browserAction.setBadgeBackgroundColor({ color: '#ff4444' });
      chrome.browserAction.setTitle({ title: title || 'Error' })
      break;
    case 'Sending':
      chrome.browserAction.setBadgeText({ text: '…' });
      chrome.browserAction.setBadgeBackgroundColor({ color: '#ffbb33' });
      chrome.browserAction.setTitle({ title: title || 'Sending...' })
      break;
    default:
      chrome.browserAction.setBadgeText({ text: '' });
      chrome.browserAction.setTitle({ title: title || '' })
      break;
  }
}
