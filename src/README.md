# 🏠 PG Locator - Premium Student Accommodation Finder

An elegant, full-featured web application for finding and booking Paying Guest (PG) accommodations near Assam Downtown University (ADTU). Built with modern web technologies and a focus on user experience.

---

## ⚡ Try it Now - Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **👨‍🎓 Student** | `teststuff677+test@gmail.com` | `123456` |
| **🏢 Owner** | `teststuff677+test1@gmail.com` | `123456` |
| **🛡️ Admin** | `teststuff677@gmail.com` | `akash97` |

💡 **Quick Tip**: Click "⚡ Quick Fill Demo" on the login form to auto-fill these credentials!

---

## ✨ Features

### 🎯 For Students
- **Smart Search & Filters**: Find PGs by price, distance, gender, and amenities
- **Interactive Listings**: Browse verified PG accommodations with beautiful image galleries
- **Favorites System**: Save your favorite PGs for easy comparison
- **Seamless Booking**: Book rooms with a simple, intuitive flow
- **Review System**: Read and write authentic reviews from fellow students
- **Booking Management**: Track active bookings and download invoices

### 🏢 For Property Owners
- **Property Management**: List and manage PG accommodations (coming soon)
- **Booking Dashboard**: View and manage student bookings
- **Analytics**: Track property performance and occupancy

### 🛡️ For Administrators
- **Verification System**: Verify and approve PG listings
- **User Management**: Oversee student and owner accounts
- **Content Moderation**: Ensure quality and authenticity

## 🎨 Design Philosophy

