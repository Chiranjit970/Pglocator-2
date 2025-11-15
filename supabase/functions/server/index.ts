import { Hono, Context, Next } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { createClient } from "@supabase/supabase-js";
import * as kv from "./kv_store.ts";

// Provide a loose Deno declaration so TypeScript checks in non-Deno environments don't fail.
declare const Deno: any;

const app = new Hono();

// Small helper to safely read values set on the Hono context without triggering strict generic errors.
function getCtxValue<T = any>(c: Context, key: string): T | null {
  try {
    return ((c as any).get ? (c as any).get(key) : null) as T | null;
  } catch (e) {
    return null;
  }
}


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
const requireAuth = async (c: Context, next: Next) => {
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
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

// Diagnostic endpoint to check demo users status
app.get("/diagnose-demo-users", async (c) => {
  try {
    const demoEmails = [
      'teststuff677+test@gmail.com',
      'teststuff677+test1@gmail.com',
      'teststuff677@gmail.com',
    ];

    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      return c.json({ error: 'Failed to list users', details: listError.message }, 500);
    }

    const results = [];
    
    for (const email of demoEmails) {
      const authUser = authUsers?.users?.find((u: any) => u.email === email);
      const allProfiles = await kv.getByPrefix(`user:`) || [];
      const profile = allProfiles.find((p: any) => p.email === email);
      
      results.push({
        email,
        inAuth: !!authUser,
        authUserId: authUser?.id || null,
        emailConfirmed: authUser?.email_confirmed_at ? true : false,
        authMetadata: authUser?.user_metadata || null,
        inKVStore: !!profile,
        profileRole: profile?.role || null,
        profileId: profile?.id || null,
      });
    }

    return c.json({ 
      message: 'Demo users diagnostic',
      results,
      totalAuthUsers: authUsers?.users?.length || 0,
    });
  } catch (error) {
    console.error('Diagnostic error:', error);
    return c.json({ error: 'Failed to diagnose users', details: String(error) }, 500);
  }
});

