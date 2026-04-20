import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export function useComments(locationId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!locationId) return;
    fetchComments();
    const unsub = subscribeToComments();
    return unsub;
  }, [locationId]);

  async function fetchComments() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("comments")
        .select("*")
        .eq("location_id", locationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setComments(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching comments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function subscribeToComments() {
    const subscription = supabase
      .channel(`comments-${locationId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "comments", filter: `location_id=eq.${locationId}` },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setComments(prev => [...prev, payload.new]);
          } else if (payload.eventType === "DELETE") {
            setComments(prev => prev.filter(c => c.id !== payload.old.id));
          } else if (payload.eventType === "UPDATE") {
            setComments(prev => prev.map(c => c.id === payload.new.id ? payload.new : c));
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(subscription); };
  }

  async function addComment(content, userEmail) {
    try {
      const { data, error } = await supabase
        .from("comments")
        .insert([{ location_id: locationId, user_email: userEmail, content }])
        .select();
      if (error) throw error;
      return data[0];
    } catch (err) {
      console.error("Error adding comment:", err);
      throw err;
    }
  }

  async function deleteComment(commentId) {
    try {
      const { error } = await supabase.from("comments").delete().eq("id", commentId);
      if (error) throw error;
    } catch (err) {
      console.error("Error deleting comment:", err);
      throw err;
    }
  }

  return { comments, loading, error, addComment, deleteComment };
}
