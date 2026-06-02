import { useColorScheme } from '@mui/material';

export type ResolvedMode = 'light' | 'dark';

export const useResolvedMode = () => {
  const { mode, systemMode } = useColorScheme();
  return systemMode || (mode as ResolvedMode);
};
