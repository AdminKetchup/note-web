
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { messages, prompt, model } = await req.json();
        // API key from server environment only (secure)
        const apiKey = process.env.OPENROUTER_API_KEY;

        if (!apiKey) {
            return NextResponse.json(
                { error: 'OpenRouter API Key not configured on server. Please add OPENROUTER_API_KEY to .env.local' },
                { status: 500 }
            );
        }

        // Construct payload
        // If 'messages' is provided (new way), use it.
        // If only 'prompt' is provided (legacy slash command), construct messages.
        let payloadMessages = messages;
        if (!payloadMessages && prompt) {
            payloadMessages = [
                { "role": "system", "content": "You are a helpful writing assistant. Continue the text or answer the user's prompt directly and concisely." },
                { "role": "user", "content": prompt }
            ];
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "https://note.myarchive.cc", // Optional but good practice
                "X-Title": "MyArchive Note"
            },
            body: JSON.stringify({
                "model": model || "openai/gpt-3.5-turbo",
                "messages": payloadMessages,
                "reasoning": { "max_tokens": 2048 }
            })
        });

        const data = await response.json();
        if (data.error) {
            throw new Error(data.error.message || 'OpenRouter Error');
        }

        const choice = data.choices?.[0]?.message;
        const content = choice?.content || "";
        const reasoning = choice?.reasoning || ""; // OpenRouter standard field

        return NextResponse.json({ content, reasoning });

    } catch (error: any) {
        console.error("AI API Error:", error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
