import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Auth middleware
const requireAuth = async (c: any, next: any) => {
  const accessToken = c.req.header('Authorization')?.split(' ')[1];
  
  if (!accessToken) {
    return c.json({ error: 'Unauthorized - No token provided' }, 401);
  }

  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user) {
    console.log('Auth error:', error?.message);
    return c.json({ error: 'Unauthorized - Invalid token' }, 401);
  }

  c.set('userId', user.id);
  c.set('userEmail', user.email);
  await next();
};

// Health check endpoint
app.get("/make-server-2c39c550/health", (c) => {
  return c.json({ status: "ok" });
});

// ===== INITIALIZE DEMO USERS =====
app.post("/make-server-2c39c550/init-demo-users", async (c) => {
  try {
    const demoUsers = [
      {
        email: 'teststuff677+test@gmail.com',
        password: '123456',
        name: 'Demo Student',
        role: 'student',
        course: 'Computer Science',
        rollNo: 'ADTU2024001',
        gender: 'male',
      },
      {
        email: 'teststuff677+test1@gmail.com',
        password: '123456',
        name: 'Demo Owner',
        role: 'owner',
        phone: '+91 98765 43210',
        businessName: 'Premium PG Services',
      },
      {
        email: 'teststuff677@gmail.com',
        password: 'akash97',
        name: 'Admin User',
        role: 'admin',
      },
    ];

    const results = [];

    for (const user of demoUsers) {
      try {
        // Check if user exists in Supabase Auth by email
        const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
        
        let existingAuthUser = null;
        if (!listError && authUsers?.users) {
          existingAuthUser = authUsers.users.find((u: any) => u.email === user.email);
        }

        // Check if profile exists in KV store
        const allProfiles = await kv.getByPrefix(`user:`) || [];
        const existingProfile = allProfiles.find((profile: any) => profile.email === user.email);

        if (existingAuthUser) {
          // User exists in Supabase Auth
          const userId = existingAuthUser.id;
          
          // Update password to ensure it matches
          try {
            await supabase.auth.admin.updateUserById(userId, {
              password: user.password,
              email_confirm: true, // Ensure email is confirmed
            });
          } catch (updateError) {
            console.log(`Warning: Could not update password for ${user.email}:`, updateError);
          }

          // Check if profile exists in KV store
          if (!existingProfile) {
            // Create profile in KV store
            const { password, ...profileData } = user;
            const profile = {
              id: userId,
              ...profileData,
              createdAt: new Date().toISOString(),
            };
            await kv.set(`user:${userId}`, profile);
            results.push({ email: user.email, status: 'profile_created', userId });
          } else {
            // Update profile to ensure it matches
            const { password, ...profileData } = user;
            const profile = {
              id: userId,
              ...existingProfile, // Keep existing data
              ...profileData, // Update with demo data
              id: userId, // Ensure ID matches
            };
            await kv.set(`user:${userId}`, profile);
            results.push({ email: user.email, status: 'updated', userId });
          }
        } else {
          // User doesn't exist in Supabase Auth, create new user
          const { data, error } = await supabase.auth.admin.createUser({
            email: user.email,
            password: user.password,
            email_confirm: true, // Auto-confirm email
            user_metadata: { name: user.name },
          });

          if (error) {
            // If user already exists (race condition), try to get it
            if (error.message.includes('already registered')) {
              const { data: authUsers2 } = await supabase.auth.admin.listUsers();
              const existingUser = authUsers2?.users?.find((u: any) => u.email === user.email);
              if (existingUser) {
                // Update password and create/update profile
                await supabase.auth.admin.updateUserById(existingUser.id, {
                  password: user.password,
                  email_confirm: true,
                });
                const { password, ...profileData } = user;
                const profile = {
                  id: existingUser.id,
                  ...profileData,
                  createdAt: new Date().toISOString(),
                };
                await kv.set(`user:${existingUser.id}`, profile);
                results.push({ email: user.email, status: 'created_after_race', userId: existingUser.id });
                continue;
              }
            }
            console.log(`Error creating user ${user.email}:`, error.message);
            results.push({ email: user.email, status: 'error', error: error.message });
            continue;
          }

          if (data.user) {
            // Store user profile in KV store
            const { password, ...profileData } = user;
            const profile = {
              id: data.user.id,
              ...profileData,
              createdAt: new Date().toISOString(),
            };

            await kv.set(`user:${data.user.id}`, profile);
            results.push({ email: user.email, status: 'created', userId: data.user.id });
          }
        }
      } catch (err) {
        console.error(`Error processing user ${user.email}:`, err);
        results.push({ email: user.email, status: 'error', error: String(err) });
      }
    }

    return c.json({ message: 'Demo users initialization complete', results });
  } catch (error) {
    console.error('Error initializing demo users:', error);
    return c.json({ error: 'Failed to initialize demo users' }, 500);
  }
});

