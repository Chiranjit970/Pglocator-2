# 🔧 Fix RLS Policy - Toggle Availability Error

## Problem You're Seeing

```
Error toggling availability:
{
  code: '42501',
  message: 'new row violates row-level security policy for table "rooms"'
}
```

**Error Code 42501** = Row-level security policy violation during UPDATE

---

## Root Cause

The current RLS policy for UPDATE is missing the `WITH CHECK` clause, which is required for UPDATE operations to verify both the old AND new row.

---

## The Fix (Run This SQL)

Open Supabase SQL Editor and run this:

```sql
-- Drop the old UPDATE policy
DROP POLICY IF EXISTS "Authenticated users can update rooms" ON public.rooms;

-- Create the corrected UPDATE policy with WITH CHECK
CREATE POLICY "Authenticated users can update rooms" ON public.rooms
  FOR UPDATE 
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

✅ **Click Run**

---

## How to Execute

1. Go to https://app.supabase.com
2. Select your project
3. Click **SQL Editor**
4. Paste the SQL above
5. Click **Run**
6. Refresh your app (Ctrl+F5)
7. Try toggling availability again ✅

---

## What This Fixes

After running this SQL:
- ✅ Can toggle room availability
- ✅ Can update room status
- ✅ Can edit other room details
- ✅ No more 42501 errors
- ✅ RLS still protects data

---

## Technical Details

**RLS UPDATE Syntax:**
```sql
CREATE POLICY "name" ON table_name
  FOR UPDATE 
  USING (condition)           -- Checks OLD row (allow access to old data)
  WITH CHECK (condition)      -- Checks NEW row (validate new data)
```

**Your policy now:**
```sql
FOR UPDATE 
USING (auth.role() = 'authenticated')    -- Can update if authenticated
WITH CHECK (auth.role() = 'authenticated') -- New row also must be authentic
```

---

## Why Both Are Needed

- **USING:** Checks if you can access/modify the existing row
- **WITH CHECK:** Validates the new data being written

Both must pass for UPDATE to succeed ✅

---

## Time to Fix

- Copy SQL: 1 minute
- Run SQL: 1 minute
- Test: 2 minutes
- **Total: 4 minutes**

---

**Status:** 🟢 Ready  
**Difficulty:** Easy (copy-paste SQL)  
**Build Impact:** None (DB-only change)

**Go run the SQL now!**
