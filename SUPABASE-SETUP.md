# Supabase Setup Guide for PresX

This guide will help you set up Supabase Storage for voice recordings in your PresX application.

## Prerequisites

1. Create a Supabase account at [https://supabase.com](https://supabase.com)
2. Create a new project in Supabase

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to **Settings** > **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://your-project-id.supabase.co`)
   - **Anon Public Key** (starts with `eyJ...`)

## Step 2: Configure Environment Variables

1. Create a `.env.local` file in your project root (if it doesn't exist)
2. Add your Supabase credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key_here
```

## Step 3: Create Storage Bucket

1. In your Supabase dashboard, go to **Storage**
2. Click **Create a new bucket**
3. Set the bucket name to `recordings`
4. Choose **Public bucket** if you want direct access to recordings, or **Private bucket** for secure access
5. Click **Create bucket**

### Bucket Policies (Important!)

If you created a **public bucket**, you can skip this step. For **private buckets**, set up the following policies:

1. Go to **Storage** > **Policies**
2. Create a new policy for the `recordings` bucket:

**For Upload (INSERT):**
```sql
-- Allow authenticated users to upload recordings
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'recordings' AND 
  auth.role() = 'authenticated'
);
```

**For Read (SELECT):**
```sql
-- Allow public read access (adjust as needed)
CREATE POLICY "Allow public reads" ON storage.objects
FOR SELECT USING (bucket_id = 'recordings');
```

**For Delete:**
```sql
-- Allow authenticated users to delete their recordings
CREATE POLICY "Allow authenticated deletes" ON storage.objects
FOR DELETE USING (
  bucket_id = 'recordings' AND 
  auth.role() = 'authenticated'
);
```

## Step 4: Test the Setup

1. Start your Next.js development server:
   ```bash
   npm run dev
   ```

2. Go to the prescription creation page (`/create`)
3. Try recording a conversation and submitting the form
4. Check your Supabase Storage dashboard to see if the audio file was uploaded

## Troubleshooting

### Error: "Supabase is not configured"
- Make sure your environment variables are correctly set
- Restart your development server after adding environment variables

### Error: "New row violates row-level security policy"
- Check your bucket policies in Supabase Storage
- Ensure the bucket is either public or has appropriate policies

### Error: "The resource was not found"
- Make sure the `recordings` bucket exists in your Supabase project
- Check the bucket name matches exactly (case-sensitive)

### Audio Upload Fails
- Check browser console for detailed error messages
- Verify your Supabase URL and API key are correct
- Ensure your bucket policies allow uploads

## Migration from Firebase Storage

If you were previously using Firebase Storage, the migration is automatic. The application now:

1. Uses Supabase Storage for all new audio recordings
2. Maintains the same interface and functionality
3. Stores audio URLs in Firestore (Firebase remains the main database)

## Security Considerations

1. **Public vs Private Buckets**: Choose based on your privacy requirements
2. **File Size Limits**: Configure appropriate limits in Supabase
3. **Access Policies**: Implement proper RLS policies for production
4. **URL Expiration**: For private buckets, signed URLs expire after 1 hour by default

## Cost Benefits

Supabase Storage offers:
- More generous free tier compared to Firebase Storage
- Competitive pricing for paid usage
- Better integration with open-source stack

## Support

For issues related to:
- **Supabase Setup**: Check [Supabase Documentation](https://supabase.com/docs)
- **PresX Integration**: Refer to the application logs and error messages
- **Audio Recording**: Ensure microphone permissions are granted in the browser