// ===== INITIALIZE DEMO USERS =====
app.post("/init-demo-users", async (c) => {
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
        // Attempt to create the user directly
        const { data, error } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: { 
            name: user.name,
            role: user.role, // Store role in user_metadata for reference
          },
        });

        if (error) {
          if (error.message.includes('already registered') || error.message.includes('already exists')) {
            // User exists, so we'll update them
            // listUsers() doesn't accept email parameter, we need to get all users and filter
            const { data: usersResponse, error: listError } = await supabase.auth.admin.listUsers();
            
            if (listError) {
              console.error(`Error listing users for ${user.email}:`, listError);
              throw new Error(`Failed to list users: ${listError.message}`);
            }
            
            if (!usersResponse || !usersResponse.users) {
              throw new Error(`No users found in response`);
            }
            
            // Find user by email
            const existingUser = usersResponse.users.find((u: any) => u.email === user.email);
            
            if (!existingUser) {
              throw new Error(`User ${user.email} exists but could not be found in user list.`);
            }
            
            // Update password and ensure email is confirmed
            const { error: updateError } = await supabase.auth.admin.updateUserById(existingUser.id, {
              password: user.password,
              email_confirm: true,
              user_metadata: {
                ...existingUser.user_metadata,
                name: user.name,
                role: user.role, // Ensure role is in metadata
              },
            });
            
            if (updateError) {
              console.error(`Error updating user ${user.email}:`, updateError);
              // Continue anyway - password might already be correct
            } else {
              console.log(`Successfully updated user ${user.email} (${user.role})`);
            }

            // Create or update profile in KV store
            const { password, ...profileData } = user;
            const profile = {
              id: existingUser.id,
              ...profileData,
              createdAt: new Date().toISOString(),
            };
            await kv.set(`user:${existingUser.id}`, profile);
            results.push({ email: user.email, status: 'updated', userId: existingUser.id });


          } else {
            // Another error occurred
            console.error(`Error creating user ${user.email}:`, error);
            throw error;
          }
        } else if (data.user) {
          // User was created successfully
          const { password, ...profileData } = user;
          const profile = {
            id: data.user.id,
            ...profileData,
            createdAt: new Date().toISOString(),
          };
          await kv.set(`user:${data.user.id}`, profile);
          console.log(`Successfully created user ${user.email} (${user.role}) with ID: ${data.user.id}`);
          results.push({ email: user.email, status: 'created', userId: data.user.id });
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
app.post("/init-data", async (c) => {
  try {
    const ownerId = 'effce8e3-746a-4c37-a53d-9d91403ac25d';

    const samplePGs = [
      {
        id: '1',
        name: 'ADTU Comfort Stay',
        ownerId: ownerId,
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
        verificationStatus: 'verified',
        active: true,
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
        ownerId: ownerId,
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
        verificationStatus: 'verified',
        active: true,
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
        ownerId: ownerId,
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
        verificationStatus: 'verified',
        active: true,
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
        ownerId: ownerId,
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
        verificationStatus: 'pending',
        active: false,
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
        ownerId: ownerId,
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
        verificationStatus: 'verified',
        active: true,
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
        ownerId: ownerId,
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
        verificationStatus: 'pending',
        active: false,
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
app.post("/auth/signup", async (c) => {
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
app.get("/user/profile", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
    const userEmail = getCtxValue<string>(c, 'userEmail');
    
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
// Public endpoint - students need to see PGs before logging in
app.get("/pgs", async (c) => {
  try {
    const allPGs = await kv.getByPrefix('pg:') || [];
    
    // Filter to only return verified and active PGs (for students to see)
    const verifiedPGs = allPGs.filter((pg: any) => pg.verified === true && pg.active === true);
    
    console.log(`Returning ${verifiedPGs.length} verified PGs out of ${allPGs.length} total PGs`);
    return c.json(verifiedPGs);
  } catch (error) {
    console.error('Error fetching PGs:', error);
    return c.json({ error: 'Failed to fetch PGs' }, 500);
  }
});

// ===== GET SINGLE PG =====
// For students, only return if verified. For owners/admins, return regardless of status.
app.get("/pgs/:id", async (c) => {
  try {
    const id = c.req.param('id');
    const pg = await kv.get(`pg:${id}`);

    if (!pg) {
      return c.json({ error: 'PG not found' }, 404);
    }

    // Check if user is authenticated and what role they have
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    let userRole: string | null = null;
    let userId: string | null = null;
    
    if (accessToken) {
      try {
        const { data: { user } } = await supabase.auth.getUser(accessToken);
        if (user) {
          userId = user.id;
          const profile = await kv.get(`user:${user.id}`);
          userRole = profile?.role || null;
        }
      } catch (error) {
        // If auth fails, treat as anonymous (student)
        console.log('Auth check failed, treating as anonymous');
      }
    }

    // If user is owner of this PG or admin, return it regardless of verification status
    if (userRole === 'admin' || (userRole === 'owner' && pg.ownerId === userId)) {
      return c.json(pg);
    }

    // For students or anonymous users, only return if verified and active
    if (pg.verified === true && pg.active === true) {
      return c.json(pg);
    }

    // PG exists but is not verified and user is not admin/owner
    return c.json({ error: 'PG not found or not yet verified' }, 404);
  } catch (error) {
    console.error('Error fetching PG:', error);
    return c.json({ error: 'Failed to fetch PG' }, 500);
  }
});

// ===== GET USER FAVORITES =====
app.get("/user/favorites", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
    const favorites = await kv.get(`favorites:${userId}`);
    
    if (!favorites || !Array.isArray(favorites)) {
      return c.json([]);
    }

    // Fetch full PG details for each favorite
    const pgPromises = favorites.map(id => kv.get(`pg:${id}`));
    const pgs = await Promise.all(pgPromises);
    
    // Only return verified and active PGs (students should only see verified favorites)
    const verifiedPGs = pgs.filter((pg: any) => 
      pg !== null && pg.verified === true && pg.active === true
    );
    
    return c.json(verifiedPGs);
  } catch (error) {
    console.error('Error fetching favorites:', error);
    return c.json({ error: 'Failed to fetch favorites' }, 500);
  }
});

// ===== ADD TO FAVORITES =====
app.post("/user/favorites/:pgId", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
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
app.delete("/user/favorites/:pgId", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
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
app.post("/bookings", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
    const body = await c.req.json();
    const { pgId, roomType, checkIn, duration, totalAmount } = body;

    if (!pgId || !roomType || !checkIn || !duration) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const pg = await kv.get(`pg:${pgId}`);
    if (!pg) {
      return c.json({ error: 'PG not found' }, 404);
    }

    // Normalize and capture the selected room details so frontend can render the booked room card
    const selectedRoom = (pg.roomTypes || []).find((rt: any) => String(rt.type).toLowerCase() === String(roomType).toLowerCase()) || null;

    const bookingId = `booking-${Date.now()}-${userId}`;
    const booking: any = {
      id: bookingId,
      userId,
      pgId,
      roomType,
      selectedRoom, // include room snapshot
      checkIn,
      duration,
      totalAmount,
      status: 'pending', // Set initial status to pending
      createdAt: new Date().toISOString(),
      ownerId: pg.ownerId, // Add ownerId to the booking object
      pgSnapshot: {
        id: pg.id,
        name: pg.name,
        rating: pg.rating,
        reviews: pg.reviews,
        images: Array.isArray(pg.images) ? pg.images.slice(0, 2) : [],
      },
    };

    await kv.set(`booking:${bookingId}`, booking);

    // Also maintain user bookings list
    let userBookings = await kv.get(`user-bookings:${userId}`) || [];
    if (!Array.isArray(userBookings)) {
      userBookings = [];
    }
    userBookings.push(bookingId);
    await kv.set(`user-bookings:${userId}`, userBookings);

    // Create notification for the PG owner (reuse pg variable)
    if (pg && pg.ownerId) {
      const notificationId = `notification-${Date.now()}-${pg.ownerId}`;
      const notification = {
        id: notificationId,
        userId: pg.ownerId,
        title: 'New Booking Request',
        message: `You have a new booking request for ${pg.name}`,
        bookingId: bookingId,
        read: false,
        createdAt: new Date().toISOString(),
      };
      let ownerNotifications = await kv.get(`notifications:${pg.ownerId}`) || [];
      if (!Array.isArray(ownerNotifications)) {
        ownerNotifications = [];
      }
      ownerNotifications.unshift(notification);
      await kv.set(`notifications:${pg.ownerId}`, ownerNotifications);
    }

    return c.json({ message: 'Booking request sent successfully', booking });
  } catch (error) {
    console.error('Error creating booking:', error);
    return c.json({ error: 'Failed to create booking' }, 500);
  }
});

// ===== GET USER BOOKINGS =====
app.get("/user/bookings", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
    const bookingIds = await kv.get(`user-bookings:${userId}`) || [];
    
    if (!Array.isArray(bookingIds) || bookingIds.length === 0) {
      return c.json([]);
    }

    const bookingPromises = bookingIds.map(id => kv.get(`booking:${id}`));
    const bookings = await Promise.all(bookingPromises);

    // Fetch PG details for each booking and ensure selected room info is present
    const bookingsWithPG = await Promise.all(
      bookings.filter((b: any) => b !== null).map(async (booking: any) => {
        // Try to get the latest PG data from KV; if not available, fall back to snapshot stored on booking
        let pg = await kv.get(`pg:${booking.pgId}`) || null;
        
        // If PG not in store, try to create a minimal PG object from pgSnapshot
        if (!pg && booking.pgSnapshot) {
          pg = booking.pgSnapshot;
        }
        
        // If still no PG, try to get it from booking.pg (for backwards compatibility)
        if (!pg && booking.pg) {
          pg = booking.pg;
        }

        // Ensure selectedRoom is present (try to resolve from current PG if missing)
        let selectedRoom = booking.selectedRoom || null;
        if (!selectedRoom && pg && Array.isArray(pg.roomTypes) && booking.roomType) {
          selectedRoom = pg.roomTypes.find((rt: any) => String(rt.type).toLowerCase() === String(booking.roomType).toLowerCase()) || null;
        }

        return { 
          ...booking, 
          pg: pg || {
            id: booking.pgId,
            name: 'PG (Details not found)',
            location: 'Location unknown',
            images: [],
            ownerName: 'Unknown',
            ownerPhone: 'N/A',
          }, 
          selectedRoom 
        };
      })
    );

    // Sort bookings by creation date (newest first)
    bookingsWithPG.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json(bookingsWithPG);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

// ===== ADD REVIEW =====
app.post("/reviews", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
    const body = await c.req.json();
    const { pgId, rating, comment } = body;

    if (!pgId || !rating) {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const reviewId = `review-${Date.now()}-${userId}`;
    const review: any = {
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

    // --- Start: New logic for updating PG rating ---
    // Fetch all reviews for this PG
    const allReviewIdsForPg = await kv.get(`pg-reviews:${pgId}`) || [];
    const allReviewsForPg = await Promise.all(
      allReviewIdsForPg.map((id: string) => kv.get(`review:${id}`))
    );
    const validReviews = allReviewsForPg.filter((r: any) => r !== null && typeof r.rating === 'number');

    let totalRatingSum = 0;
    for (const r of validReviews) {
      totalRatingSum += r.rating;
    }
    const newAverageRating = validReviews.length > 0 ? totalRatingSum / validReviews.length : 0;

    // Fetch the PG and update its rating and reviews count
    const pg = await kv.get(`pg:${pgId}`);
    if (pg) {
      const updatedPG = {
        ...pg,
        rating: parseFloat(newAverageRating.toFixed(1)), // Round to 1 decimal place
        reviews: validReviews.length,
      };
      await kv.set(`pg:${pgId}`, updatedPG);
    }
    // --- End: New logic for updating PG rating ---

    return c.json({ message: 'Review added successfully', review });
  } catch (error) {
    console.error('Error adding review:', error);
    return c.json({ error: 'Failed to add review' }, 500);
  }
});

// ===== GET PG REVIEWS =====
app.get("/pgs/:pgId/reviews", async (c) => {
  try {
    const pgId = c.req.param('pgId');
    const reviewIds = await kv.get(`pg-reviews:${pgId}`) || [];
    
    if (!Array.isArray(reviewIds) || reviewIds.length === 0) {
      return c.json([]);
    }

    const reviewPromises = reviewIds.map(id => kv.get(`review:${id}`));
    const reviews = await Promise.all(reviewPromises);
    
    return c.json(reviews.filter((r: any) => r !== null));
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return c.json({ error: 'Failed to fetch reviews' }, 500);
  }
});

// ===== UPDATE USER PROFILE =====
app.put("/user/profile", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
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

// ===== NOTIFICATION ENDPOINTS =====
app.options("/user/notifications", (c) => {
  return c.json({}, 200);
});

app.get("/user/notifications", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
    const notifications = await kv.get(`notifications:${userId}`) || [];
    return c.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return c.json({ error: 'Failed to fetch notifications' }, 500);
  }
});

app.post("/user/notifications/:id/read", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
    const notificationId = c.req.param('id');
    
    let notifications = await kv.get(`notifications:${userId}`) || [];
    if (!Array.isArray(notifications)) {
      notifications = [];
    }

    const notificationIndex = notifications.findIndex((n: any) => n.id === notificationId);
    if (notificationIndex > -1) {
      notifications[notificationIndex].read = true;
      await kv.set(`notifications:${userId}`, notifications);
    }

    return c.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return c.json({ error: 'Failed to mark notification as read' }, 500);
  }
});


// ===== OWNER ENDPOINTS =====

// Get owner stats
app.get("/owner/stats", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
    
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
        return b.status === 'approved' &&
               bookingDate.getMonth() === now.getMonth() && 
               bookingDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);

    const totalEarnings = ownerBookings
      .filter((b: any) => b.status === 'approved')
      .reduce((sum: number, b: any) => sum + (b.totalAmount || 0), 0);
    
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
app.post("/owner/pgs", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
    const body = await c.req.json();
    
    const pgId = `pg-${Date.now()}-${userId}`;
    const pg = {
      id: pgId,
      ...body,
      ownerId: userId,
      verified: false,
      verificationStatus: 'pending',
      active: false, // New PGs are inactive until verified by admin
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
app.get("/owner/pgs", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
    const allPGs = await kv.getByPrefix('pg:') || [];
    const ownerPGs = allPGs.filter((pg: any) => pg.ownerId === userId);
    
    return c.json(ownerPGs);
  } catch (error) {
    console.error('Error fetching owner PGs:', error);
    return c.json({ error: 'Failed to fetch PGs' }, 500);
  }
});

// Update PG listing
app.put("/owner/pgs/:id", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
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
app.delete("/owner/pgs/:id", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
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
app.get("/owner/bookings", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
    
    // Get all PGs owned by this user
    const allPGs = await kv.getByPrefix('pg:') || [];
    const ownerPGs = allPGs.filter((pg: any) => pg.ownerId === userId);
    const ownerPGIds = ownerPGs.map((pg: any) => pg.id);
    
    // Get all bookings
    const allBookings = await kv.getByPrefix('booking:') || [];
    const ownerBookings = allBookings.filter((booking: any) => 
      ownerPGIds.includes(booking.pgId)
    );

    console.log(`Owner ${userId} has ${ownerPGs.length} PGs and ${ownerBookings.length} bookings`);

    // Enrich bookings with PG and user info
    const enrichedBookings = await Promise.all(
      ownerBookings.map(async (booking: any) => {
        let pg = await kv.get(`pg:${booking.pgId}`);
        let user = await kv.get(`user:${booking.userId}`);
        
        // If PG not found, use pgSnapshot if available
        if (!pg && booking.pgSnapshot) {
          pg = booking.pgSnapshot;
        }
        
        // Ensure user has required fields
        if (!user) {
          user = {
            name: 'Unknown User',
            email: 'N/A',
            phone: 'N/A',
          };
        }
        
        // Ensure pg has required fields
        if (!pg) {
          pg = {
            name: 'Unknown PG',
            location: 'N/A',
          };
        }
        
        return {
          ...booking,
          pg,
          user,
        };
      })
    );

    console.log(`Returning ${enrichedBookings.length} enriched bookings`);
    return c.json(enrichedBookings);
  } catch (error) {
    console.error('Error fetching owner bookings:', error);
    return c.json({ error: 'Failed to fetch bookings' }, 500);
  }
});

// Update booking status
app.put("/owner/bookings/:id", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
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
      status: body.status, // 'approved' or 'declined'
      id: bookingId,
    };

    await kv.set(`booking:${bookingId}`, updatedBooking);

    // Create notification for the student
    const notificationId = `notification-${Date.now()}-${booking.userId}`;
    const notificationTitle = body.status === 'approved' ? 'Congratulations! 🎉' : `Booking ${body.status}`;
    const notificationMessage = body.status === 'approved' 
      ? `Your booking is confirmed for ${pg.name}` 
      : `Your booking for ${pg.name} has been ${body.status}`;
    
    const notification = {
      id: notificationId,
      userId: booking.userId,
      title: notificationTitle,
      message: notificationMessage,
      bookingId: bookingId,
      read: false,
      createdAt: new Date().toISOString(),
    };
    let studentNotifications = await kv.get(`notifications:${booking.userId}`) || [];
    if (!Array.isArray(studentNotifications)) {
      studentNotifications = [];
    }
    studentNotifications.unshift(notification);
    await kv.set(`notifications:${booking.userId}`, studentNotifications);

    return c.json({ message: 'Booking updated successfully', booking: updatedBooking });
  } catch (error) {
    console.error('Error updating booking:', error);
    return c.json({ error: 'Failed to update booking' }, 500);
  }
});

// Get owner's reviews
app.get("/owner/reviews", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
    
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
app.get("/admin/stats", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
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
app.get("/admin/pgs", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
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
    const userId = getCtxValue<string>(c, 'userId');
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
      active: true, // Mark as active so it appears in student dashboards
      verifiedAt: new Date().toISOString(),
      verifiedBy: userId,
    };

    await kv.set(`pg:${pgId}`, updatedPG);
    console.log(`PG ${pgId} (${pg.name}) has been verified and activated by admin ${userId}`);
    return c.json({ message: 'PG verified successfully and is now active', pg: updatedPG });
  } catch (error) {
    console.error('Error verifying PG:', error);
    return c.json({ error: 'Failed to verify PG' }, 500);
  }
});

// Reject PG listing
app.post("/make-server-2c39c550/admin/pgs/:id/reject", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
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
      active: false, // Mark as inactive so it doesn't appear in student dashboards
      rejectionReason: body.reason || 'No reason provided',
      rejectedAt: new Date().toISOString(),
      rejectedBy: userId,
    };

    await kv.set(`pg:${pgId}`, updatedPG);
    console.log(`PG ${pgId} (${pg.name}) has been rejected by admin ${userId}`);
    return c.json({ message: 'PG rejected and removed from student view', pg: updatedPG });
  } catch (error) {
    console.error('Error rejecting PG:', error);
    return c.json({ error: 'Failed to reject PG' }, 500);
  }
});

