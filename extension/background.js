const KEY = 'gdmEnabled';

const TIPS = [
  { id: 'tip-card',   title: '☕ Tip by card / Apple Pay / Google Pay', url: 'https://buymeacoffee.com/maksforge' },
  { id: 'tip-paypal', title: '💙 Tip with PayPal',                       url: 'https://paypal.me/maksymiliansredniawa' }
];

const GMAIL_DARK_THEME_TITLE =
  'Gmail is using its own Dark theme, which leaves emails white. ' +
  'Switch Gmail to the Default theme (Settings → Themes) for a full dark mode.';

function titleFor(on) {
  return on ? 'Gmail dark mode: on — click to turn off' : 'Gmail dark mode: off — click to turn on';
}

function showState(on) {
  chrome.action.setBadgeText({ text: on ? '' : 'off' });
  chrome.action.setBadgeBackgroundColor({ color: '#5f6368' });
  chrome.action.setTitle({ title: titleFor(on) });
}

function showTabState(tabId, { enabled, gmailDark }) {
  const warn = enabled && gmailDark;
  chrome.action.setBadgeText({ tabId, text: warn ? '!' : null });
  // setTitle has no way to drop a tab's title back to the global one, so the tab mirrors it instead.
  chrome.action.setTitle({ tabId, title: warn ? GMAIL_DARK_THEME_TITLE : titleFor(enabled) });
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

chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === 'gmailTheme' && sender.tab) showTabState(sender.tab.id, msg);
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
