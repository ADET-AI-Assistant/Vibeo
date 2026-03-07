/**
 * smartSearchAI.js
 * ═══════════════════════════════════════════════════════════════
 * Hybrid AI client for Smart Search.
 * Waterfall: Groq (Llama 3) → HuggingFace (Mistral) → null
 * Returns an array of movie title strings, or null if all fail.
 * ═══════════════════════════════════════════════════════════════
 */

import { collection, query as firestoreQuery, where, getDocs, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { normalizeSearchQuery } from "./geminiClient";

// Fetch keys directly when running local Vite dev server
const LOCAL_GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.GROQ_API;
const LOCAL_HF_API_KEY = import.meta.env.VITE_HF_API_KEY || import.meta.env.HUGGING_FACE_API;

const GROQ_MODEL = 'llama-3.3-70b-versatile';
const HF_MODEL = 'mistralai/Mistral-7B-Instruct-v0.3';

/**
 * Shared prompt that instructs the model to return movie titles as JSON.
 */
const buildPrompt = (query) => `You are a movie recommendation engine. The user's search query is: "${query}"

Based on this query, recommend 8 to 12 movie or TV show titles that best match what they are looking for.
- If the query is an exact title (e.g., "Inception"), return that title and similar movies.
- If the query is descriptive (e.g., "funny movies from the 90s"), return the best matching titles.
- If the query describes a plot or scene (e.g., "movie about a man stuck on Mars"), identify the movie and return similar ones.

CRITICAL: Return ONLY a valid JSON array of title strings. No markdown, no backticks, no explanations.
Example: ["The Martian", "Interstellar", "Gravity", "Apollo 13"]`;

/**
 * Normalize AI response text into a JSON array of titles.
 */
const parseAIResponse = (text) => {
    // Strip markdown code blocks and whitespace
    let cleaned = text
        .replace(/```json/gi, '')
        .replace(/```/g, '')
        .trim();

    // Try to extract JSON array if there's surrounding text
    const arrayMatch = cleaned.match(/\[[\s\S]*\]/);
    if (arrayMatch) {
        cleaned = arrayMatch[0];
    }

    try {
        const parsed = JSON.parse(cleaned);
        if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'string') {
            return parsed;
        }
    } catch (e) {
        console.warn('[SmartSearch AI] Failed to parse response:', cleaned);
    }

    return null;
};

// ── Session Cache ─────────────────────────────────────────────
const getCache = (normalizedQuery) => {
    const key = `smart_ai_${normalizedQuery}`;
    const cached = sessionStorage.getItem(key);
    if (cached) {
        try {
            return JSON.parse(cached);
        } catch { return null; }
    }
    return null;
};

const setCache = (normalizedQuery, data) => {
    const key = `smart_ai_${normalizedQuery}`;
    sessionStorage.setItem(key, JSON.stringify(data));
};

// ── Groq Provider ─────────────────────────────────────────────
const queryGroq = async (query) => {
    try {
        // If we are running Vite locally, skip the Vercel proxy and call Groq directly
        const isLocalDev = import.meta.env.DEV;
        const endpoint = isLocalDev ? 'https://api.groq.com/openai/v1/chat/completions' : '/api/groq';
        const headers = { 'Content-Type': 'application/json' };

        if (isLocalDev) {
            if (!LOCAL_GROQ_API_KEY) {
                console.warn('[SmartSearch] Local Groq API key not configured, skipping.');
                return null;
            }
            headers['Authorization'] = `Bearer ${LOCAL_GROQ_API_KEY}`;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: GROQ_MODEL,
                messages: [
                    { role: 'user', content: buildPrompt(query) }
                ],
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.warn(`[SmartSearch] Groq failed (${response.status}):`, errText);
            return null;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) return null;

        return parseAIResponse(content);
    } catch (err) {
        console.warn('[SmartSearch] Groq error:', err.message);
        return null;
    }
};

