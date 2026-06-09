import { NlSearchModelForm } from '@/components/NlSearchModelForm';
import {
  Badge,
  PageHeader,
  primaryButtonSx,
  smallButtonSx,
} from '@/components/redesign';
import { splitModelName } from '@/constants';
import { useDeleteNlSearchModel, useNlSearchModels } from '@/hooks';
import { designTokens } from '@/theme/themePrimitives';
import {
  AddRounded,
  AutoAwesomeRounded,
  DeleteOutlineRounded,
  OpenInNewRounded,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Skeleton,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

export const Route = createFileRoute('/_dashboard/nl-models')({
  component: RouteComponent,
  staticData: { crumb: 'NL models' },
});

const cellSx = {
  fontSize: 13,
  color: designTokens.text,
  fontFamily: designTokens.fontMono,
} as const;

function RouteComponent() {
  const [open, setOpen] = useState(false);
  const { data: models, isLoading } = useNlSearchModels();
  const del = useDeleteNlSearchModel();

  return (
    <Stack sx={{ minWidth: 0 }}>
      <PageHeader
        title='NL search models'
        badges={<Badge tone='indigo'>natural language</Badge>}
        actions={
          <Stack direction='row' sx={{ gap: 1, alignItems: 'center' }}>
            <Button
              variant='outlined'
              size='small'
              component='a'
              href='https://typesense.org/docs/latest/api/natural-language-search.html'
              target='_blank'
              rel='noopener noreferrer'
              startIcon={<OpenInNewRounded sx={{ fontSize: 13 }} />}
              sx={{ ...smallButtonSx, display: { xs: 'none', md: 'inline-flex' } }}
            >
              Docs
            </Button>
            <Button
              variant='contained'
              size='small'
              startIcon={<AddRounded sx={{ fontSize: 14 }} />}
              onClick={() => setOpen(true)}
              sx={{ ...primaryButtonSx, color: designTokens.onAccent }}
            >
              New model
            </Button>
          </Stack>
        }
      />

      <Box
        sx={{
          flex: 1,
          px: { xs: 2.5, md: 3.5 },
          py: 2.25,
          background: designTokens.surfaceTinted,
          minHeight: 0,
        }}
      >
        <Box
          sx={{
            background: designTokens.surface,
            border: `1px solid ${designTokens.border}`,
            borderRadius: 1,
            overflow: 'hidden',
            maxWidth: 760,
          }}
        >
          {isLoading ? (
            <Skeleton variant='rounded' height={160} sx={{ m: 2 }} />
          ) : !models?.length ? (
            <Box sx={{ px: 2.5, py: 4, textAlign: 'center' }}>
              <AutoAwesomeRounded
                sx={{ fontSize: 22, color: designTokens.textFaint, mb: 1 }}
              />
              <Typography sx={{ fontSize: 13, color: designTokens.textMuted }}>
                No NL search models yet.
              </Typography>
              <Typography
                sx={{ fontSize: 12, color: designTokens.textFaint, mt: 0.5 }}
              >
                Create one to translate plain-English queries into Typesense
                search parameters.
              </Typography>
            </Box>
          ) : (
            <Stack divider={<Box sx={{ height: 1, background: designTokens.border }} />}>
              {models.map((m) => {
                const provider = splitModelName(m.model_name).provider?.label;
                return (
                  <Stack
                    key={m.id}
                    direction='row'
                    sx={{ alignItems: 'center', gap: 1.5, px: 2, py: 1.5 }}
                  >
                    <Box sx={{ minWidth: 0, flex: 1 }}>
                      <Typography
                        sx={{ ...cellSx, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis' }}
                      >
                        {m.model_name}
                      </Typography>
                      <Typography
                        sx={{ fontSize: 11.5, color: designTokens.textFaint, fontFamily: designTokens.fontMono }}
                      >
                        id {m.id}
                        {provider ? ` · ${provider}` : ''}
                      </Typography>
                    </Box>
                    <Tooltip title='Delete model'>
                      <IconButton
                        size='small'
                        onClick={() => del.mutate(m.id)}
                        sx={{ color: designTokens.textFaint }}
                      >
                        <DeleteOutlineRounded sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Box>
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth='xs'
        fullWidth
        slotProps={{
          paper: {
            sx: { border: `1px solid ${designTokens.border}`, borderRadius: 1.5 },
          },
        }}
      >
        <DialogTitle
          sx={{
            fontSize: 15,
            fontWeight: 600,
            color: designTokens.text,
            borderBottom: `1px solid ${designTokens.border}`,
            py: 1.75,
          }}
        >
          New NL search model
        </DialogTitle>
        <DialogContent sx={{ py: 2.25, px: 2.75 }}>
          <Box sx={{ pt: 1 }}>
            <NlSearchModelForm onSuccess={() => setOpen(false)} />
          </Box>
        </DialogContent>
      </Dialog>
    </Stack>
  );
}
