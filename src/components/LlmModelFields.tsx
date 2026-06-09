// Reusable provider + model + credentials form section, shared by the NL
// search model and (future) conversation model create forms. Controlled: the
// parent owns state and supplies the provider-specific `fields` mapping, since
// NL models and conversation models accept different field sets.

import { fieldInputSx, fieldLabelSx } from '@/constants/redesignSx';
import {
  getLlmProvider,
  LLM_PROVIDERS,
  type LlmFieldDef,
  type LlmProviderDef,
  type LlmProviderId,
} from '@/constants';
import { designTokens } from '@/theme/themePrimitives';
import { Box, InputAdornment, MenuItem, Stack, TextField } from '@mui/material';

const Label = ({ children }: { children: React.ReactNode }) => (
  <Box component='div' sx={fieldLabelSx}>
    {children}
  </Box>
);

export interface LlmModelFieldsProps {
  providerId: LlmProviderId;
  onProviderChange: (id: LlmProviderId) => void;
  /** Bare model id (the part after the provider prefix). */
  model: string;
  onModelChange: (model: string) => void;
  /** Provider-specific credential/config fields to render. */
  fields: LlmFieldDef[];
  /** Flat values keyed by each field's `key`. */
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  /** Restrict the provider options (defaults to all providers). */
  providers?: readonly LlmProviderDef[];
}

export const LlmModelFields = ({
  providerId,
  onProviderChange,
  model,
  onModelChange,
  fields,
  values,
  onChange,
  providers = LLM_PROVIDERS,
}: LlmModelFieldsProps) => {
  const provider = getLlmProvider(providerId);

  return (
    <Stack sx={{ gap: 2 }}>
      <Box>
        <Label>Provider</Label>
        <TextField
          select
          fullWidth
          size='small'
          value={providerId}
          onChange={(e) => onProviderChange(e.target.value as LlmProviderId)}
          sx={fieldInputSx}
        >
          {providers.map((p) => (
            <MenuItem key={p.id} value={p.id}>
              {p.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Box>
        <Label>Model</Label>
        <TextField
          fullWidth
          size='small'
          placeholder={provider?.modelExample}
          value={model}
          onChange={(e) => onModelChange(e.target.value)}
          sx={fieldInputSx}
          slotProps={{
            input: {
              startAdornment: provider ? (
                <InputAdornment position='start'>
                  <Box
                    component='span'
                    sx={{
                      fontFamily: designTokens.fontMono,
                      fontSize: 12.5,
                      color: designTokens.textFaint,
                    }}
                  >
                    {provider.prefix}/
                  </Box>
                </InputAdornment>
              ) : undefined,
            },
          }}
        />
      </Box>

      {fields.map((f) => (
        <Box key={f.key}>
          <Label>
            {f.label}
            {f.required ? null : (
              <Box
                component='span'
                sx={{ ml: 0.5, color: designTokens.textSubtle, fontWeight: 500 }}
              >
                (optional)
              </Box>
            )}
          </Label>
          <TextField
            fullWidth
            size='small'
            type={f.secret ? 'password' : 'text'}
            autoComplete='off'
            placeholder={f.placeholder}
            value={values[f.key] ?? ''}
            onChange={(e) => onChange(f.key, e.target.value)}
            sx={fieldInputSx}
            helperText={f.helper}
            slotProps={{
              formHelperText: {
                sx: { fontSize: 11, color: designTokens.textFaint, mx: 0 },
              },
            }}
          />
        </Box>
      ))}
    </Stack>
  );
};
