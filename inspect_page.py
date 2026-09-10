import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 720})
        await page.goto("http://localhost:3004")
        await page.wait_for_timeout(2000)

        # Print buttons or clickable items
        buttons = await page.locator("button, a, div[role='button'], .cursor-pointer").all()
        print("Clickable elements:")
        for idx, btn in enumerate(buttons):
            text = await btn.text_content()
            cls = await btn.get_attribute("class")
            print(f"{idx}: text='{text.strip() if text else ''}', class='{cls}'")

        await browser.close()

asyncio.run(main())
