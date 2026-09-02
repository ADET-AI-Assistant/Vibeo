import React, { useEffect, useRef } from 'react';
import TVMovieCard from './TVMovieCard';
import { useTVFocus } from '../context/TVFocusContext';

export const TVMovieRow = ({
    id,
    title,
    movies = [],
    orderIndex = 1,
    onCardFocus,
    onCardClick,
    loading = false,
}) => {
    const { setZoneConfig } = useTVFocus();
    const zoneId = `row-${id}`;
    const trackRef = useRef(null);

    useEffect(() => {
        setZoneConfig(zoneId, {
            type: 'horizontal',
            orderIndex,
        });
    }, [zoneId, orderIndex, setZoneConfig]);

    if (!loading && (!movies || movies.length === 0)) {
        return null;
    }

    return (
        <section className="tv-row" aria-label={title} id={id}>
            <div className="tv-row__header">
                <h2 className="tv-row__title">
                    {title}
                </h2>
            </div>

            <div className="tv-row__track" ref={trackRef}>
                {loading
                    ? Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={`skeleton-${i}`}
                            className="tv-card"
                            style={{
                                background: 'linear-gradient(90deg, #141424 0%, #1e1e34 50%, #141424 100%)',
                                animation: 'pulse 1.5s infinite ease-in-out',
                            }}
                        />
                    ))
                    : movies.map(movie => (
                        <TVMovieCard
                            key={movie.id}
                            movie={movie}
                            zone={zoneId}
                            onFocus={onCardFocus}
                            onClick={onCardClick}
                        />
                    ))}
            </div>
        </section>
    );
};

export default TVMovieRow;
