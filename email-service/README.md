# Email Service for Lost & Found App

This service processes the `email_queue` table and sends emails via Resend.

## Setup

### 1. Add columns to email_queue table (if missing)

Run this in Supabase SQL Editor:

```sql
ALTER TABLE public.email_queue
ADD COLUMN IF NOT EXISTS retry_count INT DEFAULT 0;
```

### 2. Get Required Credentials

- **SUPABASE_URL**: From Supabase dashboard → Settings → API
- **SUPABASE_SERVICE_ROLE_KEY**: From Supabase dashboard → Settings → API (use service role key, not anon key)
- **RESEND_API_KEY**: From https://resend.com → API Keys

### 3. Create .env file

In the `email-service` directory, create `.env`:

```env
SUPABASE_URL=https://rvgozbswemwiqfxmygzw.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
RESEND_API_KEY=re_your-resend-api-key-here
```

### 4. Install dependencies

```bash
cd email-service
npm install
```

### 5. Run locally (testing)

```bash
npm run dev
```

You should see:
```
🚀 Lost & Found Email Service Started
📍 Supabase URL: https://...
⏱️  Poll interval: 5000ms
```

## Deployment to Railway

1. Go to https://railway.app
2. Create new project → GitHub repo
3. Add environment variables (SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY)
4. Set start command: `npm start`
5. Deploy

The service will run continuously and send emails every 5 seconds.

## How It Works

1. Service polls `email_queue` table every 5 seconds for `status='pending'`
2. For each pending email:
   - Sends via Resend API
   - Updates status to `'sent'` + sets `sent_at` timestamp
   - If error: increments `retry_count`, fails after 3 attempts
3. Logs all activity to console

## Monitoring

Check email status in Supabase:

```sql
SELECT * FROM email_queue ORDER BY created_at DESC;
```

- `status='pending'` - Not yet sent
- `status='sent'` - Successfully sent
- `status='failed'` - Failed after max retries
