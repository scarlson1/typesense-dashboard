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
import type { AnalyticsRuleCreateSchema } from 'typesense/lib/Typesense/AnalyticsRule';
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
      schema: AnalyticsRuleCreateSchema;
    }) => client.analytics.rules().upsert(name, schema),
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
      let msg = err?.message || 'failed to save analytics rule';
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
      const schema: AnalyticsRuleCreateSchema = {
        type,
        params: {
          ...params,
          limit: isNaN(Number(params.limit)) ? undefined : Number(params.limit),
        },
      };

      try {
        let res = await mutation.mutateAsync({
          name,
          schema,
        });

        form.reset();
      } catch (err) {}
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
      let collections = await client.collections().retrieve();
      let aliasRes = await client.aliases().retrieve();

      let collectionNames = collections.map((c) => c.name);
      let aliasNames = aliasRes.aliases.map((a) => a.name);

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
