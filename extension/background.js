const KEY = 'gdmEnabled';

const TIPS = [
  { id: 'tip-card',   title: '☕ Tip by card / Apple Pay / Google Pay', url: 'https://buymeacoffee.com/maksforge' },
  { id: 'tip-paypal', title: '💙 Tip with PayPal',                       url: 'https://paypal.me/maksymiliansredniawa' }
];

function showState(on) {
  chrome.action.setBadgeText({ text: on ? '' : 'off' });
  chrome.action.setBadgeBackgroundColor({ color: '#5f6368' });
}

chrome.action.onClicked.addListener(async () => {
  const r = await chrome.storage.sync.get({ [KEY]: true });
  const next = !r[KEY];
  await chrome.storage.sync.set({ [KEY]: next });
  showState(next);
});

chrome.contextMenus.onClicked.addListener((info) => {
  const tip = TIPS.find((t) => t.id === info.menuItemId);
  if (tip) chrome.tabs.create({ url: tip.url });
});

async function init() {
  const r = await chrome.storage.sync.get({ [KEY]: true });
  showState(r[KEY]);
}

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    for (const t of TIPS) {
      chrome.contextMenus.create({ id: t.id, title: t.title, contexts: ['action'] });
    }
  });
  init();
});
chrome.runtime.onStartup.addListener(init);
