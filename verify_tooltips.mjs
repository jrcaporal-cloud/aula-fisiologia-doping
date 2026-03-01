import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);

    // Navigate to slide 9 (UGT2B17)
    for (let i = 0; i < 8; i++) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(100);
    }
    await page.waitForTimeout(1000);
    
    // Screenshot normal UGT2B17
    await page.screenshot({ path: '/Users/mac/.gemini/antigravity/brain/09306791-3aab-4df0-b6b4-bb1ee9cf91c9/verify_ugt_normal.jpeg', type: 'jpeg' });
    
    // Hover over central WADA block
    const centralBlock = page.locator('.uc-node').nth(2);
    if (await centralBlock.count() > 0) {
        await centralBlock.hover();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '/Users/mac/.gemini/antigravity/brain/09306791-3aab-4df0-b6b4-bb1ee9cf91c9/verify_ugt_hover.jpeg', type: 'jpeg' });
    }

    // Navigate to slide 12 (Insulin - Index 11 probably)
    for (let i = 0; i < 3; i++) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(100);
    }
    await page.waitForTimeout(1000);
    
    // Evaluate if insulin-tracker exists
    const yellowSeg = page.locator('.yellow-seg').first();
    if (await yellowSeg.count() > 0) {
        await yellowSeg.hover();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '/Users/mac/.gemini/antigravity/brain/09306791-3aab-4df0-b6b4-bb1ee9cf91c9/verify_insulin_fixed.jpeg', type: 'jpeg' });
    }

    await browser.close();
})();