// ===== INITIALIZE SAMPLE DATA =====
app.post("/make-server-2c39c550/init-data", async (c) => {
  try {
    const samplePGs = [
      {
        id: '1',
        name: 'ADTU Comfort Stay',
        description: 'Premium PG accommodation with modern amenities, just 5 minutes walk from campus. Fully furnished rooms with attached bathrooms.',
        price: 8500,
        location: 'Panikhaiti, Near ADTU Gate 1',
        distance: 0.5,
        gender: 'male',
        images: [
          'https://images.unsplash.com/photo-1668089677938-b52086753f77?w=800',
          'https://images.unsplash.com/photo-1709805619372-40de3f158e83?w=800',
          'https://images.unsplash.com/photo-1579632151052-92f741fb9b79?w=800',
        ],
        amenities: ['WiFi', 'AC', 'Meals', 'Laundry', 'Security'],
        rating: 4.5,
        reviews: 24,
        verified: true,
        ownerName: 'Rajesh Kumar',
        ownerPhone: '+91 98765 43210',
        roomTypes: [
          { type: 'Single', price: 8500, available: 2 },
          { type: 'Double', price: 6500, available: 3 },
        ],
      },
      {
        id: '2',
        name: 'Scholar\'s Den',
        description: 'Affordable and comfortable accommodation for female students. Safe neighborhood with 24/7 security.',
        price: 7000,
        location: 'Amingaon, 1.2 km from ADTU',
        distance: 1.2,
        gender: 'female',
        images: [
          'https://images.unsplash.com/photo-1579632151052-92f741fb9b79?w=800',
          'https://images.unsplash.com/photo-1761818645928-47e5dad8ec76?w=800',
          'https://images.unsplash.com/photo-1618831352005-83a8a8b65c6d?w=800',
        ],
        amenities: ['WiFi', 'Meals', 'Laundry', 'Security'],
        rating: 4.7,
        reviews: 31,
        verified: true,
        ownerName: 'Priya Sharma',
        ownerPhone: '+91 98765 43211',
        roomTypes: [
          { type: 'Single', price: 7000, available: 1 },
          { type: 'Double', price: 5500, available: 4 },
          { type: 'Triple', price: 4500, available: 2 },
        ],
      },
      {
        id: '3',
        name: 'Campus View Residency',
        description: 'Spacious rooms with excellent facilities. Close to local markets and public transport.',
        price: 9000,
        location: 'Khanapara, Near ADTU',
        distance: 0.8,
        gender: 'both',
        images: [
          'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800',
          'https://images.unsplash.com/photo-1668089677938-b52086753f77?w=800',
          'https://images.unsplash.com/photo-1709805619372-40de3f158e83?w=800',
        ],
        amenities: ['WiFi', 'AC', 'Meals', 'Security'],
        rating: 4.3,
        reviews: 18,
        verified: true,
        ownerName: 'Amit Borah',
        ownerPhone: '+91 98765 43212',
        roomTypes: [
          { type: 'Single', price: 9000, available: 3 },
          { type: 'Double', price: 7000, available: 2 },
        ],
      },
      {
        id: '4',
        name: 'Green Valley PG',
        description: 'Peaceful environment with home-cooked meals. Ideal for students who prefer a quiet study atmosphere.',
        price: 6500,
        location: 'Jalukbari, 2 km from ADTU',
        distance: 2.0,
        gender: 'male',
        images: [
          'https://images.unsplash.com/photo-1618831352005-83a8a8b65c6d?w=800',
          'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800',
          'https://images.unsplash.com/photo-1579632151052-92f741fb9b79?w=800',
        ],
        amenities: ['WiFi', 'Meals', 'Laundry'],
        rating: 4.1,
        reviews: 12,
        verified: false,
        ownerName: 'Suresh Das',
        ownerPhone: '+91 98765 43213',
        roomTypes: [
          { type: 'Double', price: 6500, available: 5 },
          { type: 'Triple', price: 5000, available: 3 },
        ],
      },
      {
        id: '5',
        name: 'Elite Student Housing',
        description: 'Premium accommodation with gym, study room, and recreational facilities. Perfect for serious students.',
        price: 10500,
        location: 'Panikhaiti, Adjacent to ADTU',
        distance: 0.3,
        gender: 'female',
        images: [
          'https://images.unsplash.com/photo-1761818645928-47e5dad8ec76?w=800',
          'https://images.unsplash.com/photo-1668089677938-b52086753f77?w=800',
          'https://images.unsplash.com/photo-1709805619372-40de3f158e83?w=800',
        ],
        amenities: ['WiFi', 'AC', 'Meals', 'Laundry', 'Security'],
        rating: 4.8,
        reviews: 42,
        verified: true,
        ownerName: 'Anjali Devi',
        ownerPhone: '+91 98765 43214',
        roomTypes: [
          { type: 'Single', price: 10500, available: 2 },
          { type: 'Double', price: 8000, available: 1 },
        ],
      },
      {
        id: '6',
        name: 'Budget Student Stay',
        description: 'Affordable option for students on a budget. Basic amenities with good connectivity to campus.',
        price: 5500,
        location: 'Amingaon, 1.5 km from ADTU',
        distance: 1.5,
        gender: 'both',
        images: [
          'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800',
          'https://images.unsplash.com/photo-1618831352005-83a8a8b65c6d?w=800',
          'https://images.unsplash.com/photo-1579632151052-92f741fb9b79?w=800',
        ],
        amenities: ['WiFi', 'Meals'],
        rating: 3.9,
        reviews: 8,
        verified: false,
        ownerName: 'Ramesh Saikia',
        ownerPhone: '+91 98765 43215',
        roomTypes: [
          { type: 'Double', price: 5500, available: 6 },
          { type: 'Triple', price: 4200, available: 4 },
        ],
      },
    ];

    // Store each PG
    for (const pg of samplePGs) {
      await kv.set(`pg:${pg.id}`, pg);
    }

    return c.json({ message: 'Sample data initialized successfully', count: samplePGs.length });
  } catch (error) {
    console.error('Error initializing data:', error);
    return c.json({ error: 'Failed to initialize data' }, 500);
  }
});

