import { supabase } from "../lib/supabase";

const log = (...args) => { if (import.meta.env.DEV) console.error(...args); };

export function usePhotoUpload() {
  async function uploadPhoto(file, locationId, userId) {
    if (!file) return null;
    const timestamp = Date.now();
    const fileName = `${locationId}_${userId}_${timestamp}.jpg`;
    const filePath = `locations/${fileName}`;
    try {
      const { error: uploadError } = await supabase.storage
        .from("location-photos")
        .upload(filePath, file, { upsert: false });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage
        .from("location-photos")
        .getPublicUrl(filePath);
      return data.publicUrl;
    } catch (err) {
      log("Photo upload error:", err);
      throw err;
    }
  }

  async function deletePhoto(photoPath) {
    if (!photoPath) return;
    try {
      const fileName = photoPath.split("/").pop();
      const { error } = await supabase.storage
        .from("location-photos")
        .remove([`locations/${fileName}`]);
      if (error) throw error;
    } catch (err) {
      log("Photo deletion error:", err);
      throw err;
    }
  }

  return { uploadPhoto, deletePhoto };
}
