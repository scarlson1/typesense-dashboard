import { Paper, Stack, Typography, type TypographyProps } from '@mui/material';
import { useMemo, type ReactNode } from 'react';
import type {
  DocumentSchema,
  SearchResponseHit,
} from 'typesense/lib/Typesense/Documents';
import { HitActions } from './HitActions';

export interface HitProps {
  hit: SearchResponseHit<DocumentSchema>;
  children?: ReactNode;
  displayFields?: string[];
}

export function Hit({ hit, children, displayFields }: HitProps) {
  let displayFieldsArr = useMemo(() => {
    if (!displayFields?.length) return Object.entries(hit?.document);

    return Object.entries(hit?.document).filter(([field]) =>
      displayFields.includes(field)
    );
  }, [displayFields, hit]);

  return (
    <Paper
      sx={{
        p: { xs: 3, sm: 4, md: 5 },
        position: 'relative',
      }}
    >
      <Stack
        direction='column'
        spacing={1}
        sx={{ maxHeight: 300, overflowX: 'auto' }}
      >
        {displayFieldsArr.map(([key, value]) => (
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

      <HitActions docId={hit.document.id} docData={hit.document} />
      {children}
    </Paper>
  );
}

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
