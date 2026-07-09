import { ChipMultiField } from '@/components/redesign';
import { fieldInputSx } from '@/constants/redesignSx';
import { designTokens } from '@/theme/themePrimitives';
import type { EmbedProvider, GcpAuthMode } from '@/types';
import { DEFAULT_EMBED_MODEL, type VectorConfigState } from '@/utils';
import { OpenInNewRounded } from '@mui/icons-material';
import {
  Box,
  Link,
  MenuItem,
  Stack,
  Switch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

const VEC_DIST_OPTIONS = ['cosine', 'ip'] as const;

const EMBED_PROVIDERS: { value: EmbedProvider; label: string }[] = [
  { value: 'builtin', label: 'Built-in (ts/…)' },
  { value: 'openai', label: 'OpenAI / Google PaLM' },
  { value: 'azure', label: 'Azure / OpenAI-compatible' },
  { value: 'gcp_vertex', label: 'GCP Vertex AI' },
  { value: 'custom', label: 'Custom (self-hosted)' },
];

const FieldLabel = ({ children }: { children: ReactNode }) => (
  <Typography
    sx={{
      fontSize: 12,
      fontWeight: 600,
      color: designTokens.text,
      mb: 0.75,
    }}
  >
    {children}
  </Typography>
);

const InlineCode = ({ children }: { children: ReactNode }) => (
  <Box
    component='code'
    sx={{ fontFamily: designTokens.fontMono, fontSize: 11 }}
  >
    {children}
  </Box>
);

const EmbedField = ({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  multiline,
  helper,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  multiline?: boolean;
  helper?: ReactNode;
}) => (
  <Box>
    <FieldLabel>{label}</FieldLabel>
    <TextField
      fullWidth
      size='small'
      type={type}
      multiline={multiline}
      minRows={multiline ? 2 : undefined}
      autoComplete='off'
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      sx={fieldInputSx}
    />
    {helper ? (
      <Typography
        sx={{ fontSize: 11.5, color: designTokens.textMuted, mt: 0.5 }}
      >
        {helper}
      </Typography>
    ) : null}
  </Box>
);

interface VectorFieldConfigProps {
  state: VectorConfigState;
  onChange: (next: VectorConfigState) => void;
  /** Names of sibling `string`/`string[]` fields usable as `embed.from`. */
  fromOptions: string[];
}

/**
 * Configuration panel for a `float[]` vector field: manual dimensions or an
 * auto-embed setup (provider, model, credentials) plus the distance metric.
 * Used by the schema-field edit dialog and the new-collection form.
 */
export const VectorFieldConfig = ({
  state,
  onChange,
  fromOptions,
}: VectorFieldConfigProps) => {
  return (
    <Box
      sx={{
        border: `1px solid ${designTokens.border}`,
        borderRadius: 1,
        p: 1.5,
        background: designTokens.surfaceTinted,
      }}
    >
      <Stack
        direction='row'
        sx={{
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 13,
              fontWeight: 600,
              color: designTokens.text,
            }}
          >
            Auto-embed
          </Typography>
          <Typography
            sx={{
              fontSize: 11.5,
              color: designTokens.textMuted,
              lineHeight: 1.4,
            }}
          >
            Generate vectors from other fields with an embedding model
          </Typography>
        </Box>
        <Switch
          size='small'
          checked={state.autoEmbed}
          onChange={(_, checked) => onChange({ ...state, autoEmbed: checked })}
        />
      </Stack>

      {state.autoEmbed ? (
        <Stack sx={{ gap: 1.5, mt: 1.5 }}>
          <Box>
            <FieldLabel>Embed from fields</FieldLabel>
            <ChipMultiField
              values={state.from}
              options={fromOptions}
              placeholder='Add field...'
              onAdd={(val) => {
                if (!state.from.includes(val))
                  onChange({ ...state, from: [...state.from, val] });
              }}
              onRemove={(i) =>
                onChange({
                  ...state,
                  from: state.from.filter((_, idx) => idx !== i),
                })
              }
            />
            {fromOptions.length === 0 ? (
              <Typography
                sx={{
                  fontSize: 11.5,
                  color: designTokens.textMuted,
                  mt: 0.5,
                }}
              >
                Add a <InlineCode>string</InlineCode> or{' '}
                <InlineCode>string[]</InlineCode> field first to embed from.
              </Typography>
            ) : null}
          </Box>
          <Box>
            <FieldLabel>Provider</FieldLabel>
            <TextField
              select
              fullWidth
              size='small'
              value={state.provider}
              onChange={(e) =>
                onChange({
                  ...state,
                  provider: e.target.value as EmbedProvider,
                })
              }
              sx={fieldInputSx}
            >
              {EMBED_PROVIDERS.map((p) => (
                <MenuItem key={p.value} value={p.value}>
                  {p.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <EmbedField
            label='Model name'
            placeholder={DEFAULT_EMBED_MODEL}
            value={state.modelName}
            onChange={(v) => onChange({ ...state, modelName: v })}
            helper={
              <>
                e.g. <InlineCode>ts/e5-small</InlineCode>,{' '}
                <InlineCode>openai/text-embedding-3-small</InlineCode>, or a
                Vertex model.{' '}
                <Link
                  href='https://typesense.org/docs/30.2/api/vector-search.html#index-embeddings'
                  target='_blank'
                  rel='noopener noreferrer'
                >
                  Supported models <OpenInNewRounded fontSize='inherit' />
                </Link>
              </>
            }
          />

          {(state.provider === 'openai' || state.provider === 'azure') && (
            <EmbedField
              label='API key'
              type='password'
              placeholder='Provider API key'
              value={state.apiKey}
              onChange={(v) => onChange({ ...state, apiKey: v })}
            />
          )}

          {state.provider === 'azure' && (
            <EmbedField
              label='API endpoint URL'
              placeholder='https://your-resource.openai.azure.com/...'
              value={state.url}
              onChange={(v) => onChange({ ...state, url: v })}
              helper={
                <>
                  Azure OpenAI or OpenAI-compatible endpoint (model name must
                  start with <InlineCode>openai</InlineCode>).
                </>
              }
            />
          )}

          {state.provider === 'gcp_vertex' && (
            <Stack sx={{ gap: 1.5 }}>
              <EmbedField
                label='Project ID'
                placeholder='my-gcp-project'
                value={state.projectId}
                onChange={(v) => onChange({ ...state, projectId: v })}
              />
              <Box>
                <FieldLabel>Authentication</FieldLabel>
                <ToggleButtonGroup
                  exclusive
                  size='small'
                  value={state.gcpAuthMode}
                  onChange={(_, next: GcpAuthMode | null) =>
                    next && onChange({ ...state, gcpAuthMode: next })
                  }
                  sx={{
                    border: `1px solid ${designTokens.border}`,
                    borderRadius: '8px',
                    overflow: 'hidden',
                    background: designTokens.surface,
                    '& .MuiToggleButtonGroup-grouped': {
                      border: 'none',
                      borderRadius: 0,
                      height: 28,
                      px: 1.625,
                      textTransform: 'none',
                      fontSize: 11,
                      fontWeight: 500,
                      color: designTokens.textMuted,
                      borderLeft: `1px solid ${designTokens.border}`,
                      '&:first-of-type': { borderLeft: 'none' },
                      '&.Mui-selected': {
                        fontWeight: 600,
                        color: designTokens.accent,
                        background: designTokens.accentSoft,
                        '&:hover': {
                          background: designTokens.accentSoft,
                        },
                      },
                    },
                  }}
                >
                  <ToggleButton value='oauth'>OAuth</ToggleButton>
                  <ToggleButton value='service_account'>
                    Service account
                  </ToggleButton>
                </ToggleButtonGroup>
              </Box>

              {state.gcpAuthMode === 'oauth' ? (
                <>
                  <EmbedField
                    label='Access token'
                    type='password'
                    value={state.accessToken}
                    onChange={(v) => onChange({ ...state, accessToken: v })}
                  />
                  <EmbedField
                    label='Refresh token'
                    type='password'
                    value={state.refreshToken}
                    onChange={(v) => onChange({ ...state, refreshToken: v })}
                  />
                  <Stack direction='row' sx={{ gap: 1.5 }}>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <EmbedField
                        label='Client ID'
                        value={state.clientId}
                        onChange={(v) => onChange({ ...state, clientId: v })}
                      />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <EmbedField
                        label='Client secret'
                        type='password'
                        value={state.clientSecret}
                        onChange={(v) =>
                          onChange({ ...state, clientSecret: v })
                        }
                      />
                    </Box>
                  </Stack>
                </>
              ) : (
                <>
                  <EmbedField
                    label='Client email'
                    placeholder='svc@my-project.iam.gserviceaccount.com'
                    value={state.saClientEmail}
                    onChange={(v) => onChange({ ...state, saClientEmail: v })}
                  />
                  <EmbedField
                    label='Private key'
                    type='password'
                    multiline
                    placeholder='-----BEGIN PRIVATE KEY-----'
                    value={state.saPrivateKey}
                    onChange={(v) => onChange({ ...state, saPrivateKey: v })}
                  />
                </>
              )}
            </Stack>
          )}

          {state.provider === 'custom' && (
            <Stack direction='row' sx={{ gap: 1.5 }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <EmbedField
                  label='Indexing prefix'
                  placeholder='e.g. passage:'
                  value={state.indexingPrefix}
                  onChange={(v) => onChange({ ...state, indexingPrefix: v })}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <EmbedField
                  label='Query prefix'
                  placeholder='e.g. query:'
                  value={state.queryPrefix}
                  onChange={(v) => onChange({ ...state, queryPrefix: v })}
                />
              </Box>
            </Stack>
          )}
        </Stack>
      ) : (
        <Box sx={{ mt: 1.5 }}>
          <FieldLabel>Dimensions (num_dim)</FieldLabel>
          <TextField
            fullWidth
            size='small'
            type='number'
            placeholder='e.g. 768'
            value={state.numDim}
            onChange={(e) => onChange({ ...state, numDim: e.target.value })}
            sx={fieldInputSx}
          />
          <Typography
            sx={{ fontSize: 11.5, color: designTokens.textMuted, mt: 0.5 }}
          >
            Required length of the vectors you index yourself.
          </Typography>
        </Box>
      )}

      <Box sx={{ mt: 1.5 }}>
        <FieldLabel>Distance metric</FieldLabel>
        <TextField
          select
          fullWidth
          size='small'
          value={state.vecDist}
          onChange={(e) => onChange({ ...state, vecDist: e.target.value })}
          sx={fieldInputSx}
        >
          {VEC_DIST_OPTIONS.map((o) => (
            <MenuItem key={o} value={o}>
              {o}
            </MenuItem>
          ))}
        </TextField>
      </Box>
    </Box>
  );
};
