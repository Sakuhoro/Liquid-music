import asyncio
from playwright.async_api import async_playwright

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch()
        page = await browser.new_page(viewport={"width": 1280, "height": 720})
        await page.goto("http://localhost:3004")
        await page.wait_for_timeout(1000)

        await page.locator("text=Collections").click()
        await page.wait_for_timeout(1000)

        print("After clicking Collections:")
        elements = await page.locator(".cursor-pointer, card, .group").all()
        for idx, el in enumerate(elements[:15]):
            text = await el.text_content()
            cls = await el.get_attribute("class")
            print(f"{idx}: text='{text.strip()[:30] if text else ''}', class='{cls}'")

        await browser.close()

asyncio.run(main())
