import type { TypesenseFieldType } from '@/types';
import { formOptions } from '@tanstack/react-form';
import { z } from 'zod/v4';

/**
 * Structured builder for a Typesense `filter_by` string. Each row contributes
 * one `field <operator> value` condition; rows are joined with a single, global
 * `&&` (Match ALL) or `||` (Match ANY).
 *
 * ── LIMITATION: single global join, no mixed precedence ──────────────────────
 * Because every row shares one join operator, this builder can express
 * `a && b && c` or `a || b || c`, but NOT mixed precedence such as
 * `(a && b) || c`. Typesense requires explicit parentheses for that, which a
 * flat row list can't model. The escape hatch is the "Raw filter" mode in the
 * UI, where the user types the `filter_by` string directly.
 *
 * ── FUTURE: grouped rows ─────────────────────────────────────────────────────
 * To support mixed precedence without dropping to raw mode, nest one level:
 *   interface FilterGroup { join: FilterJoin; conditions: FilterCondition[] }
 *   interface UpdateFilterValues { join: FilterJoin; groups: FilterGroup[] }
 * then serialize each group with its own inner join, wrap it in parens, and
 * join the groups with the outer join, e.g. `(a && b) || (c)`. One nesting
 * level covers the overwhelming majority of real-world filters.
 */

export type FieldKind = 'numeric' | 'string' | 'bool' | 'geo' | 'unsupported';

// Array fields filter with the same operators as their scalar base type.
export const fieldKind = (type: TypesenseFieldType): FieldKind => {
  switch (type.replace('[]', '')) {
    case 'int32':
    case 'int64':
    case 'float':
      return 'numeric';
    case 'string':
    case 'string*':
    case 'image':
      return 'string';
    case 'bool':
      return 'bool';
    case 'geopoint':
    case 'geopolygon':
      return 'geo';
    default:
      return 'unsupported'; // object / auto — not filterable via the builder
  }
};

export const filterOperators = [
  'eq',
  'ne',
  'gt',
  'gte',
  'lt',
  'lte',
  'between',
  'anyOf',
] as const;
export type FilterOperator = (typeof filterOperators)[number];

// `input` selects which value control renders for the operator.
export const OPERATORS: Record<
  FilterOperator,
  { label: string; input: 'single' | 'range' | 'multi' }
> = {
  eq: { label: '= equals', input: 'single' },
  ne: { label: '≠ not equals', input: 'single' },
  gt: { label: '> greater than', input: 'single' },
  gte: { label: '≥ at least', input: 'single' },
  lt: { label: '< less than', input: 'single' },
  lte: { label: '≤ at most', input: 'single' },
  between: { label: 'between', input: 'range' },
  anyOf: { label: 'any of', input: 'multi' },
};

export const operatorsByKind: Record<FieldKind, FilterOperator[]> = {
  numeric: ['eq', 'ne', 'gt', 'gte', 'lt', 'lte', 'between', 'anyOf'],
  string: ['eq', 'ne', 'anyOf'],
  bool: ['eq'],
  geo: [], // radius/polygon syntax can't be expressed with 3 inputs — use raw
  unsupported: [],
};

export const filterJoins = ['&&', '||'] as const;
export type FilterJoin = (typeof filterJoins)[number];

export interface FilterCondition {
  field: string;
  operator: FilterOperator;
  value: string; // single value / range lower bound
  valueMax: string; // range upper bound
  values: string[]; // "any of" multiselect
}

export interface UpdateFilterValues {
  join: FilterJoin;
  conditions: FilterCondition[];
}

export const emptyCondition: FilterCondition = {
  field: '',
  operator: 'eq',
  value: '',
  valueMax: '',
  values: [],
};

// String values are backtick-quoted so commas/spaces don't break the filter.
const lit = (kind: FieldKind, v: string) =>
  kind === 'string' ? `\`${v.replace(/`/g, '')}\`` : v;

// Serialize a single condition row.
export const buildCondition = (kind: FieldKind, c: FilterCondition): string => {
  const f = c.field;
  if (!f) return '';
  switch (c.operator) {
    case 'eq':
      return `${f}:=${lit(kind, c.value)}`;
    case 'ne':
      return `${f}:!=${lit(kind, c.value)}`;
    case 'gt':
      return `${f}:>${c.value}`;
    case 'gte':
      return `${f}:>=${c.value}`;
    case 'lt':
      return `${f}:<${c.value}`;
    case 'lte':
      return `${f}:<=${c.value}`;
    case 'between':
      return `${f}:[${c.value}..${c.valueMax}]`;
    case 'anyOf':
      return `${f}:[${c.values.map((x) => lit(kind, x)).join(',')}]`;
  }
};

// Join all non-empty rows with the chosen global operator.
export const buildFilterBy = (
  v: UpdateFilterValues,
  kindOf: (fieldName: string) => FieldKind,
): string =>
  v.conditions
    .map((c) => buildCondition(kindOf(c.field), c))
    .filter(Boolean)
    .join(` ${v.join} `);

export const updateFilterDefaults: UpdateFilterValues = {
  join: '&&',
  conditions: [{ ...emptyCondition }],
};

// Structural validation only. "Is this operator legal for this field's kind?"
// is enforced by only offering valid operators in the operator <Select>.
const conditionSchema = z
  .object({
    field: z.string().min(1, 'select a field'),
    operator: z.enum(filterOperators),
    value: z.string(),
    valueMax: z.string(),
    values: z.array(z.string()),
  })
  .superRefine((v, ctx) => {
    if (v.operator === 'anyOf') {
      if (!v.values.length)
        ctx.issues.push({
          code: 'custom',
          path: ['values'],
          message: 'add a value',
          input: v.values,
        });
    } else if (v.operator === 'between') {
      if (!v.value)
        ctx.issues.push({
          code: 'custom',
          path: ['value'],
          message: 'min required',
          input: v.value,
        });
      if (!v.valueMax)
        ctx.issues.push({
          code: 'custom',
          path: ['valueMax'],
          message: 'max required',
          input: v.valueMax,
        });
    } else if (!v.value) {
      ctx.issues.push({
        code: 'custom',
        path: ['value'],
        message: 'value required',
        input: v.value,
      });
    }
  });

export const updateFilterSchema = z.object({
  join: z.enum(filterJoins),
  conditions: z.array(conditionSchema).min(1, 'add at least one condition'),
});

export const updateFilterFormOpts = formOptions({
  defaultValues: updateFilterDefaults,
  validators: { onChange: updateFilterSchema },
});
