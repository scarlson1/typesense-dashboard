import { Badge } from '@/components/redesign';
import { apiKeyQueryKeys } from '@/constants';
import { useAsyncToast, useDialog, useTypesenseClient } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { queryClient } from '@/utils';
import { DeleteOutlineRounded, ExpandMoreRounded } from '@mui/icons-material';
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
import { useState } from 'react';
import type { KeySchema } from 'typesense/lib/Typesense/Key';
import type { KeysRetrieveSchema } from 'typesense/lib/Typesense/Keys';

// chips/collections beyond these counts are hidden behind a "show more" toggle
const COLLAPSED_ACTION_COUNT = 6;
const COLLAPSED_COLLECTION_COUNT = 3;

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

// const copyButtonSx = {
//   width: 22,
//   height: 22,
//   border: `1px solid ${designTokens.border}`,
//   borderRadius: '4px',
//   background: designTokens.surface,
//   color: designTokens.textFaint,
//   '&:hover': { borderColor: designTokens.borderStrong },
// };

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
      const keysData: KeysRetrieveSchema | undefined = queryClient.getQueryData(
        apiKeyQueryKeys.all(clusterId),
      );
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

  const deleteButtonSx = {
    width: 26,
    height: 26,
    borderRadius: '5px',
    color: designTokens.textFaint,
    '&:hover': {
      color: designTokens.danger,
      background: designTokens.dangerSoft,
    },
  };

  return (
    <>
      {/* Mobile card list */}
      <Box sx={{ display: { xs: 'block', md: 'none' } }}>
        {keys.map((k, i) => (
          <MobileKeyCard
            key={k.id}
            k={k}
            isFirst={i === 0}
            onCopy={handleCopy}
          />
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
              <TableCell sx={thSx}>Expires</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {keys.map((k, i) => (
              <DesktopKeyRow
                key={k.id}
                k={k}
                isFirst={i === 0}
                isDeleting={mutation.isPending}
                onCopy={handleCopy}
                onDelete={handleDelete}
                deleteButtonSx={deleteButtonSx}
              />
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

interface DesktopKeyRowProps {
  k: KeySchema;
  isFirst: boolean;
  isDeleting: boolean;
  onCopy: (text: string) => void;
  onDelete: (key: KeySchema) => void;
  deleteButtonSx: object;
}

function DesktopKeyRow({
  k,
  isFirst,
  isDeleting,
  onCopy,
  onDelete,
  deleteButtonSx,
}: DesktopKeyRowProps) {
  const [expanded, setExpanded] = useState(false);

  const actions = k.actions ?? [];
  const allCollections = k.collections ?? [];
  const isAllCollections = allCollections.includes('*');

  const hiddenActions = Math.max(0, actions.length - COLLAPSED_ACTION_COUNT);
  const hiddenCollections = isAllCollections
    ? 0
    : Math.max(0, allCollections.length - COLLAPSED_COLLECTION_COUNT);
  const collapsible = hiddenActions > 0 || hiddenCollections > 0;

  const visibleActions =
    expanded || !collapsible
      ? actions
      : actions.slice(0, COLLAPSED_ACTION_COUNT);

  const visibleCollections =
    expanded || !collapsible
      ? allCollections
      : allCollections.slice(0, COLLAPSED_COLLECTION_COUNT);

  return (
    <TableRow
      sx={{
        '& td': {
          px: 1.75,
          py: 1.5,
          border: 'none',
          borderTop: isFirst ? 'none' : `1px solid ${designTokens.border}`,
          verticalAlign: 'top',
        },
        '&:hover': { background: designTokens.surfaceMuted },
      }}
    >
      <TableCell sx={{ px: 0.75, width: 40 }}>
        <Tooltip title='Delete key'>
          <IconButton
            size='small'
            onClick={() => onDelete(k)}
            disabled={isDeleting}
            sx={deleteButtonSx}
          >
            <DeleteOutlineRounded sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
      </TableCell>

      <TableCell>
        <Typography
          sx={{
            fontSize: 13,
            fontWeight: 500,
            color: designTokens.text,
            mb: 0.5,
          }}
        >
          {k.description || `Key #${k.id}`}
        </Typography>
        <KeyTypeBadge actions={k.actions} />
      </TableCell>

      <TableCell sx={{ whiteSpace: 'nowrap' }}>
        <Stack direction='row' spacing={0.75} sx={{ alignItems: 'center' }}>
          <Typography
            component='span'
            sx={{
              fontFamily: designTokens.fontMono,
              fontSize: 12.5,
              color: designTokens.text,
            }}
          >
            {k.value_prefix}
            <Box component='span' sx={{ color: designTokens.textSubtle }}>
              •••••••••••••••
            </Box>
          </Typography>
          {/* <Tooltip title='Copy prefix'>
            <IconButton
              size='small'
              onClick={() => onCopy(k.value_prefix || '')}
              sx={copyButtonSx}
            >
              <ContentCopyOutlined sx={{ fontSize: 11 }} />
            </IconButton>
          </Tooltip> */}
        </Stack>
      </TableCell>

      <TableCell>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {visibleActions.map((a) => (
            <Box key={a} component='span' sx={actionChipSx}>
              {a}
            </Box>
          ))}
          {!expanded && hiddenActions > 0 && (
            <Box
              component='span'
              onClick={() => setExpanded(true)}
              sx={{
                ...actionChipSx,
                cursor: 'pointer',
                color: designTokens.accent,
                borderColor: designTokens.accentBorder,
                background: designTokens.accentSoft,
              }}
            >
              +{hiddenActions} more
            </Box>
          )}
        </Box>
        {collapsible && (
          <Stack
            direction='row'
            onClick={() => setExpanded((v) => !v)}
            sx={{
              mt: 1,
              alignItems: 'center',
              gap: 0.25,
              cursor: 'pointer',
              color: designTokens.textMuted,
              width: 'fit-content',
              '&:hover': { color: designTokens.text },
            }}
          >
            <Typography
              sx={{ fontSize: 12, fontWeight: 600, color: 'inherit' }}
            >
              {expanded ? 'Show less' : 'Show all'}
            </Typography>
            <ExpandMoreRounded
              sx={{
                fontSize: 16,
                transition: 'transform 120ms ease',
                transform: expanded ? 'rotate(180deg)' : 'none',
              }}
            />
          </Stack>
        )}
      </TableCell>

      <TableCell>
        <Typography
          sx={{
            fontSize: 12,
            fontFamily: designTokens.fontMono,
            color: designTokens.textMuted,
          }}
        >
          {isAllCollections ? (
            <Box component='span' sx={{ color: designTokens.text }}>
              all collections
            </Box>
          ) : allCollections.length ? (
            <>
              {visibleCollections.join(', ')}
              {!expanded && hiddenCollections > 0
                ? ` +${hiddenCollections}`
                : ''}
            </>
          ) : (
            '—'
          )}
        </Typography>
      </TableCell>

      <TableCell>
        <Typography sx={{ fontSize: 12, color: designTokens.textMuted }}>
          {k.expires_at
            ? new Date(k.expires_at * 1000).toLocaleDateString(undefined, {
                month: 'short',
                day: '2-digit',
                year: 'numeric',
              })
            : '—'}
        </Typography>
      </TableCell>
    </TableRow>
  );
}

interface MobileKeyCardProps {
  k: KeySchema;
  isFirst: boolean;
  onCopy: (text: string) => void;
}

function MobileKeyCard({ k, isFirst, onCopy }: MobileKeyCardProps) {
  const [expanded, setExpanded] = useState(false);

  const actions = k.actions ?? [];
  const allCollections = k.collections ?? [];
  const isAllCollections = allCollections.includes('*');

  const hiddenActions = Math.max(0, actions.length - COLLAPSED_ACTION_COUNT);
  const hiddenCollections = isAllCollections
    ? 0
    : Math.max(0, allCollections.length - COLLAPSED_COLLECTION_COUNT);
  const collapsible = hiddenActions > 0 || hiddenCollections > 0;

  const visibleActions =
    expanded || !collapsible
      ? actions
      : actions.slice(0, COLLAPSED_ACTION_COUNT);

  const collectionsLabel = isAllCollections
    ? 'all collections'
    : allCollections.length
      ? (expanded || !collapsible
          ? allCollections
          : allCollections.slice(0, COLLAPSED_COLLECTION_COUNT)
        ).join(', ')
      : '—';

  return (
    <Box
      sx={{
        px: 2,
        py: 1.625,
        borderTop: isFirst ? 'none' : `1px solid ${designTokens.border}`,
      }}
    >
      {/* Description + badge */}
      <Stack
        direction='row'
        sx={{
          mb: 0.625,
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography
          sx={{ fontSize: 14, fontWeight: 600, color: designTokens.text }}
        >
          {k.description || `Key #${k.id}`}
        </Typography>
        <KeyTypeBadge actions={k.actions} />
      </Stack>

      {/* Key prefix + copy */}
      <Stack
        direction='row'
        spacing={0.75}
        sx={{ mb: 0.875, alignItems: 'center' }}
      >
        <Typography
          component='span'
          sx={{
            fontFamily: designTokens.fontMono,
            fontSize: 12.5,
            color: designTokens.text,
          }}
        >
          {k.value_prefix}
          <Box component='span' sx={{ color: designTokens.textSubtle }}>
            •••••••••••
          </Box>
        </Typography>
        {/* <Tooltip title='Copy prefix'>
          <IconButton
            size='small'
            onClick={() => onCopy(k.value_prefix || '')}
            sx={copyButtonSx}
          >
            <ContentCopyOutlined sx={{ fontSize: 11 }} />
          </IconButton>
        </Tooltip> */}
      </Stack>

      {/* Actions + collection scope */}
      <Stack
        direction='row'
        spacing={1}
        sx={{ justifyContent: 'space-between', alignItems: 'flex-start' }}
      >
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, flex: 1 }}>
          {visibleActions.map((a) => (
            <Box key={a} component='span' sx={actionChipSx}>
              {a}
            </Box>
          ))}
          {!expanded && hiddenActions > 0 && (
            <Box
              component='span'
              onClick={() => setExpanded(true)}
              sx={{
                ...actionChipSx,
                cursor: 'pointer',
                color: designTokens.accent,
                borderColor: designTokens.accentBorder,
                background: designTokens.accentSoft,
              }}
            >
              +{hiddenActions} more
            </Box>
          )}
        </Box>
        <Typography
          sx={{
            fontSize: 12,
            fontFamily: designTokens.fontMono,
            color: designTokens.textMuted,
            flexShrink: 0,
            textAlign: 'right',
          }}
        >
          {collectionsLabel}
          {!expanded && hiddenCollections > 0 ? ` +${hiddenCollections}` : ''}
        </Typography>
      </Stack>

      {collapsible && (
        <Stack
          direction='row'
          onClick={() => setExpanded((v) => !v)}
          sx={{
            mt: 1,
            alignItems: 'center',
            gap: 0.25,
            cursor: 'pointer',
            color: designTokens.textMuted,
            '&:hover': { color: designTokens.text },
          }}
        >
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'inherit' }}>
            {expanded ? 'Show less' : 'Show all'}
          </Typography>
          <ExpandMoreRounded
            sx={{
              fontSize: 16,
              transition: 'transform 120ms ease',
              transform: expanded ? 'rotate(180deg)' : 'none',
            }}
          />
        </Stack>
      )}
    </Box>
  );
}

function KeyTypeBadge({ actions }: { actions?: string[] }) {
  if (!actions?.length) return null;
  const isAdmin = actions.includes('*');
  const isSearch = actions.length === 1 && actions[0] === 'documents:search';
  if (isAdmin) return <Badge tone='warn'>● admin</Badge>;
  if (isSearch) return <Badge tone='indigo'>search</Badge>;
  return <Badge tone='neutral'>scoped</Badge>;
}

export default ApiKeyGrid;