// ===== USER SIGNUP ROUTE =====
app.post("/make-server-2c39c550/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, role, ...metadata } = body;

    if (!email || !password || !name || !role) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    // Validate role
    if (!['student', 'owner', 'admin'].includes(role)) {
      return c.json({ error: 'Invalid role' }, 400);
    }

    // Check if user already exists in Supabase Auth
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    if (!listError && authUsers?.users) {
      const existingUser = authUsers.users.find((u: any) => u.email === email);
      if (existingUser) {
        return c.json({ error: 'User with this email already exists' }, 400);
      }
    }

    // Check if profile exists in KV store (by email)
    const allProfiles = await kv.getByPrefix(`user:`) || [];
    const existingProfile = allProfiles.find((profile: any) => profile.email === email);
    if (existingProfile) {
      return c.json({ error: 'User with this email already exists' }, 400);
    }

    // Validate admin code if role is admin
    if (role === 'admin' && metadata.adminCode !== 'ADTU-ADMIN-2024') {
      return c.json({ error: 'Invalid admin invitation code' }, 400);
    }

    // Create user with Supabase Auth
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm since email server isn't configured
      user_metadata: { name, role },
    });

    if (error) {
      console.log('Signup error:', error.message);
      // Check if it's a duplicate error
      if (error.message.includes('already registered') || error.message.includes('already exists')) {
        return c.json({ error: 'User with this email already exists' }, 400);
      }
      return c.json({ error: error.message }, 400);
    }

    if (!data.user) {
      return c.json({ error: 'Failed to create user' }, 500);
    }

    // Store user profile in KV store
    const { adminCode, ...profileMetadata } = metadata; // Remove adminCode from profile
    const profile = {
      id: data.user.id,
      email,
      name,
      role,
      ...profileMetadata,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`user:${data.user.id}`, profile);

    return c.json({ message: 'User created successfully', userId: data.user.id });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// ===== GET USER PROFILE =====
