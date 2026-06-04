import { NewCollectionForm } from '@/components/NewCollectionForm';
import { Box, Skeleton, Tab, Tabs, Typography } from '@mui/material';
import { createFileRoute } from '@tanstack/react-router';
import {
  lazy,
  Suspense,
  useCallback,
  useState,
  type SyntheticEvent,
} from 'react';

const NewCollectionEditor = lazy(
  () => import('@/components/NewCollectionEditor')
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
    <Box>
      <Typography variant='h3'>New Collection</Typography>
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
    </Box>
  );
}
