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