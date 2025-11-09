# PG Locator - Troubleshooting Guide

## 🔍 Common Issues & Solutions

### Authentication Issues

#### ❌ "Unauthorized - Invalid token" Error

**Symptoms:**
- Cannot access protected routes
- Logged out unexpectedly
- Data not loading after login

**Solutions:**
1. **Clear Browser Storage**
   ```javascript
   // Open browser console (F12) and run:
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

2. **Check Token Expiration**
   - Tokens expire after 1 hour by default
   - Refresh the page to get a new token
   - Auto-refresh should handle this automatically

3. **Verify Login Status**
   - Log out and log back in
   - Check that you're using the correct role

#### ❌ "This account is registered as [role], not [selected_role]"

**Cause:** Trying to login with wrong role selected

**Solution:**
- Switch to the correct role tab before logging in
- Each account is tied to one specific role
- Use the role selector at the top of the login form

#### ❌ Google Login Shows "Provider is not enabled"

**Cause:** Google OAuth not configured in Supabase

**Solution:**
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable Google provider
3. Follow guide: https://supabase.com/docs/guides/auth/social-login/auth-google
4. Add OAuth credentials from Google Cloud Console
5. Set authorized redirect URIs

#### ❌ Password Reset Email Not Received

**Possible Causes:**
- Email in spam folder
- Email server not configured in Supabase
- Invalid email address

**Solutions:**
1. Check spam/junk folder
2. Verify email address spelling
3. Configure SMTP in Supabase (production)
4. Check Supabase logs for delivery status
5. Try resending after 5 minutes

---

### Data Loading Issues

#### ❌ No PG Listings Showing

**Symptoms:**
- Empty home page
- "0 PGs found" message
- Loading spinner forever

**Solutions:**

1. **Initialize Sample Data**
   ```javascript
   // Open browser console and run:
   localStorage.removeItem('pgDataInitialized');
   location.reload();
   ```

2. **Check Network**
   - Open DevTools → Network tab
   - Look for failed requests to `/pgs` endpoint
   - Verify internet connection

3. **Clear Filters**
   - Click "Clear Filters" button
   - Reset price range to 0-20000
   - Remove all amenity filters

4. **Backend Status**
   - Check if Supabase Edge Functions are running
   - Visit health endpoint: `https://[project-id].supabase.co/functions/v1/make-server-2c39c550/health`
   - Should return `{"status":"ok"}`

#### ❌ Images Not Loading

**Symptoms:**
- Broken image icons
- Gray placeholder boxes
- Missing PG photos

**Causes:**
- Unsplash rate limiting
- Slow internet connection
- Invalid image URLs

**Solutions:**
1. **Refresh Page**: Images may load on retry
2. **Check Internet**: Verify stable connection
3. **Wait for Timeout**: ImageWithFallback will show fallback
4. **Clear Browser Cache**:
   - Chrome: Ctrl+Shift+Del → Clear images and files
   - Firefox: Ctrl+Shift+Del → Cache

---

### Booking Issues

#### ❌ "Please login to book" Error

**Cause:** Not authenticated

**Solution:**
- Ensure you're logged in as a Student
- Check header shows your name
- Try logging out and back in

#### ❌ "Please select check-in and check-out dates"

**Cause:** Missing date fields

**Solution:**
- Fill both date fields in booking form
- Ensure check-out is after check-in
- Dates must be in the future

#### ❌ "Check-out date must be after check-in date"

**Cause:** Invalid date range

**Solution:**
- Select check-out date that's later than check-in
- Minimum booking is typically 1 month

#### ❌ Booking Not Appearing in "My Bookings"

**Possible Causes:**
- Booking failed silently
- Not refreshed after booking
- Wrong account

**Solutions:**
1. Check browser console for errors
2. Refresh the page
3. Verify you're logged in as correct user
4. Try booking again
5. Check toast notifications for success message

---

### Favorites Issues

#### ❌ Can't Add to Favorites

**Symptoms:**
- Heart icon doesn't change color
- "Please login to add favorites" error
- No toast notification

**Solutions:**
1. **Ensure Logged In**: Must be authenticated
2. **Check Token**: Refresh page if token expired
3. **Network Issues**: Check DevTools console
4. **Try Different PG**: Some may be temporarily unavailable

#### ❌ Favorites Not Syncing

**Cause:** localStorage conflict

**Solution:**
```javascript
// Clear favorites cache
localStorage.removeItem('favorites');
location.reload();
```

---

### Review Issues

#### ❌ Can't Submit Review

**Symptoms:**
- "Please write a review comment" error
- Submit button not working
- Review not appearing

**Checklist:**
- ✅ Logged in as Student
- ✅ Have active or past booking for that PG
- ✅ Rating selected (1-5 stars)
- ✅ Comment field not empty
- ✅ Internet connection stable

**Solutions:**
1. Fill all required fields
2. Write at least a short comment
3. Check network connection
4. Try refreshing and submitting again

---

### Performance Issues

#### 🐌 App Running Slowly

**Possible Causes:**
- Too many open browser tabs
- Outdated browser
- Slow internet connection
- Large browser cache

**Solutions:**

