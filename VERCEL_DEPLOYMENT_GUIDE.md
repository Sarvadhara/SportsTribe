# Deploy SportsTribe to Vercel - Complete Guide

## Prerequisites

✅ Your project is ready to deploy
✅ You have a GitHub account (or GitLab/Bitbucket)
✅ Your code is pushed to a Git repository

---

## Method 1: Deploy via Vercel Dashboard (Recommended for Beginners)

### Step 1: Push Your Code to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   cd sportstribe-web
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **Create a GitHub Repository**:
   - Go to https://github.com/new
   - Create a new repository (e.g., `sportstribe-web`)
   - Don't initialize with README

3. **Push Your Code**:
   ```bash
   git remote add origin https://github.com/yourusername/sportstribe-web.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Sign Up / Login to Vercel

1. Go to https://vercel.com
2. Click "Sign Up" or "Log In"
3. Sign in with GitHub (recommended - easiest way)

### Step 3: Import Your Project

1. **Click "Add New..." → "Project"**
2. **Import your GitHub repository**:
   - Find `sportstribe-web` in the list
   - Click "Import"

3. **Configure Project**:
   - **Framework Preset**: Next.js (should auto-detect)
   - **Root Directory**: `sportstribe-web` (if your repo has the folder)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `.next` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

### Step 4: Add Environment Variables

**IMPORTANT**: Add your Supabase credentials here!

1. **In the "Environment Variables" section**, add:
   - **Name**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: `https://sktedmokfgqsvjkfyfly.supabase.co`
   - Click "Add"

2. **Add the second variable**:
   - **Name**: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value**: `your_actual_anon_key_here` (paste from your .env.local)
   - Click "Add"

3. **Optional**: Add admin emails if needed:
   - **Name**: `NEXT_PUBLIC_ADMIN_EMAILS`
   - **Value**: `admin@sportstribe.com` (comma-separated if multiple)

### Step 5: Deploy!

1. **Click "Deploy"**
2. **Wait for build** (2-5 minutes)
3. **Your app will be live!** 🎉

You'll get a URL like: `https://sportstribe-web.vercel.app`

---

## Method 2: Deploy via Vercel CLI (Advanced)

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
cd sportstribe-web
vercel
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No** (first time)
- Project name? **sportstribe-web** (or your choice)
- Directory? **./** (current directory)
- Override settings? **No**

### Step 4: Add Environment Variables

```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste your URL when prompted

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste your anon key when prompted
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

---

## Important Configuration

### Root Directory Setup

If your project is in a subfolder (`sportstribe-web`), you need to set the root directory:

1. Go to **Project Settings** → **General**
2. Find **Root Directory**
3. Set it to: `sportstribe-web`
4. Save

### Build Settings

Vercel should auto-detect Next.js, but verify:
- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Node Version**: 18.x or 20.x (auto-selected)

---

## Post-Deployment Checklist

- [ ] ✅ Environment variables added
- [ ] ✅ Build completed successfully
- [ ] ✅ App is accessible at Vercel URL
- [ ] ✅ Test Supabase connection (visit `/test-connection`)
- [ ] ✅ Update Supabase RLS policies for production
- [ ] ✅ Test authentication (if implemented)
- [ ] ✅ Test database queries

---

## Custom Domain (Optional)

1. Go to **Project Settings** → **Domains**
2. Add your domain (e.g., `sportstribe.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (can take 24-48 hours)

---

## Troubleshooting

### Build Fails

**Error**: "Module not found"
- **Solution**: Make sure all dependencies are in `package.json`
- Run `npm install` locally to verify

**Error**: "Environment variable not found"
- **Solution**: Check that all `NEXT_PUBLIC_*` variables are added in Vercel dashboard

### App Works Locally But Not on Vercel

- Check **Build Logs** in Vercel dashboard
- Verify environment variables are set correctly
- Make sure Supabase URL allows requests from your Vercel domain

### Supabase Connection Issues

- Check Supabase dashboard → **Settings** → **API**
- Verify your anon key is correct
- Check **Row Level Security (RLS)** policies
- Make sure your Supabase project allows requests from Vercel domain

---

## Automatic Deployments

Vercel automatically deploys when you push to:
- **main/master branch** → Production
- **Other branches** → Preview deployments

Every push = New deployment! 🚀

---

## Useful Vercel Features

- **Preview Deployments**: Every branch gets its own URL
- **Analytics**: Track your app performance
- **Logs**: View real-time logs
- **Rollback**: Revert to previous deployment
- **Team Collaboration**: Invite team members

---

## Next Steps After Deployment

1. **Remove test files** (optional):
   - Delete `app/test-connection/page.tsx`
   - Delete `lib/testSupabaseConnection.ts`

2. **Set up production database**:
   - Create all necessary tables in Supabase
   - Set up Row Level Security (RLS) policies
   - Add sample data

3. **Configure Supabase**:
   - Add your Vercel domain to allowed origins
   - Set up authentication providers
   - Configure email templates

4. **Monitor your app**:
   - Check Vercel analytics
   - Monitor Supabase usage
   - Set up error tracking (optional)

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Deployment**: https://nextjs.org/docs/deployment
- **Vercel Discord**: https://vercel.com/discord

---

## Quick Deploy Checklist

```
□ Code pushed to GitHub
□ Vercel account created
□ Project imported from GitHub
□ Environment variables added
□ Build settings configured
□ Deployed successfully
□ Tested live URL
□ Custom domain configured (optional)
```

Good luck with your deployment! 🚀




