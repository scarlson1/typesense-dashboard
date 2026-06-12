import { dangerButtonSx, SectionCard, smallButtonSx } from '@/components/redesign';
import {
  useAsyncToast,
  useDeleteByQuery,
  useDialog,
  useTypesenseClient,
  useUpdateByQuery,
} from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { Button, Divider, Stack, TextField, Typography } from '@mui/material';
import { useCallback, useState } from 'react';

type PendingCount = 'delete' | 'update' | null;

const monoInputSlotProps = {
  input: { sx: { fontFamily: designTokens.fontMono, fontSize: 12.5 } },
} as const;

/**
 * Bulk write operations against a collection's documents: update-by-filter
 * and delete-by-filter. Both preview the match count and confirm before
 * touching anything.
 */
export const BulkDocumentOpsCard = ({
  collectionId,
}: {
  collectionId: string;
}) => {
  const toast = useAsyncToast();
  const dialog = useDialog();
  const [client] = useTypesenseClient();

  const [deleteFilter, setDeleteFilter] = useState('');
  const [updateFilter, setUpdateFilter] = useState('');
  const [updateDoc, setUpdateDoc] = useState('');
  const [counting, setCounting] = useState<PendingCount>(null);

  const deleteMutation = useDeleteByQuery({
    onSuccess: () => setDeleteFilter(''),
  });
  const updateMutation = useUpdateByQuery();

  const countMatches = useCallback(
    async (filterBy: string) => {
      const res = await client
        .collections(collectionId)
        .documents()
        .search({ q: '*', filter_by: filterBy, per_page: 0 });
      return res.found;
    },
    [client, collectionId],
  );

  const handleDelete = useCallback(async () => {
    const filterBy = deleteFilter.trim();
    if (!filterBy) return void toast.warn('filter_by is required');

    setCounting('delete');
    let found: number;
    try {
      found = await countMatches(filterBy);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'error counting matches',
      );
      return;
    } finally {
      setCounting(null);
    }

    if (!found) return void toast.info('no documents match this filter');

    try {
      await dialog.prompt({
        variant: 'danger',
        catchOnCancel: true,
        title: `Delete ${found.toLocaleString()} documents?`,
        description: `Documents in "${collectionId}" matching ${filterBy} will be permanently deleted. This action cannot be undone.`,
        slotProps: {
          cancelButton: { children: 'cancel' },
          acceptButton: { children: `delete ${found.toLocaleString()} docs` },
        },
      });
    } catch (err) {
      console.log('cancelled delete by query', err);
      return;
    }

    deleteMutation.mutate({ collectionId, filterBy });
  }, [collectionId, countMatches, deleteFilter, deleteMutation, dialog, toast]);

  const handleUpdate = useCallback(async () => {
    const filterBy = updateFilter.trim();
    if (!filterBy) return void toast.warn('filter_by is required');

    let document: Record<string, unknown>;
    try {
      document = JSON.parse(updateDoc);
    } catch {
      return void toast.warn('document patch is not valid JSON');
    }
    if (
      !document ||
      Array.isArray(document) ||
      typeof document !== 'object' ||
      !Object.keys(document).length
    ) {
      return void toast.warn(
        'document patch must be a JSON object with at least one field',
      );
    }

    setCounting('update');
    let found: number;
    try {
      found = await countMatches(filterBy);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : 'error counting matches',
      );
      return;
    } finally {
      setCounting(null);
    }

    if (!found) return void toast.info('no documents match this filter');

    try {
      await dialog.prompt({
        variant: 'danger',
        catchOnCancel: true,
        title: `Update ${found.toLocaleString()} documents?`,
        description: `The fields ${Object.keys(document).join(', ')} will be patched onto every document in "${collectionId}" matching ${filterBy}.`,
        slotProps: {
          cancelButton: { children: 'cancel' },
          acceptButton: { children: `update ${found.toLocaleString()} docs` },
        },
      });
    } catch (err) {
      console.log('cancelled update by query', err);
      return;
    }

    updateMutation.mutate({ collectionId, document, filterBy });
  }, [
    collectionId,
    countMatches,
    dialog,
    toast,
    updateDoc,
    updateFilter,
    updateMutation,
  ]);

  return (
    <SectionCard
      title='Bulk document operations'
      description='Update or delete every document matching a filter. The match count is previewed before anything runs.'
    >
      <Stack sx={{ gap: 1.25 }}>
        <Typography
          sx={{ fontSize: 12.5, fontWeight: 600, color: designTokens.text }}
        >
          Update by filter
        </Typography>
        <TextField
          label='Update filter (filter_by)'
          placeholder='e.g. in_stock:false'
          value={updateFilter}
          onChange={(e) => setUpdateFilter(e.target.value)}
          size='small'
          fullWidth
          slotProps={monoInputSlotProps}
        />
        <TextField
          label='Document patch (JSON)'
          placeholder='{ "on_sale": true }'
          value={updateDoc}
          onChange={(e) => setUpdateDoc(e.target.value)}
          size='small'
          fullWidth
          multiline
          minRows={3}
          slotProps={monoInputSlotProps}
        />
        <Button
          variant='outlined'
          size='small'
          sx={smallButtonSx}
          onClick={() => void handleUpdate()}
          loading={counting === 'update' || updateMutation.isPending}
        >
          Preview &amp; update matches
        </Button>
      </Stack>

      <Divider />

      <Stack sx={{ gap: 1.25 }}>
        <Typography
          sx={{ fontSize: 12.5, fontWeight: 600, color: designTokens.danger }}
        >
          Delete by filter
        </Typography>
        <TextField
          label='Delete filter (filter_by)'
          placeholder='e.g. num_employees:<10'
          value={deleteFilter}
          onChange={(e) => setDeleteFilter(e.target.value)}
          size='small'
          fullWidth
          slotProps={monoInputSlotProps}
        />
        <Button
          variant='outlined'
          size='small'
          sx={dangerButtonSx}
          onClick={() => void handleDelete()}
          loading={counting === 'delete' || deleteMutation.isPending}
        >
          Preview &amp; delete matches
        </Button>
      </Stack>
    </SectionCard>
  );
};
