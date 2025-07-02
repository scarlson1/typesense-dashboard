import { Paper, Stack, Typography, type TypographyProps } from '@mui/material';
import type {
  DocumentSchema,
  SearchResponseHit,
} from 'typesense/lib/Typesense/Documents';
import { HitActions } from './HitActions';

function HitLabel({ children, ...props }: TypographyProps) {
  return (
    <Typography
      variant='body2'
      color='textSecondary'
      sx={{
        textAlign: 'right',
        width: { xs: 120, sm: 150, md: 200 },
        flex: '0 0 auto',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
      {...props}
    >
      {children}
    </Typography>
  );
}

export interface HitProps {
  hit: SearchResponseHit<DocumentSchema>;
}

export function Hit({ hit }: HitProps) {
  return (
    <Paper
      sx={{
        p: { xs: 3, sm: 4, md: 5 },
        my: { xs: 2, sm: 3 },
        position: 'relative',
      }}
    >
      <Stack
        direction='column'
        spacing={1}
        sx={{ maxHeight: 300, overflowX: 'auto' }}
      >
        {Object.entries(hit?.document).map(([key, value]) => (
          <Stack direction='row' spacing={3} key={key} sx={{ display: 'flex' }}>
            <HitLabel>{key}</HitLabel>
            <Typography
              variant='body2'
              sx={{
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
              }}
            >
              {typeof value === 'string' || typeof value === 'number'
                ? value
                : JSON.stringify(value)}
            </Typography>
          </Stack>
        ))}
        <HitLabel variant='overline'>text_match_info</HitLabel>
        {Object.entries(hit?.text_match_info as Record<string, any>).map(
          ([key, value], i) => (
            <Stack
              direction='row'
              spacing={3}
              key={key}
              sx={{ display: 'flex', mt: i === 0 ? 2 : 0 }}
            >
              <HitLabel>{key}</HitLabel>
              <Typography
                variant='body2'
                sx={{
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {typeof value === 'string' || typeof value === 'number'
                  ? value
                  : JSON.stringify(value)}
              </Typography>
            </Stack>
          )
        )}
        <Stack direction='row' spacing={3} sx={{ display: 'flex', mt: 2 }}>
          <HitLabel>ID</HitLabel>
          <Typography
            variant='body2'
            sx={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {hit?.document.id}
          </Typography>
        </Stack>
      </Stack>

      {/* TODO: need helper function to get doc ID from schema (could be different than "id") ?? */}
      <HitActions docId={hit.document.id} docData={hit.document} />
    </Paper>
  );
}
