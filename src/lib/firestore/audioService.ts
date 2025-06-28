// lib/firestore/audioService.ts
import { createClient } from '@supabase/supabase-js';

// Ensure these environment variables are set up in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided as environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const audioService = {
  /**
   * Uploads an audio blob to Supabase Storage.
   * @param audioBlob The Blob object containing the audio data.
   * @param fileName The desired file name in Supabase Storage.
   * @returns An object containing the audioUrl, fileName, and fileSize.
   */
  uploadRecording: async (audioBlob: Blob, fileName: string) => {
    try {
      // --- IMPORTANT: REPLACE 'your_bucket_name' with your actual Supabase Storage bucket name ---
      const bucketName = 'your_bucket_name'; 

      const { data, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(fileName, audioBlob, {
          cacheControl: '3600', // Cache for 1 hour
          upsert: false, // Do not overwrite if file exists
          contentType: 'audio/webm', // Ensure correct content type
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw uploadError; // Re-throw to be caught by the calling function
      }

      // If upload is successful, get the public URL
      const { data: publicUrlData } = supabase.storage
        .from(bucketName)
        .getPublicUrl(fileName);

      if (publicUrlData && publicUrlData.publicUrl) {
        return {
          audioUrl: publicUrlData.publicUrl,
          fileName: fileName,
          fileSize: audioBlob.size,
        };
      } else {
        throw new Error('Failed to retrieve public URL after successful upload.');
      }

    } catch (error) {
      console.error('Error in audioService.uploadRecording:', error);
      throw error; // Propagate the error
    }
  },
  // You can add other audio-related functions here if needed
};