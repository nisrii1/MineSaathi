-- Add video_url column to hazard_reports table
ALTER TABLE hazard_reports
ADD COLUMN IF NOT EXISTS video_url TEXT;

-- Add comment
COMMENT ON COLUMN hazard_reports.video_url IS 'URL of uploaded video evidence for the hazard report';
