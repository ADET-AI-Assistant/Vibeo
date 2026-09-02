import React from 'react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TVFocusProvider } from '../context/TVFocusContext';
import { UserMoviesProvider, useUserMoviesContext } from '@/context/UserMoviesContext';
import { TVHeroBanner } from '../components/TVHeroBanner';
import { TVLibrary } from '../pages/TVLibrary';

// Mock AuthContext to return guest mode (null currentUser)
vi.mock('@/context/AuthContext', () => ({
    useAuth: () => ({ currentUser: null }),
}));

// Mock Firebase
vi.mock('../firebase', () => ({
    db: {},
}));

// Mock Django API Client
vi.mock('@/api/djangoClient', () => ({
    createFavorite: vi.fn(),
    createHistoryItem: vi.fn(),
    deleteFavorite: vi.fn(),
    deleteWatchlistItem: vi.fn(),
    getDjangoToken: vi.fn(() => null),
    syncUserStats: vi.fn(),
    updateWatchlistItem: vi.fn(),
}));

const mockMovie = {
    id: 4242,
    title: 'Interstellar',
    poster_path: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdrop_path: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    vote_average: 8.7,
    release_date: '2014-11-05',
    overview: 'A team of explorers travel through a wormhole in space.',
};

describe('TV Watchlist & Guest Persistence', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    it('allows guest users to add and remove movies from watchlist with localStorage persistence', async () => {
        let contextValue;
        const ConsumerComponent = () => {
            contextValue = useUserMoviesContext();
            return (
                <div>
                    <span data-testid="is-listed">
                        {contextValue.isWatchlisted(mockMovie.id) ? 'YES' : 'NO'}
                    </span>
                    <button
                        data-testid="toggle-btn"
                        onClick={() => contextValue.toggleWatchlist(mockMovie)}
                    >
                        Toggle
                    </button>
                </div>
            );
        };

        render(
            <UserMoviesProvider>
                <ConsumerComponent />
            </UserMoviesProvider>
        );

        // Initially not listed
        expect(screen.getByTestId('is-listed').textContent).toBe('NO');
        expect(contextValue.isWatchlisted(mockMovie.id)).toBe(false);

        // Click to add
        await act(async () => {
            fireEvent.click(screen.getByTestId('toggle-btn'));
        });

        // Now listed
        expect(screen.getByTestId('is-listed').textContent).toBe('YES');
        expect(contextValue.isWatchlisted(mockMovie.id)).toBe(true);

        // Verify stored in localStorage
        const stored = JSON.parse(localStorage.getItem('vibeo_guest_watchlist') || '[]');
        expect(stored.length).toBe(1);
        expect(stored[0].id).toBe(4242);
        expect(stored[0].title).toBe('Interstellar');

        // Click again to remove
        await act(async () => {
            fireEvent.click(screen.getByTestId('toggle-btn'));
        });

        expect(screen.getByTestId('is-listed').textContent).toBe('NO');
        expect(contextValue.isWatchlisted(mockMovie.id)).toBe(false);
        const storedAfterRemove = JSON.parse(localStorage.getItem('vibeo_guest_watchlist') || '[]');
        expect(storedAfterRemove.length).toBe(0);
    });

    it('toggles TVHeroBanner button state between "Watchlist" and "In Watchlist"', async () => {
        render(
            <MemoryRouter>
                <UserMoviesProvider>
                    <TVFocusProvider>
                        <TVHeroBanner movie={mockMovie} />
                    </TVFocusProvider>
                </UserMoviesProvider>
            </MemoryRouter>
        );

        // Initially shows "Watchlist"
        const watchlistBtn = screen.getByRole('button', { name: /Watchlist/i });
        expect(watchlistBtn).toBeInTheDocument();
        expect(watchlistBtn.textContent).toContain('Watchlist');
        expect(watchlistBtn.textContent).not.toContain('In Watchlist');

        // Click to add to watchlist
        await act(async () => {
            fireEvent.click(watchlistBtn);
        });

        // Button should update to "In Watchlist"
        const inWatchlistBtn = screen.getByRole('button', { name: /In Watchlist/i });
        expect(inWatchlistBtn).toBeInTheDocument();
        expect(inWatchlistBtn.textContent).toContain('In Watchlist');

        // Click again to remove
        await act(async () => {
            fireEvent.click(inWatchlistBtn);
        });

        // Button should flip back to "Watchlist"
        expect(screen.getByRole('button', { name: /Watchlist/i }).textContent).toBe('Watchlist');
    });

    it('displays the added title in TVLibrary under the Watchlist row', async () => {
        // Prepopulate guest watchlist in localStorage
        localStorage.setItem(
            'vibeo_guest_watchlist',
            JSON.stringify([mockMovie])
        );

        render(
            <MemoryRouter>
                <UserMoviesProvider>
                    <TVFocusProvider>
                        <TVLibrary />
                    </TVFocusProvider>
                </UserMoviesProvider>
            </MemoryRouter>
        );

        // Library should display the "Watchlist" header and movie title
        expect(screen.getByText('Watchlist')).toBeInTheDocument();
        expect(screen.getByText('Interstellar')).toBeInTheDocument();
        expect(screen.queryByText('Your library is empty')).not.toBeInTheDocument();
    });
});
