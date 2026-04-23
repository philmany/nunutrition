export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const apiKey = process.env.GOOGLE_AI_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GOOGLE_AI_KEY not configured on server.' });
  }

  try {
    const googleRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 1000 }
        })
      }
    );

    const data = await googleRes.json();

    // Forward Google's status code if it's an error
    if (!googleRes.ok) {
      return res.status(googleRes.status).json(data);
    }

    return res.status(200).json(data);

  } catch (err) {
    return res.status(503).json({ error: 'Failed to reach Google AI service.' });
  }
}
