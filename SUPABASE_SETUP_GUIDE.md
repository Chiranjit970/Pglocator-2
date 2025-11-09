# 🔐 Supabase Authentication Setup Guide for PG Locator

This guide will help you configure Supabase authentication for the PG Locator app, including email settings, demo users, and password reset functionality.

## 📋 Table of Contents

1. [Email Configuration](#email-configuration)
2. [Demo Users Setup](#demo-users-setup)
3. [Password Reset Configuration](#password-reset-configuration)
4. [Admin Invitation Code System](#admin-invitation-code-system)
5. [Troubleshooting](#troubleshooting)

---

## 📧 Email Configuration

### Option 1: Use Supabase Default Email (Development)

For development and testing, Supabase provides a default email service that sends emails to a catch-all address. **Email confirmation is automatically bypassed** in our setup.

**Configuration:**
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to **Authentication** → **Settings**
3. Under **Email Auth**, ensure:
   - ✅ **Enable email confirmations** is **OFF** (or we auto-confirm in code)
   - ✅ **Secure email change** is enabled
   - ✅ **Double confirm email changes** is enabled (optional)

**Current Setup:**
- Our Edge Function automatically sets `email_confirm: true` when creating users
- This means users don't need to verify their email to login
- Perfect for development and demo purposes

### Option 2: Configure Custom SMTP (Production)

For production, you should configure a custom SMTP server:

1. **Go to Supabase Dashboard** → **Authentication** → **Settings**
2. **Scroll to "SMTP Settings"**
3. **Enable "Enable Custom SMTP"**
4. **Configure your SMTP provider** (examples below)

#### Using Gmail SMTP:
```
SMTP Host: smtp.gmail.com
SMTP Port: 587
SMTP User: your-email@gmail.com
SMTP Password: [App Password - see below]
Sender Email: your-email@gmail.com
Sender Name: PG Locator
```

**To get Gmail App Password:**
1. Go to Google Account settings
2. Security → 2-Step Verification → App passwords
3. Generate a new app password for "Mail"
4. Use this 16-character password in SMTP settings

#### Using SendGrid:
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
SMTP User: apikey
SMTP Password: [Your SendGrid API Key]
Sender Email: noreply@yourdomain.com
Sender Name: PG Locator
```

#### Using Mailgun:
```
SMTP Host: smtp.mailgun.org
SMTP Port: 587
SMTP User: [Your Mailgun SMTP username]
SMTP Password: [Your Mailgun SMTP password]
Sender Email: noreply@yourdomain.com
Sender Name: PG Locator
```

### Email Templates

Supabase allows you to customize email templates:

1. Go to **Authentication** → **Email Templates**
2. Customize templates for:
   - **Confirm signup**
   - **Reset password**
   - **Magic link**
   - **Change email address**

**Important:** If you enable email confirmations in production, update the signup endpoint to remove `email_confirm: true`:

```typescript
// In src/supabase/functions/server/index.tsx
// Change from:
email_confirm: true,

// To:
email_confirm: false, // Users will receive confirmation email
```

---

## 👥 Demo Users Setup

### Automatic Initialization

Demo users are automatically created when the app loads. The initialization happens in:

1. **Frontend**: `src/components/InitializeData.tsx`
2. **Backend**: `src/supabase/functions/server/index.tsx` → `/init-demo-users` endpoint

### Demo User Credentials

| Role | Email | Password |
|------|-------|----------|
| **Student** | `teststuff677+test@gmail.com` | `123456` |
| **Owner** | `teststuff677+test1@gmail.com` | `123456` |
| **Admin** | `teststuff677@gmail.com` | `akash97` |

### Manual Setup (if automatic fails)

If demo users don't get created automatically:

1. **Go to Supabase Dashboard** → **Authentication** → **Users**
2. **Click "Add user"** → **Create new user**
3. For each demo user:
   - Enter email
   - Enter password
   - ✅ Check "Auto Confirm User"
   - Click "Create user"

4. **Then call the initialization endpoint** to create profiles:
   ```bash
   curl -X POST https://YOUR_PROJECT_ID.supabase.co/functions/v1/make-server-2c39c550/init-demo-users \
     -H "Authorization: Bearer YOUR_ANON_KEY"
   ```

### Verifying Demo Users

1. **Check Supabase Auth:**
   - Go to **Authentication** → **Users**
   - Verify all three demo users exist
   - Check that emails are confirmed

2. **Check KV Store (User Profiles):**
   - The app stores user profiles in the `kv_store_2c39c550` table
   - Each user should have a profile with their role and metadata

3. **Test Login:**
   - Use the "⚡ Quick Fill Demo" button in the login form
   - Click "Login"
   - You should be redirected to the appropriate dashboard

---

## 🔑 Password Reset Configuration

### Current Setup

Password reset is configured to work with Supabase's password reset flow:

1. **User clicks "Forgot Password?"**
2. **Enters email address**
3. **Supabase sends reset email** (if SMTP is configured)
4. **User clicks link in email**
5. **User sets new password**

### Configuration Steps

1. **Go to Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Set "Site URL"** to your app's URL:
   ```
   http://localhost:5173 (development)
   https://yourdomain.com (production)
   ```

3. **Add Redirect URLs**:
   - Add your app URL to "Redirect URLs"
   - This allows password reset links to redirect back to your app

4. **Configure Email Template**:
   - Go to **Authentication** → **Email Templates** → **Reset Password**
   - Customize the template if needed
   - The reset link will be: `{{ .ConfirmationURL }}`

### Password Reset Flow

```typescript
// Frontend: src/components/auth/PasswordResetForm.tsx
const { error } = await supabase.auth.resetPasswordForEmail(email, {
  redirectTo: window.location.origin, // Redirect back to app after reset
});
```

### Testing Password Reset

1. **If SMTP is not configured:**
   - Password reset emails won't be sent
   - Check Supabase logs for email delivery status
   - For development, use Supabase's email testing feature

2. **If SMTP is configured:**
   - Enter an email address in "Forgot Password?"
   - Check email inbox for reset link
   - Click link and set new password
   - Login with new password

---

## 🛡️ Admin Invitation Code System

### How It Works

The admin invitation code system prevents unauthorized users from creating admin accounts. Only users with the correct invitation code can sign up as administrators.

### Current Implementation

**Invitation Code:** `ADTU-ADMIN-2024`

This code is:
- **Validated in the frontend** (`src/components/auth/SignupForm.tsx`)
- **Validated in the backend** (`src/supabase/functions/server/index.tsx`)

### Who Provides the Invitation Code?

**Option 1: System Administrator (Recommended)**
- The system administrator (first admin) receives the code during initial setup
- They distribute it to trusted individuals who need admin access
- The code can be changed by updating it in the codebase

**Option 2: Existing Admins**
- Existing admins can provide the code to new administrators
- This requires building an admin management interface (future enhancement)

**Option 3: University/Institution**
- The code can be provided by the university (ADTU) administration
- It's tied to the university name in the code (`ADTU-ADMIN-2024`)

### Changing the Admin Code

To change the admin invitation code:

1. **Update Frontend Validation:**
   ```typescript
   // src/components/auth/SignupForm.tsx
   if (formData.adminCode !== 'NEW-ADMIN-CODE') {
     newErrors.adminCode = 'Invalid admin code';
   }
   ```

2. **Update Backend Validation:**
   ```typescript
   // src/supabase/functions/server/index.tsx
   if (role === 'admin' && metadata.adminCode !== 'NEW-ADMIN-CODE') {
     return c.json({ error: 'Invalid admin invitation code' }, 400);
   }
   ```

3. **Update Documentation:**
   - Update this guide
   - Update README.md
   - Notify existing admins

### Future Enhancements

1. **Dynamic Admin Codes:**
   - Store admin codes in database
   - Allow admins to generate new codes
   - Set expiration dates for codes

2. **Admin Invitation System:**
   - Admins can invite new admins via email
   - Invitation links with unique tokens
   - Automatic role assignment upon acceptance

3. **Role-Based Access:**
   - Different admin roles (super admin, moderator, etc.)
   - Different invitation codes for different roles

---

## 🐛 Troubleshooting

### Demo Users Not Logging In

**Problem:** "Invalid login credentials" error when using demo accounts.

**Solutions:**
1. **Check if users exist in Supabase Auth:**
   - Go to **Authentication** → **Users**
   - Verify demo users exist
   - Check if emails are confirmed

2. **Reinitialize Demo Users:**
   ```bash
   # Clear localStorage
   localStorage.clear();
   
   # Refresh page
   # Demo users will be recreated on next load
   ```

3. **Manually Create Users:**
   - Create users in Supabase Dashboard
   - Use the init endpoint to create profiles

4. **Check Passwords:**
   - Verify passwords match exactly
   - Student/Owner: `123456`
   - Admin: `akash97`

### Email Not Sending

**Problem:** Password reset emails or confirmation emails not being sent.

**Solutions:**
1. **Check SMTP Configuration:**
   - Verify SMTP settings are correct
   - Test SMTP credentials
   - Check email provider limits

2. **Check Supabase Logs:**
   - Go to **Logs** → **Auth Logs**
   - Look for email delivery errors
   - Check rate limits

3. **For Development:**
   - Use auto-confirm (current setup)
   - Check Supabase's email testing feature
   - Use a service like Mailtrap for testing

### Role Mismatch Error

**Problem:** "This account is registered as X, not Y" error.

**Solutions:**
1. **Check User Profile:**
   - Verify user's role in KV store
   - Ensure role matches selected role on login

2. **Update User Role:**
   - Use Supabase Dashboard to check user metadata
   - Update profile in database if needed

3. **Recreate User:**
   - Delete user from Supabase Auth
   - Delete profile from KV store
   - Sign up again with correct role

### Profile Not Found

**Problem:** "Profile not found" error after login.

**Solutions:**
1. **Check KV Store:**
   - Verify user profile exists in `kv_store_2c39c550` table
   - Check that profile has correct `id` matching user ID

2. **Auto-Create Profile:**
   - The updated code now auto-creates profiles if missing
   - Check logs for profile creation

3. **Manual Profile Creation:**
   - Use the signup endpoint to create profile
   - Or manually insert into KV store

---

## 📚 Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Email Configuration](https://supabase.com/docs/guides/auth/auth-smtp)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Password Reset Guide](https://supabase.com/docs/guides/auth/auth-password-reset)

---

## ✅ Checklist

- [ ] Supabase project created
- [ ] Edge Functions deployed
- [ ] Email configuration set up (SMTP or auto-confirm)
- [ ] Demo users created and verified
- [ ] Password reset tested
- [ ] Admin invitation code documented
- [ ] Redirect URLs configured
- [ ] Email templates customized (optional)

---

**Last Updated:** 2024
**Maintained by:** PG Locator Development Team

