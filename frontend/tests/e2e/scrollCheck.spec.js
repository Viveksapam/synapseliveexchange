import { test, expect } from '@playwright/test';

test('Check scroll styles on homepage', async ({ page }) => {
  await page.goto('http://localhost:5173/');
  
  // Get computed styles
  const styles = await page.evaluate(() => {
    const getStyles = (selector) => {
      const el = document.querySelector(selector);
      if (!el) return `${selector} not found`;
      const comp = window.getComputedStyle(el);
      return {
        overflow: comp.overflow,
        overflowY: comp.overflowY,
        overflowX: comp.overflowX,
        height: comp.height,
        minHeight: comp.minHeight,
        maxHeight: comp.maxHeight,
        position: comp.position
      };
    };
    
    return {
      html: getStyles('html'),
      body: getStyles('body'),
      root: getStyles('#root'),
      v2Wrapper: getStyles('.ath-wrapper')
    };
  });
  
  console.log('COMPUTED SCROLL STYLES:', JSON.stringify(styles, null, 2));
});
