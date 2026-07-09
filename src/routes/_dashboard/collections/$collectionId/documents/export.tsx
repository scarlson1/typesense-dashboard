import {
  Badge,
  CollectionTabBar,
  MobileCollectionScopeStrip,
  PageHeader,
  primaryButtonSx,
  SectionCard,
  smallButtonSx,
} from '@/components/redesign';
import { useExportDocuments, useSchema } from '@/hooks';
import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { designTokens } from '@/theme/themePrimitives';
import { typesenseStore } from '@/utils';
import {
  CheckRounded,
  ContentCopyRounded,
  DownloadRounded,
  OpenInNewRounded,
} from '@mui/icons-material';
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Zoom,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { format } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';
import type { DocumentsExportParameters } from 'typesense/lib/Typesense/Documents';
import { useStore } from 'zustand';

export const Route = createFileRoute(
  '/_dashboard/collections/$collectionId/documents/export',
)({
  component: RouteComponent,
  staticData: { crumb: 'Export' },
});

// Above this many documents, nudge users toward the streaming cURL export —
// the browser export buffers the entire JSONL response in memory.
const LARGE_EXPORT_WARN_DOCS = 100_000;

interface ExportFilters {
  filterBy: string;
  includeFields: string[];
  excludeFields: string[];
}

const toExportParams = ({
  filterBy,
  includeFields,
  excludeFields,
}: ExportFilters): DocumentsExportParameters => {
  const params: DocumentsExportParameters = {};
  if (filterBy.trim()) params.filter_by = filterBy.trim();
  if (includeFields.length) params.include_fields = includeFields.join(',');
  if (excludeFields.length) params.exclude_fields = excludeFields.join(',');
  return params;
};

