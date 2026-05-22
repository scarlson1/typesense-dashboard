import { designTokens } from '@/theme/themePrimitives';
import { EditOutlined } from '@mui/icons-material';
import { Box, IconButton, Stack } from '@mui/material';
import type { CollectionFieldSchema } from 'typesense/lib/Typesense/Collection';

interface SchemaTableViewProps {
  fields: CollectionFieldSchema[];
  onEditField?: (field: CollectionFieldSchema) => void;
}

type FieldFlagKey = 'index' | 'facet' | 'sort' | 'range' | 'optional';

const FLAG_COLUMNS: { key: FieldFlagKey; label: string }[] = [
  { key: 'index', label: 'Index' },
  { key: 'facet', label: 'Facet' },
  { key: 'sort', label: 'Sort' },
  { key: 'range', label: 'Range' },
  { key: 'optional', label: 'Optional' },
];

const GRID_TEMPLATE =
  'minmax(160px, 1.6fr) minmax(110px, 0.9fr) repeat(5, minmax(64px, 0.7fr)) 32px';

const getFlagValue = (
  field: CollectionFieldSchema,
  key: FieldFlagKey,
): boolean => {
  if (key === 'range') return Boolean(field.range_index);
  return Boolean(field[key]);
};

export const SchemaTableView = ({
  fields,
  onEditField,
}: SchemaTableViewProps) => {
  return (
    <Box sx={{ width: '100%', overflowX: 'auto' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: GRID_TEMPLATE,
          alignItems: 'center',
          px: 2,
          py: 1.25,
          gap: 1,
          borderBottom: `1px solid ${designTokens.border}`,
          background: designTokens.surfaceTinted,
          fontSize: 10.5,
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: designTokens.textFaint,
        }}
      >
        <Box>Field</Box>
        <Box>Type</Box>
        {FLAG_COLUMNS.map((c) => (
          <Box key={c.key}>{c.label}</Box>
        ))}
        <Box />
      </Box>

      {fields.map((field) => (
        <Box
          key={field.name}
          sx={{
            display: 'grid',
            gridTemplateColumns: GRID_TEMPLATE,
            alignItems: 'center',
            px: 2,
            py: 1.25,
            gap: 1,
            borderBottom: `1px solid ${designTokens.border}`,
            transition: 'background 120ms ease',
            '&:last-of-type': { borderBottom: 'none' },
            '&:hover': { background: designTokens.surfaceTinted },
          }}
        >
          <Box
            sx={{
              fontFamily: designTokens.fontMono,
              fontSize: 13,
              color: designTokens.text,
              fontWeight: 500,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
            title={field.name}
          >
            {field.name}
          </Box>

          <Box>
            <TypeChip type={String(field.type)} />
          </Box>

          {FLAG_COLUMNS.map((c) => (
            <Box key={c.key}>
              {getFlagValue(field, c.key) ? (
                <OnPill />
              ) : (
                <Box
                  component='span'
                  sx={{ color: designTokens.textFaint, fontSize: 13 }}
                >
                  —
                </Box>
              )}
            </Box>
          ))}

          <Stack direction='row' sx={{ justifyContent: 'flex-end' }}>
            <IconButton
              size='small'
              onClick={() => onEditField?.(field)}
              sx={{
                width: 26,
                height: 26,
                color: designTokens.textFaint,
                '&:hover': { color: designTokens.text },
              }}
              aria-label={`edit ${field.name}`}
            >
              <EditOutlined sx={{ fontSize: 14 }} />
            </IconButton>
          </Stack>
        </Box>
      ))}
    </Box>
  );
};

const TypeChip = ({ type }: { type: string }) => (
  <Box
    component='span'
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      fontFamily: designTokens.fontMono,
      fontSize: 12,
      color: designTokens.text,
      background: designTokens.surfaceMuted,
      border: `1px solid ${designTokens.border}`,
      borderRadius: '4px',
      px: '8px',
      py: '2px',
      lineHeight: 1.4,
    }}
  >
    {type}
  </Box>
);

const OnPill = () => (
  <Box
    component='span'
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 0.625,
      fontFamily: designTokens.fontMono,
      fontSize: 11.5,
      color: designTokens.successDeep,
      background: designTokens.successSoft,
      border: `1px solid ${designTokens.successBorder}`,
      borderRadius: '4px',
      px: '8px',
      py: '2px',
      lineHeight: 1.4,
    }}
  >
    <Box
      component='span'
      sx={{
        width: 6,
        height: 6,
        borderRadius: '50%',
        background: designTokens.success,
      }}
    />
    on
  </Box>
);
