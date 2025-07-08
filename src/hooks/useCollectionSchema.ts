import { CollectionContext, type CollectionContextValues } from '@/context';
import { useContext } from 'react';

export const useCollectionSchema = () => {
  const context = useContext<CollectionContextValues<Error> | null>(
    CollectionContext
  );
  if (context === undefined)
    throw new Error(
      'useCollectionSchema must be within a CollectionContext.Provider'
    );

  return context as CollectionContextValues<Error>;
};
