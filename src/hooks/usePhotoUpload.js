import { supabase } from "../lib/supabase";

export function usePhotoUpload() {
  async function uploadPhoto(file, locationId, userId) {
    if (!file) return null;

    const timestamp = Date.now();
    const fileName = `${locationId}_${userId}_${timestamp}.jpg`;
    const filePath = `locations/${fileName}`;

    try {
      // Upload file
      const { error: uploadError } = await supabase.storage
        .from("location-photos")
        .upload(filePath, file, { upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("location-photos")
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (err) {
      console.error("Photo upload error:", err);
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
      console.error("Photo deletion error:", err);
      throw err;
    }
  }

  return { uploadPhoto, deletePhoto };
}
