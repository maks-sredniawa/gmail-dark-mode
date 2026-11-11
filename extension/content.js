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

function apply() {
  const gmailDark = gmailIsAlreadyDark();
  const want = enabled && !gmailDark;
  if (root.classList.contains('gdm-on') !== want) root.classList.toggle('gdm-on', want);
  report(gmailDark);
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

// Gmail swaps its theme in place when it is changed in Settings, without a reload.
setInterval(apply, 2000);