const downloadJsonl = (content: string, filename: string) => {
  const blob = new Blob([content], { type: 'application/x-ndjson' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

function RouteComponent() {
  const { collectionId } = Route.useParams();
  const [filters, setFilters] = useState<ExportFilters>({
    filterBy: '',
    includeFields: [],
    excludeFields: [],
  });

  return (
    <Stack sx={{ minWidth: 0 }}>
      <PageHeader
        title='Export documents'
        badges={
          <Badge tone='neutral'>
            <Box component='span' sx={{ fontFamily: designTokens.fontMono }}>
              {collectionId}
            </Box>
          </Badge>
        }
        actions={
          <Button
            component='a'
            href='https://typesense.org/docs/29.0/api/documents.html#export-documents'
            target='_blank'
            rel='noopener noreferrer'
            variant='outlined'
            size='small'
            startIcon={<OpenInNewRounded sx={{ fontSize: 13 }} />}
            sx={smallButtonSx}
          >
            API docs
          </Button>
        }
      />
      <CollectionTabBar collectionId={collectionId} />

      <Box
        sx={{
          flex: 1,
          px: { xs: 2.5, md: 3.5 },
          py: 2.25,
          background: designTokens.surfaceTinted,
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1fr 320px' },
          gap: 2,
          minHeight: 0,
        }}
      >
        <Stack sx={{ gap: 1.75, minWidth: 0 }}>
          <ExportCard
            collectionId={collectionId}
            filters={filters}
            onChange={setFilters}
          />
        </Stack>

        <Stack sx={{ gap: 1.5, minWidth: 0 }}>
          <CurlExportCard collectionId={collectionId} filters={filters} />
        </Stack>
      </Box>
      <MobileCollectionScopeStrip currentCollectionId={collectionId} />
    </Stack>
  );
}

function ExportCard({
  collectionId,
  filters,
  onChange,
}: {
  collectionId: string;
  filters: ExportFilters;
  onChange: (next: ExportFilters) => void;
}) {
  const { data } = useSchema(collectionId);
  const numDocuments = data.num_documents ?? 0;
  const fieldNames = useMemo(
    () => (data.fields ?? []).map((f) => f.name),
    [data.fields],
  );

  const exportMutation = useExportDocuments({
    onSuccess: (jsonl) => {
      const formattedDate = format(new Date(), 'MM-dd-yyyy--hh-mm-ss-a');
      downloadJsonl(jsonl, `${collectionId}-${formattedDate}.jsonl`);
    },
  });

  const handleExport = useCallback(() => {
    exportMutation.mutate({
      collectionId,
      options: toExportParams(filters),
    });
  }, [exportMutation, collectionId, filters]);

  return (
    <SectionCard
      title='Export to JSONL'
      description={`${numDocuments.toLocaleString()} documents in this collection. Leave the fields below empty to export everything.`}
      footer={
        <Stack direction='row' sx={{ justifyContent: 'flex-end' }}>
          <Button
            variant='contained'
            startIcon={<DownloadRounded sx={{ fontSize: 16 }} />}
            sx={{
              ...primaryButtonSx,
              flex: { xs: '1 1 100%', md: '0 0 auto' },
            }}
            onClick={handleExport}
            loading={exportMutation.isPending}
          >
            Export documents
          </Button>
        </Stack>
      }
    >
      {numDocuments > LARGE_EXPORT_WARN_DOCS ? (
        <Alert severity='warning'>
          This collection has {numDocuments.toLocaleString()} documents. The
          browser export buffers the entire result in memory — for very large
          collections, prefer the streaming cURL command on the right.
        </Alert>
      ) : null}

      <TextField
        label='Filter (filter_by)'
        placeholder='e.g. num_employees:>100 && country:USA'
        value={filters.filterBy}
        onChange={(e) => onChange({ ...filters, filterBy: e.target.value })}
        size='small'
        fullWidth
        helperText='Only export documents matching this filter. Leave empty to export all documents.'
        slotProps={{ input: { sx: { fontFamily: designTokens.fontMono } } }}
      />
      <Autocomplete
        multiple
        freeSolo
        size='small'
        options={fieldNames}
        value={filters.includeFields}
        onChange={(_e, value) => onChange({ ...filters, includeFields: value })}
        renderInput={(params) => (
          <TextField
            {...params}
            label='Include fields'
            placeholder={filters.includeFields.length ? '' : 'All fields'}
            helperText='Only these fields are present in the exported documents.'
          />
        )}
      />
      <Autocomplete
        multiple
        freeSolo
        size='small'
        options={fieldNames}
        value={filters.excludeFields}
        onChange={(_e, value) => onChange({ ...filters, excludeFields: value })}
        renderInput={(params) => (
          <TextField
            {...params}
            label='Exclude fields'
            placeholder={filters.excludeFields.length ? '' : 'None'}
            helperText='These fields are dropped from the exported documents.'
          />
        )}
      />
    </SectionCard>
  );
}

function CurlExportCard({
  collectionId,
  filters,
}: {
  collectionId: string;
  filters: ExportFilters;
}) {
  const creds = useStore(typesenseStore, (state) => state.credentials);
  const currKey = useStore(typesenseStore, (state) => state.currentCredsKey);
  const credentials = currKey ? creds[currKey] : null;
  const protocol = credentials?.protocol || '[PROTOCOL]';
  const node = credentials?.node || '[YOUR_NODE]';
  const port = protocol === 'http' ? credentials?.port || '[PORT]' : '';

  const [, copy, copied] = useCopyToClipboard(2000);

  const query = new URLSearchParams(
    toExportParams(filters) as Record<string, string>,
  ).toString();
  const url = `${protocol}://${node}${port ? `:${port}` : ''}/collections/${collectionId}/documents/export${query ? `?${query}` : ''}`;

  const snippet = `export TYPESENSE_API_KEY=YOUR_API_KEY

curl -H "X-TYPESENSE-API-KEY: \${TYPESENSE_API_KEY}" \\
  "${url}" > ${collectionId}-export.jsonl`;

  const handleCopy = useCallback(async () => {
    await copy(snippet);
  }, [copy, snippet]);

  return (
    <SectionCard
      title='Stream via cURL'
      description='Streams directly to disk — use this for very large collections.'
    >
      <Box
        component='pre'
        sx={{
          m: 0,
          background: designTokens.codeSurface,
          color: designTokens.codeText,
          borderRadius: 1,
          p: 2,
          fontFamily: designTokens.fontMono,
          fontSize: 11.5,
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          position: 'relative',
        }}
      >
        {snippet}
        <Tooltip title={copied ? 'Copied!' : 'Copy to clipboard'}>
          <IconButton
            size='small'
            onClick={handleCopy}
            sx={{
              color: copied ? designTokens.success : designTokens.textFaint,
              p: 0.5,
              position: 'absolute',
              top: 10,
              right: 10,
              width: 26,
              height: 26,
              transition: 'color 0.2s ease',
              '&:hover': {
                color: copied ? designTokens.success : designTokens.codeText,
              },
            }}
          >
            <Zoom in={!copied} timeout={180} unmountOnExit>
              <ContentCopyRounded sx={{ fontSize: 14, position: 'absolute' }} />
            </Zoom>
            <Zoom in={copied} timeout={180} unmountOnExit>
              <CheckRounded sx={{ fontSize: 16, position: 'absolute' }} />
            </Zoom>
          </IconButton>
        </Tooltip>
      </Box>
      <Typography sx={{ fontSize: 11.5, color: designTokens.textMuted }}>
        The export endpoint honors the same filter and field options as the
        form — they are already included in the URL above.
      </Typography>
    </SectionCard>
  );
}
