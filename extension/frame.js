// Google's account switcher, apps grid and contact cards are frames inside Gmail: Gmail's filter
// inverts them along with the page, and dark.css cannot reach in to turn their pictures back.
const root = document.documentElement;
const ancestors = location.ancestorOrigins;
let markQueued = false;

function hasText(el) {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) if (walker.currentNode.data.trim()) return true;
  return false;
}

// App icons are sprites set by Google's own style sheets, so only the computed style shows them.
function markPictures() {
  markQueued = false;
  if (!root.classList.contains('gdm-frame-on') || !document.body) return;
  for (const el of document.body.querySelectorAll('*')) {
    const style = getComputedStyle(el);
    const picture = style.backgroundImage.includes('url(') && (!hasText(el) || style.backgroundSize === 'cover');
    if (el.classList.contains('gdm-picture') !== picture) el.classList.toggle('gdm-picture', picture);
  }
}

function queueMarkPictures() {
  if (markQueued) return;
  markQueued = true;
  setTimeout(markPictures, 100);
}

function followGmail(on) {
  if (root.classList.contains('gdm-frame-on') !== on) root.classList.toggle('gdm-frame-on', on);
  queueMarkPictures();
}

if (ancestors.length && ancestors[ancestors.length - 1] === 'https://mail.google.com') {
  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'gdmFrames') followGmail(msg.on);
  });
  chrome.runtime.sendMessage({ type: 'gdmFrameAsk' }).then(followGmail);
  new MutationObserver(queueMarkPictures).observe(root, { childList: true, subtree: true });
  addEventListener('load', queueMarkPictures);
}
