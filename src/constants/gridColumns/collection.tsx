import { GridCellExpand } from '@/components/GridCellExpand';
import type { GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import type { CollectionSchema } from 'typesense/lib/Typesense/Collection';

export const collectionColumns: GridColDef<CollectionSchema>[] = [
  {
    field: 'name',
    headerName: 'Name',
    type: 'string',
    minWidth: 120,
    flex: 0.8,
    sortable: false,
    filterable: false,
  },
  {
    field: 'num_documents',
    headerName: '# Documents',
    type: 'number',
    minWidth: 100,
    flex: 0.3,
    sortable: true,
    filterable: true,
  },
  {
    field: 'fields',
    headerName: 'Fields',
    type: 'string',
    minWidth: 280,
    flex: 2,
    sortable: false,
    filterable: false,
    renderCell: (params) => {
      return (
        <GridCellExpand
          value={params.value ? JSON.stringify(params.value) : ''}
          popperValue={
            params.value ? (
              <pre style={{ marginTop: 0 }}>
                {JSON.stringify(params.value, null, 2)}
              </pre>
            ) : (
              ''
            )
          }
          width={params.colDef.computedWidth}
        />
      );
    },
  },
  {
    field: 'created_at',
    headerName: 'Created',
    type: 'date',
    minWidth: 180,
    flex: 0.5,
    sortable: true,
    filterable: true,
    valueGetter: (_, row) =>
      row.created_at ? new Date(row.created_at * 1000) : null,
    valueFormatter: (val) => (val ? format(val, 'MM/dd/yy') : null),
    // renderCell: ({ value }) =>
    //   value ? <Typography>{format(value, 'MM/dd/yy')}</Typography> : null,
  },
  {
    field: 'default_sorting_field',
    headerName: 'Default Sorting Field',
    type: 'string',
    minWidth: 160,
    flex: 0.5,
    sortable: false,
    filterable: false,
  },
  {
    field: 'symbols_to_index',
    headerName: 'Symbols To Index',
    type: 'string',
    minWidth: 160,
    flex: 0.5,
    sortable: false,
    filterable: false,
    valueGetter: (_, row) =>
      row.symbols_to_index ? row.symbols_to_index.join(', ') : '',
  },
  {
    field: 'token_separators',
    headerName: 'Token Separators',
    type: 'string',
    minWidth: 160,
    flex: 0.5,
    sortable: false,
    filterable: false,
    valueGetter: (_, row) =>
      row.token_separators ? row.token_separators.join(', ') : '',
  },
  {
    field: 'enable_nested_fields',
    headerName: 'Enable Nested Fields',
    type: 'boolean',
    minWidth: 160,
    flex: 0.5,
    sortable: false,
    filterable: false,
  },
  {
    field: 'metadata',
    headerName: 'Metadata',
    type: 'string',
    minWidth: 160,
    flex: 1,
    sortable: false,
    filterable: false,
    valueGetter: (_, row) => (row.metadata ? JSON.stringify(row.metadata) : ''),
  },
  {
    field: 'voice_query_model.model_name',
    headerName: 'Voice Model',
    type: 'string',
    minWidth: 160,
    flex: 0.5,
    sortable: false,
    filterable: false,
    valueGetter: (_, row) => row.voice_query_model?.model_name ?? '',
  },
];
