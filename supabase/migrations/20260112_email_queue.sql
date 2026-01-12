-- Create email_queue table for storing pending emails to be sent
CREATE TABLE public.email_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  data JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  type TEXT NOT NULL DEFAULT 'claim_approval',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT
);

-- Enable Row Level Security
ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert emails
CREATE POLICY "Allow authenticated to insert emails"
ON public.email_queue
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Allow authenticated users to view emails
CREATE POLICY "Allow authenticated to view emails"
ON public.email_queue
FOR SELECT
TO authenticated
USING (true);

-- Create indexes for performance
CREATE INDEX idx_email_queue_status ON public.email_queue(status);
CREATE INDEX idx_email_queue_created_at ON public.email_queue(created_at DESC);
