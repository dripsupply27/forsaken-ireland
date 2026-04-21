import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

const log = (...args) => { if (import.meta.env.DEV) console.error(...args); };

export function useLocations() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  async function fetchLocations() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .order("date", { ascending: false })
        .limit(200);
      if (error) throw error;
      // Fix #12: stable array ref — only update if IDs changed
      setLocations(prev => {
        const next = data || [];
        if (
          prev.length === next.length &&
          prev.every((l, i) => l.id === next[i].id)
        ) return prev;
        return next;
      });
      setError(null);
    } catch (err) {
      log("Error fetching locations:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function addLocation(locationData) {
    try {
      const { data, error } = await supabase
        .from("locations")
        .insert([locationData])
        .select();
      if (error) throw error;
      setLocations(prev => [data[0], ...prev]);
      return data[0];
    } catch (err) {
      log("Error adding location:", err);
      throw err;
    }
  }

  async function updateLikes(locationId) {
    try {
      // Fix #10: atomic increment via RPC — no race condition
      const { error } = await supabase.rpc("increment_likes", { loc_id: locationId });
      if (error) throw error;
      setLocations(prev =>
        prev.map(l => l.id === locationId ? { ...l, likes: l.likes + 1 } : l)
      );
    } catch (err) {
      log("Error updating likes:", err);
      throw err;
    }
  }

  return { locations, loading, error, addLocation, updateLikes, fetchLocations };
}
