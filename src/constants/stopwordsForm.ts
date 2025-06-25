import { formOptions } from '@tanstack/react-form';
import { z } from 'zod/v4';

export const stopwordsValues = z.object({
  stopwordId: z.string(),
  stopwords: z.string(), // z.array(z.string()).min(1),
  locale: z.string(),
});

export const stopwordsFormOpts = formOptions({
  defaultValues: {
    stopwordId: '',
    stopwords: '', // [],
    locale: '',
  },
  validators: {
    onChange: stopwordsValues,
  },
});
