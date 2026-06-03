-- Support multiple photos per found item while keeping photo_url as the primary image.
ALTER TABLE public.found_items
ADD COLUMN IF NOT EXISTS photo_urls TEXT[] DEFAULT ARRAY[]::TEXT[];

ALTER TABLE public.found_items
DROP CONSTRAINT IF EXISTS found_items_status_check;

UPDATE public.found_items
SET status = 'available'
WHERE status IS NULL OR status = '';

ALTER TABLE public.found_items
ADD CONSTRAINT found_items_status_check
CHECK (status IN ('available', 'claimed', 'returned', 'rejected', 'pending', 'approved'));

UPDATE public.found_items
SET photo_urls = ARRAY[photo_url]
WHERE photo_url IS NOT NULL
  AND (photo_urls IS NULL OR array_length(photo_urls, 1) IS NULL);

ALTER TABLE public.found_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can submit items" ON public.found_items;

CREATE POLICY "Authenticated users can submit items"
ON public.found_items
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "Users can view their own items" ON public.found_items;

CREATE POLICY "Users can view their own items"
ON public.found_items
FOR SELECT
TO authenticated
USING (auth.uid() = submitted_by);

DROP POLICY IF EXISTS "Anyone can view approved items" ON public.found_items;

CREATE POLICY "Anyone can view approved items"
ON public.found_items
FOR SELECT
USING (approved = true);

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT 'User',
  email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO public.profiles (id, full_name, email, created_at)
SELECT
  users.id,
  COALESCE(users.raw_user_meta_data->>'full_name', 'User'),
  users.email,
  COALESCE(users.created_at, NOW())
FROM auth.users
WHERE users.email IS NOT NULL
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  full_name = COALESCE(NULLIF(public.profiles.full_name, ''), EXCLUDED.full_name);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typnamespace = 'public'::regnamespace AND typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user', 'teacher');
  ELSE
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'teacher';
  END IF;
END
$$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name public.app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = $1 AND user_roles.role::TEXT = $2::TEXT
  )
$$;

CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, role_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_roles.user_id = $1 AND user_roles.role::TEXT = $2
  )
$$;

-- Teachers/admins need profile and role visibility for the admin Users tab
-- and for broadcasting approved found-item notifications.
DROP POLICY IF EXISTS "Admins and teachers can view all profiles" ON public.profiles;

CREATE POLICY "Admins and teachers can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::TEXT) OR public.has_role(auth.uid(), 'teacher'::TEXT));

DROP POLICY IF EXISTS "Teachers can view all roles" ON public.user_roles;

CREATE POLICY "Teachers can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'teacher'::TEXT));

DROP POLICY IF EXISTS "Admins and teachers can view all items" ON public.found_items;

CREATE POLICY "Admins and teachers can view all items"
ON public.found_items
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::TEXT) OR public.has_role(auth.uid(), 'teacher'::TEXT));

DROP POLICY IF EXISTS "Admins and teachers can update all items" ON public.found_items;

CREATE POLICY "Admins and teachers can update all items"
ON public.found_items
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::TEXT) OR public.has_role(auth.uid(), 'teacher'::TEXT));

DROP POLICY IF EXISTS "Admins and teachers can delete items" ON public.found_items;

CREATE POLICY "Admins and teachers can delete items"
ON public.found_items
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::TEXT) OR public.has_role(auth.uid(), 'teacher'::TEXT));

CREATE TABLE IF NOT EXISTS public.email_queue (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  recipient TEXT NOT NULL,
  subject TEXT NOT NULL,
  html_body TEXT NOT NULL,
  data JSONB,
  status TEXT NOT NULL DEFAULT 'pending',
  type TEXT NOT NULL DEFAULT 'claim_approval',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at TIMESTAMPTZ,
  error_message TEXT
);

ALTER TABLE public.email_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated to insert emails" ON public.email_queue;

