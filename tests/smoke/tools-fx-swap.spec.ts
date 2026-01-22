import { test, expect } from '@playwright/test';

test('currency swap swaps From/To and updates UI lines accordingly', async ({ page }) => {
  await page.goto('/tools/', { waitUntil: 'domcontentloaded' });

  const fromSelect = page.locator('#fxFrom');
  const toSelect = page.locator('#fxTo');
  const swapBtn = page.locator('#fxSwap');
  const rateLine = page.locator('#fxLineRate');
  const convertLine = page.locator('#fxLineConvert');
  const amountInput = page.locator('#fxAmount');

  await amountInput.fill('100');

  // Wait for initial content
  await expect(rateLine).toHaveText(/1\s+[A-Z]{3}\s*=\s*[\d.,]+\s+[A-Z]{3}/, { timeout: 30_000 });


  const fromBefore = await fromSelect.inputValue();
  const toBefore = await toSelect.inputValue();
  const rateBefore = (await rateLine.textContent()) || '';
  const convertBefore = (await convertLine.textContent()) || '';

  console.log(`[FX-SWAP] BEFORE from=${fromBefore} to=${toBefore}`);
  console.log(`[FX-SWAP] BEFORE rateLine="${rateBefore}"`);
  console.log(`[FX-SWAP] BEFORE convertLine="${convertBefore}"`);

  await swapBtn.click();

  const fromAfter = await fromSelect.inputValue();
  const toAfter = await toSelect.inputValue();

  console.log(`[FX-SWAP] AFTER  from=${fromAfter} to=${toAfter}`);

  // Assert swap is correct (this part already works in your logs)
  expect(fromAfter).toBe(toBefore);
  expect(toAfter).toBe(fromBefore);

  // IMPORTANT: wait until UI line reflects NEW from/to (because recomputeFx is async and doesn't reset text first)
  await expect(rateLine).toContainText(`1 ${fromAfter} =`, { timeout: 30_000 });
  await expect(rateLine).toContainText(` ${toAfter}`, { timeout: 30_000 });

  // And conversion line should reflect the new currencies too
  // (we don’t hardcode symbols; we just ensure it changed)
  const rateAfter = (await rateLine.textContent()) || '';
  const convertAfter = (await convertLine.textContent()) || '';

  console.log(`[FX-SWAP] AFTER  rateLine="${rateAfter}"`);
  console.log(`[FX-SWAP] AFTER  convertLine="${convertAfter}"`);

  expect(rateAfter).not.toBe(rateBefore);
  expect(convertAfter).not.toBe(convertBefore);

  console.log('the money conversion tool swap is working correctly');
});
