function openHome() {
  const url = chrome.runtime.getManifest().homepage_url;
  if (url !== undefined) {
    chrome.tabs.create({ url });
  }
}

function openSupport() {
  const url = chrome.runtime.getManifest().homepage_url;
  if (url !== undefined) {
    chrome.tabs.create({ url: `${url}/issues` });
  }
}

function openOptions() {
  chrome.runtime.openOptionsPage();
}

const homeMenu = document.getElementById('home') as HTMLAnchorElement;
homeMenu.text = chrome.runtime.getManifest().name;
homeMenu.addEventListener('click', openHome);

const optionsMenu = document.getElementById('options') as HTMLAnchorElement;
optionsMenu.addEventListener('click', openOptions);

const supportMenu = document.getElementById('support') as HTMLAnchorElement;
supportMenu.addEventListener('click', openSupport);
