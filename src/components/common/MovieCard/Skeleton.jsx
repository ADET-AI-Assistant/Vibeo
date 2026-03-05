import React from 'react';
import './styles.css';

const MovieCardSkeleton = () => {
    return (
        <div className="mc mc--skeleton">
            <div className="mc__poster-wrap">
                <div className="mc__skeleton-shimmer" />
            </div>
            <div className="mc__info">
                <div className="mc__skeleton-line mc__skeleton-title" />
                <div className="mc__skeleton-line mc__skeleton-year" />
            </div>
        </div>
    );
};

export default MovieCardSkeleton;
