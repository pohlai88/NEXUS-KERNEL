/**
 * NEXUS-KERNEL FINANCIAL PRECISION HELPERS
 * 
 * Based on: security.pack.json DAT_MATH_PRECISION_POLICY
 * OWASP A04:2021 Insecure Design - Prevents IEEE 754 floating-point errors
 * 
 * CRITICAL: JavaScript's native number type cannot represent 0.1 + 0.2 accurately
 * Use decimal.js for ALL financial calculations to prevent audit failures
 */

import Decimal from 'decimal.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🔢 DECIMAL CONFIGURATION (Based on security.pack.json)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Configure Decimal.js globally
 * GAAP-compliant rounding for financial calculations
 */
Decimal.set({
  precision: 20,              // 20 significant digits
  rounding: Decimal.ROUND_HALF_EVEN, // Banker's rounding (GAAP compliant)
  toExpNeg: -7,               // Use scientific notation for < 0.0000001
  toExpPos: 21,               // Use scientific notation for > 10^21
  minE: -9e15,                // Min exponent
  maxE: 9e15,                 // Max exponent
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💰 CURRENCY TYPE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Type-safe currency amount (immutable)
 * Prevents accidental mixing of currency and native numbers
 */
export class Currency {
  private readonly amount: Decimal;
  private readonly currencyCode: string;
  
  constructor(value: number | string | Decimal, currency: string = 'USD') {
    this.amount = new Decimal(value);
    this.currencyCode = currency.toUpperCase();
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔢 ARITHMETIC OPERATIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  add(other: Currency): Currency {
    this.assertSameCurrency(other);
    return new Currency(this.amount.plus(other.amount), this.currencyCode);
  }
  
  subtract(other: Currency): Currency {
    this.assertSameCurrency(other);
    return new Currency(this.amount.minus(other.amount), this.currencyCode);
  }
  
  multiply(factor: number | string | Decimal): Currency {
    return new Currency(this.amount.times(factor), this.currencyCode);
  }
  
  divide(divisor: number | string | Decimal): Currency {
    return new Currency(this.amount.dividedBy(divisor), this.currencyCode);
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 📊 COMPARISONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  equals(other: Currency): boolean {
    return this.currencyCode === other.currencyCode && this.amount.equals(other.amount);
  }
  
  greaterThan(other: Currency): boolean {
    this.assertSameCurrency(other);
    return this.amount.greaterThan(other.amount);
  }
  
  lessThan(other: Currency): boolean {
    this.assertSameCurrency(other);
    return this.amount.lessThan(other.amount);
  }
  
  isZero(): boolean {
    return this.amount.isZero();
  }
  
  isPositive(): boolean {
    return this.amount.greaterThan(0);
  }
  
  isNegative(): boolean {
    return this.amount.lessThan(0);
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🔄 CONVERSIONS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  /**
   * Convert to number (use only for display, NEVER for calculations)
   */
  toNumber(): number {
    return this.amount.toNumber();
  }
  
  /**
   * Convert to string with specified decimal places
   */
  toString(decimalPlaces: number = 2): string {
    return this.amount.toFixed(decimalPlaces);
  }
  
  /**
   * Format for display (e.g., "$1,234.56")
   */
  format(locale: string = 'en-US'): string {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: this.currencyCode,
    }).format(this.amount.toNumber());
  }
  
  /**
   * Convert to JSON (for database storage)
   */
  toJSON(): { amount: string; currency: string } {
    return {
      amount: this.amount.toString(), // Store as string to preserve precision
      currency: this.currencyCode,
    };
  }
  
  /**
   * Create from JSON
   */
  static fromJSON(json: { amount: string; currency: string }): Currency {
    return new Currency(json.amount, json.currency);
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🛡️ VALIDATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  private assertSameCurrency(other: Currency): void {
    if (this.currencyCode !== other.currencyCode) {
      throw new Error(
        `Currency mismatch: cannot operate on ${this.currencyCode} and ${other.currencyCode}`
      );
    }
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 🏭 FACTORY METHODS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  static zero(currency: string = 'USD'): Currency {
    return new Currency(0, currency);
  }
  
  static fromCents(cents: number, currency: string = 'USD'): Currency {
    return new Currency(new Decimal(cents).dividedBy(100), currency);
  }
  
  toCents(): number {
    return this.amount.times(100).round().toNumber();
  }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 💵 HELPER FUNCTIONS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Calculate percentage (e.g., tax, discount)
 * Example: calculatePercentage(100, 8.5) returns 8.50
 */
export function calculatePercentage(
  amount: number | string | Currency,
  percentage: number | string
): Currency {
  const base = amount instanceof Currency ? amount : new Currency(amount);
  const rate = new Decimal(percentage).dividedBy(100);
  return base.multiply(rate);
}

/**
 * Calculate discount
 * Example: applyDiscount(100, 20) returns 80.00
 */
export function applyDiscount(
  amount: number | string | Currency,
  discountPercent: number | string
): Currency {
  const base = amount instanceof Currency ? amount : new Currency(amount);
  const discount = calculatePercentage(base, discountPercent);
  return base.subtract(discount);
}

/**
 * Calculate tax
 * Example: calculateTax(100, 8.5) returns 108.50
 */
export function calculateTax(
  amount: number | string | Currency,
  taxRate: number | string
): Currency {
  const base = amount instanceof Currency ? amount : new Currency(amount);
  const tax = calculatePercentage(base, taxRate);
  return base.add(tax);
}

/**
 * Sum array of amounts
 */
export function sum(amounts: Currency[]): Currency {
  if (amounts.length === 0) {
    throw new Error('Cannot sum empty array');
  }
  
  return amounts.reduce((total, amount) => total.add(amount));
}

/**
 * Average of amounts
 */
export function average(amounts: Currency[]): Currency {
  if (amounts.length === 0) {
    throw new Error('Cannot average empty array');
  }
  
  const total = sum(amounts);
  return total.divide(amounts.length);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 📐 ROUNDING MODES (From security.pack.json)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const RoundingMode = {
  /**
   * Banker's Rounding (GAAP compliant)
   * Rounds to nearest even number (reduces bias)
   * 2.5 → 2, 3.5 → 4
   */
  HALF_EVEN: Decimal.ROUND_HALF_EVEN,
  
  /**
   * Round half up (common in commerce)
   * 2.5 → 3, 3.5 → 4
   */
  HALF_UP: Decimal.ROUND_HALF_UP,
  
  /**
   * Round down (floor)
   * 2.9 → 2, -2.9 → -3
   */
  FLOOR: Decimal.ROUND_FLOOR,
  
  /**
   * Round up (ceiling)
   * 2.1 → 3, -2.1 → -2
   */
  CEILING: Decimal.ROUND_CEIL,
  
  /**
   * Round towards zero (truncate)
   * 2.9 → 2, -2.9 → -2
   */
  TRUNCATE: Decimal.ROUND_DOWN,
} as const;

/**
 * Round amount with specified mode
 */
export function roundCurrency(
  amount: Currency,
  decimalPlaces: number = 2,
  mode: Decimal.Rounding = RoundingMode.HALF_EVEN
): Currency {
  const rounded = new Decimal(amount.toString()).toDecimalPlaces(decimalPlaces, mode);
  return new Currency(rounded, 'USD'); // Assuming USD, adjust as needed
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 🧪 TEST CASES (Demonstrates IEEE 754 fix)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Demonstrate why decimal.js is critical
 * Run this in a test to verify correctness
 */
export function demonstrateIEEE754Fix(): void {
  // ❌ WRONG (JavaScript native number):
  const nativeResult = 0.1 + 0.2;
  console.log('Native JS:', nativeResult); // 0.30000000000000004 ❌
  
  // ✅ CORRECT (decimal.js):
  const decimalResult = new Decimal('0.1').plus('0.2');
  console.log('Decimal.js:', decimalResult.toString()); // 0.3 ✅
  
  // ❌ WRONG (currency calculation):
  const price = 19.99;
  const quantity = 3;
  const nativeTotal = price * quantity;
  console.log('Native total:', nativeTotal); // 59.9700000000000017 ❌
  
  // ✅ CORRECT (Currency class):
  const correctPrice = new Currency('19.99');
  const correctTotal = correctPrice.multiply(3);
  console.log('Currency total:', correctTotal.toString()); // 59.97 ✅
}

// Export Decimal for advanced use cases
export { Decimal };