app.get("/make-server-2c39c550/user/profile", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userEmail = c.get('userEmail');
    
    // Try to get profile by userId first
    let profile = await kv.get(`user:${userId}`);

    // If profile doesn't exist, try to find by email (for migration/compatibility)
    if (!profile) {
      const allProfiles = await kv.getByPrefix(`user:`) || [];
      profile = allProfiles.find((p: any) => p.email === userEmail);
      
      // If found by email but ID doesn't match, update it
      if (profile && profile.id !== userId) {
        // Create new profile with correct ID
        profile = {
          ...profile,
          id: userId,
          email: userEmail,
        };
        await kv.set(`user:${userId}`, profile);
      }
    }

    // If still no profile, create a basic one from auth user
    if (!profile) {
      const { data: { user } } = await supabase.auth.getUser(c.req.header('Authorization')?.split(' ')[1] || '');
      if (user) {
        profile = {
          id: user.id,
          email: user.email || userEmail,
          name: user.user_metadata?.name || 'User',
          role: user.user_metadata?.role || 'student',
          createdAt: new Date().toISOString(),
        };
        await kv.set(`user:${userId}`, profile);
      }
    }

    if (!profile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    return c.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// ===== GET ALL PGS =====
app.get("/make-server-2c39c550/pgs", async (c) => {
  try {
    const pgs = await kv.getByPrefix('pg:');
    return c.json(pgs || []);
  } catch (error) {
    console.error('Error fetching PGs:', error);
    return c.json({ error: 'Failed to fetch PGs' }, 500);
  }
});

// ===== GET SINGLE PG =====
app.get("/make-server-2c39c550/pgs/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const pg = await kv.get(`pg:${id}`);

    if (!pg) {
      return c.json({ error: 'PG not found' }, 404);
    }

    return c.json(pg);
  } catch (error) {
    console.error('Error fetching PG:', error);
    return c.json({ error: 'Failed to fetch PG' }, 500);
  }
});

// ===== GET USER FAVORITES =====
app.get("/make-server-2c39c550/user/favorites", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const favorites = await kv.get(`favorites:${userId}`);
    
    if (!favorites || !Array.isArray(favorites)) {
      return c.json([]);
    }

    // Fetch full PG details for each favorite
    const pgPromises = favorites.map(id => kv.get(`pg:${id}`));
    const pgs = await Promise.all(pgPromises);
    
    return c.json(pgs.filter(pg => pg !== null));
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return c.json({ error: 'Failed to fetch favorites' }, 500);
  }
});

// ===== ADD TO FAVORITES =====
app.post("/make-server-2c39c550/user/favorites/:pgId", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const pgId = c.req.param('pgId');

    let favorites = await kv.get(`favorites:${userId}`) || [];
    
    if (!Array.isArray(favorites)) {
      favorites = [];
    }

    if (!favorites.includes(pgId)) {
      favorites.push(pgId);
      await kv.set(`favorites:${userId}`, favorites);
    }

    return c.json({ message: 'Added to favorites' });
  } catch (error) {
    console.error('Error adding favorite:', error);
    return c.json({ error: 'Failed to add favorite' }, 500);
  }
});