// ── HuggingFace Provider ──────────────────────────────────────
const queryHuggingFace = async (query) => {
    try {
        // If we are running Vite locally, skip the Vercel proxy and call HF directly
        const isLocalDev = import.meta.env.DEV;
        const endpoint = isLocalDev ? `https://api-inference.huggingface.co/models/${HF_MODEL}/v1/chat/completions` : '/api/huggingface';
        const headers = { 'Content-Type': 'application/json' };

        if (isLocalDev) {
            if (!LOCAL_HF_API_KEY) {
                console.warn('[SmartSearch] Local HuggingFace API key not configured, skipping.');
                return null;
            }
            headers['Authorization'] = `Bearer ${LOCAL_HF_API_KEY}`;
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                model: HF_MODEL,
                messages: [
                    { role: 'user', content: buildPrompt(query) }
                ],
                temperature: 0.7,
                max_tokens: 500,
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.warn(`[SmartSearch] HuggingFace failed (${response.status}):`, errText);
            return null;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (!content) return null;

        return parseAIResponse(content);
    } catch (err) {
        console.warn('[SmartSearch] HuggingFace error:', err.message);
        return null;
    }
};

// ── Public API ────────────────────────────────────────────────

/**
 * Query AI providers in waterfall order.
 * Returns { titles: string[], provider: 'groq'|'huggingface'|null }
 */
export const querySmartSearchAI = async (query) => {
    const normalizedQuery = normalizeSearchQuery(query);

    // Helper to print a clean table in the console for developers
    const logAction = (source, meaning) => {
        const rowLabel = query ? `"${query}"` : "Empty Query";
        console.table({
            [rowLabel]: {
                "Database Lookup Match": normalizedQuery,
                "Data Source": source,
                "Explanation": meaning
            }
        });
    };

    // 1. Check Session Cache
    const cached = getCache(normalizedQuery);
    if (cached) {
        logAction(`Session Cache (${cached.provider})`, "Fastest: Instant load from browser memory. 0 API/DB usage.");
        return cached;
    }

    // 2. Check Firestore Global Cache
    try {
        const cacheRef = collection(db, "smart_search_cache");
        const q = firestoreQuery(cacheRef, where("searchQuery", "==", normalizedQuery));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            logAction("Firestore Database", "Saved API limit: Loaded shared result from DB because another user searched this.");
            const firestoreData = querySnapshot.docs[0].data();
            const result = { titles: firestoreData.results, provider: firestoreData.provider || 'firestore_cache' };

            // Save to session cache for quicker subsequent access
            setCache(normalizedQuery, result);
            return result;
        }
    } catch (dbError) {
        console.error("[SmartSearch AI] Error checking Firestore cache:", dbError);
    }

    // 3. Try Groq
    let result = null;
    const groqTitles = await queryGroq(query);

    if (groqTitles) {
        result = { titles: groqTitles, provider: 'groq' };
    } else {
        // 4. Try HuggingFace
        const hfTitles = await queryHuggingFace(query);
        if (hfTitles) {
            result = { titles: hfTitles, provider: 'huggingface' };
        }
    }

    if (result) {
        const providerName = result.provider === 'groq' ? "Groq (Llama 3)" : "HuggingFace (Mistral)";
        logAction(`${providerName} API`, `Cost API limit: Generated ${result.titles.length} completely new title recommendations.`);

        // Save to Session Storage
        setCache(normalizedQuery, result);

        // Save to Firestore Cache
        try {
            const cacheRef = collection(db, "smart_search_cache");
            const q = firestoreQuery(cacheRef, where("searchQuery", "==", normalizedQuery));
            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                await addDoc(cacheRef, {
                    searchQuery: normalizedQuery,
                    results: result.titles,
                    provider: result.provider,
                    timestamp: new Date()
                });
                console.log(`[SmartSearch AI] Wrote "${query}" to Firestore Global Cache so future users don't need to ask AI.`);
            } else {
                console.log(`[SmartSearch AI] Skipping Firestore write. Another process just saved it.`);
            }
        } catch (dbError) {
            console.error("[SmartSearch AI] Error saving to Firestore cache:", dbError);
        }

        return result;
    }

    // 5. Both failed
    logAction("Failed", "Both AI APIs failed or are not configured. Falling back to simple keyword parser.");
    return { titles: null, provider: null };
};

/**
 * Check if any AI provider is configured.
 */
export const hasAIProvider = () => {
    if (import.meta.env.DEV) {
        return !!(LOCAL_GROQ_API_KEY || LOCAL_HF_API_KEY);
    }
    return true; // Proxy via Vercel removes need for client-side keys check
};
