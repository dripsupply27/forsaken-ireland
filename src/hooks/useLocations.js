import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

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
        .order("date", { ascending: false });

      if (error) throw error;
      setLocations(data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching locations:", err);
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
      console.error("Error adding location:", err);
      throw err;
    }
  }

  async function updateLikes(locationId, newLikeCount) {
    try {
      const { error } = await supabase
        .from("locations")
        .update({ likes: newLikeCount })
        .eq("id", locationId);

      if (error) throw error;
      setLocations(prev => prev.map(l => l.id === locationId ? { ...l, likes: newLikeCount } : l));
    } catch (err) {
      console.error("Error updating likes:", err);
      throw err;
    }
  }

  return { locations, loading, error, addLocation, updateLikes, fetchLocations };
}