// ===== REMOVE FROM FAVORITES =====
app.delete("/make-server-2c39c550/user/favorites/:pgId", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const pgId = c.req.param('pgId');

    let favorites = await kv.get(`favorites:${userId}`) || [];
    
    if (Array.isArray(favorites)) {
      favorites = favorites.filter(id => id !== pgId);
      await kv.set(`favorites:${userId}`, favorites);
    }

    return c.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing favorite:', error);
    return c.json({ error: 'Failed to remove favorite' }, 500);
  }
});

// ===== CREATE BOOKING =====
app.post("/make-server-2c39c550/bookings", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { pgId, roomType, checkIn, duration, totalAmount } = body;

    if (!pgId || !roomType || !checkIn || !duration) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const bookingId = `booking-${Date.now()}-${userId}`;
    const booking = {
      id: bookingId,
      userId,
      pgId,
      roomType,
      checkIn,
      duration,
      totalAmount,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    };

    await kv.set(`booking:${bookingId}`, booking);
    
    // Also maintain user bookings list
    let userBookings = await kv.get(`user-bookings:${userId}`) || [];
    if (!Array.isArray(userBookings)) {
      userBookings = [];
    }
    userBookings.push(bookingId);
    await kv.set(`user-bookings:${userId}`, userBookings);

    return c.json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    return c.json({ error: 'Failed to create booking' }, 500);
  }
});

// ===== GET USER BOOKINGS =====
app.get("/make-server-2c39c550/user/bookings", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const bookingIds = await kv.get(`user-bookings:${userId}`) || [];
    
    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return c.json([]);
    }

    const bookingPromises = bookingIds.map(id => kv.get(`booking:${id}`));
    const bookings = await Promise.all(bookingPromises);
    
    // Fetch PG details for each booking
    const bookingsWithPG = await Promise.all(
      bookings.filter(b => b !== null).map(async (booking) => {
        const pg = await kv.get(`pg:${booking.pgId}`);
        return { ...booking, pg };
      })
    );

    return c.json(bookingsWithPG);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

// ===== ADD REVIEW =====
app.post("/make-server-2c39c550/reviews", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    const { pgId, rating, comment } = body;

    if (!pgId || !rating) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const reviewId = `review-${Date.now()}-${userId}`;
    const review = {
      id: reviewId,
      userId,
      pgId,
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };

    // Get user profile for reviewer name
    const userProfile = await kv.get(`user:${userId}`);
    review.userName = userProfile?.name || 'Anonymous';

    await kv.set(`review:${reviewId}`, review);
    
    // Add to PG reviews list
    let pgReviews = await kv.get(`pg-reviews:${pgId}`) || [];
    if (!Array.isArray(pgReviews)) {
      pgReviews = [];
    }
    pgReviews.push(reviewId);
    await kv.set(`pg-reviews:${pgId}`, pgReviews);

    return c.json({ message: 'Review added successfully', review });
  } catch (error) {
    console.error('Error adding review:', error);
    return c.json({ error: 'Failed to add review' }, 500);
  }
});

