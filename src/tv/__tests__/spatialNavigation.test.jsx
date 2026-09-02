import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { TVFocusProvider, useTVFocusable, useTVFocus } from '../context/TVFocusContext';

const TestItem = ({ id, zone, onSelect, autoFocus }) => {
    const { ref, isFocused } = useTVFocusable({ id, zone, onSelect, autoFocus });
    return (
        <button
            ref={ref}
            data-testid={id}
            data-focused={isFocused ? 'true' : 'false'}
            className={isFocused ? 'focused' : ''}
        >
            {id}
        </button>
    );
};

const TestApp = ({ onCardSelect }) => {
    const { setZoneConfig } = useTVFocus();

    React.useEffect(() => {
        setZoneConfig('sidebar', { type: 'vertical', orderIndex: 0 });
        setZoneConfig('row-1', { type: 'horizontal', orderIndex: 1 });
        setZoneConfig('row-2', { type: 'horizontal', orderIndex: 2 });
    }, [setZoneConfig]);

    return (
        <div>
            <div data-testid="sidebar-zone">
                <TestItem id="side-home" zone="sidebar" />
                <TestItem id="side-search" zone="sidebar" />
            </div>
            <div data-testid="row-1-zone">
                <TestItem id="card-1-1" zone="row-1" onSelect={onCardSelect} autoFocus />
                <TestItem id="card-1-2" zone="row-1" onSelect={onCardSelect} />
                <TestItem id="card-1-3" zone="row-1" onSelect={onCardSelect} />
            </div>
            <div data-testid="row-2-zone">
                <TestItem id="card-2-1" zone="row-2" onSelect={onCardSelect} />
                <TestItem id="card-2-2" zone="row-2" onSelect={onCardSelect} />
            </div>
        </div>
    );
};

describe('TVFocusContext Spatial Navigation', () => {
    it('initializes focus on autoFocus item', () => {
        render(
            <TVFocusProvider>
                <TestApp />
            </TVFocusProvider>
        );

        const card1 = screen.getByTestId('card-1-1');
        expect(card1.getAttribute('data-focused')).toBe('true');
    });

    it('moves focus right and left within the horizontal row', () => {
        render(
            <TVFocusProvider>
                <TestApp />
            </TVFocusProvider>
        );

        // Press Right -> card-1-2
        fireEvent.keyDown(window, { key: 'ArrowRight' });
        expect(screen.getByTestId('card-1-2').getAttribute('data-focused')).toBe('true');
        expect(screen.getByTestId('card-1-1').getAttribute('data-focused')).toBe('false');

        // Press Right -> card-1-3
        fireEvent.keyDown(window, { key: 'ArrowRight' });
        expect(screen.getByTestId('card-1-3').getAttribute('data-focused')).toBe('true');

        // Press Left -> card-1-2
        fireEvent.keyDown(window, { key: 'ArrowLeft' });
        expect(screen.getByTestId('card-1-2').getAttribute('data-focused')).toBe('true');
    });

    it('transitions to sidebar on ArrowLeft from first item of row', () => {
        render(
            <TVFocusProvider>
                <TestApp />
            </TVFocusProvider>
        );

        // At card-1-1, press ArrowLeft -> switches to sidebar
        fireEvent.keyDown(window, { key: 'ArrowLeft' });
        expect(screen.getByTestId('side-home').getAttribute('data-focused')).toBe('true');

        // In sidebar, press ArrowDown -> side-search
        fireEvent.keyDown(window, { key: 'ArrowDown' });
        expect(screen.getByTestId('side-search').getAttribute('data-focused')).toBe('true');

        // From sidebar, press ArrowRight -> returns to content row memory (card-1-1)
        fireEvent.keyDown(window, { key: 'ArrowRight' });
        expect(screen.getByTestId('card-1-1').getAttribute('data-focused')).toBe('true');
    });

    it('navigates vertically between row zones with ArrowDown and ArrowUp', () => {
        render(
            <TVFocusProvider>
                <TestApp />
            </TVFocusProvider>
        );

        // Move to card-1-2
        fireEvent.keyDown(window, { key: 'ArrowRight' });
        expect(screen.getByTestId('card-1-2').getAttribute('data-focused')).toBe('true');

        // Press ArrowDown -> moves to row-2 matching index (card-2-2)
        fireEvent.keyDown(window, { key: 'ArrowDown' });
        expect(screen.getByTestId('card-2-2').getAttribute('data-focused')).toBe('true');

        // Press ArrowUp -> returns to row-1 (card-1-2)
        fireEvent.keyDown(window, { key: 'ArrowUp' });
        expect(screen.getByTestId('card-1-2').getAttribute('data-focused')).toBe('true');
    });

    it('triggers onSelect when Enter or Space is pressed', () => {
        const onCardSelect = vi.fn();
        render(
            <TVFocusProvider>
                <TestApp onCardSelect={onCardSelect} />
            </TVFocusProvider>
        );

        expect(screen.getByTestId('card-1-1').getAttribute('data-focused')).toBe('true');

        fireEvent.keyDown(window, { key: 'Enter' });
        expect(onCardSelect).toHaveBeenCalledWith('card-1-1');

        fireEvent.keyDown(window, { keyCode: 32 }); // Space
        expect(onCardSelect).toHaveBeenCalledTimes(2);
    });
});
