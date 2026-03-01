import { chromium } from 'playwright';

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173');
    await page.waitForTimeout(1000);

    // Slide 2 Triangle Node
    // We can go to slide 2
    // Press keyboard right arrow to go to slide 2
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(1000);
    
    // Evaluate and hover over triangle-node
    await page.locator('.triangle-node').first().hover();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/Users/mac/.gemini/antigravity/brain/09306791-3aab-4df0-b6b4-bb1ee9cf91c9/verify_flattened_triangle.jpeg', type: 'jpeg' });

    // Go to slide 29
    for (let i = 0; i < 28; i++) {
        await page.keyboard.press('ArrowRight');
        await page.waitForTimeout(100);
    }
    await page.waitForTimeout(1000);
    
    // Hover over the first athlete image container
    const dossierNode = page.locator('.dv-img-container').first();
    if (await dossierNode.count() > 0) {
        await dossierNode.hover();
        await page.waitForTimeout(1000);
        await page.screenshot({ path: '/Users/mac/.gemini/antigravity/brain/09306791-3aab-4df0-b6b4-bb1ee9cf91c9/verify_dossier_expanded.jpeg', type: 'jpeg' });
    }

    await browser.close();
})();