1. **Close Unused Tabs**
   - Keep only necessary tabs open
   - Close other heavy applications

2. **Update Browser**
   - Use latest Chrome, Firefox, or Edge
   - Enable hardware acceleration

3. **Clear Cache**
   ```javascript
   // Open console and run:
   localStorage.clear();
   sessionStorage.clear();
   location.reload();
   ```

4. **Check Internet Speed**
   - Run speed test
   - Switch to faster WiFi/data
   - Close bandwidth-heavy apps

5. **Disable Browser Extensions**
   - Try incognito/private mode
   - Disable unnecessary extensions

#### 🔄 Animations Stuttering

**Solutions:**
1. **Reduce Motion** (if browser supports):
   - macOS: System Preferences → Accessibility → Display → Reduce motion
   - Windows: Settings → Ease of Access → Display → Show animations

2. **Close Background Apps**
   - Free up system resources
   - Close video players, games, etc.

3. **Update Graphics Drivers**
   - Especially for 3D animations
   - Check GPU manufacturer website

---

### Display Issues

#### 📱 Mobile Layout Broken

**Symptoms:**
- Text overlapping
- Buttons cut off
- Images not responsive

**Solutions:**
1. **Force Refresh**: Ctrl+Shift+R (Cmd+Shift+R on Mac)
2. **Clear Cache**: Browser settings → Clear browsing data
3. **Try Different Browser**: Test on Chrome, Safari, Firefox
4. **Update OS**: Ensure mobile OS is up to date
5. **Check Zoom Level**: Should be 100%

#### 🖥️ Desktop Layout Issues

**Solutions:**
1. **Reset Zoom**: Press Ctrl+0 (Cmd+0 on Mac)
2. **Maximize Window**: Ensure browser is full screen
3. **Check Screen Resolution**: Minimum 1024px width recommended
4. **Try Different Browser**: Test compatibility

#### 🎨 Colors Look Wrong

**Possible Causes:**
- Dark mode interference
- Browser theme
- Monitor calibration

**Solutions:**
1. Disable browser dark mode
2. Check system appearance settings
3. Try incognito mode
4. Adjust monitor brightness/contrast

---

### Backend Issues

#### ⚠️ "Failed to fetch" Errors

**Symptoms:**
- Red toast notifications
- Data not loading
- Console shows CORS errors

**Solutions:**

1. **Check Server Status**
   ```bash
   # Visit in browser:
   https://[your-project-id].supabase.co/functions/v1/make-server-2c39c550/health
   ```

2. **Verify Environment Variables**
   - SUPABASE_URL set correctly
   - SUPABASE_ANON_KEY present
   - SUPABASE_SERVICE_ROLE_KEY configured

3. **Check Supabase Dashboard**
   - Edge Functions deployed
   - No billing issues
   - Project not paused

4. **CORS Issues**
   - Server should allow all origins in dev
   - Check browser console for specific errors

#### 💾 Database Errors

**Symptoms:**
- "Failed to save" messages
- Data not persisting
- KV store errors

**Solutions:**
1. Check Supabase project status
2. Verify database not at capacity
3. Check Edge Function logs
4. Ensure proper permissions

---

## 🆘 Still Having Issues?

### Debug Steps

1. **Open Browser DevTools** (F12)
   - Check Console tab for errors
   - Check Network tab for failed requests
   - Check Application tab for localStorage

2. **Check Edge Function Logs**
   - Go to Supabase Dashboard
   - Functions → server → Logs
   - Look for error messages

3. **Test in Incognito Mode**
   - Rules out extension interference
   - Fresh session without cache

4. **Try Different Browser**
   - Test on Chrome, Firefox, Safari
   - Identifies browser-specific issues

5. **Check Network Connection**
   - Stable internet required
   - VPN may cause issues
   - Corporate firewalls may block

### Reporting Bugs

If you find a bug, please provide:

1. **Environment**:
   - Browser and version
   - Operating system
   - Screen size/device

2. **Steps to Reproduce**:
   - What you clicked
   - What you expected
   - What actually happened

3. **Error Messages**:
   - Screenshot of console errors
   - Network request failures
   - Toast notification messages

4. **Account Details**:
   - Which demo account used
   - What role you're testing
   - When the issue started

---

## 🔧 Developer Tools

### Useful Console Commands

```javascript
// Check current user
console.log(JSON.parse(localStorage.getItem('userRole')));

// View all localStorage
console.log(localStorage);

// Clear all data and restart
localStorage.clear();
sessionStorage.clear();
location.reload();

// Force re-initialize data
localStorage.removeItem('pgDataInitialized');
localStorage.removeItem('demoUsersInitialized');
location.reload();

// Check auth state
console.log('Auth Token:', localStorage.getItem('sb-access-token'));
```

### Network Debugging

1. Open DevTools → Network tab
2. Refresh page
3. Look for red/failed requests
4. Click request → Response tab
5. Note error message
6. Click Headers tab
7. Verify Authorization header present

---

**Need More Help?**

- 📧 Check the guidelines folder for detailed docs
- 📖 Read the README for feature descriptions
- 🔍 Search existing issues in console
- 💬 Contact support (if available)

---

**Last Updated**: November 7, 2025