CREATE POLICY "Allow authenticated to insert emails"
ON public.email_queue
FOR INSERT
TO authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated to view emails" ON public.email_queue;

CREATE POLICY "Allow authenticated to view emails"
ON public.email_queue
FOR SELECT
TO authenticated
USING (true);

CREATE INDEX IF NOT EXISTS idx_email_queue_status ON public.email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_created_at ON public.email_queue(created_at DESC);

CREATE OR REPLACE FUNCTION public.escape_email_html(_value TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT replace(
    replace(
      replace(
        replace(
          replace(coalesce(_value, ''), '&', '&amp;'),
          '<',
          '&lt;'
        ),
        '>',
        '&gt;'
      ),
      '"',
      '&quot;'
    ),
    '''',
    '&#39;'
  )
$$;

CREATE OR REPLACE FUNCTION public.queue_new_item_report_emails(_item_id UUID, _app_origin TEXT)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  item_record public.found_items%ROWTYPE;
  claim_url TEXT;
  queued_count INTEGER := 0;
BEGIN
  SELECT *
  INTO item_record
  FROM public.found_items
  WHERE id = _item_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  IF auth.uid() <> item_record.submitted_by
    AND NOT public.has_role(auth.uid(), 'admin'::TEXT)
    AND NOT public.has_role(auth.uid(), 'teacher'::TEXT) THEN
    RETURN 0;
  END IF;

  claim_url := rtrim(coalesce(_app_origin, ''), '/') || '/claim/' || item_record.id::TEXT;

  INSERT INTO public.email_queue (
    recipient,
    subject,
    html_body,
    data,
    status,
    type
  )
  SELECT DISTINCT ON (users.email)
    users.email,
    'New Found Item: ' || item_record.title,
    '<!DOCTYPE html>
      <html>
        <body style="font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif; line-height: 1.6; color: #333;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: #111; color: #fff; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px;">
              <h2 style="margin: 0;">New Found Item Reported</h2>
            </div>
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px;">
              <p>Hi ' || public.escape_email_html(coalesce(profiles.full_name, users.raw_user_meta_data->>'full_name', 'there')) || ',</p>
              <p>A new found item has been reported and is waiting for admin review:</p>
              <p><strong>Item:</strong><br />' || public.escape_email_html(item_record.title) || '</p>
              <p><strong>Category:</strong><br />' || public.escape_email_html(item_record.category) || '</p>
              <p><strong>Description:</strong><br />' || public.escape_email_html(item_record.description) || '</p>
              <p><strong>Where it was found:</strong><br />' || public.escape_email_html(item_record.location_found) || '</p>
              <p><strong>Date Found:</strong><br />' || to_char(item_record.date_found, 'Month FMDD, YYYY') || '</p>
              <a href="' || public.escape_email_html(claim_url) || '" style="display: inline-block; margin-top: 12px; padding: 12px 18px; border-radius: 8px; background: #fbbf24; color: #111; text-decoration: none; font-weight: 700;">View or claim item</a>
              <p style="margin-top: 16px;">You may need to sign in before submitting a claim. If the item is still under review, it will become available once an admin approves it.</p>
            </div>
            <p style="margin-top: 20px; font-size: 12px; color: #999; text-align: center;">This is an automated email. Please do not reply directly.</p>
          </div>
        </body>
      </html>',
    jsonb_build_object(
      'itemId', item_record.id,
      'itemTitle', item_record.title,
      'itemCategory', item_record.category,
      'itemLocation', item_record.location_found,
      'itemDateFound', item_record.date_found,
      'claimUrl', claim_url
    ),
    'pending',
    'new_item_report'
  FROM auth.users
  LEFT JOIN public.profiles ON profiles.id = users.id
  WHERE users.email IS NOT NULL
    AND users.email <> '';

  GET DIAGNOSTICS queued_count = ROW_COUNT;
  RETURN queued_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.queue_new_item_report_emails(UUID, TEXT) TO authenticated;
