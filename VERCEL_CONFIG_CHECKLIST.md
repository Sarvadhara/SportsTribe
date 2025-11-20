# Vercel Configuration Checklist

## ✅ Step-by-Step Configuration

### 1. Root Directory
- [ ] Click "Edit" next to Root Directory
- [ ] Change from `./` to `sportstribe-web`
- [ ] Save

### 2. Build Settings (Usually Auto-Detected)
- [ ] Framework Preset: **Next.js** ✅
- [ ] Build Command: `npm run build` ✅
- [ ] Output Directory: `Next.js default` ✅
- [ ] Install Command: `npm install` ✅

### 3. Environment Variables (REQUIRED!)

#### Add Supabase URL:
- [ ] Click "Add More" button
- [ ] Key: `NEXT_PUBLIC_SUPABASE_URL`
- [ ] Value: `https://sktedmokfgqsvjkfyfly.supabase.co`
- [ ] Click "Add"

#### Add Supabase Anon Key:
- [ ] Click "Add More" button
- [ ] Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Value: `your_actual_anon_key_here` (paste from Supabase dashboard)
- [ ] Click "Add"

### 4. Optional: Admin Emails (if needed)
- [ ] Key: `NEXT_PUBLIC_ADMIN_EMAILS`
- [ ] Value: `admin@sportstribe.com` (comma-separated if multiple)
- [ ] Click "Add"

---

## 📝 Exact Values to Use

### Root Directory:
```
sportstribe-web
```

### Environment Variables:

**Variable 1:**
- Key: `NEXT_PUBLIC_SUPABASE_URL`
- Value: `https://sktedmokfgqsvjkfyfly.supabase.co`

**Variable 2:**
- Key: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (your full anon key)

---

## ⚠️ Important Notes

1. **Root Directory is CRITICAL** - Without this, Vercel won't find your Next.js project
2. **Environment Variables are REQUIRED** - Your app won't connect to Supabase without them
3. **Variable names must be EXACT** - Case-sensitive, no spaces
4. **After adding variables, you MUST redeploy** for them to take effect

---

## 🚀 After Configuration

1. Click "Save" or "Deploy"
2. Wait for build to complete
3. Your app will be live at: `https://your-project.vercel.app`

---

## 🔍 How to Get Your Anon Key

1. Go to: https://supabase.com/dashboard/project/sktedmokfgqsvjkfyfly/settings/api
2. Find "anon public" key
3. Click the eye icon to reveal it
4. Copy the entire key (starts with `eyJ...`)
5. Paste it in Vercel environment variables

---

## ✅ Verification

After deployment, test your connection:
- Visit: `https://your-project.vercel.app/test-connection`
- You should see green success message if everything is configured correctly



