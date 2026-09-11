import time
from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Navigate to app
    page.goto("http://localhost:3000")
    page.wait_for_timeout(1000)

    # Click on "Collections" navigation link to switch to Catalog view (which defaults to Skewed Carousel)
    page.locator("#nav-link-collections").click()
    page.wait_for_timeout(1500)

    # Take screenshot of the initial Skewed Carousel view over video background
    page.screenshot(path="/home/jules/verification/screenshots/skewed_carousel_initial.png")
    page.wait_for_timeout(1000)

    # Click Next button to navigate through carousel
    next_btn = page.get_by_role("button", name="Next")
    if next_btn.is_visible():
        next_btn.click()
        page.wait_for_timeout(1000)
        next_btn.click()
        page.wait_for_timeout(1000)

    page.screenshot(path="/home/jules/verification/screenshots/skewed_carousel_scrolled.png")
    page.wait_for_timeout(1000)

    # Final screenshot for official verification report
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1440, "height": 900},
            record_video_dir="/home/jules/verification/videos"
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