// Get all users (admin)
app.get("/make-server-2c39c550/admin/users", requireAuth, async (c) => {
  try {
    const userId = getCtxValue<string>(c, 'userId');
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
    const adminId = getCtxValue<string>(c, 'userId');
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
    const userId = getCtxValue<string>(c, 'userId');
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

// ===== ADMIN: One-off migration to enrich existing bookings =====
// Adds `selectedRoom` and `pgSnapshot` to bookings that are missing them.
// Usage: POST /admin/migrate-bookings (must be an admin)
app.post('/admin/migrate-bookings', requireAuth, async (c) => {
  try {
    const adminId = getCtxValue<string>(c, 'userId');
    const adminProfile = await kv.get(`user:${adminId}`);
    if (!adminProfile || adminProfile.role !== 'admin') {
      return c.json({ error: 'Unauthorized - admin required' }, 403);
    }

    const allBookings = await kv.getByPrefix('booking:') || [];
    let updated = 0;
    let skipped = 0;
    const errors: string[] = [];

    for (const b of allBookings) {
      try {
        if (!b || !b.id) continue;

        // If both are present, skip
        if (b.selectedRoom && b.pgSnapshot) {
          skipped++;
          continue;
        }

        const pg = await kv.get(`pg:${b.pgId}`) || null;

        const selectedRoom = b.selectedRoom || (pg && Array.isArray(pg.roomTypes)
          ? (pg.roomTypes.find((rt: any) => String(rt.type).toLowerCase() === String(b.roomType).toLowerCase()) || null)
          : null);

        const pgSnapshot = b.pgSnapshot || (pg ? {
          id: pg.id,
          name: pg.name,
          rating: pg.rating,
          reviews: pg.reviews,
          images: Array.isArray(pg.images) ? pg.images.slice(0,2) : [],
        } : null);

        const newBooking = { ...b, selectedRoom, pgSnapshot };
        await kv.set(`booking:${b.id}`, newBooking);
        updated++;
      } catch (err: any) {
        errors.push(String(err));
      }
    }

    return c.json({ message: 'Migration complete', updated, skipped, errors });
  } catch (err) {
    return c.json({ error: 'Migration failed', details: String(err) }, 500);
  }
});
