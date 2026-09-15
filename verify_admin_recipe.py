from playwright.sync_api import sync_playwright
import os

def run_verification(page):
    page.goto("http://localhost:3000/Liquidmusic/admin")
    page.wait_for_timeout(1000)

    # Login
    page.get_by_placeholder("@White_Blooming").fill("@White_Blooming")
    page.wait_for_timeout(300)
    page.get_by_placeholder("••••••••").fill("365Dca586")
    page.wait_for_timeout(300)
    page.get_by_role("button", name="Войти в систему").click()
    page.wait_for_timeout(1000)

    # Click Production tab
    page.get_by_role("button", name="Производство").click()
    page.wait_for_timeout(1000)

    # Click Recipes sub-tab
    page.get_by_role("button", name="Рецепты").click()
    page.wait_for_timeout(1000)

    # Click Aromas sub-tab
    page.get_by_role("button", name="Аромы").click()
    page.wait_for_timeout(1000)

    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="/home/jules/verification/videos")
        page = context.new_page()
        try:
            run_verification(page)
        finally:
            context.close()
            browser.close()
