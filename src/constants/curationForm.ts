import { formOptions } from '@tanstack/react-form';
import { z } from 'zod/v4';

export const overrideQueryMatch = z.enum(['exact', 'contains']);
type OverrideQueryMatch = z.infer<typeof overrideQueryMatch>;
const overrideRuleQuerySchema = z.object({
  query: z.string(), // .optional()
  match: overrideQueryMatch, // .optional()
});

const overrideRuleFilterSchema = z.object({
  filter_by: z.string(), // .optional()
});

const overrideRuleTagsSchema = z.object({
  tags: z.string(), // z.array(z.string())// .optional()
});

// const rule = z.union([
//   overrideRuleQuerySchema,
//   overrideRuleFilterSchema,
//   overrideRuleTagsSchema,
// ]);
const rule = overrideRuleQuerySchema
  .and(overrideRuleFilterSchema)
  .and(overrideRuleTagsSchema);

export const overrideValues = z
  .object({
    overrideId: z.string(),
    rule_query_bool: z.boolean(),
    rule_filter_bool: z.boolean(),
    rule_tags_bool: z.boolean(),
    rule,
    filter_by_bool: z.boolean(),
    filter_by: z.string(),
    sort_by_bool: z.boolean(),
    sort_by: z.string(),
    remove_match_tokens: z.boolean(),
    replace_query_bool: z.boolean(),
    replace_query: z.string(),
    // TODO: includes and excludes
    // includes: z.array(
    //   z.object({
    //     id: z.string(),
    //     position: z.number(),
    //   })
    // ), //.optional(), // "Pin Documents" field ?? (search for docs) --> array field (docId & position)
    // excludes: z.array(z.object({ id: z.string() })), // .optional(), // "Hide Documents" field ??
    filter_curated_hits: z.boolean(),
    effective_from_ts_bool: z.boolean(),
    effective_to_ts_bool: z.boolean(),
    effective_from_ts: z.date(), //.nullable(), // number (seconds)
    effective_to_ts: z.date(), // .nullable(), // number (seconds)
    stop_processing: z.boolean(),
    custom_metadata_bool: z.boolean(),
    metadata: z.string(),
    // .check((ctx) => {
    //   // if (ctx.)
    //   try {
    //     JSON.parse(ctx.value);
    //   } catch (_) {
    //     ctx.issues.push({
    //       code: 'custom', // 'invalid_value',
    //       message: 'metadata must be valid JSON',
    //       input: ctx.value,
    //     });
    //   }
    // }),
    // metadata: z.string().refine((val) => {
    //   try {
    //     JSON.parse(val)
    //   } catch (_) {
    //     return false
    //   }
    // }),
  })
  .refine(
    ({ custom_metadata_bool, metadata }) => {
      if (custom_metadata_bool) {
        try {
          JSON.parse(metadata);
        } catch (_) {
          return false;
        }
      }
      return true;
    },
    {
      path: ['metadata'],
      message: '`metadata` must be valid JSON',
    }
  );

export const overrideCreateSchema = z.object({
  overrideId: z.string(),
  rule: rule,
  filter_by: z.string(),
  sort_by: z.string(),
  remove_match_tokens: z.boolean(),
  replace_query: z.string(),
  includes: z.array(
    z.object({
      id: z.string(),
      position: z.number(),
    })
  ),
  excludes: z.array(z.object({ id: z.string() })),
  filter_curated_hits: z.boolean(),
  effective_from_ts_bool: z.boolean(),
  effective_to_ts_bool: z.boolean(),
  effective_from_ts: z.number(), // date (seconds)
  effective_to_ts: z.number(), // date (seconds)
  stop_processing: z.boolean(),
  metadata: z.record(z.string(), z.any()),
});

export const defaultOverrideValues = {
  overrideId: '',
  rule_query_bool: false,
  rule_filter_bool: false,
  rule_tags_bool: false,
  rule: {
    query: '',
    match: 'exact' as OverrideQueryMatch,
    filter_by: '',
    tags: '',
  },
  // includes: [],
  // excludes: [],
  filter_by_bool: false,
  filter_by: '',
  sort_by_bool: false,
  sort_by: '',
  filter_curated_hits: false,
  replace_query_bool: false,
  replace_query: '',
  remove_match_tokens: false,
  custom_metadata_bool: false,
  metadata: '',
  stop_processing: true,
  effective_from_ts_bool: false,
  effective_from_ts: new Date(), // null, // as Date,
  effective_to_ts_bool: false,
  effective_to_ts: new Date(), // null, // '', // null as Date
};

export const overrideFormOpts = formOptions({
  defaultValues: defaultOverrideValues,
  validators: {
    onChange: overrideValues,
  },
});
