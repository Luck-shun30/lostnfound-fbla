-- Create info_requests table for users to ask questions about items
CREATE TABLE public.info_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  item_id UUID REFERENCES public.found_items(id) ON DELETE CASCADE NOT NULL,
  requester_name TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  requester_phone TEXT,
  question TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  admin_response TEXT,
  responded_at TIMESTAMP WITH TIME ZONE,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.info_requests ENABLE ROW LEVEL SECURITY;

-- Users can create info requests
CREATE POLICY "Users can create info requests"
ON public.info_requests
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Users can view their own info requests
CREATE POLICY "Users can view their own info requests"
ON public.info_requests
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Teachers and admins can view all info requests
CREATE POLICY "Teachers can view all info requests"
ON public.info_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- Teachers and admins can update info requests (to respond)
CREATE POLICY "Teachers can update info requests"
ON public.info_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));

-- Teachers and admins can delete info requests
CREATE POLICY "Teachers can delete info requests"
ON public.info_requests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'teacher') OR public.has_role(auth.uid(), 'admin'));