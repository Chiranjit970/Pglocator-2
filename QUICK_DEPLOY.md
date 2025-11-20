# ⚡ Quick Deploy - Copy & Paste Commands

## 🚀 Deploy in 5 Minutes

### Step 1: Open Terminal/Command Prompt

### Step 2: Run These Commands (One by One)

```bash
npm install -g supabase
```

Wait for it to complete, then:

```bash
supabase login
```

This will open a browser window. Login with your Supabase account.

Then run:

```bash
supabase link --project-ref odxrugzhcfeksxvnfmyn
```

Finally, deploy:

```bash
supabase functions deploy server
```

### Step 3: Wait for Deployment

You should see output like:
```
✓ Function deployed successfully
✓ Deployed to https://odxrugzhcfeksxvnfmyn.supabase.co/functions/v1/server
```

### Step 4: Test

Go back to your app and try logging in with:
- Email: `teststuff677+test@gmail.com`
- Password: `123456`

## ✅ What Should Happen

1. ✅ Login succeeds
2. ✅ Redirected to StudentHome
3. ✅ PGs load in grid
4. ✅ Can click on PGs
5. ✅ Can add to favorites
6. ✅ Can view bookings
7. ✅ Can view notifications
8. ✅ No CORS errors
9. ✅ No console errors

## 🆘 If Something Goes Wrong

### Error: "supabase: command not found"
```bash
npm install -g supabase
```

### Error: "Not authenticated"
```bash
supabase logout
supabase login
```

### Error: "Project not found"
Make sure project ref is correct: `odxrugzhcfeksxvnfmyn`

### Still getting CORS errors after deployment?
1. Wait 2-3 minutes for full propagation
2. Clear browser cache (Ctrl+Shift+Delete)
3. Restart dev server
4. Hard refresh browser (Ctrl+F5)

## 📊 Verify Deployment

After deployment, check Supabase Dashboard:
1. Go to https://app.supabase.com
2. Select your project
3. Go to "Edge Functions"
4. You should see "server" function listed
5. Click on it to see logs

## 🎯 That's It!

Once deployed, the app will work perfectly with:
- ✅ Login
- ✅ Student Dashboard
- ✅ Owner Dashboard
- ✅ Admin Dashboard
- ✅ Favorites
- ✅ Bookings
- ✅ Notifications
- ✅ All features

---

**Time to Deploy:** 5 minutes  
**Difficulty:** Easy  
**Commands:** 4 simple commands
