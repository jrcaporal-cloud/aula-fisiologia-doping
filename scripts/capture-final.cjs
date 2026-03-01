const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ 
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 2 
    });
    
    // Wait for dev server to be ready
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // init animation
    
    // Slide 0: Title
    
    // Jump to Passaporte Biologico (Slide 11 / index ~9 or 10)
    for(let i = 0; i < 11; i++) {
        await page.keyboard.press('ArrowDown');
        await page.waitForTimeout(500);
    }
    
    // Hover on the second passport card "O Atleta contra Ele Mesmo"
    await page.hover('text=O Atleta contra Ele Mesmo', { force: true });
    await page.waitForTimeout(1000); 
    await page.screenshot({ path: '/Users/mac/.gemini/antigravity/brain/09306791-3aab-4df0-b6b4-bb1ee9cf91c9/verify_passport_expanded.jpeg' });

    // Jump to Insulin slide (Slide 13 / ~12 presses)
    await page.keyboard.press('ArrowDown');
    await page.waitForTimeout(500);
    
    // Screenshot before interaction
    await page.screenshot({ path: '/Users/mac/.gemini/antigravity/brain/09306791-3aab-4df0-b6b4-bb1ee9cf91c9/verify_insulin_idle.jpeg' });
    
    // Hover on membrane to trigger Insulin cascade
    await page.hover('text=PASSE O MOUSE NA CÉLULA', { force: true });
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '/Users/mac/.gemini/antigravity/brain/09306791-3aab-4df0-b6b4-bb1ee9cf91c9/verify_insulin_active.jpeg' });

    await browser.close();
    console.log("Screenshots captured");
})();
