import type { DialogSlotProps, DialogSlotsComponents } from '@/components';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';

export const CONTEXT_DIALOG_DEFAULT_SLOTS_COMPONENTS: DialogSlotsComponents = {
  dialog: Dialog,
  title: DialogTitle,
  content: DialogContent,
  actions: DialogActions,
  acceptButton: Button,
  cancelButton: Button,
};

export const CONTEXT_DIALOG_DEFAULT_SLOT_PROPS: DialogSlotProps = {
  dialog: {
    maxWidth: 'xs',
    fullWidth: true,
  },
  title: {},
  content: {
    dividers: true,
  },
  actions: {},
  acceptButton: {
    color: 'primary',
  },
  cancelButton: {
    color: 'inherit',
  },
};
