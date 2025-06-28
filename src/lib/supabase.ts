// Supabase configuration for PresX
import { createClient } from '@supabase/supabase-js';

// These should be set in your environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder_key';

// Create client with fallback values (will show warnings but won't crash build)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Utility function to ensure the recordings bucket exists
async function ensureBucketExists() {
  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing buckets:', listError);
      return false;
    }

    const recordingsBucket = buckets?.find(bucket => bucket.name === 'voice');
    
    if (!recordingsBucket) {
      console.log('Creating recordings bucket...');
      
      // Create the bucket
      const { data, error } = await supabase.storage.createBucket('voice', {
        public: true, // Make it public so we can get public URLs
        fileSizeLimit: 50 * 1024 * 1024, // 50MB limit
        allowedMimeTypes: ['audio/*']
      });

      console.log('Create bucket response data:', data);

      if (error) {
        console.error('Error creating bucket:', error);
        return false;
      }

      console.log('Recordings bucket created successfully');
      return true;
    }

    return true;
  } catch (error) {
    console.error('Error ensuring bucket exists:', error);
    return false;
  }
}

// Audio/Storage service using Supabase Storage
export const supabaseAudioService = {
  // Upload audio recording to Supabase Storage
  async uploadRecording(audioBlob: Blob, fileName: string): Promise<{
    audioUrl: string;
    fileName: string;
    fileSize: number;
  }> {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Key exists:', !!supabaseKey);
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.');
    }

    // Ensure the recordings bucket exists
    const bucketExists = await ensureBucketExists();
    if (!bucketExists) {
      throw new Error('Failed to ensure recordings bucket exists');
    }

    try {
      console.log('Attempting to upload to Supabase Storage...');
      console.log('File name:', fileName);
      console.log('File size:', audioBlob.size);
      console.log('File type:', audioBlob.type);

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('voice') // bucket name
        .upload(fileName, audioBlob, {
          contentType: audioBlob.type || 'audio/webm',
          upsert: false // don't overwrite existing files
        });

      console.log('Upload response data:', data);
      console.log('Upload response error:', error);

      if (error) {
        console.error('Supabase upload error:', error);
        
        // Check if it's a bucket not found error
        if (error.message && error.message.includes('not found')) {
          throw new Error('The "recordings" bucket does not exist in Supabase Storage. Please create it in your Supabase dashboard.');
        }
        
        throw new Error(`Failed to upload recording: ${error.message || JSON.stringify(error)}`);
      }

      if (!data || !data.path) {
        throw new Error('Upload succeeded but no file path was returned');
      }

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('recordings')
        .getPublicUrl(data.path);

      console.log('Public URL data:', urlData);

      if (!urlData || !urlData.publicUrl) {
        throw new Error('Failed to get public URL for uploaded file');
      }

      return {
        audioUrl: urlData.publicUrl,
        fileName,
        fileSize: audioBlob.size,
      };
    } catch (error) {
      console.error('Error uploading audio to Supabase:', error);
      throw error; // Re-throw the original error with full context
    }
  },

  // Delete audio recording from Supabase Storage
  async deleteRecording(fileName: string): Promise<void> {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.');
    }

    try {
      const { error } = await supabase.storage
        .from('recordings')
        .remove([fileName]);

      if (error) {
        console.error('Supabase delete error:', error);
        throw new Error(`Failed to delete recording: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting audio from Supabase:', error);
      throw new Error('Failed to delete recording');
    }
  },

  // Get signed URL for private access (if bucket is private)
  async getSignedUrl(fileName: string, expiresIn: number = 3600): Promise<string> {
    // Check if Supabase is properly configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      throw new Error('Supabase is not configured. Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your environment variables.');
    }

    try {
      const { data, error } = await supabase.storage
        .from('recordings')
        .createSignedUrl(fileName, expiresIn);

      if (error) {
        console.error('Supabase signed URL error:', error);
        throw new Error(`Failed to get signed URL: ${error.message}`);
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error getting signed URL from Supabase:', error);
      throw new Error('Failed to get signed URL');
    }
  },
};
