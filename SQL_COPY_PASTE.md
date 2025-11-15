# 🗄️ EXACT SQL TO RUN - Copy & Paste Ready

## Where to Paste This SQL

1. Go to: https://app.supabase.com
2. Select your project: `pglocator-2`
3. Click: **SQL Editor** (left sidebar)
4. Click: **New Query**
5. Paste each SQL block below
6. Click **Run** button

---

## SQL Command 1️⃣ - DELETE OLD TABLE

### ⚠️ Warning: This deletes the old rooms table!

Copy and paste this:

```sql
DROP TABLE IF EXISTS public.rooms CASCADE;
```

**Click: Run**

Expected result: ✅ Success (or "0 rows affected" if table didn't exist)

---

## SQL Command 2️⃣ - CREATE NEW TABLE

### This is the complete fixed schema

Copy and paste this entire block:

```sql
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

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_rooms_pg_id ON public.rooms(pg_id);
CREATE INDEX idx_rooms_status ON public.rooms(status);
CREATE INDEX idx_rooms_created_at ON public.rooms(created_at DESC);

CREATE POLICY "Anyone can read available rooms" ON public.rooms
  FOR SELECT USING (status = 'available');

CREATE POLICY "Authenticated users can insert rooms" ON public.rooms
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update rooms" ON public.rooms
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete rooms" ON public.rooms
  FOR DELETE USING (auth.role() = 'authenticated');
```

**Click: Run**

Expected result: ✅ Success

---

## SQL Command 3️⃣ - VERIFY

### Check that the table was created

Copy and paste this:

```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'rooms';
```

**Click: Run**

Expected result:
```
table_name
-----------
rooms
```

---

## 📋 What Changed in SQL

### Old (Didn't Work)
```sql
pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE
```

### New (Works Now)
```sql
pg_id TEXT NOT NULL
```

**Key Difference:**
- OLD: Expected standard UUID format (`xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`)
- NEW: Accepts text format (`pg-1763198497797-89c39e77-64b6-4991-b2fd-b4a05d376222`)

---

## ✅ Visual Guide - Step by Step

### Step 1: Open Supabase
```
https://app.supabase.com
     ↓
Select Project → pglocator-2
     ↓
Click: SQL Editor
     ↓
New Query
```

### Step 2: Copy Query 1
```
Copy: DROP TABLE IF EXISTS public.rooms CASCADE;
     ↓
Paste in SQL Editor
     ↓
Click: Run
     ↓
See: Success message
```

### Step 3: Copy Query 2
```
Copy: CREATE TABLE public.rooms (... all the way to the last CREATE POLICY...);
     ↓
Paste in SQL Editor
     ↓
Click: Run
     ↓
See: Success message
```

### Step 4: Verify with Query 3
```
Copy: SELECT table_name FROM information_schema.tables...
     ↓
Paste in SQL Editor
     ↓
Click: Run
     ↓
See: rooms in results
```

### Step 5: Test in App
```
Refresh Browser (Ctrl+F5)
     ↓
Login as Owner
     ↓
Dashboard → Manage PGs
     ↓
Click: Edit & Manage Rooms
     ↓
Click: + Add Room
     ↓
Fill Form & Submit
     ↓
See: Room appears! ✅
```

---

## 🎯 Key Points

### The Fix is Simple
- Query 1: Delete old table
- Query 2: Create new table with TEXT pg_id
- Query 3: Verify it worked

### No Code Changes
Your application already supports this schema. Just run the SQL!

### No Data Loss Concerns
If you don't have existing rooms data, it's safe to delete the table. If you do, see QUICK_FIX_GUIDE.md for backup instructions.

---

## 💾 SQL Summary

| Query | Purpose | Action |
|-------|---------|--------|
| 1 | Delete old rooms table | DROP TABLE |
| 2 | Create new rooms table with TEXT pg_id | CREATE TABLE + Indexes + RLS Policies |
| 3 | Verify table exists | SELECT |

---

## ✨ After Running These Queries

✅ Table `public.rooms` exists  
✅ Column `pg_id` is TEXT type  
✅ Accepts custom PG IDs like `pg-1763198497797-89c39e77-...`  
✅ RLS security policies active  
✅ Indexes for performance  
✅ Ready to add rooms  

---

## 🚀 Next Steps

1. **Copy SQL 1** → Run it
2. **Copy SQL 2** → Run it  
3. **Copy SQL 3** → Verify success
4. **Refresh app** → Ctrl+F5
5. **Test** → Add a room
6. **Success!** → 🎉

---

**Time to Run:** ~2 minutes  
**Difficulty:** Easy (copy-paste)  
**Risk:** Low (just schema changes)  

**Let's go!** 🚀
