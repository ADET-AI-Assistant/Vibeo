/**
 * vibeyAI.js
 * ═══════════════════════════════════════════════════════════════
 * AI client for the Vibey chatbot.
 * Waterfall: Groq (Llama 3) → HuggingFace (Mistral) → error
 *
 * Accepts a full conversation history array for contextual memory.
 * Returns { text, movies[] } where movies are TMDB-enriched.
 * ═══════════════════════════════════════════════════════════════
 */

import { fetchTMDB } from './tmdbClient';

const GROQ_API_KEY = import.meta.env.GROQ_API;
const HF_API_KEY = import.meta.env.HUGGING_FACE_API;

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';

const TMDB_IMG_BASE = 'https://image.tmdb.org/t/p/w342';

// Simple session cache for AI results
const aiCache = new Map();

/**
 * Generate a semi-unique string key for conversation history
 */
const getHistoryKey = (history) => {
    return history.map(m => `${m.role}:${m.content}`).join('|');
};

/**
 * System prompt that defines Vibey's personality and output format.
 */
const SYSTEM_PROMPT = `You are Vibey, the friendly AI movie & TV recommendation assistant for Vibeo — a premium streaming app.

PERSONALITY:
- You're enthusiastic, witty, and casual — like chatting with a movie-nerd friend.
- Use short, punchy sentences. Sprinkle in the occasional emoji but don't overdo it.
- Keep responses concise (2-4 sentences of commentary max before recommendations).

RECOMMENDATION RULES:
- When the user asks for recommendations, ALWAYS include a [MOVIES] block.
- Inside the [MOVIES] block, put a JSON array of exact movie/TV titles.
- Place the [MOVIES] block at the END of your response, after your commentary.
- If the user is just chatting or asking a non-movie question, respond normally WITHOUT a [MOVIES] block.
- Remember previous context in the conversation to refine recommendations.

FORMAT EXAMPLE:
Great picks! If you loved those mind-benders, you'll definitely want to check these out 🍿

[MOVIES]["Inception", "Interstellar", "The Prestige", "Memento", "Shutter Island", "Dark City"][/MOVIES]

IMPORTANT: The [MOVIES] block must contain ONLY a valid JSON array of title strings. No extra text inside the block.`;

/**
 * Parse Vibey's response to extract text and movie titles.
 */
const parseVibeyResponse = (rawText) => {
    const movieBlockRegex = /\[MOVIES\]([\s\S]*?)\[\/MOVIES\]/;
    const match = rawText.match(movieBlockRegex);

    let text = rawText;
    let movieTitles = [];

    if (match) {
        // Remove the movie block from the displayed text
        text = rawText.replace(movieBlockRegex, '').trim();

        try {
            const cleaned = match[1].trim();
            const parsed = JSON.parse(cleaned);
            if (Array.isArray(parsed)) {
                movieTitles = parsed;
            }
        } catch (e) {
            console.warn('[Vibey] Failed to parse movie block:', match[1]);
        }
    }

    return { text, movieTitles };
};

/**
 * Enrich movie titles via TMDB search.
 * Returns array of { id, title, poster_path, vote_average, release_date, overview, media_type }
 */
const enrichWithTMDB = async (titles) => {
    const results = [];

    // Process in parallel but cap at 6 to keep it snappy
    const toSearch = titles.slice(0, 6);

    const searches = toSearch.map(async (title) => {
        try {
            const data = await fetchTMDB('/search/multi', { query: title });
            if (data?.results?.length > 0) {
                // Pick the best match (first result with a poster)
                const best = data.results.find(r => r.poster_path) || data.results[0];
                return {
                    id: best.id,
                    title: best.title || best.name,
                    poster_path: best.poster_path,
                    vote_average: best.vote_average,
                    release_date: best.release_date || best.first_air_date,
                    overview: best.overview,
                    media_type: best.media_type || 'movie',
                    posterUrl: best.poster_path ? `${TMDB_IMG_BASE}${best.poster_path}` : null,
                };
            }
        } catch (err) {
            console.warn(`[Vibey] TMDB search failed for "${title}":`, err);
        }
        return null;
    });

    const resolved = await Promise.all(searches);
    resolved.forEach(r => { if (r) results.push(r); });

    return results;
};

// ── Groq Provider ─────────────────────────────────────────────
const queryGroq = async (messages) => {
    try {
        const response = await fetch('/api/groq', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...messages,
                ],
                temperature: 0.8,
                max_tokens: 800,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.warn(`[Vibey] Groq failed (${response.status}):`, errText);
            return null;
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
    } catch (err) {
        console.warn('[Vibey] Groq error:', err.message);
        return null;
    }
};

// ── HuggingFace Provider ──────────────────────────────────────
const queryHuggingFace = async (messages) => {
    try {
        const response = await fetch('/api/huggingface', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: HF_MODEL,
                messages: [
                    { role: 'system', content: SYSTEM_PROMPT },
                    ...messages,
                ],
                temperature: 0.8,
                max_tokens: 800,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.warn(`[Vibey] HuggingFace failed (${response.status}):`, errText);
            return null;
        }

        const data = await response.json();
        return data.choices?.[0]?.message?.content || null;
    } catch (err) {
        console.warn('[Vibey] HuggingFace error:', err.message);
        return null;
    }
};

// ── Public API ────────────────────────────────────────────────

/**
 * Send a message to Vibey with full conversation context.
 * @param {Array<{role: string, content: string}>} conversationHistory
 * @returns {Promise<{text: string, movies: Array}>}
 */
export const sendVibeyMessage = async (conversationHistory) => {
    // 1. Check cache first
    const cacheKey = getHistoryKey(conversationHistory);
    if (aiCache.has(cacheKey)) {
        console.log('[Vibey] Returning cached response');
        return aiCache.get(cacheKey);
    }

    // 2. Try Groq
    let rawResponse = await queryGroq(conversationHistory);
    let provider = 'groq';

    // 3. Fallback to HuggingFace
    if (!rawResponse) {
        rawResponse = await queryHuggingFace(conversationHistory);
        provider = 'huggingface';
    }

    // 4. Both failed
    if (!rawResponse) {
        return {
            text: "Hmm, I'm having trouble connecting right now. Try again in a moment! 🔌",
            movies: [],
            provider: null,
        };
    }

    console.log(`[Vibey] Response from ${provider}`);

    // 5. Parse the response
    const { text, movieTitles } = parseVibeyResponse(rawResponse);

    // 6. Enrich with TMDB data if there are movie recommendations
    let movies = [];
    if (movieTitles.length > 0) {
        movies = await enrichWithTMDB(movieTitles);
    }

    const result = { text, movies, provider, rawResponse };

    // 7. Save to cache
    aiCache.set(cacheKey, result);

    return result;
};

/**
 * Check if any AI provider is configured for Vibey.
 */
export const hasVibeyProvider = () => {
    return true; // Proxy via Vercel removes need for client-side keys
};
