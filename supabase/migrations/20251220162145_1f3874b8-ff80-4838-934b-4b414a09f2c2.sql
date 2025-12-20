-- Drop existing restrictive policies for claims
DROP POLICY IF EXISTS "Admins can view all claims" ON public.claims;
DROP POLICY IF EXISTS "Admins can update claims" ON public.claims;

-- Create new policies that include both admin and teacher roles
CREATE POLICY "Admins and teachers can view all claims" 
ON public.claims 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Admins and teachers can update claims" 
ON public.claims 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

-- Add delete policy for claims
CREATE POLICY "Admins and teachers can delete claims" 
ON public.claims 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

-- Drop existing restrictive policies for found_items
DROP POLICY IF EXISTS "Admins can view all items" ON public.found_items;
DROP POLICY IF EXISTS "Admins can update all items" ON public.found_items;
DROP POLICY IF EXISTS "Admins can delete items" ON public.found_items;

-- Create new policies that include both admin and teacher roles
CREATE POLICY "Admins and teachers can view all items" 
ON public.found_items 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Admins and teachers can update all items" 
ON public.found_items 
FOR UPDATE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));

CREATE POLICY "Admins and teachers can delete items" 
ON public.found_items 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'teacher'::app_role));