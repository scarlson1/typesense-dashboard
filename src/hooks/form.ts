import { Checkbox } from '@/components/forms/Checkbox';
import { createFormHook } from '@tanstack/react-form';
// import { MaskInput } from '../components/forms/MaskInput';
import { Select } from '@/components/forms/Select';
import { SubmitButton } from '@/components/forms/SubmitButton';
// import { WizardNavButtons } from '../components/forms/WizardNavButtons';
import { lazy } from 'react';
import { fieldContext, formContext } from './formContext';

const TextField = lazy(() => import('../components/forms/TextField.tsx'));
const DatePicker = lazy(() => import('../components/forms/DatePicker.tsx'));
const Autocomplete = lazy(() => import('../components/forms/Autocomplete.tsx'));

// TODO: create other reusable input types (number input, select, masked fields etc.)

// useAppForm is similar to useForm, but provides reusable custom UI components (<field.TextField>, <form.SubmitButton>, etc.)
const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    TextField,
    Checkbox,
    Select,
    DatePicker,
    Autocomplete,
    // MaskInput,
  },
  formComponents: {
    SubmitButton,
    // WizardNavButtons,
  },
  fieldContext,
  formContext,
});

export { useAppForm, withForm };
