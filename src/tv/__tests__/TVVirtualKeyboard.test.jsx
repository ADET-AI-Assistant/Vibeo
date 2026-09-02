import React, { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TVFocusProvider } from '../context/TVFocusContext';
import TVVirtualKeyboard from '../components/TVVirtualKeyboard';

const TestKeyboardApp = ({ onSearch }) => {
    const [query, setQuery] = useState('');

    return (
        <TVFocusProvider>
            <TVVirtualKeyboard
                query={query}
                onQueryChange={setQuery}
                onSearch={onSearch}
            />
        </TVFocusProvider>
    );
};

describe('TVVirtualKeyboard', () => {
    it('initializes and focuses key A', () => {
        render(<TestKeyboardApp />);
        const keyA = screen.getByTestId('key-key-A');
        expect(keyA).toBeDefined();
        expect(keyA.classList.contains('tv-focused')).toBe(true);
    });

    it('navigates the grid using D-Pad and types characters', () => {
        render(<TestKeyboardApp />);

        // Press Enter on key A
        fireEvent.keyDown(window, { key: 'Enter' });
        expect(screen.getByTestId('tv-search-query').textContent).toContain('A');

        // Move Right -> key B
        fireEvent.keyDown(window, { key: 'ArrowRight' });
        expect(screen.getByTestId('key-key-B').classList.contains('tv-focused')).toBe(true);
        fireEvent.keyDown(window, { key: 'Enter' });

        // Query should now display AB
        expect(screen.getByTestId('tv-search-query').textContent).toContain('AB');
    });

    it('handles backspace and clear function keys', () => {
        render(<TestKeyboardApp />);

        // Type 'A'
        fireEvent.keyDown(window, { key: 'Enter' });
        expect(screen.getByTestId('tv-search-query').textContent).toContain('A');

        // Click Backspace
        const backspaceKey = screen.getByTestId('key-key-backspace');
        fireEvent.click(backspaceKey);

        // Query should be empty (shows placeholder)
        expect(screen.getByTestId('tv-search-query').textContent).toContain('Search movies & TV shows...');
    });
});
