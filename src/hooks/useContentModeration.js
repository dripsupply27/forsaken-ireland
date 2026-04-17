const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_MODERATION_URL = "https://api.openai.com/v1/moderations";

export function useContentModeration() {
  async function moderateContent(text) {
    if (!text || text.trim().length === 0) {
      return { safe: true, flags: {} };
    }

    try {
      const response = await fetch(OPENAI_MODERATION_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ input: text })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const result = data.results[0];

      return {
        safe: !result.flagged,
        score: result.category_scores,
        flags: {
          sexual: result.categories.sexual,
          hateSpeech: result.categories.hate,
          violence: result.categories.violence,
          selfHarm: result.categories["self-harm"],
          harassment: result.categories.harassment,
          illegalActivity: result.categories["illegal"]
        }
      };
    } catch (err) {
      console.error("Content moderation error:", err);
      return { safe: true, flags: {}, error: err.message };
    }
  }

  async function moderateLocation(description, access) {
    const combined = `${description} ${access}`;
    return moderateContent(combined);
  }

  return { moderateContent, moderateLocation };
}
