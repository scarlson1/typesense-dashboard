import { VersionContext, type VersionInfo } from '@/context/VersionContext';
import { useContext } from 'react';

export const useTypesenseVersion = () => {
  const context = useContext(VersionContext);

  if (!context)
    throw new Error(
      'useTypesenseVersion must be within VersionContext Provider',
    );

  return context as VersionInfo;
};
