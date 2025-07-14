import type { GridColDef } from '@mui/x-data-grid';
import { format } from 'date-fns';
import type { KeySchema } from 'typesense/lib/Typesense/Key';

export const apiKeyColumns: GridColDef<KeySchema>[] = [
  {
    field: 'id',
    headerName: 'ID',
    type: 'number',
    minWidth: 80,
    flex: 0.2,
    sortable: false,
    filterable: false,
  },
  {
    field: 'description',
    headerName: 'Description',
    type: 'string',
    minWidth: 200,
    flex: 1.5,
    sortable: false,
    filterable: false,
  },
  {
    field: 'value_prefix',
    headerName: 'Prefix',
    type: 'string',
    minWidth: 80,
    flex: 0.8,
    sortable: false,
    filterable: false,
  },
  // not returned ??
  // {
  //   field: 'value',
  //   headerName: 'Value',
  //   type: 'number',
  //   minWidth: 140,
  //   flex: 0.8,
  //   sortable: false,
  //   filterable: false,
  // },
  {
    field: 'collections',
    headerName: 'Collections',
    type: 'string',
    minWidth: 220,
    flex: 1,
    sortable: false,
    filterable: false,
    valueFormatter: (_, row) =>
      row.collections ? row.collections.join(', ') : '',
  },
  {
    field: 'actions',
    headerName: 'Actions',
    type: 'string',
    minWidth: 220,
    flex: 1,
    sortable: false,
    filterable: false,
    valueFormatter: (_, row) => (row.actions ? row.actions.join(', ') : ''),
  },
  {
    field: 'autodelete',
    headerName: 'Autodelete',
    type: 'boolean',
    minWidth: 80,
    flex: 0.8,
    sortable: false,
    filterable: false,
  },
  {
    field: 'expires_at',
    headerName: 'Expiration',
    type: 'date',
    minWidth: 120,
    flex: 0.8,
    sortable: true,
    filterable: true,
    valueGetter: (_, row) =>
      row.expires_at ? new Date(row.expires_at * 1000) : null,
    renderCell: (params) =>
      params.value ? format(params.value, 'MM/dd/yyyy') : '',
  },
];
