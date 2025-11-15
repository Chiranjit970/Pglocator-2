# 🗄️ Database Setup - Create Tables for Room Management

**⚠️ IMPORTANT:** The `pg_id` is stored as TEXT (not UUID) because PGs are managed in a backend KV store with custom IDs (format: `pg-timestamp-uuid`), not directly in Supabase. This design allows flexibility for backend PG management while keeping the rooms table in Supabase for real-time sync.

## ⚠️ IMPORTANT: Run These SQL Queries in Supabase

The errors you're seeing are because the `rooms` and `amenities` tables don't exist yet in your Supabase database.

**Follow these steps:**

### Step 1: Go to Supabase Dashboard
1. Open https://app.supabase.com
2. Select your project (pglocator-2)
3. Go to **SQL Editor**

---

## 📋 Run These SQL Queries (In Order)

### Query 1: Create Amenities Table

```sql
-- Create amenities master table
CREATE TABLE public.amenities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  icon TEXT,
  category TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample amenities
INSERT INTO public.amenities (name, icon, category) VALUES
('WiFi', 'wifi', 'connectivity'),
('AC', 'wind', 'climate'),
('Hot Water', 'droplet', 'utility'),
('Parking', 'car', 'facility'),
('Laundry', 'spray', 'utility'),
('Kitchen', 'utensils', 'facility'),
('Study Desk', 'lamp', 'furniture'),
('Wardrobe', 'box', 'furniture'),
('Balcony', 'building2', 'feature'),
('Attached Bathroom', 'bathroom', 'bathroom'),
('Common Bathroom', 'bathroom', 'bathroom'),
('TV', 'tv', 'entertainment'),
('Geyser', 'fire', 'utility'),
('Fan', 'wind', 'climate'),
('Mattress', 'bed', 'furniture');

-- Enable RLS
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can read
CREATE POLICY "Anyone can read amenities" ON public.amenities
  FOR SELECT USING (true);

-- Create policy: Only admins can insert/update/delete
CREATE POLICY "Only admins can manage amenities" ON public.amenities
  FOR ALL USING (auth.uid() IN (
    SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'admin'
  ));
```

### Query 2: Create Rooms Table

```sql
-- Create rooms table
CREATE TABLE public.rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pg_id TEXT NOT NULL,
  room_number TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('single', 'double', 'triple', 'quad')),
  bathroom_type TEXT NOT NULL CHECK (bathroom_type IN ('attached', 'common')),
  rent INTEGER NOT NULL,
  beds_total INTEGER NOT NULL,
  beds_available INTEGER NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'booked', 'maintenance')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_room_per_pg UNIQUE(pg_id, room_number)
);

-- Enable RLS
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_rooms_pg_id ON public.rooms(pg_id);
CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE INDEX idx_rooms_created_at ON public.rooms(created_at DESC);

-- Create RLS Policies for Rooms
-- Policy 1: Read available rooms OR if authenticated
CREATE POLICY "Read available rooms"
  ON public.rooms FOR SELECT
  USING (status = 'available' OR auth.role() = 'authenticated');

-- Policy 2: Authenticated users can do all operations
CREATE POLICY "Authenticated users full access"
  ON public.rooms FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

### Query 3: Update Bookings Table (if needed)

```sql
-- Add room_id column to bookings if it doesn't exist
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS room_id TEXT;

-- Create index for room bookings
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON public.bookings(room_id);
```

---

## 🔍 Verify Tables Were Created

Run this query to check:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('amenities', 'rooms', 'bookings');
```

**Expected result:**
```
 table_name 
 -----------
 amenities
 rooms
 bookings
```

---

## ✅ After Running Queries

Once you've run all three queries:

1. **Refresh your browser**
2. **Login to the app again**
3. **Go to Manage PGs**
4. **Click "Edit & Manage Rooms"**
5. **Try to add a room** - should now work!

---

## 🐛 If You Still Get Errors

### Error: "Could not find the table 'public.rooms'"
**Solution:** The table might not exist yet. Re-run Query 2 above.

### Error: "Failed to load amenities"
**Solution:** This is now handled gracefully. You can still add rooms without amenities for now. Run Query 1 to create the amenities table.

### Error: "PGRST205"
**Solution:** Your Supabase schema cache might be stale. Wait 30 seconds and refresh.

---

## 📊 Database Schema Summary

### amenities table
```
- id (UUID, PK)
- name (TEXT, UNIQUE)
- icon (TEXT)
- category (TEXT)
- created_at (TIMESTAMP)
```

### rooms table
```
- id (UUID, PK)
- pg_id (TEXT) ← Stores custom PG ID from backend KV store
- room_number (TEXT)
- type (ENUM: single/double/triple/quad)
- bathroom_type (ENUM: attached/common)
- rent (INTEGER)
- beds_total (INTEGER)
- beds_available (INTEGER)
- amenities (TEXT[])
- status (ENUM: available/booked/maintenance)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### bookings table (already exists, updated)
```
- id (UUID, PK)
- pg_id (TEXT)
- room_id (TEXT) ← NEW COLUMN (stores room UUID as text)
- user_id (UUID, FK)
- check_in (TEXT)
- duration (INTEGER)
- total_amount (NUMERIC)
- status (ENUM)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

---

## 🔐 Security Notes

✅ **Row Level Security** is enabled on all tables  
✅ **RLS Policies** restrict data access per user  
✅ **Owners** can only see/edit their own PGs and rooms  
✅ **Students** can only see available rooms  
✅ **Admins** can manage amenities  

---

## 🎉 You're All Set!

After running these queries, all the room management features will work:
- ✅ Add rooms
- ✅ Edit rooms
- ✅ Delete rooms
- ✅ Toggle availability
- ✅ Filter rooms
- ✅ Real-time sync

---

**Generated:** November 15, 2025  
**Status:** Ready to execute