// ===== GET PG REVIEWS =====
app.get("/make-server-2c39c550/pgs/:pgId/reviews", async (c) => {
  try {
    const pgId = c.req.param('pgId');
    const reviewIds = await kv.get(`pg-reviews:${pgId}`) || [];
    
    if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
      return c.json([]);
    }

    const reviewPromises = reviewIds.map(id => kv.get(`review:${id}`));
    const reviews = await Promise.all(reviewPromises);
    
    return c.json(reviews.filter(r => r !== null));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

// ===== UPDATE USER PROFILE =====
app.put("/make-server-2c39c550/user/profile", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    
    const currentProfile = await kv.get(`user:${userId}`);
    if (!currentProfile) {
      return c.json({ error: 'Profile not found' }, 404);
    }

    const updatedProfile = {
      ...currentProfile,
      ...body,
      id: userId, // Ensure ID doesn't change
      email: currentProfile.email, // Ensure email doesn't change
      role: currentProfile.role, // Ensure role doesn't change
    };

    await kv.set(`user:${userId}`, updatedProfile);
    return c.json(updatedProfile);
  } catch (error) {
    console.error('Error updating profile:', error);
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

// ===== OWNER ENDPOINTS =====

// Get owner stats
app.get("/make-server-2c39c550/owner/stats", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    
    // Get all PGs owned by this user
    const allPGs = await kv.getByPrefix('pg:') || [];
    const ownerPGs = allPGs.filter((pg: any) => pg.ownerId === userId);
    
    // Get all bookings
    const allBookings = await kv.getByPrefix('booking:') || [];
    const ownerBookings = allBookings.filter((booking: any) => {
      const pg = ownerPGs.find((p: any) => p.id === booking.pgId);
      return pg !== undefined;
    });

    // Calculate stats
    const pendingBookings = ownerBookings.filter((b: any) => b.status === 'pending').length;
    const monthlyEarnings = ownerBookings
      .filter((b: any) => {
        const bookingDate = new Date(b.createdAt);
        const now = new Date();
        return bookingDate.getMonth() === now.getMonth() && 
               bookingDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);

    const totalEarnings = ownerBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
    
    // Calculate average rating
    let totalRating = 0;
    let ratingCount = 0;
    for (const pg of ownerPGs) {
      if (pg.rating) {
        totalRating += pg.rating;
        ratingCount++;
      }
    }
    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    return c.json({
      totalPGs: ownerPGs.length,
      totalBookings: ownerBookings.length,
      pendingBookings,
      monthlyEarnings,
      totalEarnings,
      averageRating,
    });
  } catch (error) {
    console.error('Error fetching owner stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// Create new PG listing
app.post("/make-server-2c39c550/owner/pgs", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const body = await c.req.json();
    
    const pgId = `pg-${Date.now()}-${userId}`;
    const pg = {
      id: pgId,
      ...body,
      ownerId: userId,
      verified: false,
      verificationStatus: 'pending',
      rating: 0,
      reviews: 0,
      createdAt: new Date().toISOString(),
    };

    await kv.set(`pg:${pgId}`, pg);
    
    return c.json({ message: 'PG created successfully', pg });
  } catch (error) {
    console.error('Error creating PG:', error);
    return c.json({ error: 'Failed to create PG' }, 500);
  }
});

// Get owner's PG listings
app.get("/make-server-2c39c550/owner/pgs", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const allPGs = await kv.getByPrefix('pg:') || [];
    const ownerPGs = allPGs.filter((pg: any) => pg.ownerId === userId);
    
    return c.json(ownerPGs);
  } catch (error) {
    console.error('Error fetching owner PGs:', error);
    return c.json({ error: 'Failed to fetch PGs' }, 500);
  }
});

// Update PG listing
app.put("/make-server-2c39c550/owner/pgs/:id", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const pgId = c.req.param('id');
    const body = await c.req.json();
    
    const pg = await kv.get(`pg:${pgId}`);
    if (!pg) {
      return c.json({ error: 'PG not found' }, 404);
    }
    
    if (pg.ownerId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const updatedPG = {
      ...pg,
      ...body,
      id: pgId,
      ownerId: userId,
    };

    await kv.set(`pg:${pgId}`, updatedPG);
    return c.json({ message: 'PG updated successfully', pg: updatedPG });
  } catch (error) {
    console.error('Error updating PG:', error);
    return c.json({ error: 'Failed to update PG' }, 500);
  }
});

// Delete PG listing
app.delete("/make-server-2c39c550/owner/pgs/:id", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const pgId = c.req.param('id');
    
    const pg = await kv.get(`pg:${pgId}`);
    if (!pg) {
      return c.json({ error: 'PG not found' }, 404);
    }
    
    if (pg.ownerId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    await kv.del(`pg:${pgId}`);
    return c.json({ message: 'PG deleted successfully' });
  } catch (error) {
    console.error('Error deleting PG:', error);
    return c.json({ error: 'Failed to delete PG' }, 500);
  }
});

