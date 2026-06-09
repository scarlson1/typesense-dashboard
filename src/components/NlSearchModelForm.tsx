import { LlmModelFields } from '@/components/LlmModelFields';
import { primaryButtonSx } from '@/components/redesign';
import {
  fieldInputSx,
  fieldLabelSx,
} from '@/constants/redesignSx';
import { toModelName, type LlmFieldDef, type LlmProviderId } from '@/constants';
import { useCreateNlSearchModel } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { pruneEmpty } from '@/utils';
import { AddRounded } from '@mui/icons-material';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useMemo, useState } from 'react';
import type { NLSearchModelCreateSchema } from 'typesense/lib/Typesense/NLSearchModels';

// Per-provider credential fields, matching the flat NLSearchModelBase schema.
const NL_PROVIDER_FIELDS: Record<LlmProviderId, LlmFieldDef[]> = {
  openai: [{ key: 'api_key', label: 'API key', required: true, secret: true }],
  azure: [
    { key: 'api_key', label: 'API key', required: true, secret: true },
    {
      key: 'api_url',
      label: 'Resource URL',
      required: true,
      placeholder: 'https://<resource>.openai.azure.com/…',
    },
  ],
  cloudflare: [
    { key: 'api_key', label: 'API key', required: true, secret: true },
    { key: 'account_id', label: 'Account ID', required: true },
  ],
  vllm: [
    {
      key: 'api_url',
      label: 'API URL',
      required: true,
      placeholder: 'http://localhost:8000',
    },
  ],
  google: [{ key: 'api_key', label: 'API key', required: true, secret: true }],
  gcp: [
    { key: 'project_id', label: 'Project ID', required: true },
    { key: 'access_token', label: 'Access token', required: true, secret: true },
    { key: 'refresh_token', label: 'Refresh token', required: true, secret: true },
    { key: 'client_id', label: 'Client ID', required: true },
    { key: 'client_secret', label: 'Client secret', required: true, secret: true },
    { key: 'region', label: 'Region' },
  ],
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <Box component='div' sx={fieldLabelSx}>
    {children}
  </Box>
);

export function NlSearchModelForm({ onSuccess }: { onSuccess?: () => void }) {
  const [providerId, setProviderId] = useState<LlmProviderId>('openai');
  const [model, setModel] = useState('');
  const [id, setId] = useState('');
  const [creds, setCreds] = useState<Record<string, string>>({});
  const [systemPrompt, setSystemPrompt] = useState('');
  const [maxBytes, setMaxBytes] = useState('');
  const [temperature, setTemperature] = useState('');

  const fields = NL_PROVIDER_FIELDS[providerId];

  const mutation = useCreateNlSearchModel({
    onSuccess: () => onSuccess?.(),
  });

  const canSubmit = useMemo(() => {
    if (!model.trim()) return false;
    return fields.every((f) => !f.required || (creds[f.key] ?? '').trim());
  }, [model, fields, creds]);

  const handleSubmit = () => {
    // Only include the current provider's credential fields.
    const credPayload: Record<string, string> = {};
    for (const f of fields) {
      const v = (creds[f.key] ?? '').trim();
      if (v) credPayload[f.key] = v;
    }

    const payload = pruneEmpty({
      id: id.trim(),
      model_name: toModelName(providerId, model.trim()),
      ...credPayload,
      system_prompt: systemPrompt.trim(),
      max_bytes: maxBytes.trim() ? Number(maxBytes) : undefined,
      temperature: temperature.trim() ? Number(temperature) : undefined,
    }) as NLSearchModelCreateSchema;

    mutation.mutate(payload);
  };

  return (
    <Stack sx={{ gap: 2 }}>
      <LlmModelFields
        providerId={providerId}
        onProviderChange={(p) => {
          setProviderId(p);
          setCreds({});
        }}
        model={model}
        onModelChange={setModel}
        fields={fields}
        values={creds}
        onChange={(key, value) =>
          setCreds((prev) => ({ ...prev, [key]: value }))
        }
      />

      <Box>
        <Label>
          Model ID
          <Box
            component='span'
            sx={{ ml: 0.5, color: designTokens.textSubtle, fontWeight: 500 }}
          >
            (optional)
          </Box>
        </Label>
        <TextField
          fullWidth
          size='small'
          placeholder='Referenced as nl_model_id at search time'
          value={id}
          onChange={(e) => setId(e.target.value)}
          sx={fieldInputSx}
        />
      </Box>

      <Box>
        <Label>
          System prompt
          <Box
            component='span'
            sx={{ ml: 0.5, color: designTokens.textSubtle, fontWeight: 500 }}
          >
            (optional)
          </Box>
        </Label>
        <TextField
          fullWidth
          multiline
          minRows={2}
          size='small'
          placeholder='Extra instructions appended to the generated prompt'
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          sx={fieldInputSx}
        />
      </Box>

      <Stack direction='row' sx={{ gap: 1.5 }}>
        <Box sx={{ flex: 1 }}>
          <Label>Max bytes</Label>
          <TextField
            fullWidth
            size='small'
            type='number'
            placeholder='16000'
            value={maxBytes}
            onChange={(e) => setMaxBytes(e.target.value)}
            sx={fieldInputSx}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Label>Temperature</Label>
          <TextField
            fullWidth
            size='small'
            type='number'
            placeholder='0.0'
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            sx={fieldInputSx}
          />
        </Box>
      </Stack>

      <Button
        variant='contained'
        size='small'
        onClick={handleSubmit}
        disabled={!canSubmit}
        loading={mutation.isPending}
        startIcon={<AddRounded sx={{ fontSize: 14 }} />}
        sx={{ ...primaryButtonSx, alignSelf: 'flex-start' }}
      >
        Create model
      </Button>
    </Stack>
  );
}
