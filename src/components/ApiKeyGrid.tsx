import { apiKeyQueryKeys } from '@/constants';
import { Badge } from '@/components/redesign';
import { designTokens } from '@/theme/themePrimitives';
import { useAsyncToast, useDialog, useTypesenseClient } from '@/hooks';
import { queryClient } from '@/utils';
import {
  ContentCopyOutlined,
  DeleteOutlineRounded,
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';
import type { KeySchema } from 'typesense/lib/Typesense/Key';
import type { KeysRetrieveSchema } from 'typesense/lib/Typesense/Keys';

const thSx = {
  textAlign: 'left' as const,
  px: 1.75,
  py: 1.25,
  fontSize: 11,
  color: designTokens.textFaint,
  fontWeight: 600,
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  border: 'none',
  borderBottom: `1px solid ${designTokens.border}`,
  background: designTokens.surfaceTinted,
  whiteSpace: 'nowrap' as const,
};

const ApiKeyGrid = () => {
  const [client, clusterId] = useTypesenseClient();
  const toast = useAsyncToast();
  const dialog = useDialog();

  const { data, isError, error } = useQuery({
    queryKey: apiKeyQueryKeys.all(clusterId),
    queryFn: () => client.keys().retrieve(),
  });

  const mutation = useMutation({
    mutationFn: (id: number) => client.keys(id).delete(),
    onMutate: async (variables) => {
      await queryClient.cancelQueries({
        queryKey: apiKeyQueryKeys.all(clusterId),
      });
      const keysData: KeysRetrieveSchema | undefined =
        queryClient.getQueryData(apiKeyQueryKeys.all(clusterId));
      const prevKeyData = keysData?.keys.find((k) => k.id === variables);
      queryClient.setQueryData(
        apiKeyQueryKeys.all(clusterId),
        (data: KeysRetrieveSchema) => ({
          keys: data.keys?.filter((k) => k.id !== variables),
        }),
      );
      toast.loading(`deleting key [${variables}]...`, { id: 'delete-key' });
      return { id: variables, prevKeyData };
    },
    onSuccess: (_, __, ctx) => {
      toast.success(`API key ${ctx.id} deleted`, { id: 'delete-key' });
    },
    onError: (err, _, ctx) => {
      const msg = err.message || 'failed to delete key';
      toast.error(msg, { id: 'delete-key' });
      if (ctx?.prevKeyData) {
        queryClient.setQueryData(
          apiKeyQueryKeys.all(clusterId),
          (data: KeysRetrieveSchema) => ({
            keys: [...(data.keys || []), ctx.prevKeyData],
          }),
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: apiKeyQueryKeys.all(clusterId),
      });
    },
  });

  const handleDelete = async (key: KeySchema) => {
    try {
      await dialog.prompt({
        variant: 'danger',
        catchOnCancel: true,
        title: `Confirm API Key Deletion [ID: ${key.id}]`,
        description: `THIS ACTION CANNOT BE UNDONE. Please confirm whether you'd like to delete API Key with prefix ${key.value_prefix}`,
        slotProps: { dialog: { maxWidth: 'sm' } },
      });
      mutation.mutate(key.id);
    } catch {
      // cancelled
    }
  };

  const handleCopy = (text: string) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
      toast.success('prefix copied', { id: 'copy-prefix' });
    }
  };

  if (isError) {
    return (
      <Typography sx={{ p: 2, fontSize: 13, color: designTokens.textMuted }}>
        {error?.message || 'something went wrong'}
      </Typography>
    );
  }

  const keys = data?.keys ?? [];

  if (!keys.length) {
    return (
      <Box sx={{ px: 2, py: 3, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 13, color: designTokens.textMuted }}>
          No API keys found. Create one using the panel on the right.
        </Typography>
      </Box>
    );
  }

  const actionChipSx = {
    fontFamily: designTokens.fontMono,
    fontSize: 11,
    px: 0.75,
    py: '1px',
    background: designTokens.surfaceMuted,
    border: `1px solid ${designTokens.border}`,
    borderRadius: '3px',
    color: designTokens.textMuted,
    whiteSpace: 'nowrap' as const,
  };

  const copyButtonSx = {
    width: 22,
    height: 22,
    border: `1px solid ${designTokens.border}`,
    borderRadius: '4px',
    background: designTokens.surface,
    color: designTokens.textFaint,
    '&:hover': { borderColor: designTokens.borderStrong },
  };

  const deleteButtonSx = {
    width: 26,
    height: 26,
    borderRadius: '5px',
    color: designTokens.textFaint,
    '&:hover': { color: designTokens.danger, background: designTokens.dangerSoft },
  };

  return (
    <>
      {/* Mobile card list */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {keys.map((k, i) => (
          <Box
            key={k.id}
            sx={{
              px: 2,
              py: 1.625,
              borderTop: i === 0 ? 'none' : `1px solid ${designTokens.border}`,
            }}
          >
            {/* Description + badge */}
            <Stack direction='row' justifyContent='space-between' alignItems='center' sx={{ mb: 0.625 }}>
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: designTokens.text }}>
                {k.description || `Key #${k.id}`}
              </Typography>
              <KeyTypeBadge actions={k.actions} />
            </Stack>

            {/* Key prefix + copy */}
            <Stack direction='row' spacing={0.75} alignItems='center' sx={{ mb: 0.875 }}>
              <Typography
                component='span'
                sx={{ fontFamily: designTokens.fontMono, fontSize: 12.5, color: designTokens.text }}
              >
                {k.value_prefix}
                <Box component='span' sx={{ color: designTokens.textSubtle }}>•••••••••••</Box>
              </Typography>
              <Tooltip title='Copy prefix'>
                <IconButton size='small' onClick={() => handleCopy(k.value_prefix)} sx={copyButtonSx}>
                  <ContentCopyOutlined sx={{ fontSize: 11 }} />
                </IconButton>
              </Tooltip>
            </Stack>

            {/* Actions + collection scope */}
            <Stack direction='row' justifyContent='space-between' alignItems='flex-start' spacing={1}>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, flex: 1 }}>
                {k.actions?.map((a) => (
                  <Box key={a} component='span' sx={actionChipSx}>{a}</Box>
                ))}
              </Box>
              <Typography
                sx={{ fontSize: 12, fontFamily: designTokens.fontMono, color: designTokens.textMuted, flexShrink: 0 }}
              >
                {k.collections?.includes('*') ? 'all collections' : (k.collections?.join(', ') ?? '—')}
              </Typography>
            </Stack>
          </Box>
        ))}
      </Box>

      {/* Desktop table */}
      <TableContainer sx={{ display: { xs: 'none', md: 'block' } }}>
        <Table size='small' sx={{ tableLayout: 'auto' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ ...thSx, width: 40, px: 0.75 }} />
              <TableCell sx={thSx}>Description</TableCell>
              <TableCell sx={thSx}>Key</TableCell>
              <TableCell sx={thSx}>Actions</TableCell>
              <TableCell sx={thSx}>Collections</TableCell>
              <TableCell sx={thSx}>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {keys.map((k, i) => (
              <TableRow
                key={k.id}
                sx={{
                  '& td': {
                    px: 1.75,
                    py: 1.5,
                    border: 'none',
                    borderTop: i === 0 ? 'none' : `1px solid ${designTokens.border}`,
                    verticalAlign: 'top',
                  },
                  '&:hover': { background: designTokens.surfaceMuted },
                }}
              >
                <TableCell sx={{ px: 0.75, width: 40 }}>
                  <Tooltip title='Delete key'>
                    <IconButton
                      size='small'
                      onClick={() => handleDelete(k)}
                      disabled={mutation.isPending}
                      sx={deleteButtonSx}
                    >
                      <DeleteOutlineRounded sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Tooltip>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontSize: 13, fontWeight: 500, color: designTokens.text, mb: 0.5 }}>
                    {k.description || `Key #${k.id}`}
                  </Typography>
                  <KeyTypeBadge actions={k.actions} />
                </TableCell>

                <TableCell sx={{ whiteSpace: 'nowrap' }}>
                  <Stack direction='row' spacing={0.75} sx={{ alignItems: 'center' }}>
                    <Typography
                      component='span'
                      sx={{ fontFamily: designTokens.fontMono, fontSize: 12.5, color: designTokens.text }}
                    >
                      {k.value_prefix}
                      <Box component='span' sx={{ color: designTokens.textSubtle }}>•••••••••••••••</Box>
                    </Typography>
                    <Tooltip title='Copy prefix'>
                      <IconButton size='small' onClick={() => handleCopy(k.value_prefix)} sx={copyButtonSx}>
                        <ContentCopyOutlined sx={{ fontSize: 11 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {k.actions?.map((a) => (
                      <Box key={a} component='span' sx={actionChipSx}>{a}</Box>
                    ))}
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontSize: 12, fontFamily: designTokens.fontMono, color: designTokens.textMuted }}>
                    {k.collections?.includes('*') ? (
                      <Box component='span' sx={{ color: designTokens.text }}>all collections</Box>
                    ) : (k.collections?.join(', ') ?? '—')}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Typography sx={{ fontSize: 12, color: designTokens.textMuted }}>
                    {k.expires_at
                      ? new Date(k.expires_at * 1000).toLocaleDateString(undefined, {
                          month: 'short', day: '2-digit', year: 'numeric',
                        })
                      : '—'}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

function KeyTypeBadge({ actions }: { actions?: string[] }) {
  if (!actions?.length) return null;
  const isAdmin = actions.includes('*');
  const isSearch =
    actions.length === 1 && actions[0] === 'documents:search';
  if (isAdmin) return <Badge tone='warn'>● admin</Badge>;
  if (isSearch) return <Badge tone='indigo'>search</Badge>;
  return <Badge tone='neutral'>scoped</Badge>;
}

export default ApiKeyGrid;
