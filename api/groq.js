const rateLimitMap = new Map();
const MAX_CACHE_SIZE = 1000;
const WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS = 20;

export default async function handler(req, res) {
    // Basic rate limiting
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'anonymous';
    const now = Date.now();
    const limitData = rateLimitMap.get(ip);

    if (!limitData) {
        // Manage map size to prevent memory leaks
        if (rateLimitMap.size >= MAX_CACHE_SIZE) {
            const oldestKey = rateLimitMap.keys().next().value;
            rateLimitMap.delete(oldestKey);
        }
        rateLimitMap.set(ip, { count: 1, lastReset: now });
    } else {
        if (now - limitData.lastReset > WINDOW_MS) {
            limitData.count = 1;
            limitData.lastReset = now;
        } else {
            limitData.count++;
        }

        if (limitData.count > MAX_REQUESTS) {
            return res.status(429).json({ error: 'Too many requests. Please slow down!' });
        }
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const GROQ_API_KEY = process.env.GROQ_API;

    if (!GROQ_API_KEY) {
        return res.status(500).json({ error: 'GROQ_API key is not configured on backend' });
    }

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify(req.body),
        });

        if (!response.ok) {
            const errText = await response.text();
            return res.status(response.status).json({ error: errText });
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
