-- Pg Locator - Room Management RLS (Row Level Security) Policies
-- File: supabase/rls_policies.sql
-- Purpose: Secure room management operations to only allow authorized owners

-- ============================================================================
-- ROOMS TABLE - RLS Policies
-- ============================================================================

-- Enable RLS on the rooms table
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

-- Policy 1: SELECT - Users can view available rooms (all public rooms)
CREATE POLICY "Anyone can view available rooms"
ON rooms FOR SELECT
USING (status = 'available' OR auth.uid() = (
  SELECT owner_id FROM pgs WHERE id = rooms.pg_id
));

-- Policy 2: INSERT - Only PG owners can add rooms to their PGs
CREATE POLICY "Owners can add rooms to their PGs"
ON rooms FOR INSERT
WITH CHECK (auth.uid() = (
  SELECT owner_id FROM pgs WHERE id = pg_id
));

-- Policy 3: UPDATE - Only PG owners can edit their rooms
CREATE POLICY "Owners can update their own rooms"
ON rooms FOR UPDATE
USING (auth.uid() = (
  SELECT owner_id FROM pgs WHERE id = pg_id
))
WITH CHECK (auth.uid() = (
  SELECT owner_id FROM pgs WHERE id = pg_id
));

-- Policy 4: DELETE - Only PG owners can delete their rooms
CREATE POLICY "Owners can delete their own rooms"
ON rooms FOR DELETE
USING (auth.uid() = (
  SELECT owner_id FROM pgs WHERE id = pg_id
));

-- ============================================================================
-- BOOKINGS TABLE - RLS Policies
-- ============================================================================

-- Enable RLS on the bookings table
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Policy 1: SELECT - Users can view their own bookings or owners can view bookings on their PGs
CREATE POLICY "Users can view their own bookings"
ON bookings FOR SELECT
USING (auth.uid() = user_id OR auth.uid() = (
  SELECT owner_id FROM pgs WHERE id = pg_id
));

-- Policy 2: INSERT - Only authenticated users (students) can create bookings
CREATE POLICY "Authenticated users can create bookings"
ON bookings FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: UPDATE - Users can update their own bookings, owners can update bookings on their PGs
CREATE POLICY "Users can update their own bookings"
ON bookings FOR UPDATE
USING (auth.uid() = user_id OR auth.uid() = (
  SELECT owner_id FROM pgs WHERE id = pg_id
))
WITH CHECK (auth.uid() = user_id OR auth.uid() = (
  SELECT owner_id FROM pgs WHERE id = pg_id
));

-- Policy 4: DELETE - Admins only
CREATE POLICY "Only admins can delete bookings"
ON bookings FOR DELETE
USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- AMENITIES TABLE - RLS Policies (Read-only for users)
-- ============================================================================

-- Enable RLS on the amenities table
ALTER TABLE amenities ENABLE ROW LEVEL SECURITY;

-- Policy 1: SELECT - Anyone can view amenities (public data)
CREATE POLICY "Anyone can view amenities"
ON amenities FOR SELECT
USING (true);

-- Policy 2: INSERT/UPDATE/DELETE - Admin only
CREATE POLICY "Only admins can modify amenities"
ON amenities FOR INSERT, UPDATE, DELETE
USING (auth.jwt() ->> 'role' = 'admin')
WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- PGS TABLE - RLS Policies
-- ============================================================================

-- Enable RLS on the pgs table
ALTER TABLE pgs ENABLE ROW LEVEL SECURITY;

-- Policy 1: SELECT - Anyone can view PG listings
CREATE POLICY "Anyone can view PGs"
ON pgs FOR SELECT
USING (true);

-- Policy 2: INSERT - Only authenticated users (potential owners)
CREATE POLICY "Authenticated users can create PGs"
ON pgs FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Policy 3: UPDATE - Only PG owners can edit their listings
CREATE POLICY "Owners can update their own PGs"
ON pgs FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Policy 4: DELETE - Only admins can delete PGs
CREATE POLICY "Only admins can delete PGs"
ON pgs FOR DELETE
USING (auth.jwt() ->> 'role' = 'admin');

-- ============================================================================
-- IMPORTANT NOTES
-- ============================================================================
-- 
-- 1. These policies assume:
--    - auth.uid() returns the authenticated user's UID
--    - The 'pgs' table has an 'owner_id' column that references the user
--    - The 'bookings' table has a 'user_id' column and 'pg_id' column
--
-- 2. After creating these policies, test them thoroughly:
--    - A student should only see available rooms
--    - An owner should see all their rooms and can modify them
--    - An owner should not be able to modify other owners' rooms
--    - Only admins can delete PGs and amenities
--
-- 3. For development/testing, you may temporarily disable RLS:
--    ALTER TABLE rooms DISABLE ROW LEVEL SECURITY;
--    ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
--    ALTER TABLE pgs DISABLE ROW LEVEL SECURITY;
--    ALTER TABLE amenities DISABLE ROW LEVEL SECURITY;
--
-- 4. Index recommendations for performance:
--    CREATE INDEX idx_rooms_pg_id ON rooms(pg_id);
--    CREATE INDEX idx_rooms_status ON rooms(status);
--    CREATE INDEX idx_bookings_room_id ON bookings(room_id);
--    CREATE INDEX idx_bookings_user_id ON bookings(user_id);
--    CREATE INDEX idx_bookings_pg_id ON bookings(pg_id);
--    CREATE INDEX idx_pgs_owner_id ON pgs(owner_id);
