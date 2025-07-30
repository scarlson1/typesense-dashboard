import { Copy } from '@/components/Copy';
import { apiKeyQueryKeys } from '@/constants';
import { queryClient } from '@/utils/queryClient';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import type { KeyCreateSchema } from 'typesense/lib/Typesense/Key';
import { useAsyncToast } from './useAsyncToast';
import { useDialog } from './useDialog';
import { useTypesenseClient } from './useTypesenseClient';

type UseNewApiKeyProps = Omit<
  UseMutationOptions<KeyCreateSchema, Error, KeyCreateSchema>,
  'mutationFn'
>;

export const useCreateApiKey = (props?: UseNewApiKeyProps) => {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();
  const dialog = useDialog();

  const { onSuccess, onError, ...rest } = props || {};

  return useMutation({
    ...rest,
    mutationFn: (values: KeyCreateSchema) => client.keys().create(values),
    onSuccess: (data, vars) => {
      toast.success('API key created', { id: 'new-api-key' });
      queryClient.invalidateQueries({
        queryKey: apiKeyQueryKeys.all(clusterId),
      });

      dialog.prompt({
        variant: 'info',
        catchOnCancel: false,
        title: 'Copy new key',
        description: (
          <>
            Please copy the key below. <b>IT CANNOT BE RETRIEVED LATER</b>. If
            you lose the key, you'll need to create a new one.
          </>
        ),
        content: (
          <Copy
            value={data.value}
            textProps={{ color: 'textPrimary' }}
            buttonProps={{ color: 'primary' }}
          >
            {data.value}
          </Copy>
        ),
        slotProps: {
          dialog: {
            maxWidth: 'xs',
            fullWidth: true,
          },
        },
      });

      onSuccess && onSuccess(data, vars, {});
    },
    onError: (e, vars, ctx) => {
      let msg = e.message || 'an error occurred';
      toast.error(msg, { id: 'new-api-key' });
      onError && onError(e, vars, ctx);
    },
  });
};
