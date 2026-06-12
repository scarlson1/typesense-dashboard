import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { DocumentsExportParameters } from 'typesense/lib/Typesense/Documents';
import { useAsyncToast } from './useAsyncToast';
import { useTypesenseClient } from './useTypesenseClient';

interface ExportDocsVars {
  collectionId: string;
  options?: DocumentsExportParameters;
}
export type UseExportDocumentsProps = Omit<
  UseMutationOptions<string, Error, ExportDocsVars>,
  'mutationFn'
>;

/**
 * Exports a collection's documents as a JSONL string. The whole export is
 * buffered in memory by the JS client, so callers should warn before running
 * this against very large collections.
 */
export const useExportDocuments = (props?: UseExportDocumentsProps) => {
  const toast = useAsyncToast();
  const [client] = useTypesenseClient();

  return useMutation({
    mutationFn: ({ collectionId, options }: ExportDocsVars) =>
      client.collections(collectionId).documents().export(options),
    onMutate: (vars, ctx) => {
      toast.loading(`exporting documents...`, {
        id: `export-docs-${vars.collectionId}`,
      });
      props?.onMutate && props.onMutate(vars, ctx);
    },
    onSuccess: (data, vars, result, ctx) => {
      toast.success(`export complete`, {
        id: `export-docs-${vars.collectionId}`,
      });
      props?.onSuccess && props.onSuccess(data, vars, result, ctx);
    },
    onError: (err, vars, result, ctx) => {
      const errMsg = err?.message || `an error occurred exporting documents`;
      toast.error(errMsg, { id: `export-docs-${vars.collectionId}` });
      props?.onError && props.onError(err, vars, result, ctx);
    },
    onSettled: (data, err, vars, result, ctx) => {
      props?.onSettled && props.onSettled(data, err, vars, result, ctx);
    },
  });
};
