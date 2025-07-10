import { NewCollectionForm } from '@/components/NewCollectionForm';
import { TabContext, TabList, TabPanel } from '@mui/lab';
import { Box, Skeleton, Tab, Typography } from '@mui/material';
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
      <TabContext value={value}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <TabList onChange={handleChange} aria-label='lab API tabs example'>
            <Tab label='Form' value='form' />
            <Tab label='JSON' value='editor' />
          </TabList>
        </Box>
        <TabPanel value='form'>
          <NewCollectionForm />
        </TabPanel>
        <TabPanel value='editor'>
          <Suspense fallback={<Skeleton variant='rounded' height={'60vh'} />}>
            <NewCollectionEditor />
          </Suspense>
        </TabPanel>
      </TabContext>
    </Box>
  );
}
