# 1863 CRM — Deployment Setup Guide

## Overview

This guide takes you from zero to a live, password-protected CRM in about
45 minutes. No coding required. You'll be following instructions on two
websites (Supabase and Vercel) and one desktop app (GitHub Desktop).

**What you'll end up with:**
- A live URL (e.g. `1863crm.vercel.app` or your own domain)
- Secure login with email + password
- Three access levels: Admin, Standard, Read Only
- All player data stored in a private database
- Automatic HTTPS / SSL

---

## What You Need First

- [ ] A computer with a web browser
- [ ] An email address for the admin account
- [ ] About 45 minutes

---

## Step 1 — Create a GitHub Account and Upload the Code

GitHub is where your code will live. Vercel (the hosting service) deploys
directly from GitHub, so every time you update the code it re-deploys
automatically.

1. Go to **https://github.com** and click **Sign up**
2. Create a free account
3. Once logged in, click the **+** icon (top right) → **New repository**
4. Name it `1863-crm`
5. Set it to **Private** ← important
6. Click **Create repository**
7. On the next page, click **uploading an existing file**
8. Drag and drop ALL the files from the `1863-crm-deploy` folder you received
   (including the `src` subfolder contents)
9. Click **Commit changes**

> **File structure should look like this in GitHub:**
> ```
> index.html
> package.json
> vite.config.js
> .env.example
> schema.sql
> src/
>   App.jsx
>   main.jsx
>   supabase.js
>   LoginPage.jsx
>   RoleContext.jsx
> ```

---

## Step 2 — Set Up Supabase (Your Database)

Supabase is where all the player data, user accounts, and permissions live.

### 2a. Create your account and project

1. Go to **https://supabase.com** and click **Start your project**
2. Sign up with GitHub (easiest) or email
3. Click **New project**
4. Fill in:
   - **Name:** `1863-crm`
   - **Database password:** choose a strong password and save it somewhere safe
   - **Region:** choose one close to you (e.g. West EU — Ireland)
5. Click **Create new project** — takes about 2 minutes to provision

### 2b. Run the database schema

1. In your Supabase project, click **SQL Editor** in the left sidebar
2. Click **New query**
3. Open the `schema.sql` file from the files you received
4. Copy the entire contents and paste into the SQL editor
5. Click **Run** (or press Cmd+Enter / Ctrl+Enter)
6. You should see: `Success. No rows returned`

This creates all the database tables and security rules.

### 2c. Get your API keys

1. In Supabase, click **Settings** (gear icon, bottom left)
2. Click **API**
3. You'll see two values you need:
   - **Project URL** — looks like `https://abcdefghijk.supabase.co`
   - **anon / public key** — a long string starting with `eyJ...`
4. Keep this browser tab open — you'll need these in Step 4

### 2d. Configure Auth settings

