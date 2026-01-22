import { test, expect } from '@playwright/test';
import { parseNumberLoose, expectApprox } from '../../utils/tools';

const GRAMS_PER_TROY_OZ = 31.1034768;

// Very small helper: pick a random int 1..100
function randInt1to100(): number {
  return Math.floor(Math.random() * 100) + 1;
}

test('gold calculator (default mode) calculates correctly for random integer input (1-100)', async ({ page }) => {
  await page.goto('/tools/', { waitUntil: 'domcontentloaded' });

  // Wait for feed to load
  const goldHumanTitle = page.locator('#goldHumanTitle');
  await expect(goldHumanTitle).not.toContainText(/Loading gold feed/i, { timeout: 30_000 });

  // We do NOT toggle modes and do NOT touch dropdowns.
  // Default mode is Weight → Value.

  const modePill = page.locator('#goldModePill');
  await expect(modePill).toContainText(/Weight/i, { timeout: 30_000 });

  const qtyWeight = page.locator('#goldQtyWeight');
  const unitWeight = page.locator('#goldUnitWeight');
  const outCurrency = page.locator('#goldOutCurrency');

  const valueLine = page.locator('#goldValueLine');
  const valueExplain = page.locator('#goldValueExplain');

  // Random integer input (no decimals)
  const qty = randInt1to100();

  // Fill and ensure it sticks
  await qtyWeight.fill(String(qty));
  await expect.poll(async () => await qtyWeight.inputValue(), { timeout: 10_000 }).toBe(String(qty));

  // Blur to trigger recompute if needed
  await qtyWeight.press('Tab');

  // Wait until output line reflects our quantity (avoid parsing stale text)
  await expect(valueLine).toContainText(`${qty} `, { timeout: 30_000 });

  // Ensure explain has the numbers we need
  await expect(valueExplain).toContainText(/Spot:/i, { timeout: 30_000 });
  await expect(valueExplain).toContainText(/FX:/i, { timeout: 30_000 });

  const unit = await unitWeight.inputValue();     // e.g. g, mg, troy oz
  const curr = await outCurrency.inputValue();    // e.g. USD/JPY/IDR

  const lineText = (await valueLine.textContent()) || '';
  const explainText = (await valueExplain.textContent()) || '';

  console.log(`[GOLD] mode=Weight->Value (no toggles, no dropdown changes)`);
  console.log(`[GOLD] input qty=${qty} unit=${unit} outCurrency=${curr}`);
  console.log(`[GOLD] valueLine="${lineText}"`);
  console.log(`[GOLD] explain="${explainText}"`);

  // Parse Spot line (always USD/troy oz):
  // "Spot: 4,879.6925 USD/troy oz" (format varies)
  const spotMatch = explainText.match(/Spot:\s*([0-9.,]+)\s*USD\/troy\s*oz/i);
  expect(spotMatch, `Could not parse Spot line from:\n${explainText}`).toBeTruthy();
  const spotUsdPerOz = parseNumberLoose(spotMatch![1]);
  expect(Number.isFinite(spotUsdPerOz)).toBeTruthy();
  expect(spotUsdPerOz).toBeGreaterThan(0);

  // Parse FX line:
  // In this mode your UI shows something like:
  // "FX: 1 USD = 158.79 JPY" OR "FX: 1 IDR = 0.000059 USD"
  //
  // We want a function that gives us USD-per-output-currency (USD per 1 curr unit)
  // because we convert USD value of gold -> out currency:
  // outValue = usdValue / (USD per 1 curr)
  //
  // If the FX line is "1 CURR = X USD" => usdPerCurr = X
  // If the FX line is "1 USD = X CURR" => usdPerCurr = 1/X
  //
  let usdPerCurr: number | null = null;

  const fx1CurrToUsd = explainText.match(/FX:\s*1\s+([A-Z]{3})\s*=\s*([0-9.,]+)\s*USD/i);
  const fx1UsdToCurr = explainText.match(/FX:\s*1\s+USD\s*=\s*([0-9.,]+)\s*([A-Z]{3})/i);

  if (fx1CurrToUsd) {
    const currCode = fx1CurrToUsd[1].toUpperCase();
    const val = parseNumberLoose(fx1CurrToUsd[2]);
    if (currCode === curr.toUpperCase()) usdPerCurr = val;
  }

  if (usdPerCurr === null && fx1UsdToCurr) {
    const val = parseNumberLoose(fx1UsdToCurr[1]);
    const currCode = fx1UsdToCurr[2].toUpperCase();
    if (currCode === curr.toUpperCase()) usdPerCurr = 1 / val;
  }

  // If out currency is USD, usdPerCurr is 1 by definition (even if FX line is "local")
  if (curr.toUpperCase() === 'USD') usdPerCurr = 1;

  expect(usdPerCurr, `Could not derive USD-per-${curr} from FX line:\n${explainText}`).not.toBeNull();
  expect(Number.isFinite(usdPerCurr!)).toBeTruthy();
  expect(usdPerCurr!).toBeGreaterThan(0);

  // Convert input weight -> USD value of gold
  // We only need to support units that your dropdown provides.
  // Common: g, mg, troy oz, kg
  const qtyInGrams = (() => {
    const u = unit.toLowerCase();
    if (u === 'g') return qty;
    if (u === 'mg') return qty / 1000;
    if (u === 'kg') return qty * 1000;
    if (u === 'troy oz' || u === 'oz') return qty * GRAMS_PER_TROY_OZ;
    // fallback: treat as grams (keeps test from crashing if unit label differs slightly)
    return qty;
  })();

  const usdValue = (qtyInGrams / GRAMS_PER_TROY_OZ) * spotUsdPerOz;

  // USD -> out currency
  const expectedOutValue = usdValue / usdPerCurr!;

  // Parse the displayed out value from:
  // "<qty> <unit> gold ≈ <money>"
  const rhs = lineText.split('≈')[1] || '';
  const actualOutValue = parseNumberLoose(rhs);

  console.log(`[GOLD] parsed spotUsdPerOz=${spotUsdPerOz}`);
  console.log(`[GOLD] derived usdPer${curr}=${usdPerCurr}`);
  console.log(`[GOLD] qtyInGrams=${qtyInGrams}`);
  console.log(`[GOLD] expectedOutValue≈${expectedOutValue}`);
  console.log(`[GOLD] actualOutValue=${actualOutValue}`);

  expect(Number.isFinite(actualOutValue)).toBeTruthy();

  // Tolerance:
  // - JPY/IDR are often displayed without decimals
  // - USD usually has 2 decimals
  // Use a mix of ratio + absolute.
  let absTol = 0;
  if (curr === 'USD') absTol = 0.5;         // cents rounding + small qty variance
  if (curr === 'JPY') absTol = 5;           // yen rounding
  if (curr === 'IDR') absTol = 5000;        // rupiah rounding can be chunky depending on formatting

  expectApprox(actualOutValue, expectedOutValue, 0.10, absTol);

  console.log('the gold spot+calculator tool is successfully loaded, running, and calculate correctly');
});
