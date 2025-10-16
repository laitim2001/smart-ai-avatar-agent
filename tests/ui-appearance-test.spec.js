const { test, expect } = require('@playwright/test');

test.describe('Smart AI Avatar POC - UI Appearance Tests', () => {
  const baseURL = 'http://localhost:3000';

  test.beforeEach(async ({ page }) => {
    await page.goto(baseURL);
    // Wait for page to be fully loaded
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(2000);
  });

  test('01 - Homepage loads and basic layout', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/AI/i);

    // Take full page screenshot
    await page.screenshot({
      path: 'tests/screenshots/01-homepage-full.png',
      fullPage: true
    });

    // Check if main container exists
    const mainContainer = page.locator('main');
    await expect(mainContainer).toBeVisible();

    console.log('✅ Homepage loaded successfully');
  });

  test('02 - Header and hero section', async ({ page }) => {
    // Check for h1 heading
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    const h1Text = await h1.textContent();
    console.log('Main heading:', h1Text);

    // Check for emoji/icon
    const emoji = page.locator('.text-6xl');
    if (await emoji.count() > 0) {
      const emojiText = await emoji.textContent();
      console.log('Hero emoji:', emojiText);
    }

    await page.screenshot({
      path: 'tests/screenshots/02-header-hero.png',
      clip: { x: 0, y: 0, width: 1280, height: 400 }
    });

    console.log('✅ Header and hero section verified');
  });

  test('03 - Feature cards layout', async ({ page }) => {
    // Look for feature cards
    const featureCards = page.locator('.group.rounded-lg');
    const cardCount = await featureCards.count();
    console.log(`Found ${cardCount} feature cards`);

    // Check if cards have proper structure
    for (let i = 0; i < Math.min(cardCount, 4); i++) {
      const card = featureCards.nth(i);
      const heading = card.locator('h2');
      const description = card.locator('p');

      const headingText = await heading.textContent();
      const descText = await description.textContent();

      console.log(`Card ${i + 1}: ${headingText} - ${descText.substring(0, 50)}...`);
    }

    await page.screenshot({
      path: 'tests/screenshots/03-feature-cards.png',
      fullPage: false
    });

    expect(cardCount).toBeGreaterThan(0);
    console.log('✅ Feature cards detected and validated');
  });

  test('04 - Responsive design - Desktop view (1920x1080)', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'tests/screenshots/04-desktop-1920x1080.png',
      fullPage: true
    });

    // Check grid layout
    const grid = page.locator('.lg\\:grid-cols-4');
    const isVisible = await grid.isVisible();
    console.log('4-column grid visible on desktop:', isVisible);

    console.log('✅ Desktop view (1920x1080) captured');
  });

  test('05 - Responsive design - Laptop view (1366x768)', async ({ page }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'tests/screenshots/05-laptop-1366x768.png',
      fullPage: true
    });

    console.log('✅ Laptop view (1366x768) captured');
  });

  test('06 - Responsive design - Tablet view (768x1024)', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'tests/screenshots/06-tablet-768x1024.png',
      fullPage: true
    });

    // Check layout adaptation
    const grid = page.locator('.lg\\:grid-cols-4');
    const boundingBox = await grid.boundingBox();
    console.log('Grid layout on tablet:', boundingBox);

    console.log('✅ Tablet view (768x1024) captured');
  });

  test('07 - Responsive design - Mobile view (375x667)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);

    await page.screenshot({
      path: 'tests/screenshots/07-mobile-375x667.png',
      fullPage: true
    });

    // Check if layout stacks vertically
    const cards = page.locator('.group.rounded-lg');
    const firstCard = cards.first();
    const lastCard = cards.last();

    const firstBox = await firstCard.boundingBox();
    const lastBox = await lastCard.boundingBox();

    if (firstBox && lastBox) {
      const isStacked = lastBox.y > firstBox.y + firstBox.height;
      console.log('Cards stacked vertically on mobile:', isStacked);
    }

    console.log('✅ Mobile view (375x667) captured');
  });

  test('08 - Color scheme and visual design', async ({ page }) => {
    // Check body background
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });
    console.log('Body background color:', bodyBg);

    // Check gradient elements
    const gradients = page.locator('[class*="gradient"]');
    const gradientCount = await gradients.count();
    console.log('Gradient elements found:', gradientCount);

    // Check for dark mode support
    const colorScheme = await page.locator('meta[name="color-scheme"]').getAttribute('content');
    console.log('Color scheme support:', colorScheme);

    await page.screenshot({
      path: 'tests/screenshots/08-color-scheme.png',
      fullPage: false
    });

    console.log('✅ Color scheme analyzed');
  });

  test('09 - Typography and text hierarchy', async ({ page }) => {
    // Get font information
    const fontFamily = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontFamily;
    });

    const fontSize = await page.evaluate(() => {
      return window.getComputedStyle(document.body).fontSize;
    });

    console.log('Font family:', fontFamily);
    console.log('Base font size:', fontSize);

    // Check heading sizes
    const h1 = page.locator('h1').first();
    const h2 = page.locator('h2').first();

    if (await h1.count() > 0) {
      const h1Size = await h1.evaluate(el => window.getComputedStyle(el).fontSize);
      console.log('H1 font size:', h1Size);
    }

    if (await h2.count() > 0) {
      const h2Size = await h2.evaluate(el => window.getComputedStyle(el).fontSize);
      console.log('H2 font size:', h2Size);
    }

    console.log('✅ Typography analyzed');
  });

  test('10 - Hover states and interactions', async ({ page }) => {
    const cards = page.locator('.group.rounded-lg');
    const cardCount = await cards.count();

    if (cardCount > 0) {
      const firstCard = cards.first();

      // Get initial border color
      const initialBorder = await firstCard.evaluate(el =>
        window.getComputedStyle(el).borderColor
      );

      // Hover over card
      await firstCard.hover();
      await page.waitForTimeout(500);

      // Get border color after hover
      const hoverBorder = await firstCard.evaluate(el =>
        window.getComputedStyle(el).borderColor
      );

      console.log('Border color (initial):', initialBorder);
      console.log('Border color (hover):', hoverBorder);

      await page.screenshot({
        path: 'tests/screenshots/10-hover-state.png',
        fullPage: false
      });
    }

    console.log('✅ Hover states tested');
  });

  test('11 - Loading performance metrics', async ({ page }) => {
    // Measure page load time
    const performanceMetrics = await page.evaluate(() => {
      const timing = performance.timing;
      return {
        domContentLoaded: timing.domContentLoadedEventEnd - timing.navigationStart,
        loadComplete: timing.loadEventEnd - timing.navigationStart,
        domInteractive: timing.domInteractive - timing.navigationStart
      };
    });

    console.log('Performance metrics (ms):');
    console.log('  DOM Content Loaded:', performanceMetrics.domContentLoaded);
    console.log('  Load Complete:', performanceMetrics.loadComplete);
    console.log('  DOM Interactive:', performanceMetrics.domInteractive);

    // Performance evaluation
    let performanceScore = 'Good';
    if (performanceMetrics.domContentLoaded > 3000) performanceScore = 'Needs Improvement';
    if (performanceMetrics.domContentLoaded > 5000) performanceScore = 'Poor';

    console.log('Performance Score:', performanceScore);
    console.log('✅ Performance metrics captured');
  });

  test('12 - Accessibility features', async ({ page }) => {
    // Check meta tags
    const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
    const description = await page.locator('meta[name="description"]').getAttribute('content');

    console.log('Viewport meta:', viewport);
    console.log('Description meta:', description ? 'Present' : 'Missing');

    // Check semantic HTML
    const semantic = {
      main: await page.locator('main').count(),
      header: await page.locator('header').count(),
      nav: await page.locator('nav').count(),
      footer: await page.locator('footer').count()
    };

    console.log('Semantic HTML elements:', semantic);

    // Check heading hierarchy
    const h1Count = await page.locator('h1').count();
    const h2Count = await page.locator('h2').count();
    const h3Count = await page.locator('h3').count();

    console.log('Heading structure:', { h1Count, h2Count, h3Count });

    // Check lang attribute
    const htmlLang = await page.locator('html').getAttribute('lang');
    console.log('HTML lang attribute:', htmlLang);

    console.log('✅ Accessibility features checked');
  });
});
