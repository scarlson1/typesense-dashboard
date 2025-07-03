import {
  DataObjectRounded,
  DeleteRounded,
  EditRounded,
} from '@mui/icons-material';
import { ButtonGroup, IconButton, type IconButtonProps } from '@mui/material';
import { useCallback } from 'react';
import { DEFAULT_MONACO_OPTIONS } from '../../constants';
import {
  useDeleteDocument,
  useDialog,
  useDocumentEditorDialog,
  useSearch,
} from '../../hooks';
import { JsonEditor } from '../JsonEditor';

interface HitActionsProps {
  docData: Record<string, any>;
  docId: string;
}

// TODO: render from slots / slotProps ??
export function HitActions({ docData, docId }: HitActionsProps) {
  return (
    <ButtonGroup
      size='small'
      orientation='vertical'
      aria-label='Small button group'
      sx={{ position: 'absolute', right: '8px', top: '8px' }}
    >
      <DeleteDocumentIconButton docId={docId} />
      <EditDocumentIconButton docData={docData} docId={docId} />
      <ViewDocumentIconButton docData={docData} docId={docId} />
    </ButtonGroup>
  );
}

interface DeleteDocumentIconButtonProps
  extends Omit<IconButtonProps, 'onClick'> {
  docId: string;
}

function DeleteDocumentIconButton({ docId }: DeleteDocumentIconButtonProps) {
  const { collectionId } = useSearch();
  const dialog = useDialog();
  const deleteMutation = useDeleteDocument();

  const handleDeleteDoc = useCallback(async () => {
    try {
      await dialog.prompt({
        variant: 'danger',
        catchOnCancel: true,
        title: `Confirm Document Deletion [ID: ${docId}]`,
        description: `THIS ACTION CANNOT BE UNDONE. Please confirm that you want to proceed to delete document "${docId}" from the "${collectionId}" collection.`,
        slotProps: {
          dialog: {
            maxWidth: 'sm',
          },
        },
      });
      deleteMutation.mutate({ collectionId, docId });
    } catch (error) {}
  }, [deleteMutation?.mutate, dialog?.prompt, collectionId, docId]);

  return (
    <IconButton
      onClick={() => handleDeleteDoc()}
      aria-label='delete'
      size='small'
      loading={deleteMutation.isPending}
      color='primary'
    >
      <DeleteRounded fontSize='inherit' />
    </IconButton>
  );
}

interface EditDocumentIconButtonProps extends Omit<IconButtonProps, 'onClick'> {
  docData: Record<string, any>;
  docId: string;
}

function EditDocumentIconButton({
  docData,
  docId,
  ...props
}: EditDocumentIconButtonProps) {
  const openEditDialog = useDocumentEditorDialog();

  return (
    <IconButton
      onClick={() =>
        openEditDialog({
          value: JSON.stringify(docData, null, 2),
          title: `Edit doc ${docId}`,
        })
      }
      aria-label='edit'
      size='small'
      color='primary'
      {...props}
    >
      <EditRounded fontSize='inherit' />
    </IconButton>
  );
}

interface ViewDocumentIconButtonProps extends Omit<IconButtonProps, 'onClick'> {
  docData: Record<string, any>;
  docId: string;
}

function ViewDocumentIconButton({
  docData,
  docId,
  ...props
}: ViewDocumentIconButtonProps) {
  const dialog = useDialog();

  const handleViewJson = useCallback(() => {
    dialog.prompt({
      catchOnCancel: false,
      variant: 'info',
      title: `Document [ID: ${docId}]`,
      // description: ``,
      content: (() => {
        return (
          <JsonEditor
            height='75vh'
            options={{ ...DEFAULT_MONACO_OPTIONS, readOnly: true }}
            value={JSON.stringify(docData, null, 2)}
            schema={{}}
          />
        );
      })(),
      slotProps: {
        dialog: {
          maxWidth: 'sm',
        },
      },
    });
  }, [dialog?.prompt, docId, docData]);

  return (
    <IconButton
      onClick={() => handleViewJson()}
      aria-label='view'
      size='small'
      color='primary'
      {...props}
    >
      <DataObjectRounded fontSize='inherit' />
    </IconButton>
  );
}
