# /// script
# requires-python = ">=3.10"
# dependencies = ["playwright==1.65.0"]
# ///
"""Loads the unpacked extension in headless Chromium against a stand-in Gmail page."""
import base64
import pathlib
import sys
import tempfile

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent
EXTENSION = ROOT / "extension"
PAGE = (ROOT / "test" / "gmail.html").read_text()
PIXEL = base64.b64decode(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
)
INVERT_BACK = "invert(1) hue-rotate(180deg)"
failures = []


def check(name, actual, expected):
    ok = actual == expected
    print(f"{'PASS' if ok else 'FAIL'} {name}" + ("" if ok else f": got {actual!r}, want {expected!r}"), flush=True)
    if not ok:
        failures.append(name)


def serve(route):
    url = route.request.url
    if url.startswith("https://mail.google.com/mail/"):
        route.fulfill(status=200, content_type="text/html", body=PAGE)
    elif url.endswith(".png"):
        route.fulfill(status=200, content_type="image/png", body=PIXEL)
    else:
        route.abort()


with sync_playwright() as p:
    context = p.chromium.launch_persistent_context(
        tempfile.mkdtemp(),
        channel="chromium",
        headless=True,
        args=[f"--disable-extensions-except={EXTENSION}", f"--load-extension={EXTENSION}"],
    )
    worker = context.service_workers[0] if context.service_workers else context.wait_for_event("serviceworker")
    context.route("**/*", serve)
    page = context.new_page()
    page.goto("https://mail.google.com/mail/u/0/#inbox", wait_until="load")

    def is_dark():
        return page.evaluate("document.documentElement.classList.contains('gdm-on')")

    def filter_of(selector):
        return page.evaluate(f"getComputedStyle(document.querySelector('{selector}')).filter")

    def set_enabled(on):
        worker.evaluate(f"chrome.storage.sync.set({{gdmEnabled: {'true' if on else 'false'}}})")
        page.wait_for_timeout(300)

    page.wait_for_timeout(500)
    check("dark by default", is_dark(), True)
    check("page is inverted", "invert(0.92)" in filter_of("html"), True)
    check("photos are turned back", filter_of("#photo"), INVERT_BACK)
    check("background pictures are turned back", filter_of("#banner"), INVERT_BACK)
    check("a picture inside a turned-back one is left alone", filter_of("#nested"), "none")
    check("<picture> is turned back once", (filter_of("#picture"), filter_of("#picture-img")), (INVERT_BACK, "none"))
    check("the Gmail wordmark stays inverted", filter_of("#wordmark"), "none")

    set_enabled(False)
    check("toggling off restores Gmail", (is_dark(), filter_of("html")), (False, "none"))
    set_enabled(True)
    check("toggling on darkens again", is_dark(), True)

    page.evaluate("document.body.style.color = 'rgb(232, 234, 237)'")
    page.wait_for_timeout(2500)
    check("stays off while Gmail's own Dark theme is on", is_dark(), False)
    page.evaluate("document.body.style.color = ''")
    page.wait_for_timeout(2500)
    check("comes back when Gmail turns light again", is_dark(), True)

    set_enabled(False)
    page.reload(wait_until="load")
    page.wait_for_timeout(500)
    check("the off setting survives a reload", is_dark(), False)

    context.close()

sys.exit(1 if failures else 0)
