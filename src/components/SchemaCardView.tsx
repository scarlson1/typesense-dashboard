import { EmbedNote, ReferenceNote } from '@/components/SchemaTableView';
import { designTokens } from '@/theme/themePrimitives';
import type { FieldEmbed } from '@/types';
import { EditOutlined } from '@mui/icons-material';
import { Box, IconButton, Stack } from '@mui/material';
import type { CollectionFieldSchema } from 'typesense/lib/Typesense/Collection';

interface SchemaCardViewProps {
  fields: CollectionFieldSchema[];
  onEditField?: (field: CollectionFieldSchema) => void;
}

type FieldFlagKey = 'index' | 'facet' | 'sort' | 'range' | 'optional';

const FLAGS: { key: FieldFlagKey; label: string }[] = [
  { key: 'index', label: 'index' },
  { key: 'facet', label: 'facet' },
  { key: 'sort', label: 'sort' },
  { key: 'range', label: 'range' },
  { key: 'optional', label: 'optional' },
];

const getFlagValue = (
  field: CollectionFieldSchema,
  key: FieldFlagKey,
): boolean => {
  if (key === 'range') return Boolean(field.range_index);
  return Boolean(field[key]);
};

export const SchemaCardView = ({
  fields,
  onEditField,
}: SchemaCardViewProps) => {
  return (
    <Stack sx={{ gap: 1.25, p: 1.5 }}>
      {fields.map((field) => {
        const activeFlags = FLAGS.filter((f) => getFlagValue(field, f.key));
        return (
          <Box
            key={field.name}
            sx={{
              border: `1px solid ${designTokens.border}`,
              borderRadius: 1,
              background: designTokens.surface,
              px: 1.75,
              py: 1.5,
            }}
          >
            <Stack
              direction='row'
              sx={{
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 1,
              }}
            >
              <Stack sx={{ gap: 1.125, minWidth: 0, flex: 1 }}>
                <Box
                  sx={{
                    fontFamily: designTokens.fontMono,
                    fontSize: 14,
                    fontWeight: 600,
                    color: designTokens.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={field.name}
                >
                  {field.name}
                </Box>

                <Stack
                  direction='row'
                  sx={{ flexWrap: 'wrap', gap: 0.625, alignItems: 'center' }}
                >
                  <TypeChip type={String(field.type)} />
                  {activeFlags.map((f) => (
                    <FlagChip key={f.key} label={f.label} />
                  ))}
                </Stack>
                {field.reference ? (
                  <ReferenceNote
                    reference={String(field.reference)}
                    isAsync={Boolean(field.async_reference)}
                  />
                ) : null}
                {field.embed ? (
                  <EmbedNote embed={field.embed as FieldEmbed} />
                ) : null}
              </Stack>

              <IconButton
                size='small'
                onClick={() => onEditField?.(field)}
                sx={{
                  flexShrink: 0,
                  width: 30,
                  height: 30,
                  borderRadius: '6px',
                  color: designTokens.textFaint,
                  border: `1px solid ${designTokens.border}`,
                  background: designTokens.surface,
                  '&:hover': {
                    color: designTokens.text,
                    borderColor: designTokens.borderStrong,
                  },
                }}
                aria-label={`edit ${field.name}`}
              >
                <EditOutlined sx={{ fontSize: 15 }} />
              </IconButton>
            </Stack>
          </Box>
        );
      })}
    </Stack>
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
      color: designTokens.accentDeep,
      background: designTokens.accentSoft,
      border: `1px solid ${designTokens.accentBorder}`,
      borderRadius: '4px',
      px: '8px',
      py: '2px',
      lineHeight: 1.4,
    }}
  >
    {type}
  </Box>
);

const FlagChip = ({ label }: { label: string }) => (
  <Box
    component='span'
    sx={{
      display: 'inline-flex',
      alignItems: 'center',
      fontFamily: designTokens.fontMono,
      fontSize: 11.5,
      color: designTokens.textMuted,
      background: designTokens.surface,
      border: `1px solid ${designTokens.border}`,
      borderRadius: '4px',
      px: '8px',
      py: '2px',
      lineHeight: 1.4,
    }}
  >
    {label}
  </Box>
);
