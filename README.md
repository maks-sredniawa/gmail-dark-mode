# Dark Mode for Gmail (Unofficial)

A free Chrome extension that makes the whole of Gmail on the web dark, message bodies included.

Gmail's own Dark theme darkens the frame around your mail, but HTML emails such as newsletters,
receipts and notifications still open on their sender's white background. This extension darkens
those too.

Website: [maksforge.com/gmail-dark-mode](https://maksforge.com/gmail-dark-mode/) · [Privacy policy](https://maksforge.com/gmail-dark-mode/privacy-policy)

In development: not yet on the Chrome Web Store.

## How it works

Gmail keeps its colours in obfuscated class names that change without notice, so the extension
doesn't restyle them one by one. It inverts the page's colours and turns the hues back, which keeps
links, labels and brand colours in their own colour family, then inverts pictures, videos and
avatars back so they keep close to their real colours.

If Gmail is already dark (its own Dark theme), the extension leaves the page alone rather than
inverting it back to light, and marks the toolbar icon in that tab with `!` to say why.

## Features

- Dark inbox, conversations, message bodies and compose window
- Photos, avatars and emoji keep close to their real colours
- One click on the toolbar icon turns it on or off; your choice is remembered
- Runs only on `mail.google.com`
- No tracking, no data collection, no network requests

## Install from source

1. Download or clone this repository.
2. Open `chrome://extensions` and turn on **Developer mode**.
3. Click **Load unpacked** and select the `extension` folder.

## Build the store package

```bash
rm -f dist/gmail-dark-mode.zip && mkdir -p dist && cd extension && zip -r ../dist/gmail-dark-mode.zip . && cd ..
```

The listing text, images and privacy answers for the Chrome Web Store are in [`store/`](store/README.md).

## Test

Loads the extension in headless Chromium against a stand-in Gmail page, as CI does:

```bash
uv run --script test/e2e.py
```

## Known limitations

- Pictures with a white background inside an email (logos, signatures) stay white.
- Pictures keep close to their real colours, but strong, saturated colours (a bright red, say)
  come out muted.
- A background picture with text over it stays inverted, so the text stays readable, unless the
  picture is sized to cover its box (a hero photo), in which case both keep their real colours.
- Gmail's picture themes (a photo behind the inbox) may look wrong; the default theme works best.
- With Gmail's own Dark theme on, the extension stays off, so message bodies keep their white
  backgrounds there. The toolbar icon shows `!` in that tab, and its tooltip says to switch Gmail
  to the Default theme (Settings → Themes) for a full dark mode.
- Google may change Gmail at any time, which could break the theme until the extension is updated.

## Contact

Found a screen that's still bright, or something broke? Email [gmaildark.support@maksforge.com](mailto:gmaildark.support@maksforge.com) or [open an issue](https://github.com/maks-sredniawa/gmail-dark-mode/issues).

## Support

The extension is free. If it saves your eyes, you can leave a tip by right-clicking the toolbar icon,
or here:

- [Buy Me a Coffee](https://buymeacoffee.com/maksforge): card, Apple Pay or Google Pay, no account needed
- [PayPal](https://paypal.me/maksymiliansredniawa)

## Contributing

Dark Mode for Gmail is source-available, not open source: read it, verify it, file issues. Pull
requests are not accepted. See [LICENSE](LICENSE).

## Disclaimer

This is an unofficial project, not affiliated with or endorsed by Google. Gmail is a trademark of
Google LLC.

## License

All rights reserved, source-available. See [LICENSE](LICENSE).
