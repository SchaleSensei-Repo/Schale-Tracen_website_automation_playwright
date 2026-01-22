import { test, expect } from '@playwright/test';
import { parseNumberLoose, selectRandomOption, expectApprox } from '../../utils/tools';

test('money conversion tool is loaded, running, and calculates correctly', async ({ page }) => {
  await page.goto('/tools/', { waitUntil: 'domcontentloaded' });

  const amountInput = page.locator('#fxAmount');
  const fromSelect = page.locator('#fxFrom');
  const toSelect = page.locator('#fxTo');
  const rateLine = page.locator('#fxLineRate');
  const convertLine = page.locator('#fxLineConvert');

  // Randomize from/to ensuring from != to
  await selectRandomOption(fromSelect, { excludeCurrent: true });
  const from = await fromSelect.inputValue();
  await selectRandomOption(toSelect, { excludeCurrent: true, excludeValues: [from] });
  const to = await toSelect.inputValue();

  const amount = 123.45;
  await amountInput.fill(String(amount));

  // ✅ Wait until UI reflects the current selection (not just "not Loading")
  await expect(rateLine).toContainText(`1 ${from} =`, { timeout: 30_000 });
  await expect(rateLine).toContainText(` ${to}`, { timeout: 30_000 });

  // Optional: also ensure conversion line references the correct target currency symbol via formatter output change
  // At minimum, ensure it’s no longer in its initial placeholder state
  await expect(convertLine).not.toContainText(/Loading conversion/i, { timeout: 30_000 });

  const rateText = (await rateLine.textContent()) || '';
  const convertText = (await convertLine.textContent()) || '';

  console.log(`[FX] from=${from} to=${to} amount=${amount}`);
  console.log(`[FX] rateLine="${rateText}"`);
  console.log(`[FX] convertLine="${convertText}"`);

  // Parse rate: "1 USD = 158.79 JPY"
  const m = rateText.match(/=\s*([0-9.,]+)\s+([A-Z]{3})/);
  expect(m, `Could not parse fx rate from: "${rateText}"`).toBeTruthy();
  const rate = parseNumberLoose(m![1]);

  // Parse converted amount from right side: "... = <money>"
  const parts = convertText.split('=');
  expect(parts.length).toBeGreaterThanOrEqual(2);
  const converted = parseNumberLoose(parts[1]);

  const expected = amount * rate;

  console.log(`[FX] parsedRate=${rate}`);
  console.log(`[FX] expected≈${expected}`);
  console.log(`[FX] actualConverted=${converted}`);

  expect(Number.isFinite(rate)).toBeTruthy();
  expect(Number.isFinite(converted)).toBeTruthy();

  /// Currency formatting rounding:
// USD ~2 decimals => allow ±0.01
// JPY/IDR likely 0 decimals => allow ±1
let absTol = 0;
if (to === 'USD') absTol = 0.01;
if (to === 'JPY' || to === 'IDR') absTol = 1;

expectApprox(converted, expected, 0.05, absTol);



  console.log('the money conversion tool is successfully loaded, running, and calculate correctly');
});
