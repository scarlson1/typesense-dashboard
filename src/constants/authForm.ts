import { formOptions } from '@tanstack/react-form';
import { z } from 'zod/v4';

export const authSchema = z.object({
  node: z.string(),
  port: z.string(),
  protocol: z.string(), // z.enum(['http', 'https']),
  apiKey: z.string(),
  // remember: z.boolean(),
  env: z.string(), // environment,
});

export const authFormOpts = formOptions({
  defaultValues: {
    node: '',
    port: '',
    protocol: '',
    apiKey: '',
    // remember: false,
    env: '',
  },
  validators: {
    onChange: authSchema,
  },
});
