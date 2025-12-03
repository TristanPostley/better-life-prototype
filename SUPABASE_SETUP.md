# Supabase Setup Guide for Better Life App

This guide will walk you through setting up Supabase authentication for the Better Life application.

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in (or create an account)
2. Click **"New Project"**
3. Fill in the project details:
   - **Name**: `better-life` (or your preferred name)
   - **Database Password**: Create a strong password (save this securely!)
   - **Region**: Choose the region closest to you
   - **Pricing Plan**: Free tier is perfect for starting
4. Click **"Create new project"**
5. Wait 2-3 minutes for your project to be provisioned

## Step 2: Get API Credentials

1. Once your project is ready, go to **Project Settings** (gear icon in sidebar)
2. Navigate to **API** section
3. You'll see two important values:
   - **Project URL** - Something like `https://abcdefghijk.supabase.co`
   - **anon/public key** - A long JWT token starting with `eyJ...`
4. **Copy these values** - you'll need them in Step 4

## Step 3: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (in the sidebar)
2. Click **"New query"**
3. Open the file `database-schema.sql` from your project directory
4. **Copy the entire contents** of that file
5. **Paste it** into the Supabase SQL Editor
6. Click **"Run"** (or press Ctrl+Enter / Cmd+Enter)
7. You should see success messages indicating tables were created

### Verify Tables Were Created

In the SQL Editor, run this query to verify:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'sessions', 'responses');
```

You should see 3 rows returned with the table names.

## Step 4: Configure Your Application

1. Open `supabase-config.js` in your code editor
2. Find these lines at the top:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
   ```
3. Replace them with your actual credentials from Step 2:
   ```javascript
   const SUPABASE_URL = 'https://your-project-id.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
   ```
4. **Save the file**

## Step 5: Configure OAuth Providers (Optional)

If you want to enable Google and GitHub sign-in:

### Google OAuth Setup

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **Google** in the list and click to expand
3. Toggle **"Google enabled"** to ON
4. Follow Supabase's instructions to:
   - Create a Google Cloud project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Copy Client ID and Client Secret to Supabase
5. Set **Authorized redirect URIs** in Google Console:
   - Add: `https://your-project-id.supabase.co/auth/v1/callback`
6. Click **Save** in Supabase

### GitHub OAuth Setup

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Find **GitHub** in the list and click to expand
3. Toggle **"GitHub enabled"** to ON
4. Follow Supabase's instructions to:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Click "New OAuth App"
   - Fill in application details
   - Set **Authorization callback URL**: `https://your-project-id.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret to Supabase
5. Click **Save** in Supabase

### Skip OAuth for Now

OAuth setup is **optional**. You can start with just email/password authentication and add OAuth later. The app will still work perfectly without it!

## Step 6: Configure Email Settings (Optional)

By default, Supabase uses a rate-limited email service for testing. For production:

1. Go to **Authentication** → **Email Templates**
2. Customize the confirmation and password reset emails
3. For production, set up SMTP in **Project Settings** → **Auth** → **SMTP Settings**

## Step 7: Test the Application

1. Open your app in a browser (use a local server like Live Server, or serve with `python -m http.server`)
2. Navigate to the **Finish page** (complete a timer session or use DEBUG FINISH button)
3. Click **Settings** button
4. You should see **Sign Up** and **Sign In** buttons

### Test Sign Up Flow

1. Click **"Sign Up"**
2. Enter an email and password (minimum 6 characters)
3. Click **"Create Account"**
4. Check your email for verification link (if email confirmation is enabled)
5. After verifying, you should be able to sign in

### Test Sign In Flow

1. Click **"Sign In"**
2. Enter your email and password
3. Click **"Sign In"**
4. Settings should now show your account info

### Verify in Supabase Dashboard

1. Go to **Authentication** → **Users** in Supabase dashboard
2. You should see your newly created user account

## Step 8: Configure Site URL (For Production)

When deploying to production:

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your production domain (e.g., `https://betterlife.app`)
3. Add **Redirect URLs** for any custom domains

## Troubleshooting

### "Invalid API key" Error

- Double-check that you copied the **anon/public** key (not the service_role key)
- Make sure there are no extra spaces when pasting
- Verify the key starts with `eyJ`

### Email Not Arriving

- Check spam/junk folder
- Supabase's default email service is rate-limited
- For testing, you can disable email confirmation in **Authentication** → **Settings** (toggle off "Enable email confirmations")

### CORS Errors

- Make sure you're serving the app through a development server (not opening index.html directly)
- For local development, `http://localhost` should work automatically
- If needed, add your dev server URL to **Authentication** → **URL Configuration** → **Redirect URLs**

### "User already registered" Error

This means the email is already taken. Either:
- Use the sign-in flow instead
- Use a different email
- Delete the user from **Authentication** → **Users** in Supabase dashboard

### OAuth Not Working

- Verify redirect URLs match exactly in both OAuth provider (Google/GitHub) and Supabase
- Make sure OAuth is enabled in Supabase **Authentication** → **Providers**
- Check browser console for specific error messages

## Next Steps

Once everything is working:

1. ✅ **Test data migration** - Create localStorage data, then sign up to test import
2. ✅ **Complete a session** - Verify it's saved to Supabase `sessions` table
3. ✅ **Answer questions** - Verify responses are saved to `responses` table
4. ✅ **Test cross-device sync** - Sign in from different browser/device
5. ✅ **Review Row Level Security** - Ensure you can only access your own data

## Security Notes

- **Never commit** your Supabase credentials to Git
- For production, use environment variables or a secrets manager
- The `anon/public` key is safe to use client-side (it's designed for browser use)
- Row Level Security (RLS) policies protect user data - even with the public key, users can only access their own data

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

## Quick Reference

### View Your Data

**Check users:**
```sql
SELECT email, created_at FROM auth.users;
```

**Check profiles:**
```sql
SELECT * FROM profiles;
```

**Check sessions:**
```sql
SELECT user_id, duration_seconds, completed_at FROM sessions ORDER BY completed_at DESC;
```

**Check responses:**
```sql
SELECT user_id, question_type, response_text, created_at FROM responses ORDER BY created_at DESC;
```

### Reset Everything (If Needed)

**Delete all test users:**
```sql
DELETE FROM auth.users;
-- This will cascade and delete profiles, sessions, and responses too
```

---

Good luck! If you run into any issues, check the browser console for error messages and refer to the Troubleshooting section above.