// Get owner's bookings
app.get("/make-server-2c39c550/owner/bookings", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    
    // Get all PGs owned by this user
    const allPGs = await kv.getByPrefix('pg:') || [];
    const ownerPGs = allPGs.filter((pg: any) => pg.ownerId === userId);
    const ownerPGIds = ownerPGs.map((pg: any) => pg.id);
    
    // Get all bookings
    const allBookings = await kv.getByPrefix('booking:') || [];
    const ownerBookings = allBookings.filter((booking: any) => 
      ownerPGIds.includes(booking.pgId)
    );

    // Enrich bookings with PG and user info
    const enrichedBookings = await Promise.all(
      ownerBookings.map(async (booking: any) => {
        const pg = await kv.get(`pg:${booking.pgId}`);
        const user = await kv.get(`user:${booking.userId}`);
        return {
          ...booking,
          pg,
          user,
        };
      })
    );

    return c.json(enrichedBookings);
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

// Update booking status
app.put("/make-server-2c39c550/owner/bookings/:id", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const bookingId = c.req.param('id');
    const body = await c.req.json();
    
    const booking = await kv.get(`booking:${bookingId}`);
    if (!booking) {
      return c.json({ error: 'Booking not found' }, 404);
    }
    
    // Verify that this booking belongs to one of the owner's PGs
    const pg = await kv.get(`pg:${booking.pgId}`);
    if (!pg || pg.ownerId !== userId) {
      return c.json({ error: 'Unauthorized' }, 403);
    }

    const updatedBooking = {
      ...booking,
      ...body,
      id: bookingId,
    };

    await kv.set(`booking:${bookingId}`, updatedBooking);
    return c.json({ message: 'Booking updated successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return c.json({ error: 'Failed to update booking' }, 500);
  }
});

// Get owner's reviews
app.get("/make-server-2c39c550/owner/reviews", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    
    // Get all PGs owned by this user
    const allPGs = await kv.getByPrefix('pg:') || [];
    const ownerPGs = allPGs.filter((pg: any) => pg.ownerId === userId);
    
    // Get all reviews for these PGs
    const allReviews = [];
    for (const pg of ownerPGs) {
      const reviewIds = await kv.get(`pg-reviews:${pg.id}`) || [];
      if (Array.isArray(reviewIds)) {
        for (const reviewId of reviewIds) {
          const review = await kv.get(`review:${reviewId}`);
          if (review) {
            allReviews.push({
              ...review,
              pgName: pg.name,
            });
          }
        }
      }
    }

    return c.json(allReviews);
  } catch (error) {
    console.error('Error fetching owner reviews:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

// ===== ADMIN ENDPOINTS =====

// Get admin stats
app.get("/make-server-2c39c550/admin/stats", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);
    
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }

    const allPGs = await kv.getByPrefix('pg:') || [];
    const allUsers = await kv.getByPrefix('user:') || [];
    const allBookings = await kv.getByPrefix('booking:') || [];

    const pendingVerification = allPGs.filter((pg: any) => !pg.verified && pg.verificationStatus !== 'rejected').length;
    const verifiedPGs = allPGs.filter((pg: any) => pg.verified).length;
    const rejectedPGs = allPGs.filter((pg: any) => pg.verificationStatus === 'rejected').length;

    return c.json({
      totalPGs: allPGs.length,
      pendingVerification,
      verifiedPGs,
      rejectedPGs,
      totalUsers: allUsers.length,
      totalBookings: allBookings.length,
      revenueThisMonth: 0,
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return c.json({ error: 'Failed to fetch stats' }, 500);
  }
});

// Get all PGs (admin)
app.get("/make-server-2c39c550/admin/pgs", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);
    
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }

    const allPGs = await kv.getByPrefix('pg:') || [];
    return c.json(allPGs);
  } catch (error) {
    console.error('Error fetching PGs:', error);
    return c.json({ error: 'Failed to fetch PGs' }, 500);
  }
});

