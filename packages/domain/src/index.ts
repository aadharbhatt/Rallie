export interface PriceLineInput {
  quantity: number;
  unitPriceMinor: number;
  /** One basis point is 0.01%; 10,000 is a full discount. */
  discountBps?: number;
  /** Omitted cost means unknown, not zero. */
  unitCostMinor?: number;
}

export interface PriceLine {
  grossMinor: number;
  discountMinor: number;
  totalMinor: number;
  costMinor?: number;
  profitMinor?: number;
}

function integer(name: string, value: number, minimum = 0, maximum = Number.MAX_SAFE_INTEGER): void {
  if (!Number.isSafeInteger(value) || value < minimum || value > maximum) {
    throw new RangeError(`${name} must be a safe integer between ${minimum} and ${maximum}.`);
  }
}

function safeNumber(value: bigint): number {
  if (value > BigInt(Number.MAX_SAFE_INTEGER) || value < BigInt(Number.MIN_SAFE_INTEGER)) {
    throw new RangeError('Price calculation exceeds the safe integer range.');
  }
  return Number(value);
}

/** Nonnegative ratios round half up, once at line level; no floating-point money. */
function basisPoints(amount: bigint, bps: number): bigint {
  return (amount * BigInt(bps) + 5_000n) / 10_000n;
}

export function calculateLine(input: PriceLineInput): PriceLine {
  const { quantity, unitPriceMinor, discountBps = 0, unitCostMinor } = input;
  integer('quantity', quantity, 1);
  integer('unitPriceMinor', unitPriceMinor);
  integer('discountBps', discountBps, 0, 10_000);
  if (unitCostMinor !== undefined) integer('unitCostMinor', unitCostMinor);

  const gross = BigInt(quantity) * BigInt(unitPriceMinor);
  const discount = basisPoints(gross, discountBps);
  const total = gross - discount;
  const result: PriceLine = {
    grossMinor: safeNumber(gross),
    discountMinor: safeNumber(discount),
    totalMinor: safeNumber(total),
  };
  if (unitCostMinor !== undefined) {
    const cost = BigInt(quantity) * BigInt(unitCostMinor);
    result.costMinor = safeNumber(cost);
    result.profitMinor = safeNumber(total - cost);
  }
  return result;
}

/** Markup is applied to cost, not interpreted as a gross-margin percentage. */
export function costPlusUnitPrice(unitCostMinor: number, markupBps: number): number {
  integer('unitCostMinor', unitCostMinor);
  integer('markupBps', markupBps);
  const cost = BigInt(unitCostMinor);
  return safeNumber(cost + basisPoints(cost, markupBps));
}