The app follows a **minimalist luxury** design language:
- **Color Palette**: Warm amber (#d97706) accents on neutral stone/white base
- **Typography**: Clean sans-serif with fluid hierarchy
- **Animations**: Smooth Motion (Framer Motion) transitions with spring physics
- **Layout**: 12-column responsive grid, mobile-first approach
- **3D Elements**: React Three Fiber for immersive visual experiences

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS v4** for styling
- **Motion (Framer Motion)** for smooth animations
- **Zustand** for state management
- **Lucide React** for icons

### Backend
- **Supabase** for authentication and database
- **Hono** web framework running on Supabase Edge Functions
- **KV Store** for flexible data storage

### UI Components
- Custom component library with shadcn/ui patterns
- **Sonner** for toast notifications
- **ImageWithFallback** for reliable image loading

## 🚀 Getting Started

### 🎯 Demo Credentials - Try it Now!

The app comes pre-configured with demo accounts for instant testing:

| Role | Email | Password |
|------|-------|----------|
| **Student** | `teststuff677+test@gmail.com` | `123456` |
| **Owner** | `teststuff677+test1@gmail.com` | `123456` |
| **Admin** | `teststuff677@gmail.com` | `akash97` |

💡 **Quick Tip**: Use the "⚡ Quick Fill Demo" button on the login form to auto-fill credentials!

### Prerequisites
- Modern web browser
- Internet connection
- Supabase project (authentication will be configured automatically)

### First Run

1. **Splash Screen** (3-5 seconds)
   - Animated location pin with floating particles
   - Asset preloading
   - Beautiful gradient backgrounds

2. **Onboarding** (3 slides)
   - Learn about features
   - Swipe or click navigation
   - Skip option available

3. **Role Selection**
   - Choose: Student, Owner, or Admin
   - Each role has a unique dashboard

4. **Authentication**
   - Sign up or login
   - Email/password or Google OAuth
   - Role-specific form fields
   - Demo credentials available for quick access

### Sample Data

The app automatically initializes with 6 sample PG listings:
- ADTU Comfort Stay (₹8,500/month, Male)
- Scholar's Den (₹7,000/month, Female)
- Campus View Residency (₹9,000/month, Both)
- Green Valley PG (₹6,500/month, Male)
- Elite Student Housing (₹10,500/month, Female)
- Budget Student Stay (₹5,500/month, Both)

## 🔐 Authentication

### Setup and Configuration

**⚠️ IMPORTANT:** Before using the app, please read the [Supabase Setup Guide](../SUPABASE_SETUP_GUIDE.md) to configure:
- Email settings (SMTP or auto-confirm)
- Demo users initialization
- Password reset configuration
- Admin invitation code system

### Creating an Account

**Student Signup:**
```
Required: Name, Email, Password, Course, Roll Number, Gender
Example: John Doe | john@example.com | CSE | 12345 | Male
```

**Owner Signup:**
```
Required: Name, Email, Password, Phone
Optional: Business Name
Example: Jane Smith | jane@example.com | +91 98765 43210
```

**Admin Signup:**
```
Required: Name, Email, Password, Admin Invitation Code
Admin Code: ADTU-ADMIN-2024
Note: Contact your system administrator to obtain the admin invitation code.
```

### Google OAuth Setup

To enable Google login:
1. Visit your Supabase dashboard
2. Go to Authentication → Providers → Google
3. Follow setup guide: https://supabase.com/docs/guides/auth/social-login/auth-google
4. Add OAuth credentials from Google Cloud Console

### Password Reset

The password reset functionality requires email configuration in Supabase. See the [Supabase Setup Guide](../SUPABASE_SETUP_GUIDE.md) for detailed instructions.

**For Development:**
- Email confirmation is automatically enabled (auto-confirm)
- Users can login immediately after signup
- Password reset emails work if SMTP is configured

**For Production:**
- Configure custom SMTP server
- Set up email templates
- Update signup endpoint to require email confirmation

## 📱 Key User Flows

### Student Journey: Finding a PG

1. **Login** as student
2. **Browse listings** on the home page
3. **Use filters**: Price range (₹0-20,000), Gender, Amenities (WiFi, AC, Meals, etc.)
4. **Search** by name or location
5. **View details**: Click any PG card to see full information
6. **Add to favorites**: Click the heart icon
7. **Book**: Select room type, check-in date, duration
8. **Confirm booking**: Review details and confirm
9. **Download invoice**: Get booking confirmation

### Leaving a Review

1. Go to **My Bookings**
2. Find your active or past booking
3. Click **Review** button
4. Rate (1-5 stars) and write comment
5. Submit review

## 🎭 Component Architecture

```
App.tsx (Main Router)
├── SplashScreen
├── OnboardingScreen
│   └── RoleSelection
├── AuthScreen
│   ├── LoginForm
│   ├── SignupForm
│   └── PasswordResetForm
└── Student Module
    ├── StudentHome
    ├── FavoritesPage
    ├── MyBookingsPage
    └── PGDetailsModal
```

## 🔌 API Endpoints

### Public Endpoints
- `GET /pgs` - List all PG accommodations
- `GET /pgs/:id` - Get single PG details
- `GET /pgs/:pgId/reviews` - Get reviews for a PG

### Authenticated Endpoints (require Bearer token)
- `POST /auth/signup` - Create user account
- `GET /user/profile` - Get user profile
- `GET /user/favorites` - Get user's favorite PGs
- `POST /user/favorites/:pgId` - Add PG to favorites
- `DELETE /user/favorites/:pgId` - Remove from favorites
- `POST /bookings` - Create booking
- `GET /user/bookings` - Get user's bookings
- `POST /reviews` - Submit a review

## 🎨 Customization

### Colors
Edit `/styles/globals.css` to change theme colors:
```css
:root {
  --primary: #d97706; /* Amber */
  --secondary: #78350f; /* Dark brown */
  --accent: #fbbf24; /* Light amber */
}
```

### Sample Data
Modify `/components/InitializeData.tsx` to add/edit PG listings.

### Animations
Adjust animation timing in component files using Motion variants:
```tsx
variants={{
  initial: { opacity: 0, y: 50 },
  animate: { opacity: 1, y: 0 },
}}
transition={{ duration: 0.5, ease: "easeOut" }}
```

## 📊 Data Models

### User Profile
```typescript
{
  id: string;
  email: string;
  name: string;
  role: 'student' | 'owner' | 'admin';
  phone?: string;
  avatar?: string;
  // Student specific
  course?: string;
  rollNo?: string;
  gender?: 'male' | 'female' | 'other';
  // Owner specific
  businessName?: string;
}
```

### PG Listing
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number; // per month
  location: string;
  distance: number; // km from ADTU
  gender: 'male' | 'female' | 'both';
  images: string[];
  amenities: string[];
  rating: number;
  reviews: number;
  verified: boolean;
  ownerName: string;
  ownerPhone: string;
  roomTypes: { type: string; price: number; available: number }[];
}
```

## 🐛 Troubleshooting

### Data not loading
- Check browser console for errors
- Verify Supabase Edge Functions are deployed
- Clear localStorage and refresh

### Can't login
- Verify credentials are correct
- Check if account was created successfully
- Try password reset flow

### Images not showing
- Images use Unsplash URLs which require internet
- ImageWithFallback component provides graceful degradation

## 🚀 Future Enhancements

- [ ] Real-time chat between students and owners
- [ ] Interactive 3D campus map with WebGL
- [ ] Payment gateway integration
- [ ] Push notifications for booking updates
- [ ] Mobile app (React Native)
- [ ] Owner dashboard with analytics
- [ ] Admin verification workflow
- [ ] Multi-language support
- [ ] Dark mode toggle

## 📄 License

This project is a demonstration/prototype application built for educational purposes.

## 🙏 Acknowledgments

- Design inspiration: Modern real estate and booking platforms
- 3D graphics: React Three Fiber community
- UI components: shadcn/ui patterns
- Icons: Lucide React
- Images: Unsplash

---

**Built with ❤️ for the ADTU student community**
