# Next Steps - Supabase Authentication Setup

## 🎯 What's Been Done

✅ Installed Supabase JS client library  
✅ Created `supabase-config.js` with all auth functions  
✅ Updated `app.js` with comprehensive Settings UI  
✅ Added authentication CSS styling  
✅ Created `database-schema.sql` for Supabase tables  
✅ Implemented data migration from localStorage  
✅ Created detailed setup guide (`SUPABASE_SETUP.md`)

## 🚀 What You Need to Do

### Step 1: Create Supabase Project (5 minutes)

1. Go to https://supabase.com and sign up/sign in
2. Click "New Project"
3. Fill in:
   - Name: `better-life`
   - Database Password: (create and save securely)
   - Region: (closest to you)
4. Wait 2-3 minutes for provisioning

### Step 2: Run Database Schema (2 minutes)

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Open `database-schema.sql` from your project
4. Copy entire contents and paste into SQL Editor
5. Click "Run" (Ctrl/Cmd + Enter)
6. Verify success messages

### Step 3: Get API Credentials (1 minute)

1. Go to **Project Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://abcxyz.supabase.co`)
   - **anon/public key** (long JWT token starting with `eyJ...`)

### Step 4: Update Configuration (1 minute)

1. Open `supabase-config.js`
2. Find lines 12-13:
   ```javascript
   const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
   const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY_HERE';
   ```
3. Replace with your actual values:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJhbGc...your-actual-key...';
   ```
4. **Save the file**

### Step 5: Test It! (2 minutes)

1. Open `index.html` in a browser (use a local server like Live Server)
2. Click DEBUG FINISH button to go to Finish page
3. Click **Settings** button
4. You should see "Sign Up" and "Sign In" buttons
5. Try creating an account with email/password
6. Check your email for verification (optional)
7. Sign in and verify Settings shows your account info

## 📋 Optional: OAuth Setup

**Google OAuth** (if desired):
- See detailed instructions in `SUPABASE_SETUP.md` → Step 5
- Requires Google Cloud Console setup
- Estimate: 10-15 minutes

**GitHub OAuth** (if desired):
- See detailed instructions in `SUPABASE_SETUP.md` → Step 5
- Requires GitHub Developer Settings
- Estimate: 5-10 minutes

**Note**: You can skip OAuth for now and add it later. Email/password works perfectly without it!

## 🔍 Verification

After signing up, check in Supabase Dashboard:
- **Authentication** → **Users**: Should show your new account
- **Database** → **profiles**: Should auto-create your profile
- Complete a timer session → Check **sessions** table
- Answer questions → Check **responses** table

## ❓ Troubleshooting

### "Invalid API key" error
- Double-check you copied the **anon/public** key (not service_role)
- Ensure no extra spaces in `supabase-config.js`

### Module errors in browser
- Make sure you're using a dev server (not opening index.html directly)
- Check browser console for specific error messages

### OAuth not working
- Verify you're testing on `http://localhost` or your configured redirect URL
- OAuth requires proper callback URL configuration (see setup guide)

## 📚 Resources

- [SUPABASE_SETUP.md](SUPABASE_SETUP.md) - Detailed setup guide
- [walkthrough.md](walkthrough.md) - Complete implementation details
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)

---

**Total time to get running**: ~10 minutes (without OAuth)  
**Total time with OAuth**: ~30 minutes

Ready to get started? Open `SUPABASE_SETUP.md` for the full step-by-step guide!
