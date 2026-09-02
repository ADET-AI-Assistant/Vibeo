import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TVFocusProvider } from '../context/TVFocusContext';
import TVPlay from '../pages/TVPlay';

// Mock TMDB client
vi.mock('@/api/tmdbClient', () => ({
    fetchTMDB: vi.fn().mockResolvedValue({
        id: 123,
        title: 'Interstellar',
        seasons: [{ season_number: 1, episode_count: 10 }],
    }),
}));

// Mock UserMovies hook
vi.mock('@/hooks/useUserMovies', () => ({
    useUserMovies: () => ({
        addToContinueWatching: vi.fn(),
    }),
}));

describe('TVPlay OSD & Controls', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    it('renders the video player iframe and OSD controls', async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/tv/play/123']}>
                    <TVFocusProvider>
                        <Routes>
                            <Route path="/tv/play/:id" element={<TVPlay />} />
                        </Routes>
                    </TVFocusProvider>
                </MemoryRouter>
            );
        });

        expect(screen.getByTestId('player-play-pause')).toBeDefined();
        expect(screen.getByTestId('player-seek-back')).toBeDefined();
        expect(screen.getByTestId('player-seek-fwd')).toBeDefined();
    });

    it('displays visual feedback when seeking forward and backward', async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/tv/play/123']}>
                    <TVFocusProvider>
                        <Routes>
                            <Route path="/tv/play/:id" element={<TVPlay />} />
                        </Routes>
                    </TVFocusProvider>
                </MemoryRouter>
            );
        });

        // Click seek forward
        act(() => {
            fireEvent.click(screen.getByTestId('player-seek-fwd'));
        });
        expect(screen.getByText('+10s ⏩')).toBeDefined();

        // Fast forward 1.3s to clear feedback
        act(() => {
            vi.advanceTimersByTime(1300);
        });
        expect(screen.queryByText('+10s ⏩')).toBeNull();

        // Click seek backward
        act(() => {
            fireEvent.click(screen.getByTestId('player-seek-back'));
        });
        expect(screen.getByText('⏪ -10s')).toBeDefined();
    });

    it('toggles play/pause state when play-pause button is clicked', async () => {
        await act(async () => {
            render(
                <MemoryRouter initialEntries={['/tv/play/123']}>
                    <TVFocusProvider>
                        <Routes>
                            <Route path="/tv/play/:id" element={<TVPlay />} />
                        </Routes>
                    </TVFocusProvider>
                </MemoryRouter>
            );
        });

        const playBtn = screen.getByTestId('player-play-pause');
        expect(playBtn.getAttribute('title')).toBe('Pause');

        act(() => {
            fireEvent.click(playBtn);
        });
        expect(playBtn.getAttribute('title')).toBe('Play');
    });
});
