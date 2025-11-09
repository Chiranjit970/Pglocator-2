# Login Error Fix Guide

## Problem: "Login failed: Invalid login credentials" Error

This error appears when trying to log in with demo credentials immediately after loading the app.

## Root Cause

The demo users are initialized asynchronously when the app loads. If you try to login before this initialization completes, Supabase Auth won't find the user and returns "Invalid login credentials".

## Solutions

### Solution 1: Wait for Initialization (Recommended)
1. After the app loads, wait 3-5 seconds
2. Open browser console (F12)
3. Look for this message: `Demo users initialization result: ...`
4. Once you see "created" or "already_exists" status, you can login

### Solution 2: Use Quick Fill Demo Button
1. Click on the "⚡ Quick Fill Demo" button in the login form
2. This auto-fills the correct credentials
3. Click "Login"

### Solution 3: Clear Data and Reinitialize
If the error persists:

1. Open browser console (F12)
2. Run these commands:
   ```javascript
   localStorage.clear();
   location.reload();
   ```
3. Wait 5 seconds after page reload
4. Try logging in again

### Solution 4: Manual Verification
Check if demo users exist in Supabase:

1. Go to your Supabase dashboard
2. Navigate to Authentication > Users
3. Verify these users exist:
   - `teststuff677+test@gmail.com` (Student)
   - `teststuff677+test1@gmail.com` (Owner)
   - `teststuff677@gmail.com` (Admin)

If they don't exist:
- Clear localStorage: `localStorage.clear()`
- Refresh page
- Wait for initialization to complete

## Prevention

### For Developers:
If you're experiencing this frequently during development:

1. **Check Server Logs:**
   ```javascript
   // Open browser console and look for:
   // - "Initializing demo users..."
   // - "Demo users initialization result"
   ```

2. **Verify Environment Variables:**
   Ensure these are set in your Supabase Edge Function:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `SUPABASE_ANON_KEY`

3. **Check Network Tab:**
   - Open DevTools > Network
   - Look for `/init-demo-users` request
   - Check if it returns 200 OK
   - Verify the response contains successful user creation

## Demo Credentials

### Student Account:
- Email: `teststuff677+test@gmail.com`
- Password: `123456`

### Owner Account:
- Email: `teststuff677+test1@gmail.com`
- Password: `123456`

### Admin Account:
- Email: `teststuff677@gmail.com`
- Password: `akash97`

## Technical Details

### Initialization Flow:
1. App loads → `App.tsx` component mounts
2. `useEffect` runs `initializeApp()` and `initializeData()`
3. `initializeData()` calls `/init-demo-users` endpoint
4. Server creates users with Supabase Auth
5. Server stores user profiles in KV store
6. Initialization completes
7. Now login will work

### Why It Fails:
- If step 3-6 are still in progress when you try to login
- Supabase Auth lookup fails because user doesn't exist yet
- Error: "Invalid login credentials"

## Debugging Steps

1. **Check Console Logs:**
   ```
   ✅ Good: "Demo users initialization result: {results: [...]}"
   ❌ Bad: "Failed to initialize demo users: ..."
   ```

2. **Check LocalStorage:**
   ```javascript
   // In browser console:
   localStorage.getItem('demoUsersInitialized')
   // Should return: "true" (after successful init)
   ```

3. **Check Network Requests:**
   - POST `/init-demo-users` should return 200
   - Response should show "created" or "already_exists" for each user

4. **Check Supabase Logs:**
   - Go to Supabase Dashboard
   - Check Edge Function logs
   - Look for user creation errors

## Common Errors & Fixes

### Error: "Failed to initialize demo users"
**Fix:** Check Supabase environment variables

### Error: "User already exists"
**Fix:** This is normal - means users are already created

### Error: "Unauthorized"
**Fix:** Verify SUPABASE_SERVICE_ROLE_KEY is set correctly

### Error: "Network request failed"
**Fix:** Check internet connection and Supabase project status

## Additional Tips

1. **First Time Setup:**
   - Always wait 5-10 seconds on first load
   - Check console for initialization messages
   - Verify in Supabase dashboard

2. **Subsequent Logins:**
   - Should be instant after initial setup
   - LocalStorage remembers initialization

3. **Development Mode:**
   - Consider adding a loading indicator
   - Show "Initializing..." message
   - Disable login button until ready

## Quick Fix Script

If you need to quickly reset and reinitialize:

```javascript
// Copy and paste into browser console:
(async () => {
  console.log('Clearing localStorage...');
  localStorage.clear();
  
  console.log('Reloading page in 1 second...');
  setTimeout(() => {
    location.reload();
  }, 1000);
  
  console.log('After reload, wait 5 seconds before logging in!');
})();
```

## When to Contact Support

If after trying all solutions, you still get the error:
1. Check Supabase project status
2. Verify billing/quota limits
3. Check for any Supabase outages
4. Review Supabase Auth settings

## Prevention in Production

For production deployment, consider:
1. Pre-create demo users manually in Supabase
2. Add loading state to login form during initialization
3. Show initialization progress to users
4. Add retry logic for failed initializations
5. Implement proper error boundaries

---

**Still Having Issues?**

Check the browser console for specific error messages and compare with this guide. Most login issues are timing-related and resolve after proper initialization.
