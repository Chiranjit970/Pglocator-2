# Redeploy Edge Function - Quick Guide

## ⚠️ Issue Fixed
The edge function route `/user/profile` was missing the `/make-server-2c39c550` prefix, causing 404 errors and timeouts.

## ✅ Files Fixed
- `supabase/functions/server/index.ts` - Fixed route prefix for `/user/profile` GET and PUT endpoints

## 🚀 Deploy Using Supabase CLI

1. **Install Supabase CLI (if not installed):**
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
   supabase functions deploy server
   ```
   
   **Important:** The function name is `server` (the folder name), not `make-server-2c39c550` (that's the route prefix).

## 📝 What Was Fixed

### Before (Broken):
```typescript
app.get("/user/profile", requireAuth, async (c) => {
```

### After (Fixed):
```typescript
app.get("/make-server-2c39c550/user/profile", requireAuth, async (c) => {
```

## ✅ After Deployment

1. The profile endpoint should work correctly
2. Timeout errors should be resolved
3. App should load without infinite loading

## 🔍 Verify Deployment

After deploying, check:
- Supabase Dashboard → Edge Functions → `make-server-2c39c550` → Logs
- Test the endpoint: `https://odxrugzhcfeksxvnfmyn.supabase.co/functions/v1/make-server-2c39c550/user/profile`
