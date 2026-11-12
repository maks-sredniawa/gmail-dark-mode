# Chrome Web Store kit

Everything the Chrome Web Store Developer Dashboard asks for, ready to paste or upload. Field
names follow the dashboard's tabs.

## Package

Build `dist/gmail-dark-mode.zip` with the command under
[Build the store package](../README.md#build-the-store-package), then upload it under
**Package → Upload new package**.

The name, the 130-character summary and the version (`0.0.1`) come from `extension/manifest.json`.

## Images

All in [`assets/`](assets/), made by `uv run --script store/capture.py`
from the demo pages in [`demo/`](demo/) and [`promo/`](promo/). Screenshots and tiles are 24-bit PNG
without alpha; the icon keeps the transparent 16 px border the store asks for. The inbox is
fictional: no real mail appears anywhere.

| Dashboard field | File |
| --- | --- |
| Store icon (128×128) | `assets/store-icon-128.png` |
| Screenshots (1280×800), in this order | `assets/screenshot-*.png` |
| Small promo tile (440×280) | `assets/promo-small-440x280.png` |
| Marquee promo tile (1400×560, optional) | `assets/promo-marquee-1400x560.png` |

## Store listing

**Description**

```text
Gmail's own Dark theme darkens the frame around your mail, but HTML emails such as newsletters, receipts and notifications still open on their sender's bright white background. Dark Mode for Gmail darkens those too, so the whole of Gmail on the web goes dark.

What it does
• Darkens the inbox, conversations, message bodies and the compose window
• Keeps photos, avatars and emoji close to their real colours
• Keeps links, labels and brand colours in their own colour family
• Turns on and off with one click on the toolbar icon, and remembers your choice
• Runs only on mail.google.com

Private by design
No account, no tracking, no analytics, no ads and no network requests. The extension never stores or sends your email. The one thing it remembers is whether dark mode is on or off.

Good to know
• If Gmail's own Dark theme is on, the extension leaves the page alone and shows "!" on its icon. Switch Gmail to the Default theme (Settings → Themes) for a full dark mode.
• Pictures with a white background inside an email (logos, signatures) stay white.
• Strong, saturated colours in pictures (a bright red, say) come out a little muted.
• Gmail's picture themes may look wrong; the Default theme works best.

Free, with an optional tip from the icon's right-click menu. Nothing is locked behind it.

Found a screen that's still bright? Email gmaildark.support@maksforge.com or open an issue at https://github.com/maks-sredniawa/gmail-dark-mode/issues

Unofficial: not made, endorsed or supported by Google. Gmail is a trademark of Google LLC.
```

| Field | Value |
| --- | --- |
| Category | Make Chrome Yours → Functionality & UI |
| Language | English |
| Official URL | none |
| Homepage URL | `https://maksforge.com/gmail-dark-mode/` |
| Support URL | `https://github.com/maks-sredniawa/gmail-dark-mode/issues` |
| Mature content | No |

## Privacy practices

**Single purpose**

```text
Makes Gmail on the web dark, including the bodies of HTML emails, with a toolbar button to turn it on or off.
```

**Permission justification: storage**

```text
Remembers one setting, whether dark mode is on or off, in chrome.storage.sync so the choice survives restarts and follows the user's Chrome profile. Nothing else is stored.
```

**Permission justification: contextMenus**

```text
Adds two items to the toolbar icon's right-click menu that open optional tip pages (Buy Me a Coffee, PayPal) in a new tab. No menu items are added to web pages.
```

**Host permission justification** (the content script on `https://mail.google.com/*`)

```text
Darkening Gmail is the extension's only purpose, so its content script runs on mail.google.com and nowhere else. It adds a style sheet and a class to the page, reads the page's text colour to detect Gmail's own Dark theme, and checks whether background pictures have text over them so photos keep their colours. It never stores or sends email content and makes no network requests.
```

**Remote code:** No, I am not using remote code.

**Data usage:** tick none of the data types. The extension collects nothing, matching the
[privacy policy](../docs/privacy-policy.md). Tick all three certifications:

- I do not sell or transfer user data to third parties, outside of the approved use cases
- I do not use or transfer user data for purposes that are unrelated to my item's single purpose
- I do not use or transfer user data to determine creditworthiness or for lending purposes

**Privacy policy URL:** `https://maksforge.com/gmail-dark-mode/privacy-policy`

## Distribution

Free, public, all regions.
