import { useFieldContext } from '@/hooks';
import {
  LocalizationProvider,
  DatePicker as MuiDatePicker,
  type DatePickerProps as MuiDatePickerProps,
} from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { useStore } from '@tanstack/react-form';

type DatePickerProps = Omit<
  MuiDatePickerProps,
  'onBlur' | 'error' | 'select' // | 'onChange'
>;

export default function DatePicker({ label, ...props }: DatePickerProps) {
  const { state, store, handleBlur, handleChange } = useFieldContext<Date>();
  const errors = useStore(store, (state) => state.meta.errors);

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <MuiDatePicker
        label={label}
        defaultValue={state.value}
        // onChange={(newVal) => handleChange(newVal)}
        onChange={(newVal) => handleChange(newVal as Date)}
        // @ts-ignore
        onBlur={() => {
          handleBlur();
        }}
        views={['day', 'month', 'year']}
        {...props}
        slotProps={{
          nextIconButton: { size: 'small' },
          previousIconButton: { size: 'small' },
          ...(props.slotProps || {}),
          textField: {
            helperText: errors.join(', '),
            ...(props.slotProps?.textField || {}),
          },
        }}
      />
    </LocalizationProvider>
  );
}
