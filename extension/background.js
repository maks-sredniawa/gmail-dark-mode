const KEY = 'gdmEnabled';

const TIPS = [
  { id: 'tip-card',   title: '☕ Tip by card / Apple Pay / Google Pay', url: 'https://buymeacoffee.com/maksforge' },
  { id: 'tip-paypal', title: '💙 Tip with PayPal',                       url: 'https://paypal.me/maksymiliansredniawa' }
];

function showState(on) {
  chrome.action.setBadgeText({ text: on ? '' : 'off' });
  chrome.action.setBadgeBackgroundColor({ color: '#5f6368' });
  chrome.action.setTitle({
    title: on ? 'Gmail dark mode: on — click to turn off' : 'Gmail dark mode: off — click to turn on'
  });
}

async function refresh() {
  const r = await chrome.storage.sync.get({ [KEY]: true });
  showState(r[KEY]);
}

chrome.action.onClicked.addListener(async () => {
  const r = await chrome.storage.sync.get({ [KEY]: true });
  await chrome.storage.sync.set({ [KEY]: !r[KEY] });
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes[KEY]) refresh();
});

chrome.contextMenus.onClicked.addListener((info) => {
  const tip = TIPS.find((t) => t.id === info.menuItemId);
  if (tip) chrome.tabs.create({ url: tip.url });
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
    for (const t of TIPS) {
      chrome.contextMenus.create({ id: t.id, title: t.title, contexts: ['action'] });
    }
  });
});

refresh();
