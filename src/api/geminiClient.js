import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const modelLLM = import.meta.env.VITE_GEMINI_MODEL;

if (!apiKey) {
    console.warn("VITE_GEMINI_API_KEY is missing from environment variables!");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const fetchGeminiRecommendations = async (query) => {
    try {
        if (!apiKey) {
            throw new Error("Gemini API key is not configured");
        }

        // We use gemini-3-flash-preview as it's the fastest text model
        const model = genAI.getGenerativeModel({ model: modelLLM });

        const prompt = `
            You are a movie recommendation engine for a streaming app. 
            The user's search query is: "${query}"

            Based on this query, please recommend 5 to 10 movie or TV show titles that perfectly match what they are looking for.
            If the query is already an exact movie title (e.g., "Inception"), just return that title and some similar movies.
            If the query is descriptive (e.g., "funny movies from the 90s"), return the best matches.

            CRITICAL INSTRUCTION: You MUST return ONLY a valid JSON array of strings containing the titles. Do not include markdown formatting, backticks, or any other explanations. 
            Just the raw JSON array.

            Example response format:
            ["Title 1", "Title 2", "Title 3"]
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Try to parse the response as JSON. We remove common markdown code block syntaxes just in case.
        const cleanedText = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();

        try {
            const titles = JSON.parse(cleanedText);
            if (Array.isArray(titles)) {
                return titles;
            }
            throw new Error("Gemini did not return an array");
        } catch (parseError) {
            console.error("Failed to parse Gemini response:", cleanedText);
            throw new Error("Invalid format received from AI");
        }

    } catch (error) {
        console.error("Gemini API Error:", error);
        return []; // Return an empty array on failure so it doesn't break the app
    }
};
