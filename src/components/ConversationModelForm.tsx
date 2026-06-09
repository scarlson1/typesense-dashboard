import { HistoryCollectionField } from '@/components/HistoryCollectionField';
import { LlmModelFields } from '@/components/LlmModelFields';
import { primaryButtonSx } from '@/components/redesign';
import { fieldInputSx, fieldLabelSx } from '@/constants/redesignSx';
import {
  LLM_PROVIDERS,
  toModelName,
  type LlmFieldDef,
  type LlmProviderId,
} from '@/constants';
import { useCreateConversationModel } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import { pruneEmpty } from '@/utils';
import { AddRounded } from '@mui/icons-material';
import { Box, Button, Stack, TextField } from '@mui/material';
import { useMemo, useState } from 'react';
import type { ConversationModelCreateSchema } from 'typesense/lib/Typesense/ConversationModel';

// Conversation models support OpenAI, Azure, Google, Cloudflare, vLLM (not GCP).
const CONVERSATION_PROVIDERS = LLM_PROVIDERS.filter((p) => p.id !== 'gcp');

const CONVERSATION_PROVIDER_FIELDS: Partial<
  Record<LlmProviderId, LlmFieldDef[]>
> = {
  openai: [{ key: 'api_key', label: 'API key', required: true, secret: true }],
  azure: [
    { key: 'api_key', label: 'API key', required: true, secret: true },
    {
      key: 'url',
      label: 'Resource URL',
      required: true,
      placeholder: 'https://<resource>.openai.azure.com/…',
    },
  ],
  google: [{ key: 'api_key', label: 'API key', required: true, secret: true }],
  cloudflare: [
    { key: 'api_key', label: 'API key', required: true, secret: true },
    { key: 'account_id', label: 'Account ID', required: true },
  ],
  vllm: [
    {
      key: 'vllm_url',
      label: 'vLLM URL',
      required: true,
      placeholder: 'http://localhost:8000',
    },
  ],
};

const Label = ({ children }: { children: React.ReactNode }) => (
  <Box component='div' sx={fieldLabelSx}>
    {children}
  </Box>
);

const DEFAULT_MAX_BYTES = 16384;

export function ConversationModelForm({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [providerId, setProviderId] = useState<LlmProviderId>('openai');
  const [model, setModel] = useState('');
  const [id, setId] = useState('');
  const [creds, setCreds] = useState<Record<string, string>>({});
  const [historyCollection, setHistoryCollection] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [maxBytes, setMaxBytes] = useState('');
  const [ttl, setTtl] = useState('');

  const fields = CONVERSATION_PROVIDER_FIELDS[providerId] ?? [];

  const mutation = useCreateConversationModel({
    onSuccess: () => onSuccess?.(),
  });

  const canSubmit = useMemo(() => {
    if (!model.trim()) return false;
    // history_collection is typed optional in the SDK but is required by the
    // Typesense API (it stores conversation turns).
    if (!historyCollection.trim()) return false;
    return fields.every((f) => !f.required || (creds[f.key] ?? '').trim());
  }, [model, fields, creds, historyCollection]);

  const handleSubmit = () => {
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
      history_collection: historyCollection.trim(),
      // max_bytes is required by the API.
      max_bytes: maxBytes.trim() ? Number(maxBytes) : DEFAULT_MAX_BYTES,
      ttl: ttl.trim() ? Number(ttl) : undefined,
    }) as ConversationModelCreateSchema;

    mutation.mutate(payload);
  };

  return (
    <Stack sx={{ gap: 2 }}>
      <LlmModelFields
        providers={CONVERSATION_PROVIDERS}
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
        <Label>History collection</Label>
        <HistoryCollectionField
          value={historyCollection}
          onChange={setHistoryCollection}
        />
      </Box>

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
          placeholder='Referenced as conversation_model_id'
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
          placeholder="Instructions guiding the assistant's behavior"
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
            placeholder={String(DEFAULT_MAX_BYTES)}
            value={maxBytes}
            onChange={(e) => setMaxBytes(e.target.value)}
            sx={fieldInputSx}
          />
        </Box>
        <Box sx={{ flex: 1 }}>
          <Label>
            TTL (s)
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
            type='number'
            placeholder='86400'
            value={ttl}
            onChange={(e) => setTtl(e.target.value)}
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
