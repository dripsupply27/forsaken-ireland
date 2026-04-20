export function useContentModeration() {
  async function moderateContent(text) {
    if (!text || text.trim().length === 0) {
      return { safe: true, flags: {} };
    }
    try {
      const response = await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text })
      });
      if (!response.ok) {
        return { safe: false, flags: {}, error: "Moderation service unavailable. Please try again shortly." };
      }
      return await response.json();
    } catch (err) {
      console.error("Content moderation error:", err);
      return { safe: false, flags: {}, error: "Moderation service unavailable. Please try again shortly." };
    }
  }

  async function moderateLocation(description, access) {
    return moderateContent(`${description} ${access}`);
  }

  return { moderateContent, moderateLocation };
}
