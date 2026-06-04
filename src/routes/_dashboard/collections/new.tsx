import { NewCollectionForm } from '@/components/NewCollectionForm';
import { PageHeader, smallButtonSx } from '@/components/redesign';
import { OpenInNewRounded } from '@mui/icons-material';
import {
  Box,
  Button,
  Container,
  Skeleton,
  Stack,
  Tab,
  Tabs,
} from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import {
  lazy,
  Suspense,
  useCallback,
  useState,
  type SyntheticEvent,
} from 'react';

const NewCollectionEditor = lazy(
  () => import('@/components/NewCollectionEditor'),
);

export const Route = createFileRoute('/_dashboard/collections/new')({
  component: NewCollection,
  staticData: {
    crumb: 'New',
  },
});

function NewCollection() {
  const [value, setValue] = useState('form');

  const handleChange = useCallback((_: SyntheticEvent, newValue: string) => {
    setValue(newValue);
  }, []);

  return (
    <Stack sx={{ minWidth: 0 }}>
      <PageHeader
        title='New Collection'
        // badges={<Badge tone='neutral'>{collectionId}</Badge>}
        actions={
          <Button
            component='a'
            href='https://typesense.org/docs/32.2/api/curation.html'
            target='_blank'
            rel='noopener noreferrer'
            variant='outlined'
            size='small'
            startIcon={<OpenInNewRounded sx={{ fontSize: 13 }} />}
            sx={smallButtonSx}
          >
            Schema Docs
          </Button>
        }
      />

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={value}
          onChange={handleChange}
          aria-label='new collection input mode'
        >
          <Tab label='Form' value='form' />
          <Tab label='JSON' value='editor' />
        </Tabs>
      </Box>
      <Container maxWidth='xl'>
        <Box role='tabpanel' hidden={value !== 'form'} sx={{ pt: 3 }}>
          {value === 'form' && <NewCollectionForm />}
        </Box>
        <Box role='tabpanel' hidden={value !== 'editor'} sx={{ pt: 3 }}>
          {value === 'editor' && (
            <Suspense fallback={<Skeleton variant='rounded' height={'60vh'} />}>
              <NewCollectionEditor />
            </Suspense>
          )}
        </Box>
      </Container>
    </Stack>
  );
}
