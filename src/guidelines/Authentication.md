# PG Locator - Authentication Setup Guide

## Overview

The PG Locator app uses **Supabase Authentication** for secure user management with support for:
- Email/Password authentication
- Google OAuth (requires additional setup)
- Password reset via email
- Role-based access (Student, Owner, Admin)

## Authentication Flow

1. **Splash Screen** → First-time users see animated splash
2. **Onboarding** → Introduction to app features
3. **Role Selection** → Choose between Student, Owner, or Admin
4. **Auth Screen** → Login or Sign up based on selected role
5. **Dashboard** → Role-specific interface after successful authentication

## User Roles

### Student
- Browse and search PG listings
- Add favorites
- Book accommodations
- Write reviews
- View booking history

### Owner
- List and manage properties (coming soon)
- View bookings
- Respond to reviews

### Admin
- Verify PG listings (coming soon)
- Manage users
- Moderate content
- Access: Use admin code `ADTU-ADMIN-2024` during signup

## Google OAuth Setup (Optional)

To enable "Continue with Google" login:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click configure
4. Follow the setup instructions at: https://supabase.com/docs/guides/auth/social-login/auth-google
5. You'll need to:
   - Create a Google Cloud project
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs
   - Copy Client ID and Client Secret to Supabase

**Note:** Without completing this setup, the Google login button will show an error "provider is not enabled".

## Email Configuration

The app is configured with `email_confirm: true` which auto-confirms user emails since a custom email server hasn't been configured.

For production, you should:
1. Configure a custom SMTP server in Supabase
2. Set up email templates
3. Remove `email_confirm: true` from signup endpoint

## Security Features

- ✅ JWT-based session management
- ✅ Automatic token refresh
- ✅ Session persistence
- ✅ Password validation (min 6 characters)
- ✅ Email format validation
- ✅ Role-based access control
- ✅ Secure password reset flow

## API Endpoints

All authentication endpoints are prefixed with `/make-server-2c39c550/`:

- `POST /auth/signup` - Create new user account
- `GET /user/profile` - Get authenticated user profile
- Auth handled by Supabase SDK for login/logout

## Demo Accounts

Pre-configured demo accounts are available for immediate testing:

### Student Account
- **Email**: `teststuff677+test@gmail.com`
- **Password**: `123456`
- **Profile**: Demo Student, Computer Science, Roll: ADTU2024001
- **Features**: Full access to PG browsing, favorites, bookings, and reviews

### Owner Account  
- **Email**: `teststuff677+test1@gmail.com`
- **Password**: `123456`
- **Profile**: Demo Owner, Premium PG Services
- **Features**: Property management dashboard (coming soon)

### Admin Account
- **Email**: `teststuff677@gmail.com`
- **Password**: `akash97`
- **Profile**: Admin User
- **Features**: Verification and moderation tools (coming soon)

### Quick Fill Feature
Look for the "⚡ Quick Fill Demo" button on the login form to automatically populate credentials based on your selected role!

## Troubleshooting

### "Unauthorized" errors
- Check if user is logged in
- Verify access token is being sent in Authorization header
- Ensure token hasn't expired (auto-refresh should handle this)

### "Provider is not enabled" (Google OAuth)
- Complete Google OAuth setup in Supabase dashboard
- See link above for full instructions

### Email not received (Password Reset)
- Check spam folder
- Ensure email server is configured in Supabase
- Check Supabase logs for email delivery status

## Data Storage

User profiles are stored in the KV store with the key pattern:
```
user:{userId} → { id, email, name, role, ...metadata }
```

This allows for flexible schema while maintaining type safety through TypeScript interfaces.
