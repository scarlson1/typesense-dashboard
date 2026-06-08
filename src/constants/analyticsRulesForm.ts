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
export type AnalyticsEventType = z.infer<typeof analyticsEventType>;

export const eventTypesByRuleType: Record<
  z.infer<typeof analyticsRuleType>,
  z.infer<typeof analyticsEventType>[]
> = {
  popular_queries: ['search'],
  nohits_queries: ['search'],
  counter: ['click', 'conversion'],
  log: ['click', 'conversion', 'visit'],
};

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

// export const analyticsRuleCreateValuesV30 = z
//   .object({
//     name: z.string(),
//     type: analyticsRuleType,
//     collection: z.string(),
//     event_type: analyticsEventType.or(z.string()),
//     rule_tag: z.string(),
//     params: z.object({
//       destination_collection: z.string(),
//       // enable_auto_aggregation: z.boolean(),
//       expand_query: z.boolean(), // .optional(),
//       limit: z.number().int(), // .optional()
//       meta_fields: z.array(z.string()),
//       counter_field: z.string(),
//       weight: z.number(), // z.string(),
//     }),
//   })
//   .refine((data) => {
//     return eventTypesByRuleType[data.type].includes(
//       data.event_type as AnalyticsEventType,
//     );
//   });
// export type AnalyticsRuleCreateValuesV30 = z.infer<
//   typeof analyticsRuleCreateValuesV30
// >;

// export const analyticsFormDefaultValuesV30 = {
//   name: '',
//   type: 'popular_queries',
//   collection: '',
//   event_type: '',
//   rule_tag: '',
//   params: {
//     destination_collection: '',
//     expand_query: false,
//     limit: 1000, // as unknown as number,
//     meta_fields: [],
//     counter_field: '',
//     weight: 1,
//   },
// } as AnalyticsRuleCreateValuesV30;

// export const analyticsFormOptsV30 = formOptions({
//   defaultValues: analyticsFormDefaultValuesV30,
//   validators: {
//     onChange: analyticsRuleCreateValuesV30,
//   },
// });

// ----- V30 per-type submit schema (authoritative for the wire payload) ----- //

const baseRuleFields = {
  name: z.string(),
  collection: z.string(),
  rule_tag: z.string(),
};

const popularQueriesRule = z.object({
  ...baseRuleFields,
  type: z.literal('popular_queries'),
  event_type: z.literal('search'),
  params: z.object({
    destination_collection: z.string(),
    limit: z.number().int(),
    expand_query: z.boolean(),
    meta_fields: z.array(z.string()),
  }),
});

const nohitsQueriesRule = z.object({
  ...baseRuleFields,
  type: z.literal('nohits_queries'),
  event_type: z.literal('search'),
  params: z.object({
    destination_collection: z.string(),
    limit: z.number().int(),
  }),
});

const counterRule = z.object({
  ...baseRuleFields,
  type: z.literal('counter'),
  event_type: z.enum(['click', 'conversion', 'visit']),
  params: z.object({
    destination_collection: z.string(),
    counter_field: z.string(),
    weight: z.number(),
  }),
});

const logRule = z.object({
  ...baseRuleFields,
  collection: z.string(), //.optional(), // docs example omits collection for log
  type: z.literal('log'),
  event_type: z.enum(['click', 'conversion', 'visit', 'search']),
  params: z.object({}),
});

// z.object strips unknown keys, so e.g. counter_field/weight left in form state
// from a previous type are dropped automatically when a query rule is parsed.
export const analyticsRuleCreateSchemaV30 = z.discriminatedUnion('type', [
  popularQueriesRule,
  nohitsQueriesRule,
  counterRule,
  logRule,
]);
export type AnalyticsRuleCreateV30 = z.infer<
  typeof analyticsRuleCreateSchemaV30
>;

// ----- V30 UI config (presentation only: options, visibility, reset target) ----- //

export const analyticsRuleUiConfigV30 = {
  popular_queries: {
    eventTypes: ['search'],
    eventTypeFixed: true,
    showFields: ['limit', 'expand_query', 'meta_fields'],
  },
  nohits_queries: {
    eventTypes: ['search'],
    eventTypeFixed: true,
    showFields: ['limit'],
  },
  counter: {
    eventTypes: ['click', 'conversion', 'visit'],
    eventTypeFixed: false,
    showFields: ['counter_field', 'weight'],
  },
  log: {
    eventTypes: ['click', 'conversion', 'visit', 'search'],
    eventTypeFixed: false,
    showFields: [],
  },
} satisfies Record<
  z.infer<typeof analyticsRuleType>,
  {
    eventTypes: readonly z.infer<typeof analyticsEventType>[];
    eventTypeFixed: boolean;
    showFields: readonly string[];
  }
>;

export const analyticsFormDefaultValuesV30 = {
  name: '',
  type: 'popular_queries',
  collection: '',
  event_type: 'search',
  rule_tag: '',
  params: {
    destination_collection: '',
    expand_query: false,
    limit: 1000,
    meta_fields: [],
    // counter_field: '',
    // weight: 1,
  },
} as AnalyticsRuleCreateV30;

export const analyticsFormOptsV30 = formOptions({
  defaultValues: analyticsFormDefaultValuesV30,
  validators: {
    onChange: analyticsRuleCreateSchemaV30,
  },
});
