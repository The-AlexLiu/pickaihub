-- Add new columns for enhanced tool details
ALTER TABLE tools 
ADD COLUMN IF NOT EXISTS screenshots TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS price_detail TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;
