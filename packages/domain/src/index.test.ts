import { describe, expect, it } from 'vitest';
import { calculateLine, costPlusUnitPrice } from './index';

describe('integer minor-unit pricing', () => {
  it('calculates a discounted line and known cost', () => {
    expect(calculateLine({ quantity: 3, unitPriceMinor: 125_000, discountBps: 1_800, unitCostMinor: 90_000 }))
      .toEqual({ grossMinor: 375_000, discountMinor: 67_500, totalMinor: 307_500, costMinor: 270_000, profitMinor: 37_500 });
  });

  it('rounds half up once at line level', () => {
    expect(calculateLine({ quantity: 3, unitPriceMinor: 1, discountBps: 5_000 }))
      .toEqual({ grossMinor: 3, discountMinor: 2, totalMinor: 1 });
    expect(calculateLine({ quantity: 1, unitPriceMinor: 101, discountBps: 500 }).discountMinor).toBe(5);
  });

  it('keeps absent cost unknown and explicit zero cost known', () => {
    expect(calculateLine({ quantity: 1, unitPriceMinor: 100 })).not.toHaveProperty('profitMinor');
    expect(calculateLine({ quantity: 1, unitPriceMinor: 100, unitCostMinor: 0 }).profitMinor).toBe(100);
  });

  it('allows free prices, a full discount, and negative profit', () => {
    expect(calculateLine({ quantity: 2, unitPriceMinor: 0 }).totalMinor).toBe(0);
    expect(calculateLine({ quantity: 2, unitPriceMinor: 100, discountBps: 10_000, unitCostMinor: 80 }).profitMinor).toBe(-160);
  });

  it.each([0, -1, 1.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid quantity %s', (quantity) => {
    expect(() => calculateLine({ quantity, unitPriceMinor: 100 })).toThrow(RangeError);
  });

  it.each([-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1])('rejects invalid money %s', (value) => {
    expect(() => calculateLine({ quantity: 1, unitPriceMinor: value })).toThrow(RangeError);
    expect(() => calculateLine({ quantity: 1, unitPriceMinor: 1, unitCostMinor: value })).toThrow(RangeError);
  });

  it.each([-1, 10_001, 1.5, NaN, Infinity])('rejects invalid basis points %s', (discountBps) => {
    expect(() => calculateLine({ quantity: 1, unitPriceMinor: 100, discountBps })).toThrow(RangeError);
  });

  it('rejects unsafe totals, including cost totals', () => {
    expect(() => calculateLine({ quantity: 2, unitPriceMinor: Number.MAX_SAFE_INTEGER })).toThrow(RangeError);
    expect(() => calculateLine({ quantity: 2, unitPriceMinor: 1, unitCostMinor: Number.MAX_SAFE_INTEGER })).toThrow(RangeError);
  });

  it('retains precision in basis-point multiplication near the safe integer limit', () => {
    expect(calculateLine({ quantity: 1, unitPriceMinor: Number.MAX_SAFE_INTEGER, discountBps: 10_000 }).totalMinor).toBe(0);
  });

  it('supports cost-plus markup with half-up rounding', () => {
    expect(costPlusUnitPrice(10_000, 2_500)).toBe(12_500);
    expect(costPlusUnitPrice(1, 5_000)).toBe(2);
    expect(costPlusUnitPrice(100, 0)).toBe(100);
    expect(() => costPlusUnitPrice(100, -1)).toThrow(RangeError);
    expect(() => costPlusUnitPrice(Number.MAX_SAFE_INTEGER, 1)).toThrow(RangeError);
  });
});