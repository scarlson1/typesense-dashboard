import { formOptions } from '@tanstack/react-form';
import { z } from 'zod/v4';

export const analyticsRuleType = z.enum([
  'popular_queries',
  'nohits_queries',
  'counter',
]);
// type AnalyticsRuleType = z.infer<typeof analyticsRuleType>;

export const analyticsRuleCreateValues = z.object({
  name: z.string(),
  type: analyticsRuleType,
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
  params: {
    source: {
      collections: [],
      // events: [],
    },
    expand_query: false,
    enable_auto_aggregation: false,
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
