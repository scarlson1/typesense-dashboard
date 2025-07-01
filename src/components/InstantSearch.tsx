import { useQuery } from '@tanstack/react-query';
import { useMemo, useState, type ReactNode } from 'react';
import type { Client } from 'typesense';
import type {
  DocumentSchema,
  SearchParams,
  SearchParamsWithPreset,
} from 'typesense/lib/Typesense/Documents';
import { collectionQueryKeys } from '../constants';
import { SearchContext, type SearchContextValues } from '../context';
import { useDebounce } from '../hooks';

export type InstantSearchProps = {
  // SearchContextValues & {
  clusterId: string;
  client: Client;
  collectionId: string;
  children?: ReactNode;
  initialParams?: Omit<SearchParams, 'q'> | Omit<SearchParamsWithPreset, 'q'>;
  debounceMs?: number;
  // TODO: extends UseQueryOptions ??
  staleTime?: number;
};

export function InstantSearch<T extends DocumentSchema>({
  children,
  client,
  clusterId,
  collectionId,
  initialParams = {},
  debounceMs = 200,
  staleTime = 30000,
}: InstantSearchProps) {
  const [params, setParams] = useState(initialParams);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, debounceMs);

  const { data, isLoading, isFetching, isError, error, isPlaceholderData } =
    useQuery({
      queryKey: collectionQueryKeys.search(
        clusterId,
        collectionId,
        params,
        debouncedQuery
      ),
      queryFn: () =>
        client
          .collections<T>(collectionId)
          .documents()
          .search({
            q: debouncedQuery,
            ...params,
          }),
      enabled: !!debouncedQuery,
      staleTime,
    });

  // TODO:
  // presets
  // search params
  // create hooks for specific types of updates to context (presets, search params, etc.)

  const memoizedValue: SearchContextValues<T, Error> = useMemo(
    () => ({
      data,
      isLoading,
      isFetching,
      isError,
      error,
      isPlaceholderData,
      collectionId,
      setParams,
      setQuery,
    }),
    [
      data,
      isLoading,
      isFetching,
      isError,
      error,
      isPlaceholderData,
      collectionId,
      setParams,
      setQuery,
    ]
  );

  return (
    <SearchContext.Provider value={memoizedValue}>
      {/* <IndexContext.Provider value={search.mainIndex}> */}
      {children}
      {/* </IndexContext.Provider> */}
    </SearchContext.Provider>
  );
}

// interface UseInstantSearchApiProps {
//   clusterId: string;
//   client: Client;
//   indexName: string;

// Function called when the state changes.
// Using this function makes the instance controlled. This means that you become in charge of updating the UI state with the `setUiState` function.
// onStateChange?: (params: {
//   uiState: TUiState;
//   setUiState: (
//     uiState: TUiState | ((previousUiState: TUiState) => TUiState)
//   ) => void;
// }) => void;

// initialUiState?: NoInfer<TUiState>;

// Time before a search is considered stalled. The default is 200ms
// stalledSearchDelay?: number;

// Router configuration used to save the UI State into the URL or any other client side persistence.
// routing?: RouterProps<TUiState, TRouteState> | boolean;
// }

// import { IndexContext } from '../lib/IndexContext';
// import { InstantSearchContext } from '../lib/InstantSearchContext';
// import { useInstantSearchApi } from '../lib/useInstantSearchApi';

// import type {
//   InternalInstantSearch,
//   UseInstantSearchApiProps,
// } from '../lib/useInstantSearchApi';
// import type {
//   InstantSearch as InstantSearchType,
//   UiState,
// } from 'instantsearch.js';

// export type InstantSearchProps<
//   TUiState extends UiState = UiState,
//   TRouteState = TUiState
// > = UseInstantSearchApiProps<TUiState, TRouteState> & {
//   children?: ReactNode
// };

// export function InstantSearch<
//   TUiState extends UiState = UiState,
//   TRouteState = TUiState>
// ({ children, ...props }: InstantSearchProps<TUiState, TRouteState>) {
//   const search = useInstantSearchApi<TUiState, TRouteState>(props);

//   if (!search.started) {
//     return null;
//   }

//   return (
//     <InstantSearchContext.Provider
//       value={search as unknown as InstantSearchType<UiState, UiState>}
//     >
//       <IndexContext.Provider value={search.mainIndex}>
//         {children}
//         <ResetScheduleSearch
//           search={search as unknown as InternalInstantSearch<UiState, UiState>}
//         />
//       </IndexContext.Provider>
//     </InstantSearchContext.Provider>
//   );
// }
