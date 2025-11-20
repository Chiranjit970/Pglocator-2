# Supabase Edge Function Deployment Guide

## ⚠️ IMPORTANT: Do NOT Manually Edit Edge Functions in Supabase Dashboard

**The issue you experienced happened because:**
- Manual edits in the Supabase Dashboard can break imports and file structure
- The dashboard editor doesn't handle multi-file projects well
- Changes made directly in the dashboard can't be tracked or reverted easily

## ✅ Correct Way to Deploy Edge Functions

### Option 1: Use Supabase CLI (Recommended)

1. **Install Supabase CLI:**
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   supabase link --project-ref odxrugzhcfeksxvnfmyn
   ```

4. **Deploy the function:**
   ```bash
   supabase functions deploy make-server-2c39c550
   ```

### Option 2: Use Git Integration (If Available)

If your Supabase project is connected to GitHub:
1. Push your changes to GitHub
2. Supabase will automatically deploy if auto-deploy is enabled
3. Check the Supabase Dashboard → Edge Functions → Deployments

### Option 3: Manual Deployment via Dashboard (Last Resort)

**Only use this if CLI is not available:**

1. **DO NOT edit files directly in the dashboard**
2. **Instead, use the "Upload" or "Deploy from file" option:**
   - Go to Edge Functions in Supabase Dashboard
   - Find `make-server-2c39c550`
   - Look for "Upload" or "Import" button
   - Upload the entire `supabase/functions/server/` folder as a zip file

## 📁 File Structure

Your edge function files are located at:
```
supabase/functions/server/
├── index.ts          (Main server file - DO NOT edit manually in dashboard)
└── kv_store.ts       (KV store module - DO NOT edit manually in dashboard)
```

## 🔧 Current State

All files have been reverted to the last commit:
- ✅ `src/supabase/functions/server/index.tsx` - Reverted to original
- ✅ `supabase/functions/server/index.ts` - Reverted to original  
- ✅ `supabase/functions/server/kv_store.ts` - Reverted to original
- ✅ All component files restored
- ✅ Demo user login notification fixed (shows immediately)

## 🚀 Next Steps

1. **Test the app locally** - Everything should work now
2. **Only deploy when you need to add new features**
3. **Always use CLI for deployment** - Never edit directly in dashboard
4. **Test after deployment** - Verify endpoints work correctly

## ⚠️ What NOT to Do

- ❌ Don't edit `index.ts` or `kv_store.ts` directly in Supabase Dashboard
- ❌ Don't change import statements manually
- ❌ Don't delete or rename files in the dashboard
- ❌ Don't copy-paste code without understanding the file structure

## ✅ What TO Do

- ✅ Use Supabase CLI for all deployments
- ✅ Test locally before deploying
- ✅ Keep your code in Git
- ✅ Make changes in your local files first
- ✅ Deploy only when changes are tested and working

## 🐛 If Something Breaks

1. **Revert using Git:**
   ```bash
   git restore supabase/functions/server/index.ts
   git restore supabase/functions/server/kv_store.ts
   ```

2. **Redeploy using CLI:**
   ```bash
   supabase functions deploy make-server-2c39c550
   ```

3. **Check function logs in Supabase Dashboard** for errors

## 📝 Notes

- The app code (`src/`) and edge function code (`supabase/functions/server/`) are separate
- Changes to app code don't require redeployment
- Changes to edge function code require deployment
- Always test locally before deploying


