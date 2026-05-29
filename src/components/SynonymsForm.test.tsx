import { useAppForm } from '@/hooks';
import { renderWithProviders, resetTestState } from '@/test/utils';
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { SynonymsForm, synonymsFormOpts } from './SynonymsForm';

afterEach(resetTestState);

const Harness = ({ onSubmit }: { onSubmit: (values: unknown) => void }) => {
  const form = useAppForm({
    ...synonymsFormOpts,
    onSubmit: async ({ value }) => onSubmit(value),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <SynonymsForm form={form} />
    </form>
  );
};

describe('SynonymsForm', () => {
  it('renders the core fields and the add-rule button', async () => {
    renderWithProviders(<Harness onSubmit={vi.fn()} />);

    expect(await screen.findByText('Rule ID')).toBeInTheDocument();
    expect(screen.getByText(/synonym terms/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /multi-way/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add rule/i })).toBeInTheDocument();
  });

  it('reveals the Root field only when the one-way type is selected', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness onSubmit={vi.fn()} />);

    // multi-way is the default → no Root field
    expect(await screen.findByText('Rule ID')).toBeInTheDocument();
    expect(screen.queryByText('Root')).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /one-way/i }));
    expect(await screen.findByText('Root')).toBeInTheDocument();
  });

  it('turns comma-separated input into chips and submits the joined value', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<Harness onSubmit={onSubmit} />);

    const synonymsLabel = await screen.findByText(/synonym terms/i);
    // ChipInput is the editable box following the "Synonym terms" label.
    const chipBox = synonymsLabel.nextElementSibling as HTMLElement;
    const chipInput = within(chipBox).getByRole('textbox');

    // A trailing comma/space commits a chip.
    await user.type(chipInput, 'apartment, flat, ');
    expect(within(chipBox).getByText('apartment')).toBeInTheDocument();
    expect(within(chipBox).getByText('flat')).toBeInTheDocument();

    fireEvent.submit(chipInput.closest('form')!);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'multi-way',
        synonyms: 'apartment, flat',
      })
    );
  });
});
