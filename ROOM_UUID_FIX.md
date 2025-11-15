# 🔧 Room Insert Error Fix - UUID Type Mismatch

## Problem You Encountered

When trying to add a room, you got this error:

```
Error adding room: 
{
  code: '22P02',
  message: 'invalid input syntax for type uuid: "pg-1763198497797-89c39e77-64b6-4991-b2fd-b4a05d376222"'
}
```

**Error Code 22P02** = PostgreSQL type validation error. The database expected a UUID but received a text string.

---

## Root Cause

The issue is a **type mismatch** between:

1. **Your Backend System**: Uses a KV store (Deno KV) with custom PG ID format:
   ```
   pg-{timestamp}-{uuid}
   Example: pg-1763198497797-89c39e77-64b6-4991-b2fd-b4a05d376222
   ```

2. **Supabase Schema** (OLD): Expected `pg_id` to be a UUID type with a foreign key reference:
   ```sql
   pg_id UUID NOT NULL REFERENCES public.pgs(id)
   ```

   But the rooms table can't reference a Supabase `pgs` table that doesn't exist (PGs are in KV, not Supabase).

---

## Solution Applied

### Changed the `rooms` table schema from:
```sql
pg_id UUID NOT NULL REFERENCES public.pgs(id) ON DELETE CASCADE
```

### To:
```sql
pg_id TEXT NOT NULL
```

**Why?**
- Your PG IDs are TEXT strings in a custom format, not UUIDs
- The KV store is the source of truth for PGs, not Supabase
- By storing `pg_id` as TEXT, we can accept the custom ID format
- Rooms are still tracked per PG, just by text ID instead of UUID foreign key

---

## What You Need to Do Now

### Step 1: Delete Old Rooms Table (if it exists)
If you already ran the old SQL and created a `rooms` table, you need to delete it first:

```sql
-- Drop the old rooms table
DROP TABLE IF EXISTS public.rooms CASCADE;
```

### Step 2: Run Updated SQL
Run **Query 2** from `DATABASE_SETUP.md` - it now has the corrected schema with `pg_id TEXT`.

### Step 3: Try Adding a Room Again
1. Go to Dashboard → Manage PGs
2. Click "Edit & Manage Rooms"
3. Click "+ Add Room"
4. Fill in the form and submit
5. ✅ Room should be added successfully now!

---

## Other Changes Made

### Bookings Table
Also changed `room_id` from `UUID` to `TEXT` for consistency:

**OLD:**
```sql
room_id UUID REFERENCES public.rooms(id)
```

**NEW:**
```sql
room_id TEXT
```

### RLS Policies
Simplified RLS policies since we're not using foreign key constraints anymore. Policies now use basic authentication checks instead of subqueries.

---

## Technical Details

| Aspect | Before | After |
|--------|--------|-------|
| `pg_id` Type | `UUID` | `TEXT` |
| `pg_id` Foreign Key | References `pgs` table | No FK (text ID) |
| `room_id` Type | `UUID` | `TEXT` |
| RLS Policies | Complex subqueries | Simple auth checks |
| Flexibility | Requires PGs in Supabase | Works with external KV store |

---

## Architecture Note

Your system uses a **Hybrid Architecture**:

```
┌─────────────────────┐
│   Deno KV Store     │
│   - PGs             │
│   - Custom IDs      │
└──────────┬──────────┘
           │
           ├──> API Server
           │    (make-server-2c39c550)
           │
┌──────────▼──────────┐
│   Supabase          │
│   - Rooms (real-time)
│   - Bookings        │
│   - Amenities       │
└─────────────────────┘
```

This design:
- ✅ Keeps real-time room syncing in Supabase
- ✅ Allows KV store to manage PG listings
- ✅ Avoids data duplication
- ✅ Maintains API consistency

---

## Testing Checklist

After running the updated SQL:

- [ ] Delete any old `rooms` table
- [ ] Run new SQL Query 2 for rooms table
- [ ] Refresh the browser
- [ ] Login as owner
- [ ] Go to Manage PGs
- [ ] Click "Edit & Manage Rooms"
- [ ] Click "+ Add Room"
- [ ] Fill form with test data
- [ ] Submit form
- [ ] ✅ Room should appear in grid immediately
- [ ] Try editing the room
- [ ] Try deleting the room
- [ ] Login as student and see room in real-time

---

## If You Still Get Errors

### Error: "table rooms does not exist"
- You haven't run Query 2 yet
- Go to DATABASE_SETUP.md and run Query 2

### Error: "22P02 invalid input syntax"
- You're using the old schema
- Drop the table: `DROP TABLE public.rooms;`
- Re-run Query 2 with the new TEXT type

### Error: "Could not find the table 'public.rooms'"
- Table doesn't exist in Supabase
- Run Query 2 from DATABASE_SETUP.md

### Error: "Unique constraint violation"
- You're trying to add the same room number twice for the same PG
- Use a different room number

---

## Questions?

The fix is simple:
1. Delete old `rooms` table
2. Run new SQL (pg_id as TEXT)
3. Try adding a room again

All code is already updated to work with this new schema. No code changes needed! ✅

---

**Updated:** November 15, 2025  
**Status:** Ready to execute SQL and test
