import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        # Desktop Test
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(viewport={"width": 1280, "height": 800})
        page = await context.new_page()

        await page.goto("http://localhost:3000")
        await page.wait_for_timeout(1000)

        # Open Catalog view
        catalog_btn = page.locator("text=Все коллекции").first
        if await catalog_btn.is_visible():
            await catalog_btn.click()
            await page.wait_for_timeout(1000)

        # Click Spring Collection
        spring_card = page.locator("text=Весенняя коллекция").first
        if await spring_card.is_visible():
            await spring_card.click()
            await page.wait_for_timeout(1500)

        # Switch to Grid Mode
        grid_btn = page.locator("text=Сетка").first
        if await grid_btn.is_visible():
            await grid_btn.click()
            await page.wait_for_timeout(1000)

        # Capture Desktop Grid View Screenshot
        await page.screenshot(path="verification_desktop_grid.png")

        # Test incrementing quantity on first card
        plus_btn = page.locator("button[aria-label='Увеличить количество']").first
        if await plus_btn.is_visible():
            await plus_btn.click()
            await page.wait_for_timeout(500)
            await plus_btn.click()
            await page.wait_for_timeout(500)

        await page.screenshot(path="verification_desktop_grid_incremented.png")

        await context.close()

        # Mobile Test
        mobile_context = await browser.new_context(
            viewport={"width": 390, "height": 844},
            user_agent="Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15"
        )
        mobile_page = await mobile_context.new_page()

        await mobile_page.goto("http://localhost:3000")
        await mobile_page.wait_for_timeout(1000)

        # Go to catalog & Spring collection
        m_catalog_btn = mobile_page.locator("text=Все коллекции").first
        if await m_catalog_btn.is_visible():
            await m_catalog_btn.click()
            await mobile_page.wait_for_timeout(1000)

        m_spring = mobile_page.locator("text=Весенняя коллекция").first
        if await m_spring.is_visible():
            await m_spring.click()
            await mobile_page.wait_for_timeout(1500)

        # Switch to Grid Mode on Mobile
        m_grid_btn = mobile_page.locator("text=Сетка").first
        if await m_grid_btn.is_visible():
            await m_grid_btn.click()
            await mobile_page.wait_for_timeout(1000)

        # Capture Mobile Grid View Screenshot
        await mobile_page.screenshot(path="verification_mobile_grid.png")

        # Test increment on Mobile
        m_plus = mobile_page.locator("button[aria-label='Увеличить количество']").first
        if await m_plus.is_visible():
            await m_plus.click()
            await mobile_page.wait_for_timeout(500)

        await mobile_page.screenshot(path="verification_mobile_grid_incremented.png")

        # Switch back to 3D Gallery on Mobile
        m_dolly_btn = mobile_page.locator("text=3D Галерея").first
        if await m_dolly_btn.is_visible():
            await m_dolly_btn.click()
            await mobile_page.wait_for_timeout(1000)

        await mobile_page.screenshot(path="verification_mobile_dolly_bottomsheet.png")

        await mobile_context.close()
        await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
