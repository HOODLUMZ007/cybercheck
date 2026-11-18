// Use a full extension page so the permission dialog cannot close the check UI.
chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({url: chrome.runtime.getURL('extension/popup.html')});
});
