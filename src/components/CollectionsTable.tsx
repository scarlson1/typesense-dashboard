import {
  aliasQueryKeys,
  collectionQueryKeys,
  DEFAULT_MONACO_OPTIONS,
} from '@/constants';
import {
  useCollectionEditorDialog,
  useDeleteCollection,
  useTypesenseClient,
} from '@/hooks';
import { useConfirmDelete } from '@/hooks/useConfirmDelete';
import { designTokens } from '@/theme/themePrimitives';
import {
  DataObjectRounded,
  DeleteOutlineRounded,
  FiberManualRecordRounded,
  MoreHorizRounded,
} from '@mui/icons-material';
import {
  Box,
  IconButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { useQuery, useSuspenseQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { formatDistanceToNow } from 'date-fns';
import { useMemo, useState, type MouseEvent } from 'react';
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection';

const DEFAULT_VIEW_OPTIONS = { ...DEFAULT_MONACO_OPTIONS, readOnly: true };

const numericCellSx = {
  fontFamily: designTokens.fontMono,
  fontSize: 13,
  color: designTokens.text,
  textAlign: 'right' as const,
  whiteSpace: 'nowrap' as const,
};

export function CollectionsTable() {
  const [client, clusterId] = useTypesenseClient();

  const { data: collections } = useSuspenseQuery({
    queryKey: collectionQueryKeys.list(clusterId, {}),
    queryFn: () => client.collections().retrieve(),
  });

  const { data: aliases } = useQuery({
    queryKey: aliasQueryKeys.all(clusterId),
    queryFn: async () => {
      const res = await client.aliases().retrieve();
      return res.aliases || [];
    },
  });

  const aliasByCollection = useMemo(() => {
    const map = new Map<string, string>();
    (aliases ?? []).forEach((a) => {
      if (!map.has(a.collection_name)) map.set(a.collection_name, a.name);
    });
    return map;
  }, [aliases]);

  if (!collections.length) {
    return (
      <Box sx={{ px: 1.75, py: 4, textAlign: 'center' }}>
        <Typography sx={{ fontSize: 13, color: designTokens.textMuted }}>
          No collections yet. Create one to get started.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer>
      <Table size='small' sx={{ tableLayout: 'auto' }}>
        <TableHead>
          <TableRow
            sx={{
              background: designTokens.surfaceTinted,
              '& th': {
                px: 1.75,
                py: 1.25,
                fontSize: 11,
                color: designTokens.textFaint,
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                border: 'none',
                borderBottom: `1px solid ${designTokens.border}`,
                whiteSpace: 'nowrap',
              },
            }}
          >
            <TableCell>Name</TableCell>
            <TableCell sx={{ textAlign: 'right' }}>Documents</TableCell>
            <TableCell sx={{ textAlign: 'right' }}>Fields</TableCell>
            {/* <TableCell sx={{ textAlign: 'right' }}>Size</TableCell> */}
            <TableCell>Alias</TableCell>
            <TableCell>Updated</TableCell>
            {/* <TableCell>State</TableCell> */}
            <TableCell sx={{ width: 48 }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {collections.map((c, i) => (
            <CollectionRow
              key={c.name}
              collection={c}
              alias={aliasByCollection.get(c.name)}
              isFirst={i === 0}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

interface CollectionRowProps {
  collection: CollectionSchema;
  alias?: string;
  isFirst: boolean;
}

function CollectionRow({ collection, alias, isFirst }: CollectionRowProps) {
  const navigate = useNavigate();
  const created = (collection as { created_at?: number }).created_at;
  const fieldsCount = collection.fields?.length ?? 0;
  const docs = collection.num_documents ?? 0;

  const goToCollection = () =>
    navigate({
      to: '/collections/$collectionId/documents/search',
      params: { collectionId: collection.name },
    });

  return (
    <TableRow
      hover
      onClick={goToCollection}
      sx={{
        cursor: 'pointer',
        '& td': {
          px: 1.75,
          py: 1.5,
          border: 'none',
          borderTop: isFirst ? 'none' : `1px solid ${designTokens.border}`,
        },
        '&:hover': { background: designTokens.surfaceMuted },
      }}
    >
      <TableCell>
        <Stack direction='row' spacing={1} sx={{ alignItems: 'center' }}>
          <FiberManualRecordRounded
            sx={{ fontSize: 9, color: designTokens.success, flexShrink: 0 }}
          />
          <Typography
            sx={{
              fontFamily: designTokens.fontMono,
              fontSize: 13,
              fontWeight: 500,
              color: designTokens.text,
            }}
          >
            {collection.name}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell sx={numericCellSx}>{docs.toLocaleString()}</TableCell>
      <TableCell sx={numericCellSx}>{fieldsCount}</TableCell>
      {/* <TableCell sx={{ ...numericCellSx, color: designTokens.textMuted }}>
        —
      </TableCell> */}
      <TableCell>
        {alias ? (
          <Box
            component='span'
            sx={{
              fontFamily: designTokens.fontMono,
              fontSize: 12.5,
              px: 1,
              py: '2px',
              background: designTokens.surfaceMuted,
              border: `1px solid ${designTokens.border}`,
              borderRadius: '4px',
              color: designTokens.text,
              whiteSpace: 'nowrap',
            }}
          >
            {alias}
          </Box>
        ) : (
          <Box component='span' sx={{ color: designTokens.textFaint }}>
            —
          </Box>
        )}
      </TableCell>
      <TableCell>
        <Typography
          sx={{
            fontSize: 12.5,
            color: designTokens.textMuted,
            whiteSpace: 'nowrap',
          }}
        >
          {created
            ? formatDistanceToNow(new Date(created * 1000), { addSuffix: true })
            : '—'}
        </Typography>
      </TableCell>
      {/* <TableCell>
        <Badge tone='success'>
          <FiberManualRecordRounded sx={{ fontSize: 7 }} />
          Healthy
        </Badge>
      </TableCell> */}
      <TableCell sx={{ textAlign: 'right' }}>
        <CollectionRowActions collection={collection} />
      </TableCell>
    </TableRow>
  );
}

function CollectionRowActions({
  collection,
}: {
  collection: CollectionSchema;
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const { openConfirmDelete } = useConfirmDelete();
  const mutation = useDeleteCollection();
  const viewSchema = useCollectionEditorDialog({
    initialOptions: DEFAULT_VIEW_OPTIONS,
  });

  const handleOpen = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleClose = (e: React.MouseEvent | React.KeyboardEvent) => {
    e?.stopPropagation();
    setAnchorEl(null);
  };

  const handleViewJson = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(null);
    viewSchema({
      title: collection.name,
      value: JSON.stringify(collection, null, 2),
    });
  };

  const handleDelete = async (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchorEl(null);
    try {
      await openConfirmDelete(collection.name);
      mutation.mutate(collection.name);
    } catch {
      return;
    }
  };

  return (
    <>
      <IconButton
        size='small'
        onClick={handleOpen}
        aria-label={`actions for ${collection.name}`}
        sx={{
          width: 28,
          height: 28,
          borderRadius: '6px',
          color: designTokens.textFaint,
          '&:hover': {
            color: designTokens.text,
            background: designTokens.surfaceMuted,
          },
        }}
      >
        <MoreHorizRounded sx={{ fontSize: 18 }} />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        slotProps={{
          paper: {
            sx: {
              border: `1px solid ${designTokens.border}`,
              borderRadius: 1,
              minWidth: 160,
              boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            },
          },
        }}
      >
        <MenuItem onClick={handleViewJson} sx={{ fontSize: 13 }}>
          <ListItemIcon sx={{ minWidth: 30 }}>
            <DataObjectRounded sx={{ fontSize: 16 }} />
          </ListItemIcon>
          View JSON
        </MenuItem>
        <MenuItem
          onClick={handleDelete}
          disabled={mutation.isPending}
          sx={{ fontSize: 13, color: designTokens.danger }}
        >
          <ListItemIcon sx={{ minWidth: 30 }}>
            <DeleteOutlineRounded
              sx={{ fontSize: 16, color: designTokens.danger }}
            />
          </ListItemIcon>
          Delete
        </MenuItem>
      </Menu>
    </>
  );
}