// Verify PG listing
app.post("/make-server-2c39c550/admin/pgs/:id/verify", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);
    
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }

    const pgId = c.req.param('id');
    const pg = await kv.get(`pg:${pgId}`);
    
    if (!pg) {
      return c.json({ error: 'PG not found' }, 404);
    }

    const updatedPG = {
      ...pg,
      verified: true,
      verificationStatus: 'verified',
      verifiedAt: new Date().toISOString(),
      verifiedBy: userId,
    };

    await kv.set(`pg:${pgId}`, updatedPG);
    return c.json({ message: 'PG verified successfully', pg: updatedPG });
  } catch (error) {
    console.error('Error verifying PG:', error);
    return c.json({ error: 'Failed to verify PG' }, 500);
  }
});

// Reject PG listing
app.post("/make-server-2c39c550/admin/pgs/:id/reject", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);
    
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }

    const pgId = c.req.param('id');
    const body = await c.req.json();
    const pg = await kv.get(`pg:${pgId}`);
    
    if (!pg) {
      return c.json({ error: 'PG not found' }, 404);
    }

    const updatedPG = {
      ...pg,
      verified: false,
      verificationStatus: 'rejected',
      rejectionReason: body.reason || 'No reason provided',
      rejectedAt: new Date().toISOString(),
      rejectedBy: userId,
    };

    await kv.set(`pg:${pgId}`, updatedPG);
    return c.json({ message: 'PG rejected', pg: updatedPG });
  } catch (error) {
    console.error('Error rejecting PG:', error);
    return c.json({ error: 'Failed to reject PG' }, 500);
  }
});

// Get all users (admin)
app.get("/make-server-2c39c550/admin/users", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);
    
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }

    const allUsers = await kv.getByPrefix('user:') || [];
    return c.json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Toggle user status
app.post("/make-server-2c39c550/admin/users/:id/toggle-status", requireAuth, async (c) => {
  try {
    const adminId = c.get('userId');
    const adminProfile = await kv.get(`user:${adminId}`);
    
    if (adminProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }

    const userId = c.req.param('id');
    const body = await c.req.json();
    const user = await kv.get(`user:${userId}`);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }

    const updatedUser = {
      ...user,
      isActive: body.isActive,
    };

    await kv.set(`user:${userId}`, updatedUser);
    return c.json({ message: 'User status updated', user: updatedUser });
  } catch (error) {
    console.error('Error toggling user status:', error);
    return c.json({ error: 'Failed to toggle user status' }, 500);
  }
});

// Get analytics (admin)
app.get("/make-server-2c39c550/admin/analytics", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);
    
    if (userProfile?.role !== 'admin') {
      return c.json({ error: 'Unauthorized - Admin access required' }, 403);
    }

    const allPGs = await kv.getByPrefix('pg:') || [];
    const allUsers = await kv.getByPrefix('user:') || [];
    const allBookings = await kv.getByPrefix('booking:') || [];

    // Calculate analytics
    const totalRevenue = allBookings.reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
    const userDistribution = {
      students: allUsers.filter((u: any) => u.role === 'student').length,
      owners: allUsers.filter((u: any) => u.role === 'owner').length,
      admins: allUsers.filter((u: any) => u.role === 'admin').length,
    };

    // Popular amenities
    const amenityCount: Record<string, number> = {};
    allPGs.forEach((pg: any) => {
      if (pg.amenities && Array.isArray(pg.amenities)) {
        pg.amenities.forEach((amenity: string) => {
          amenityCount[amenity] = (amenityCount[amenity] || 0) + 1;
        });
      }
    });
    const popularAmenities = Object.entries(amenityCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Top PGs (mock data for now)
    const topPGs = allPGs
      .filter((pg: any) => pg.verified)
      .slice(0, 5)
      .map((pg: any) => ({
        id: pg.id,
        name: pg.name,
        bookings: 0,
        revenue: 0,
      }));

    return c.json({
      totalRevenue,
      revenueGrowth: 0,
      totalBookings: allBookings.length,
      bookingsGrowth: 0,
      newUsers: allUsers.length,
      userGrowth: 0,
      activePGs: allPGs.filter((pg: any) => pg.verified).length,
      pgGrowth: 0,
      popularAmenities,
      topPGs,
      userDistribution,
      monthlyData: [],
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return c.json({ error: 'Failed to fetch analytics' }, 500);
  }
});

Deno.serve(app.fetch);