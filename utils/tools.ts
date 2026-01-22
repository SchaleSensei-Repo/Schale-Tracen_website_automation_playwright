import { Locator } from '@playwright/test';

export function parseNumberLoose(text: string): number {
  // Keeps digits, dot, comma, minus; removes currency symbols and words.
  const cleaned = text.replace(/[^\d.,-]/g, '').replace(/,/g, '');
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : NaN;
}

export async function selectRandomOption(select: Locator, opts?: { excludeCurrent?: boolean; excludeValues?: string[] }) {
  const exclude = new Set(opts?.excludeValues ?? []);
  const current = opts?.excludeCurrent ? await select.inputValue() : null;

  const optionLocs = await select.locator('option').all();
  const values: string[] = [];

  for (const opt of optionLocs) {
    const v = await opt.getAttribute('value');
    if (!v) continue;
    if (current && v === current) continue;
    if (exclude.has(v)) continue;
    values.push(v);
  }

  if (values.length === 0) return;

  const chosen = values[Math.floor(Math.random() * values.length)];
  await select.selectOption(chosen);
}

export function expectApprox(
  actual: number,
  expected: number,
  toleranceRatio = 0.02,
  toleranceAbs = 0
) {
  const delta = Math.abs(actual - expected);
  const allowed = Math.max(toleranceAbs, Math.abs(expected) * toleranceRatio, 1e-9);

  if (delta > allowed) {
    throw new Error(`Expected ${actual} ≈ ${expected} (±${allowed}), delta=${delta}`);
  }
}


