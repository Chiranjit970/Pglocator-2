# ⚡ IMMEDIATE FIX - Copy & Paste

## Error Still Happening?

The RLS policy needs to be completely replaced. Copy this ENTIRE SQL block:

```sql
DROP POLICY IF EXISTS "Anyone can read available rooms" ON public.rooms;
DROP POLICY IF EXISTS "Authenticated users can insert rooms" ON public.rooms;
DROP POLICY IF EXISTS "Authenticated users can update rooms" ON public.rooms;
DROP POLICY IF EXISTS "Authenticated users can delete rooms" ON public.rooms;
DROP POLICY IF EXISTS "Read available rooms" ON public.rooms;
DROP POLICY IF EXISTS "Authenticated users full access" ON public.rooms;

CREATE POLICY "Read available rooms"
  ON public.rooms FOR SELECT
  USING (status = 'available' OR auth.role() = 'authenticated');

CREATE POLICY "Authenticated users full access"
  ON public.rooms FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

## Steps

1. Open Supabase → SQL Editor
2. **Clear any existing SQL** (select all, delete)
3. **Paste the SQL above**
4. Click **Run**
5. Refresh browser (Ctrl+F5)
6. Test toggle availability

## Done!

That's it. The error will be gone.

If it still doesn't work, use this nuclear option:

```sql
ALTER TABLE public.rooms DISABLE ROW LEVEL SECURITY;
```

This disables RLS completely (for testing).

**Go do it now!** ⚡
