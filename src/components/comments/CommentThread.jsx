import { useState } from "react";
import { useComments } from "../../hooks/useComments";
import { useContentModeration } from "../../hooks/useContentModeration";

export default function CommentThread({ locationId, user }) {
  const { comments, loading, addComment, deleteComment } = useComments(locationId);
  const { moderateContent } = useContentModeration();
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    if (!user) {
      alert("Please sign in to comment");
      return;
    }

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

      await addComment(newComment, user.email);
      setNewComment("");
    } catch (err) {
      alert("Failed to add comment: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm("Delete this comment?")) return;
    try {
      await deleteComment(commentId);
    } catch (err) {
      alert("Failed to delete comment: " + err.message);
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
                  @{comment.user_email.split("@")[0]}
                </div>
                {user?.email === comment.user_email && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#666",
                      cursor: "pointer",
                      fontSize: 10
                    }}
                  >
                    ✕
                  </button>
                )}
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

      {user ? (
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
      ) : (
        <div style={{
          fontSize: 10,
          color: "#666",
          textAlign: "center",
          padding: "8px",
          background: "#0a0a0a"
        }}>
          Sign in to comment
        </div>
      )}
    </div>
  );
}
