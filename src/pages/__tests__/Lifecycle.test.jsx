import React from 'react';
import { render, screen } from '@testing-library/react';
import Lifecycle from '../Lifecycle';

describe('Lifecycle page', () => {
  it('renders the header and input', async () => {
    render(<Lifecycle />);
    expect(screen.getByText(/Product Lifecycle/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Product ID/i)).toBeInTheDocument();
  });
});
