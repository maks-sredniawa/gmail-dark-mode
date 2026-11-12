const KEY = 'gdmEnabled';
const root = document.documentElement;
let enabled = true;
let settingLoaded = false;
let reported = '';

function luminance(rgb) {
  const [r, g, b] = (rgb.match(/\d+(\.\d+)?/g) || []).map(Number);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function gmailIsAlreadyDark() {
  return !!document.body && luminance(getComputedStyle(document.body).color) > 0.6;
}

function report(gmailDark) {
  const state = JSON.stringify({ enabled, gmailDark });
  if (!settingLoaded || state === reported) return;
  reported = state;
  chrome.runtime.sendMessage({ type: 'gmailTheme', enabled, gmailDark });
}

const BACKGROUND_PICTURE = '[style*="background" i][style*="url(" i], [background]';
let markQueued = false;

function hasText(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) if (walker.currentNode.data.trim()) return true;
  return false;
}

function isPicture(el) {
  return !hasText(el) || getComputedStyle(el).backgroundSize === 'cover';
}

function markPictures() {
  markQueued = false;
  if (!root.classList.contains('gdm-on')) return;
  for (const el of document.querySelectorAll(BACKGROUND_PICTURE)) {
    const picture = isPicture(el);
    if (el.classList.contains('gdm-picture') !== picture) el.classList.toggle('gdm-picture', picture);
  }
}

function queueMarkPictures() {
  if (markQueued) return;
  markQueued = true;
  setTimeout(markPictures, 100);
}

function apply() {
  const gmailDark = gmailIsAlreadyDark();
  const want = enabled && !gmailDark;
  if (root.classList.contains('gdm-on') !== want) root.classList.toggle('gdm-on', want);
  report(gmailDark);
  markPictures();
}

apply();

chrome.storage.sync.get({ [KEY]: true }, (r) => {
  enabled = r[KEY];
  settingLoaded = true;
  apply();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'sync' && changes[KEY]) {
    enabled = changes[KEY].newValue;
    apply();
  }
});

new MutationObserver(apply).observe(root, { attributes: true, attributeFilter: ['class'] });
new MutationObserver(queueMarkPictures).observe(root, { childList: true, subtree: true });

// Gmail swaps its theme in place when it is changed in Settings, without a reload.
setInterval(apply, 2000);
