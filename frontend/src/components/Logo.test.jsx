import React from 'react';
import { render, screen } from '@testing-library/react';
import Logo from './Logo';

describe('Logo Component', () => {
    it('renders the text Omake successfully', () => {
        render(<Logo />);
        const omakeText = screen.getByText(/Omake/i);
        expect(omakeText).toBeInTheDocument();
    });
});
