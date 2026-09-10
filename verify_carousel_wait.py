import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 720})

        await page.goto("http://localhost:3004")
        await page.wait_for_timeout(1000)

        # Click Collections tab
        await page.locator("text=Collections").click()
        await page.wait_for_timeout(1000)

        # Click Spring Collection
        await page.locator("text=Spring Collection").first.click()
        await page.wait_for_timeout(2000)

        # Hover over vinyl spin wrapper with force
        try:
            await page.wait_for_selector(".vinyl-spin-wrapper", timeout=5000)
            print("Found vinyl spin wrapper!")

            vinyl = page.locator(".vinyl-spin-wrapper").first
            await vinyl.hover(force=True)
            await page.wait_for_timeout(1000)
        except Exception as e:
            print("Error finding vinyl:", e)

        await page.screenshot(path="/home/jules/verification/screenshots/final_verification_wait.png")
        await browser.close()

asyncio.run(main())
