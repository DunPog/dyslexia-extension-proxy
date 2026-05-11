import { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(request: VercelRequest, response: VercelResponse) {
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (request.method === 'OPTIONS') {
        return response.status(200).end();
    }

    const apiKey = process.env.GEMINI_API_KEY

    if (!apiKey) {
        return response.status(500).json({ error: 'API key not found.' })
    }

    try {
        const aiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': apiKey
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: JSON.stringify(request.body)
                                }
                            ]
                        }
                    ]
                })
            }
        )

        const json = await aiResponse.json()

        const responseText = json.candidates?.[0]?.content?.parts?.[0]?.text

        return response.status(aiResponse.status).json(responseText)
    } catch (error) {
        return response.status(500).json({ error: 'Failed to obtain API key.' })
    }
}