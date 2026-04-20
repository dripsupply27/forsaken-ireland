export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { text } = req.body;

  if (!text || text.trim().length === 0) {
    return res.status(200).json({ safe: true, flags: {} });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/moderations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: text })
    });

    if (!response.ok) {
      throw new Error(`OpenAI error: ${response.statusText}`);
    }

    const data = await response.json();
    const result = data.results[0];

    return res.status(200).json({
      safe: !result.flagged,
      flags: {
        sexual: result.categories.sexual,
        hateSpeech: result.categories.hate,
        violence: result.categories.violence,
        selfHarm: result.categories["self-harm"],
        harassment: result.categories.harassment,
        illegalActivity: result.categories["illegal"]
      }
    });
  } catch (err) {
    console.error("Moderation error:", err);
    return res.status(200).json({ safe: true, flags: {}, error: err.message });
  }
}
