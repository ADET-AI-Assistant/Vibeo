export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const HF_API_KEY = process.env.HUGGING_FACE_API;

    if (!HF_API_KEY) {
        return res.status(500).json({ error: 'HUGGING_FACE_API key is not configured on backend' });
    }

    try {
        const { model, messages, temperature, max_tokens } = req.body;
        const response = await fetch(`https://api-inference.huggingface.co/models/${model}/v1/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${HF_API_KEY}`,
            },
            body: JSON.stringify({ model, messages, temperature, max_tokens }),
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
