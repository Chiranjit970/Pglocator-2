# 🚀 CRITICAL: Deploy Edge Function Now

## ⚠️ IMPORTANT

The app is currently showing CORS errors because the edge function is NOT deployed to Supabase. The code is correct, but it needs to be deployed.

## 🔴 Current Error
```
Access to fetch at 'https://odxrugzhcfeksxvnfmyn.supabase.co/functions/v1/make-server-2c39c550/pgs' 
from origin 'http://localhost:3002' has been blocked by CORS policy
```

**This means:** The edge function endpoint doesn't exist yet.

## ✅ Solution: Deploy the Edge Function

### Step 1: Install Supabase CLI
```bash
npm install -g supabase
```

### Step 2: Login to Supabase
```bash
supabase login
```

### Step 3: Link Your Project
```bash
supabase link --project-ref odxrugzhcfeksxvnfmyn
```

### Step 4: Deploy the Function
```bash
supabase functions deploy server
```

**Important:** The function name is `server` (the folder name), NOT `make-server-2c39c550` (that's the route prefix inside the function).

### Step 5: Verify Deployment
After deployment, check:
1. Go to Supabase Dashboard
2. Navigate to Edge Functions
3. You should see `server` function listed
4. Check the logs for any errors

## 🔍 What Gets Deployed

The file: `supabase/functions/server/index.ts`

This contains ALL the API endpoints:
- ✅ `/make-server-2c39c550/user/profile` - Fetch user profile
- ✅ `/make-server-2c39c550/pgs` - Get all PGs
- ✅ `/make-server-2c39c550/user/favorites` - Get favorites
- ✅ `/make-server-2c39c550/user/bookings` - Get bookings
- ✅ `/make-server-2c39c550/user/notifications` - Get notifications
- ✅ `/make-server-2c39c550/init-demo-users` - Initialize demo users
- ✅ `/make-server-2c39c550/init-data` - Initialize sample PGs
- ✅ And many more...

## 📝 After Deployment

Once deployed, the app will:
1. ✅ Login successfully
2. ✅ Fetch user profile from edge function
3. ✅ Redirect to correct dashboard (student/owner/admin)
4. ✅ Load PG listings
5. ✅ Load favorites
6. ✅ Load bookings
7. ✅ Load notifications
8. ✅ No more CORS errors
9. ✅ No more fallback profiles

## 🧪 Test the Deployment

After deploying, test with:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://odxrugzhcfeksxvnfmyn.supabase.co/functions/v1/make-server-2c39c550/health
```

Should return:
```json
{"status": "ok"}
```

## 🆘 Troubleshooting

### If deployment fails:
1. Check you're logged in: `supabase projects list`
2. Check project ref is correct: `odxrugzhcfeksxvnfmyn`
3. Check function file exists: `supabase/functions/server/index.ts`
4. Check for TypeScript errors in the file

### If function deploys but still getting CORS errors:
1. Wait 2-3 minutes for deployment to fully propagate
2. Clear browser cache
3. Restart the dev server
4. Check Supabase dashboard logs for errors

## 📊 Expected Flow After Deployment

```
User clicks "Quick Fill Demo"
         ↓
Credentials filled
         ↓
User clicks "Login"
         ↓
Supabase Auth validates credentials
         ↓
Session created with access token
         ↓
App calls: /make-server-2c39c550/user/profile
         ↓
Edge function fetches profile from KV store
         ↓
Profile returned to app
         ↓
User redirected to dashboard (student/owner/admin)
         ↓
Dashboard loads PGs, favorites, bookings, notifications
         ↓
✅ Everything works!
```

## 🎯 Next Steps

1. **Deploy the function** using the steps above
2. **Wait 2-3 minutes** for propagation
3. **Test login** with demo credentials
4. **Verify** all pages load correctly
5. **Check console** for any remaining errors

## 📞 Support

If you encounter issues:
1. Check Supabase dashboard → Edge Functions → Logs
2. Look for error messages
3. Verify the function code in `supabase/functions/server/index.ts`
4. Ensure all environment variables are set in Supabase

---

**Status:** 🔴 NEEDS DEPLOYMENT  
**Action Required:** Deploy edge function using Supabase CLI  
**Estimated Time:** 5 minutes
