import { collectionQueryKeys } from '@/constants';
import { queryClient } from '@/utils';
import { useMutation, type MutationOptions } from '@tanstack/react-query';
import { useCallback, useState } from 'react';
import type { DocumentImportParameters } from 'typesense/lib/Typesense/Documents';
import { useAsyncToast } from './useAsyncToast';
import { useTypesenseClient } from './useTypesenseClient';

interface ImportDocsVars {
  collectionId: string;
  documents: string;
  options?: DocumentImportParameters;
}
export interface MultiDocImportRes {
  success: boolean;
  error?: string;
  document?: string;
  id?: string;
}
export type UseImportDocuments = Omit<
  MutationOptions<MultiDocImportRes[], Error, ImportDocsVars>,
  'mutationFn'
>;

export const useImportDocuments = (options?: UseImportDocuments) => {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();
  const [results, setResults] = useState<MultiDocImportRes[]>([]);

  const clearResults = useCallback(() => {
    setResults([]);
  }, []);

  const mutation = useMutation({
    mutationFn: async ({
      collectionId,
      documents,
      options,
    }: ImportDocsVars) => {
      let res = await client
        .collections(collectionId)
        .documents()
        .import(documents, options);
      return res.split('\n').map((l) => JSON.parse(l)) as MultiDocImportRes[];
    },
    onMutate: (vars) => {
      toast.loading(`importing documents...`, { id: `import-docs` });
      options?.onMutate && options.onMutate(vars);
    },
    onSuccess: (data, vars, ctx) => {
      // TODO: import will always return 200 --> need to handle success/error for each doc
      console.log('lines: ', data);
      setResults(data);

      const successCount = data.reduce(
        // @ts-ignore
        (acc, cur) => acc + cur.success * 1,
        0
      );

      const failCount = data.reduce(
        // @ts-ignore
        (acc, cur) => acc + !cur.success * 1,
        0
      );

      let severityMethod = failCount ? 'warn' : 'success';

      toast[severityMethod as keyof typeof toast](
        `import complete [success: ${successCount}; failed: ${failCount}]`,
        {
          id: `import-docs`,
        }
      );

      options?.onSuccess && options.onSuccess(data, vars, ctx);
    },
    onError: (err, vars, ctx) => {
      toast.error(`importing documents...`, { id: `import-docs` });
      options?.onError && options.onError(err, vars, ctx);
    },
    onSettled: (data, err, vars, ctx) => {
      options?.onSettled && options.onSettled(data, err, vars, ctx);
      queryClient.invalidateQueries({
        queryKey: collectionQueryKeys.documents(clusterId, vars.collectionId),
      });
    },
  });

  return [mutation, results, clearResults] as const;
};
