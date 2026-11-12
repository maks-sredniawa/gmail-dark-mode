# /// script
# requires-python = ">=3.10"
# dependencies = ["playwright==1.65.0", "pillow==11.3.0"]
# ///
import base64
import io
import pathlib
import sys
import tempfile

from PIL import Image
from playwright.sync_api import sync_playwright

STORE = pathlib.Path(__file__).resolve().parent
ROOT = STORE.parent
EXTENSION = ROOT / "extension"
DEMO = STORE / "demo"
PROMO = STORE / "promo"
ASSETS = STORE / "assets"
GMAIL = "https://mail.google.com/mail/u/0/"


def log(message):
    print(message, file=sys.stderr, flush=True)


def save(png, name, size):
    image = Image.open(io.BytesIO(png))
    if image.size != size:
        sys.exit(f"{name}: got {image.size}, want {size}")
    image.convert("RGB").save(ASSETS / name, optimize=True)
    log(f"  wrote store/assets/{name}")


def serve_demo(route):
    page = route.request.url.removeprefix(GMAIL).split("#")[0].split("?")[0] or "inbox"
    path = DEMO / f"{page}.html"
    if path.is_file():
        route.fulfill(status=200, content_type="text/html", body=path.read_text())
    else:
        route.abort()


def data_uri(png):
    return "data:image/png;base64," + base64.b64encode(png).decode()


ASSETS.mkdir(exist_ok=True)
demos = {"message": "message", "inbox": "inbox", "compose": "inbox#compose"}
log(f"Capturing {len(demos)} demo screens, the before/after frame, two promo tiles and the store icon")

with sync_playwright() as p:
    context = p.chromium.launch_persistent_context(
        tempfile.mkdtemp(),
        channel="chromium",
        headless=True,
        viewport={"width": 1280, "height": 800},
        args=[f"--disable-extensions-except={EXTENSION}", f"--load-extension={EXTENSION}"],
    )
    worker = context.service_workers[0] if context.service_workers else context.wait_for_event("serviceworker")
    context.route(f"{GMAIL}**", serve_demo)
    context.route("https://mail.google.com/favicon.ico", lambda route: route.abort())
    page = context.new_page()

    def capture(demo, dark):
        worker.evaluate(f"chrome.storage.sync.set({{gdmEnabled: {'true' if dark else 'false'}}})")
        page.goto("about:blank")
        page.goto(GMAIL + demos[demo], wait_until="load")
        page.wait_for_timeout(600)
        on = page.evaluate("document.documentElement.classList.contains('gdm-on')")
        if on != dark:
            sys.exit(f"{demo}: dark mode is {'on' if on else 'off'}, expected {'on' if dark else 'off'}")
        return page.screenshot()

    shots = {}
    for i, demo in enumerate(demos, 1):
        log(f"[{i}/{len(demos)}] {demo} ...")
        shots[demo] = (capture(demo, dark=False), capture(demo, dark=True))

    frame = context.new_page()
    compare = None
    if "message" in shots and (PROMO / "compare.html").is_file():
        log("Before/after frame ...")
        light, dark = shots["message"]
        html = (
            (PROMO / "compare.html").read_text()
            .replace("../assets/message-light.png", data_uri(light))
            .replace("../assets/message-dark.png", data_uri(dark))
        )
        frame.set_viewport_size({"width": 1280, "height": 800})
        frame.set_content(html, wait_until="load")
        compare = frame.screenshot()

    order = ["message", "before-after", "inbox", "compose"]
    screenshots = {demo: dark for demo, (_, dark) in shots.items()}
    if compare:
        screenshots["before-after"] = compare
    numbered = [s for s in order if s in screenshots]
    for old in ASSETS.glob("screenshot-*.png"):
        old.unlink()
    for n, name in enumerate(numbered, 1):
        save(screenshots[name], f"screenshot-{n}-{name}.png", (1280, 800))

    for name, (width, height) in {"tile": (440, 280), "marquee": (1400, 560)}.items():
        log(f"Promo {name} ...")
        frame.set_viewport_size({"width": width, "height": height})
        frame.goto((PROMO / f"{name}.html").as_uri(), wait_until="load")
        save(frame.screenshot(), f"promo-{'small' if name == 'tile' else name}-{width}x{height}.png", (width, height))

    log("Store icon ...")
    icon = (ROOT / "art" / "icon.svg").read_text()
    frame.set_viewport_size({"width": 128, "height": 128})
    frame.set_content(
        "<style>html,body{margin:0;background:transparent}svg{display:block;width:96px;height:96px;margin:16px}</style>" + icon
    )
    png = frame.screenshot(omit_background=True)
    Image.open(io.BytesIO(png)).save(ASSETS / "store-icon-128.png", optimize=True)
    log("  wrote store/assets/store-icon-128.png")

    context.close()

log("Done")
