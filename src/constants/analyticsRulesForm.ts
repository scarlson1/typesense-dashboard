import { formOptions } from '@tanstack/react-form';
import { z } from 'zod/v4';

export const analyticsRuleType = z.enum([
  'popular_queries',
  'nohits_queries',
  'counter',
  'log',
]);
// type AnalyticsRuleType = z.infer<typeof analyticsRuleType>;

export const analyticsEventType = z.enum([
  'search',
  'click',
  'conversion',
  'visit',
]);

export const analyticsRuleCreateValues = z.object({
  name: z.string(),
  type: analyticsRuleType,
  // event_type: analyticsEventType.or(z.string()),
  params: z.object({
    enable_auto_aggregation: z.boolean(),
    source: z.object({
      collections: z.array(z.string()),
      // events: z.array(
      //   z.object({
      //     type: z.string(),
      //     weight: z.number(),
      //     name: z.string(),
      //   })
      // ), // .optional(),
    }),
    expand_query: z.boolean(), // .optional(),
    destination: z.object({
      collection: z.string(),
      // counter_field: z.string(), // .optional()
    }),
    limit: z.string(), // z.number().int(), // .optional()
  }),
});
export type AnalyticsRuleCreateValues = z.infer<
  typeof analyticsRuleCreateValues
>;

export const analyticsFormDefaultValues = {
  name: '',
  type: 'popular_queries', // analyticsRuleType.enum.popular_queries as AnalyticsRuleType,
  // event_type: '',
  params: {
    source: {
      collections: [],
      // events: [],
    },
    expand_query: false,
    enable_auto_aggregation: true,
    destination: {
      collection: '',
      // counter_field: '',
    },
    limit: '', // as unknown as number,
  },
} as AnalyticsRuleCreateValues;

export const analyticsFormOpts = formOptions({
  defaultValues: analyticsFormDefaultValues,
  validators: {
    onChange: analyticsRuleCreateValues,
  },
});

// ----- V30 ------ //

export const analyticsRuleCreateValuesV30 = z.object({
  name: z.string(),
  type: analyticsRuleType,
  collection: z.string(),
  event_type: analyticsEventType.or(z.string()),
  rule_tag: z.string(),
  params: z.object({
    destination_collection: z.string(),
    // enable_auto_aggregation: z.boolean(),
    expand_query: z.boolean(), // .optional(),
    limit: z.number().int(), // .optional()
    meta_fields: z.array(z.string()),
    counter_field: z.string(),
    weight: z.number(), // z.string(),
  }),
});
export type AnalyticsRuleCreateValuesV30 = z.infer<
  typeof analyticsRuleCreateValuesV30
>;

export const analyticsFormDefaultValuesV30 = {
  name: '',
  type: 'popular_queries',
  collection: '',
  event_type: '',
  rule_tag: '',
  params: {
    destination_collection: '',
    expand_query: false,
    limit: 1000, // as unknown as number,
    meta_fields: [],
    counter_field: '',
    weight: 1,
  },
} as AnalyticsRuleCreateValuesV30;

export const analyticsFormOptsV30 = formOptions({
  defaultValues: analyticsFormDefaultValuesV30,
  validators: {
    onChange: analyticsRuleCreateValuesV30,
  },
});
