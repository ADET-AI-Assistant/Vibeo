/**
 * moodData.js
 * ─────────────────────────────────────────────────────────────
 * Simulates the output of a "Mood-Matching" Content-Based
 * Filtering (CBF) algorithm.
 *
 * In a real system this array would be returned by a Python/ML
 * micro-service that analyses user watch-history vectors and
 * computes cosine-similarity scores against a movie embedding
 * matrix.  Here we mock that response so the frontend can
 * demonstrate the full rendering pipeline without a live model.
 *
 * Each object mirrors the shape of a TMDB movie result so that
 * the same <MovieCard> component can render both data sources.
 * ─────────────────────────────────────────────────────────────
 */

export const MOOD_MOVIES = [
    {
        id: 550,          // Fight Club  (real TMDB id → links to real watch page)
        title: "Fight Club",
        poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
        release_date: "1999-10-15",
        vote_average: 8.4,
        matchPercentage: 97,
        moodTags: ["Dark", "Psychological", "Thriller"],
        cbfNote: "High vector similarity on themes: masculinity, identity, anti-consumerism.",
    },
    {
        id: 13,           // Forrest Gump
        title: "Forrest Gump",
        poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg",
        release_date: "1994-07-06",
        vote_average: 8.5,
        matchPercentage: 94,
        moodTags: ["Feel-Good", "Drama", "Epic"],
        cbfNote: "Matches watch-history cluster: heartwarming life-journey narratives.",
    },
    {
        id: 157336,       // Interstellar
        title: "Interstellar",
        poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIe.jpg",
        release_date: "2014-11-05",
        vote_average: 8.4,
        matchPercentage: 91,
        moodTags: ["Sci-Fi", "Emotional", "Epic"],
        cbfNote: "Strong overlap in space-exploration & father-child bond feature vectors.",
    },
    {
        id: 680,          // Pulp Fiction
        title: "Pulp Fiction",
        poster_path: "/fIE3lAGcZDV1G6XM5KmuWnNsPp1.jpg",
        release_date: "1994-09-10",
        vote_average: 8.5,
        matchPercentage: 89,
        moodTags: ["Crime", "Quirky", "Intense"],
        cbfNote: "Non-linear narrative preference detected in history embedding.",
    },
    {
        id: 278,          // The Shawshank Redemption
        title: "The Shawshank Redemption",
        poster_path: "/lyQBXzOQSuE59IsHyhrp0qIiPAz.jpg",
        release_date: "1994-09-23",
        vote_average: 8.7,
        matchPercentage: 88,
        moodTags: ["Drama", "Hopeful", "Classic"],
        cbfNote: "Top-ranked drama by collaborative filter peers with similar taste profile.",
    },
    {
        id: 238,          // The Godfather
        title: "The Godfather",
        poster_path: "/3bhkrj58Vtu7enYsLlA0A5ikOEL.jpg",
        release_date: "1972-03-14",
        vote_average: 8.7,
        matchPercentage: 86,
        moodTags: ["Crime", "Epic", "Classic"],
        cbfNote: "Power-dynamics & family loyalty themes align with your genre vector.",
    },
    {
        id: 424,          // Schindler's List
        title: "Schindler's List",
        poster_path: "/sF1U4EUQS8YHUYjNl3pMGNIQyr0.jpg",
        release_date: "1993-12-15",
        vote_average: 8.6,
        matchPercentage: 83,
        moodTags: ["Historical", "Emotional", "Powerful"],
        cbfNote: "High TF-IDF similarity on historical drama + moral-courage keywords.",
    },
    {
        id: 496243,       // Parasite
        title: "Parasite",
        poster_path: "/7IiTTgloROVKNCQ4BJczEBnvLhm.jpg",
        release_date: "2019-05-30",
        vote_average: 8.5,
        matchPercentage: 81,
        moodTags: ["Thriller", "Dark Comedy", "Social"],
        cbfNote: "Class-struggle & genre-bending features match your novelty preference.",
    },
];
