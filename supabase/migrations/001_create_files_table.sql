-- Create the files table for storing file metadata
CREATE TABLE IF NOT EXISTS files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  size BIGINT NOT NULL,
  type TEXT NOT NULL,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE files ENABLE ROW LEVEL SECURITY;

-- Users can only see their own files
CREATE POLICY "Users can view their own files"
  ON files FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own files
CREATE POLICY "Users can insert their own files"
  ON files FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own files
CREATE POLICY "Users can delete their own files"
  ON files FOR DELETE
  USING (auth.uid() = user_id);

-- Create storage bucket for vault files
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault-files', 'vault-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload to vault-files
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'vault-files' AND auth.role() = 'authenticated');

-- Allow users to read their own files
CREATE POLICY "Users can read their own files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'vault-files' AND auth.role() = 'authenticated');

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'vault-files' AND auth.role() = 'authenticated');