1. In Supabase, click **Authentication** → **URL Configuration**
2. Set **Site URL** to `https://your-project.vercel.app`
   (You'll update this with your real URL after Step 3 — put a placeholder for now)
3. Under **Redirect URLs**, add: `https://your-project.vercel.app/**`
4. Click **Save**

---

## Step 3 — Deploy to Vercel (Your Hosting)

Vercel takes your GitHub code and makes it live on the internet.

1. Go to **https://vercel.com** and click **Sign Up**
2. Sign up with GitHub — this links your accounts automatically
3. Click **Add New → Project**
4. Find and select your `1863-crm` repository
5. Under **Framework Preset**, select **Vite**
6. Don't change anything else yet — click **Deploy**
7. Vercel will try to build (it will fail — that's OK, we need to add
   environment variables first)
8. Once it finishes (even with an error), you'll see your project URL —
   it looks like `1863-crm-xxxx.vercel.app`
   Copy this URL.

---

## Step 4 — Add Environment Variables to Vercel

This is how Vercel securely connects to your Supabase database.

1. In Vercel, go to your project → **Settings** → **Environment Variables**
2. Add these two variables:

   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | Your Supabase Project URL from Step 2c |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key from Step 2c |

3. For each, make sure **Production**, **Preview**, and **Development**
   are all ticked
4. Click **Save**
5. Go to **Deployments** and click **Redeploy** on the latest deployment
6. This time it should build successfully — you'll see a green tick

---

## Step 5 — Update Supabase with Your Real URL

Now that you have your real Vercel URL:

1. Go back to Supabase → **Authentication** → **URL Configuration**
2. Update **Site URL** to your actual Vercel URL
   (e.g. `https://1863-crm-xxxx.vercel.app`)
3. Update the **Redirect URL** too
4. Save

---

## Step 6 — Create Your Admin Account

1. Go to Supabase → **Authentication** → **Users**
2. Click **Add user** → **Create new user**
3. Enter your email and a strong password
4. Click **Create user**
5. Now open the **SQL Editor** and run this to make yourself an admin
   (replace the email with yours):

```sql
UPDATE profiles
SET role = 'admin', full_name = 'Your Name'
WHERE email = 'your@email.com';
```

6. Visit your Vercel URL, sign in with your email and password
7. You should see the 1863 CRM dashboard ✓

---

## Step 7 — Invite Your Team

Now you're logged in as admin:

1. In the CRM, look at the bottom-left sidebar — you'll see your name and role
2. Click **⚙ MANAGE USERS**
3. Enter a team member's name, email, and choose their access level:
   - **Admin** — full access, can manage users (AV, JS only)
   - **Standard** — can add/edit players and proposals, cannot delete
   - **Read Only** — view only, rep contract links are hidden
4. Click **Send Invite** — they'll receive an email with a link to set
   their password and log in

---

## Step 8 (Optional) — Set Up a Custom Domain

If you want `crm.18sixtythree.com` or similar instead of the Vercel URL:

1. In Vercel → your project → **Settings** → **Domains**
2. Click **Add** and type your domain
3. Vercel will show you DNS records to add
4. Log in to wherever your domain is registered (GoDaddy, Namecheap, etc.)
5. Add the DNS records Vercel provides
6. Takes up to 24 hours to propagate, usually much faster

---

## Access Levels Summary

| Feature | Admin | Standard | Read Only |
|---------|-------|----------|-----------|
| View all players | ✓ | ✓ | ✓ |
| View rep contract links | ✓ | ✓ | ✗ |
| Add / edit players | ✓ | ✓ | ✗ |
| Archive players | ✓ | ✓ | ✗ |
| Delete players | ✓ | ✗ | ✗ |
| Log proposals | ✓ | ✓ | ✗ |
| Export to Word | ✓ | ✓ | ✗ |
| Weekly Report | ✓ | ✓ | ✓ |
| Club Finder | ✓ | ✓ | ✓ |
| Manage users | ✓ | ✗ | ✗ |

---

## Ongoing Costs

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Supabase | 500MB DB, 50k auth users, unlimited API calls — **free for your scale** | £25/month Pro |
| Vercel | Unlimited deploys, custom domain, HTTPS — **free for small teams** | £20/month Pro |
| Domain | — | ~£15/year |

For a team of under 10 people, you will likely run on free tiers indefinitely.

---

## Troubleshooting

**Build fails on Vercel:**
Check that both environment variables are set correctly with no spaces.
Go to Vercel → Settings → Environment Variables and verify.

**"Invalid API key" error when logging in:**
Your `VITE_SUPABASE_ANON_KEY` is wrong. Copy it again from
Supabase → Settings → API → `anon` `public` key.

**Can't log in / auth error:**
Make sure the Site URL in Supabase Authentication settings matches your
Vercel URL exactly (including https://, no trailing slash).

**User doesn't receive invite email:**
Check Supabase → Authentication → Users to confirm the invite was created.
The email may be in spam. You can also manually set their password from
the Supabase dashboard.

**Data not saving:**
Check Supabase → Table Editor → app_data to see if rows are being created.
If not, check the Row Level Security policies ran correctly in Step 2b.

---

## Getting Help

If you get stuck at any step, the error message from your browser or
Vercel's build log is the most useful thing to share.

- Supabase docs: https://supabase.com/docs
- Vercel docs: https://vercel.com/docs
- Or share the error message and I can help diagnose it

---

*Guide version 1.0 — 1863 Sports & Entertainment*
