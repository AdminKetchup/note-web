/**
 * Formula Engine - Notion-like formula system
 * Supports 30+ functions for calculations, text manipulation, dates, and logic
 */

import * as math from 'mathjs';
import {
  addDays,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  format,
  getYear,
  getMonth,
  getDate,
  parseISO,
  isValid
} from 'date-fns';

export type PropertyValue = string | number | boolean | Date | null | undefined;
export type PropertyMap = Record<string, PropertyValue>;

/**
 * Main formula evaluation function
 * @param formula - Formula string (e.g., "prop('Price') * 1.1")
 * @param properties - Map of property names to values
 * @returns Calculated result or null on error
 */
export function evaluateFormula(formula: string, properties: PropertyMap): PropertyValue {
  if (!formula || typeof formula !== 'string') {
    console.error('Formula evaluation error: Invalid formula input');
    return null;
  }

  const trimmedFormula = formula.trim();
  if (!trimmedFormula) {
    return null;
  }

  try {
    const context = createFormulaContext(properties);
    const result = evaluateExpression(trimmedFormula, context);
    return result;
  } catch (error) {
    console.error('Formula evaluation error:', {
      formula: trimmedFormula,
      error: error instanceof Error ? error.message : 'Unknown error',
      properties: Object.keys(properties)
    });
    return null;
  }
}

/**
 * Create evaluation context with all available functions
 */
function createFormulaContext(properties: PropertyMap) {
  const getProp = (name: string) => {
    const value = properties[name];
    if (value === null || value === undefined) return 0;
    return value;
  };

  return {
    // Property accessor
    prop: getProp,

    // Math functions
    sum: (...args: number[]) => args.reduce((a, b) => Number(a) + Number(b), 0),
    avg: (...args: number[]) => {
      if (args.length === 0) return 0;
      return args.reduce((a, b) => Number(a) + Number(b), 0) / args.length;
    },
    min: (...args: number[]) => Math.min(...args.map(Number)),
    max: (...args: number[]) => Math.max(...args.map(Number)),
    round: (num: number, decimals: number = 0) => {
      if (typeof num !== 'number') return 0;
      const factor = Math.pow(10, decimals);
      return Math.round(num * factor) / factor;
    },
    ceil: (num: number) => Math.ceil(Number(num)),
    floor: (num: number) => Math.floor(Number(num)),
    abs: (num: number) => Math.abs(Number(num)),
    sqrt: (num: number) => Math.sqrt(Number(num)),
    pow: (base: number, exp: number) => Math.pow(Number(base), Number(exp)),

    // Text functions
    concat: (...args: unknown[]) => args.map(String).join(''),
    length: (str: unknown) => String(str || '').length,
    upper: (str: string) => String(str || '').toUpperCase(),
    lower: (str: string) => String(str || '').toLowerCase(),
    replace: (str: string, search: string, replacement: string) =>
      String(str || '').replace(new RegExp(search, 'g'), replacement),
    contains: (str: string, search: string) =>
      String(str || '').includes(search),
    slice: (str: string, start: number, end?: number) =>
      String(str || '').slice(start, end),

    // Date functions
    now: () => new Date(),
    today: () => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      return d;
    },
    dateAdd: (date: Date | string, amount: number, unit: 'days' | 'months' | 'years' = 'days') => {
      if (!date) return new Date();
      const d = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(d)) return new Date();

      if (unit === 'days') return addDays(d, amount);
      if (unit === 'months') return addDays(d, amount * 30);
      if (unit === 'years') return addDays(d, amount * 365);
      return d;
    },
    dateBetween: (start: Date | string, end: Date | string, unit: 'days' | 'months' | 'years' = 'days') => {
      if (!start || !end) return 0;
      const d1 = typeof start === 'string' ? parseISO(start) : start;
      const d2 = typeof end === 'string' ? parseISO(end) : end;
      if (!isValid(d1) || !isValid(d2)) return 0;

      if (unit === 'days') return differenceInDays(d2, d1);
      if (unit === 'months') return differenceInMonths(d2, d1);
      if (unit === 'years') return differenceInYears(d2, d1);
      return 0;
    },
    formatDate: (date: Date | string, formatStr: string = 'yyyy-MM-dd') => {
      if (!date) return '';
      const d = typeof date === 'string' ? parseISO(date) : date;
      if (!isValid(d)) return '';
      return format(d, formatStr);
    },

    // Logic
    if: <T>(condition: unknown, trueValue: T, falseValue: T): T =>
      condition ? trueValue : falseValue,
    and: (...args: unknown[]) => args.every(Boolean),
    or: (...args: unknown[]) => args.some(Boolean),
    not: (value: unknown) => !value,
    empty: (value: unknown) =>
      value === null || value === undefined || value === '' ||
      (Array.isArray(value) && value.length === 0),

    // Comparison
    equal: (a: unknown, b: unknown) => a == b,
    unequal: (a: unknown, b: unknown) => a != b,
    larger: (a: number, b: number) => Number(a) > Number(b),
    largerEq: (a: number, b: number) => Number(a) >= Number(b),
    smaller: (a: number, b: number) => Number(a) < Number(b),
    smallerEq: (a: number, b: number) => Number(a) <= Number(b),

    // Constants
    pi: Math.PI,
    e: Math.E,
  };
}

/**
 * Safely evaluate an expression with given context using mathjs
 */
function evaluateExpression(expression: string, context: any): PropertyValue {
  try {
    // Input validation
    if (!expression || typeof expression !== 'string') {
      throw new Error('Invalid expression: must be a non-empty string');
    }

    // Use mathjs for safe evaluation instead of Function constructor
    const scope = {
      ...context,
      // Ensure all context values are available in scope
    };

    // mathjs.evaluate is safe and doesn't use eval()
    const result = math.evaluate(expression, scope);

    // Validate result
    if (result === Infinity || result === -Infinity) {
      console.warn('Formula resulted in Infinity');
      return null;
    }
    if (typeof result === 'number' && isNaN(result)) {
      console.warn('Formula resulted in NaN');
      return null;
    }

    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Formula evaluation error:', {
      expression,
      error: errorMessage,
      availableFunctions: Object.keys(context).slice(0, 10) // Show first 10 for debugging
    });
    return null;
  }
}

/**
 * Format formula result for display
 */
export function formatFormulaResult(result: PropertyValue): string {
  if (result === null || result === undefined) return '';
  if (result instanceof Date) return format(result, 'yyyy-MM-dd');
  if (typeof result === 'boolean') return result ? 'Yes' : 'No';
  if (typeof result === 'number') {
    return Number.isInteger(result) ? result.toString() : result.toFixed(2);
  }
  return String(result);
}
