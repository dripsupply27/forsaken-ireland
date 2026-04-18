import { useState } from "react";
import { useComments } from "../../hooks/useComments";
import { useContentModeration } from "../../hooks/useContentModeration";

export default function CommentThread({ locationId }) {
  const { comments, loading, addComment } = useComments(locationId);
  const { moderateContent } = useContentModeration();
  const [newComment, setNewComment] = useState("");
  const [displayName, setDisplayName] = useState(() => localStorage.getItem("forsaken_display_name") || "");
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    setSubmitting(true);
    try {
      const moderation = await moderateContent(newComment);
      if (!moderation.safe) {
        const flaggedItems = Object.entries(moderation.flags)
          .filter(([_, flagged]) => flagged)
          .map(([name]) => name)
          .join(", ");
        alert(`Comment flagged: ${flaggedItems}`);
        setSubmitting(false);
        return;
      }

      const author = displayName.trim() || "anonymous";
      await addComment(newComment, author);
      if (displayName.trim()) {
        localStorage.setItem("forsaken_display_name", displayName.trim());
      }
      setNewComment("");
    } catch (err) {
      alert("Failed to add comment: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      background: "#111",
      border: "1px solid #1f1f1f",
      padding: "14px",
      marginTop: 12
    }}>
      <div style={{
        fontSize: 9,
        color: "#666",
        letterSpacing: 2,
        marginBottom: 10
      }}>
        COMMENTS ({comments.length})
      </div>

      {loading ? (
        <div style={{ fontSize: 11, color: "#666" }}>Loading comments...</div>
      ) : comments.length === 0 ? (
        <div style={{ fontSize: 11, color: "#666", marginBottom: 12 }}>
          No comments yet. Be the first!
        </div>
      ) : (
        <div style={{
          maxHeight: 200,
          overflowY: "auto",
          marginBottom: 12,
          paddingBottom: 8,
          borderBottom: "1px solid #1a1a1a"
        }}>
          {comments.map(comment => (
            <div key={comment.id} style={{
              fontSize: 10,
              marginBottom: 8,
              padding: "8px",
              background: "#0a0a0a",
              borderRadius: "2px"
            }}>
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: 4
              }}>
                <div style={{ color: "#c8b89a", fontWeight: "bold" }}>
                  @{comment.user_email}
                </div>
              </div>
              <div style={{ color: "#999", lineHeight: 1.4, wordBreak: "break-word" }}>
                {comment.content}
              </div>
              <div style={{
                fontSize: 8,
                color: "#555",
                marginTop: 4
              }}>
                {new Date(comment.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <input
          type="text"
          placeholder="Your name (optional)"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          onBlur={() => {
            if (displayName.trim()) {
              localStorage.setItem("forsaken_display_name", displayName.trim());
            }
          }}
          disabled={submitting}
          style={{
            padding: "8px 10px",
            background: "#0a0a0a",
            border: "1px solid #2a2a2a",
            color: "#999",
            fontFamily: "'Space Mono', monospace",
            fontSize: 9,
            outline: "none"
          }}
        />
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="text"
            placeholder="Add a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleAddComment()}
            disabled={submitting}
            style={{
              flex: 1,
              padding: "8px 10px",
              background: "#0a0a0a",
              border: "1px solid #2a2a2a",
              color: "#e0d8c8",
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              outline: "none"
            }}
          />
          <button
            onClick={handleAddComment}
            disabled={!newComment.trim() || submitting}
            style={{
              padding: "8px 12px",
              background: "#c8b89a",
              color: "#0a0a0a",
              border: "none",
              fontSize: 10,
              fontWeight: "bold",
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: (!newComment.trim() || submitting) ? 0.5 : 1
            }}
          >
            {submitting ? "..." : "POST"}
          </button>
        </div>
      </div>
    </div>
  );
}
