import {
  analyticsFormOpts,
  analyticsQueryKeys,
  collectionQueryKeys,
  type AnalyticsRuleCreateValues,
} from '@/constants';
import { useAppForm, useAsyncToast, useTypesenseClient } from '@/hooks';
import { queryClient } from '@/utils';
import { Box } from '@mui/material';
import { useMutation, useSuspenseQuery } from '@tanstack/react-query';
import type { AnalyticsRuleCreateSchemaV1 } from 'typesense';
import { AnalyticsRuleForm } from './AnalyticsRuleForm';

interface UpdateAnalyticsRuleProps {
  defaultValues: AnalyticsRuleCreateValues;
  submitButtonText?: string;
}

export function UpdateAnalyticsRule({
  defaultValues,
  submitButtonText = 'Update Analytics Rule',
}: UpdateAnalyticsRuleProps) {
  const toast = useAsyncToast();
  const [client, clusterId] = useTypesenseClient();

  const mutation = useMutation({
    mutationFn: ({
      name,
      schema,
    }: {
      name: string;
      schema: AnalyticsRuleCreateSchemaV1;
    }) => client.analyticsV1.rules().upsert(name, schema),
    onMutate: (vars) => {
      toast.loading(`saving analytics rule`, {
        id: `rule-updated-${vars.name}`,
      });
    },
    onSuccess: (_, vars) => {
      toast.success(`analytics rule saved`, {
        id: `rule-updated-${vars.name}`,
      });
    },
    onError: (err, vars, ctx) => {
      console.log(err, vars, ctx);
      const msg = err?.message || 'failed to save analytics rule';
      toast.error(msg, { id: `rule-updated-${vars.name}` });
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: analyticsQueryKeys.rules(clusterId),
      });
    },
  });

  const form = useAppForm({
    ...analyticsFormOpts,
    defaultValues,
    onSubmit: async ({ value }) => {
      const { name, type, params } = value;
      const schema: AnalyticsRuleCreateSchemaV1 = {
        type,
        params: {
          ...params,
          limit: isNaN(Number(params.limit)) ? undefined : Number(params.limit),
        },
      };

      try {
        await mutation.mutateAsync({
          name,
          schema,
        });

        form.reset();
      } catch (err) {
        console.log(err);
      }
    },
  });

  return (
    <AnalyticsRuleFormComponent
      form={form}
      submitButtonText={submitButtonText}
    />
  );
}

interface AnalyticsRuleFormComponentProps {
  form: any; // AppFieldExtendedReactFormApi
  submitButtonText: string;
}

function AnalyticsRuleFormComponent({
  form,
  submitButtonText,
}: AnalyticsRuleFormComponentProps) {
  const [client, clusterId] = useTypesenseClient();
  const { data: collectionNames } = useSuspenseQuery({
    queryKey: collectionQueryKeys.names(clusterId, { withAlias: true }),
    queryFn: async () => {
      const collections = await client.collections().retrieve();
      const aliasRes = await client.aliases().retrieve();

      const collectionNames = collections.map((c: { name: string }) => c.name);
      const aliasNames = aliasRes.aliases.map((a: { name: string }) => a.name);

      return [...aliasNames, ...collectionNames];
    },
  });

  return (
    <Box
      component='form'
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      noValidate
    >
      <AnalyticsRuleForm
        form={form}
        sourceOptions={collectionNames}
        destinationOptions={collectionNames}
        submitButtonText={submitButtonText}
      />
    </Box>
  );
}
