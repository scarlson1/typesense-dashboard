import { authFormOpts } from '@/constants/authForm';
import { useAppForm } from '@/hooks';
import { renderWithProviders, resetTestState } from '@/test/utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AuthForm } from './AuthForm';

afterEach(resetTestState);

// AuthForm is a `withForm` component with no submit logic of its own; the route
// owns onSubmit. This harness mirrors that wiring so we can exercise the fields.
const Harness = ({ onSubmit }: { onSubmit: (values: unknown) => void }) => {
  const form = useAppForm({
    ...authFormOpts,
    onSubmit: async ({ value }) => onSubmit(value),
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <AuthForm form={form} title='Login' />
    </form>
  );
};

describe('AuthForm', () => {
  it('renders the title and every credential field', async () => {
    renderWithProviders(<Harness onSubmit={vi.fn()} />);

    expect(await screen.findByText('Login')).toBeInTheDocument();
    expect(await screen.findByLabelText(/node/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/port/i)).toBeInTheDocument();
    expect(await screen.findByLabelText(/api key/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/protocol/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/environment/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /submit/i })).toBeInTheDocument();
  });

  it('masks the API key input', async () => {
    renderWithProviders(<Harness onSubmit={vi.fn()} />);
    const apiKey = await screen.findByLabelText(/api key/i);
    expect(apiKey).toHaveAttribute('type', 'password');
  });

  it('submits the entered credentials', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithProviders(<Harness onSubmit={onSubmit} />);

    await user.type(await screen.findByLabelText(/node/i), 'localhost');
    await user.type(screen.getByLabelText(/port/i), '8108');
    await user.type(screen.getByLabelText(/api key/i), 'secret-key');

    // MUI Select interaction for the protocol field.
    await user.click(screen.getByLabelText(/protocol/i));
    await user.click(await screen.findByRole('option', { name: 'http' }));

    // jsdom doesn't perform implicit form submission on a submit-button click,
    // so submit the form directly (still exercises the real onSubmit wiring).
    const submitBtn = screen.getByRole('button', { name: /submit/i });
    fireEvent.submit(submitBtn.closest('form')!);

    await waitFor(() => expect(onSubmit).toHaveBeenCalledTimes(1));
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        node: 'localhost',
        port: '8108',
        apiKey: 'secret-key',
        protocol: 'http',
      })
    );
  });
});
