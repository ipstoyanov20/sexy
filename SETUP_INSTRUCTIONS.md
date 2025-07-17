# Database Setup Instructions

Your Supabase connection is configured, but the `gallery_images` table needs to be created in your database.

## Step 1: Create the Database Table

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to the **SQL Editor** (in the left sidebar)
4. Create a new query and paste the following SQL:

```sql
/*
  # Create gallery table for shared images

  1. New Tables
    - `gallery_images`
      - `id` (uuid, primary key)
      - `title` (text)
      - `image_data` (text) - base64 encoded image
      - `date_taken` (date)
      - `time_taken` (text)
      - `uploaded_at` (timestamp)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `gallery_images` table
    - Add policy for anyone to read images (public gallery)
    - Add policy for anyone to insert images (public upload)
*/

CREATE TABLE IF NOT EXISTS gallery_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  image_data text NOT NULL,
  date_taken date NOT NULL,
  time_taken text,
  uploaded_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_images ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read images (public gallery)
CREATE POLICY "Anyone can view gallery images"
  ON gallery_images
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Allow anyone to insert images (public upload)
CREATE POLICY "Anyone can upload gallery images"
  ON gallery_images
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow anyone to delete images (for moderation)
CREATE POLICY "Anyone can delete gallery images"
  ON gallery_images
  FOR DELETE
  TO anon, authenticated
  USING (true);
```

5. Click **Run** to execute the SQL
6. You should see a success message confirming the table was created

## Step 2: Verify Setup

After running the SQL:

1. Go to the **Table Editor** in your Supabase dashboard
2. You should see the `gallery_images` table listed
3. The table should have the columns: `id`, `title`, `image_data`, `date_taken`, `time_taken`, `uploaded_at`, `created_at`

## Step 3: Test the Application

1. Restart your development server if it's running
2. Navigate to the Gallery section in your app
3. Try uploading an image to test the functionality

## Troubleshooting

If you still see errors after completing these steps:

1. **Check your Supabase URL and Key**: Make sure the values in `.env.local` are correct
2. **Verify the table exists**: In Supabase dashboard, go to Table Editor and confirm `gallery_images` is there
3. **Check RLS policies**: In the Authentication section, make sure Row Level Security is enabled and policies are active

Your current environment variables look correct:
- NEXT_PUBLIC_SUPABASE_URL: https://sgglshnmhqgbphivaxvy.supabase.co
- NEXT_PUBLIC_SUPABASE_ANON_KEY: [Present and appears valid]