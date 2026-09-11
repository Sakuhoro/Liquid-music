import os
import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            viewport={"width": 1280, "height": 800},
            record_video_dir="/home/jules/verification/videos"
        )
        page = await context.new_page()

        # Navigate to homepage
        await page.goto("http://localhost:3000")
        await page.wait_for_timeout(1000)

        # Click on "Все коллекции" or Catalog navigation to view Skewed Carousel
        catalog_btn = page.locator("text=Все коллекции").first
        if await catalog_btn.is_visible():
            await catalog_btn.click()
            await page.wait_for_timeout(1500)

        # Capture Skewed Carousel Screenshot
        await page.screenshot(path="/home/jules/verification/screenshots/skewed_carousel.png")

        # Click on a collection card inside Skewed Carousel to go to specific collection
        spring_card = page.locator("text=Spring Collection").first
        if await spring_card.is_visible():
            await spring_card.click()
            await page.wait_for_timeout(1500)

        # Capture 3D Gallery Dolly view
        await page.screenshot(path="/home/jules/verification/screenshots/dolly_gallery.png")

        # Click on a vinyl item to open Product Detail Modal
        vinyl_item = page.locator(".vinyl-spin-wrapper").first
        if await vinyl_item.is_visible():
            await vinyl_item.click()
            await page.wait_for_timeout(1500)

        # Capture Product Detail Modal
        await page.screenshot(path="/home/jules/verification/screenshots/verification.png")

        await page.wait_for_timeout(1000)
        await context.close()
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
