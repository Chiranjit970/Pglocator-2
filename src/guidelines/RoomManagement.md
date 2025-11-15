# 🏠 Owner Portal - Room Management Implementation Guide

## Overview
Complete room management system for PG owners with CRUD operations, real-time synchronization, and student-side availability filtering.

---

## 📁 Component Structure

### 1. **PGDetailsPage** (`/src/components/owner/PGDetailsPage.tsx`)
**Purpose**: Owner's primary interface for managing PG rooms

**Features**:
- Display PG details (name, location, verification status)
- Grid view of all rooms with filtering tabs (All/Available/Booked)
- Add Room button with modal
- Real-time room updates via Supabase subscriptions
- Statistics showing room counts by status

**Key Functions**:
- `fetchPG()` - Get PG details from backend API
- `handleAddRoom()` - Create new room
- `handleEditRoom()` - Open edit modal
- `handleDeleteRoom()` - Show deletion confirmation with booking impact
- `handleToggleAvailability()` - Switch room between available/booked

**State Management**:
```typescript
- pg: PG | null                    // Current PG being managed
- rooms: Room[]                    // All rooms (synced in real-time)
- filteredRooms: Room[]           // Rooms filtered by status
- roomFilter: 'all' | 'available' | 'booked'
- isSubmitting: boolean           // Form submission state
- isTogglingAvailability: string | null  // Loading state for toggle
```

---

### 2. **RoomCard** (`/src/components/owner/RoomCard.tsx`)
**Purpose**: Individual room display card with inline actions

**Features**:
- Room information (number, type, bathroom, rent, beds)
- Amenities display as badges
- Availability status indicator (green/gray)
- Edit button → opens EditRoomModal
- Delete button → shows confirmation with booking impact
- Toggle switch → changes availability status instantly

**Props**:
```typescript
interface RoomCardProps {
  room: Room;
  amenityNames: Record<string, string>;  // Maps IDs to names
  onEdit: (room: Room) => void;
  onDelete: (roomId: string, roomNumber: string) => void;
  onToggleAvailability: (roomId: string) => void;
  isTogglingAvailability: boolean;
}
```

---

### 3. **AddRoomModal** (`/src/components/owner/AddRoomModal.tsx`)
**Purpose**: Form for creating new rooms

**Form Fields**:
- Room Number * (required) - e.g., "101", "A1"
- Room Type * (required) - Select: Single, Double, Triple, Quad
- Bathroom Type (required) - Select: Common, Attached
- Monthly Rent * (required) - Numeric, > 0
- Total Beds * (required) - Numeric, >= 1
- Amenities (optional) - Checkbox list fetched from DB

**Validation**:
- Real-time field validation
- Error messages displayed on form submission
- Shows errors for invalid inputs

**Flow**:
1. User clicks "Add Room"
2. Modal opens with empty form
3. User fills form
4. Submit triggers validation
5. If valid, API call creates room
6. Success toast shown
7. Modal closes, grid refreshes automatically via real-time sync

---

### 4. **EditRoomModal** (`/src/components/owner/EditRoomModal.tsx`)
**Purpose**: Form for editing existing rooms

**Features**:
- Pre-filled with existing room data
- All form fields from AddRoomModal
- Additional validation for beds_available vs beds_total
- Cannot exceed total beds with available beds

**Validation**:
- Room number required
- Rent > 0
- Total beds >= 1
- Available beds >= 0
- Available beds <= Total beds

**Flow**:
1. User clicks Edit button on RoomCard
2. EditRoomModal opens with pre-filled data
3. User modifies fields
4. Submit triggers validation
5. If valid, updates room in Supabase
6. Success toast shown
7. Real-time sync updates grid automatically

---

### 5. **DeleteConfirmationModal** (`/src/components/owner/DeleteConfirmationModal.tsx`)
**Purpose**: Prevents accidental deletion with impact warning

**Features**:
- Warning message with icon
- Shows number of active bookings affecting the room
- Disable delete button if bookings exist
- Requires explicit confirmation

**Booking Impact**:
- If room has active bookings (pending/approved/confirmed):
  - Shows warning message with count
  - Delete button is disabled
  - User must cancel bookings first

**Flow**:
1. User clicks Delete on RoomCard
2. Hook checks for active bookings
3. DeleteConfirmationModal opens with count
4. If bookings exist, button is disabled
5. If no bookings, user can confirm deletion
6. Room is deleted from Supabase
7. Success toast and grid auto-refreshes

---

## 🪝 Custom Hook: useRooms

**Location**: `/src/hooks/useRooms.ts`

**Purpose**: Centralized room data management with real-time sync

### Exported Functions:

#### `useRooms(pgId: string)`
```typescript
const {
  rooms,                      // Room[] - Current rooms
  isLoading,                  // boolean - Initial fetch loading state
  error,                      // string | null - Error message
  fetchRooms,                 // () => Promise<void> - Manual refresh
  addRoom,                    // (roomData) => Promise<Room> - Create room
  updateRoom,                 // (roomId, updates) => Promise<Room> - Update room
  toggleAvailability,         // (roomId, currentStatus) => Promise<Room> - Toggle status
  deleteRoom                  // (roomId) => Promise<void> - Delete room
} = useRooms(pgId);
```

### Real-time Subscription:
- Subscribes to `postgres_changes` on `rooms` table
- Filters by `pg_id` matching current PG
- Automatically updates local state on:
  - `INSERT` - New room added
  - `UPDATE` - Room details changed
  - `DELETE` - Room deleted

### Performance Optimizations:

**1. Efficient Room Insertion** (O(N) instead of O(N log N)):
```typescript
// Find insertion position using findIndex
const insertIndex = prev.findIndex(
  (room) => room.room_number.localeCompare(newRoom.room_number) > 0
);
// Insert at correct position instead of sort entire array
insertIndex === -1 ? newRooms.push(newRoom) : newRooms.splice(insertIndex, 0, newRoom);
```

**2. Optimized Booking Count Query**:
```typescript
// Use count parameter instead of fetching all data
const { count } = await supabase
  .from('bookings')
  .select('id', { count: 'exact', head: true })  // Only count, no data
  .eq('room_id', roomId);
```

---

## 🔐 Security - Row Level Security (RLS)

**Location**: `/src/guidelines/RLS_Policies.md`

### Required RLS Policies:

#### Rooms Table:
- **SELECT**: Users can view available rooms OR if they're the owner
- **INSERT**: Only PG owners can add rooms to their PGs
- **UPDATE**: Only PG owners can modify their rooms
- **DELETE**: Only PG owners can delete their rooms

#### Bookings Table (for deletion check):
- **SELECT**: Users can view their own bookings or owners can view their PG's bookings
- **INSERT**: Only authenticated users can create bookings
- **UPDATE**: Users or PG owners can update relevant bookings
- **DELETE**: Admin only

#### PGs Table:
- **SELECT**: Everyone can view
- **INSERT/UPDATE**: Only PG owners
- **DELETE**: Admin only

#### Amenities Table:
- **SELECT**: Everyone can view (public data)
- **INSERT/UPDATE/DELETE**: Admin only

### Setup Instructions:
1. Go to Supabase Dashboard → SQL Editor
2. Copy SQL from `RLS_Policies.md`
3. Execute to create policies
4. Test permissions before deploying to production

---

## 📊 Student Side Integration

### PGDetailsModal Changes
**Location**: `/src/components/student/PGDetailsModal.tsx`

**Key Changes**:
1. Fetch available rooms only (`status = 'available'`)
2. Display available rooms as selectable list
3. Show room details (type, bathroom, beds, amenities, rent)
4. Student selects specific room when booking
5. If no available rooms, show "PG is currently full" banner

**Booking Flow**:
```
Student clicks "Book Now"
  ↓
Available rooms displayed in dropdown
  ↓
Student selects room + dates
  ↓
Booking created with room_id + room rent (not PG price)
  ↓
Owner's room booking count updated automatically
```

**Real-time Sync**:
- When owner toggles room status to "booked"
- Supabase real-time subscription triggers
- Room disappears from student's available rooms list
- No double-booking possible

---

## 📱 Responsive Design

| Device | Behavior |
|--------|----------|
| Mobile | Single column room grid, floating action buttons |
| Tablet | Two column room grid |
| Desktop | Three column room grid with side modals |

**Tailwind Classes Used**:
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for responsive grid
- `max-w-7xl` for content max-width
- `p-4 md:p-8` for responsive padding

---

## 🎨 UI/Animation Details

### RoomCard Animations:
```typescript
whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
// - Lifts on hover
// - Adds shadow
// - Smooth 0.3s transition
```

### Modal Animations:
```typescript
initial={{ opacity: 0, scale: 0.95, y: 20 }}
animate={{ opacity: 1, scale: 1, y: 0 }}
exit={{ opacity: 0, scale: 0.95, y: 20 }}
// - Scales up from smaller size
// - Smooth entrance/exit
// - Uses framer-motion AnimatePresence
```

### Button States:
- Hover: Scale slightly, change shadow
- Active: Pressed state with slight scale down
- Disabled: Opacity 0.5, cursor not-allowed
- Loading: Icon spins with `animate-spin`

---

## 🔄 Real-time Data Flow

```
Owner Updates Room Status
    ↓
useRooms hook detects change via Supabase subscription
    ↓
Local state updates immediately (optimistic)
    ↓
RoomCard re-renders with new status
    ↓
Filter updates room count badges
    ↓
    ├→ Student's browser also receives update
    │   ↓
    │   Room disappears from available list
    │   ↓
    │   "PG full" banner shown if all booked
    │
    └→ Owner sees confirmation toast
        "Room 102 set to Booked"
```

---

## 🚀 Deployment Checklist

- [ ] Create `amenities` table in Supabase with sample data (AC, TV, WiFi, Geyser, etc.)
- [ ] Create `rooms` table with all required columns
- [ ] Create `bookings` table with room_id foreign key
- [ ] Apply RLS policies from `RLS_Policies.md`
- [ ] Create indexes on frequently queried columns:
  - `rooms(pg_id)`
  - `rooms(status)`
  - `bookings(room_id)`
  - `bookings(user_id)`
- [ ] Test owner portal: Add/Edit/Delete rooms
- [ ] Test student portal: View available rooms, make bookings
- [ ] Test real-time sync: Update room status, verify student sees change
- [ ] Test deletion: Verify rooms with active bookings can't be deleted
- [ ] Load test: Ensure RLS policies perform well with many rooms

---

## 📞 Troubleshooting

### Issue: Rooms not appearing
**Solution**: 
- Check RLS policies allow SELECT for owner
- Verify `pg_id` matches user's PG
- Check browser console for errors

### Issue: Availability toggle not working
**Solution**:
- Verify RLS policy allows UPDATE
- Check network tab for failed requests
- Ensure `room_id` column is indexed

### Issue: Delete button disabled for rooms without bookings
**Solution**:
- Check booking validation query
- Verify `bookings` table has correct data
- Reload page to refresh booking count

### Issue: Student can't see available rooms
**Solution**:
- Verify rooms have `status = 'available'`
- Check PGDetailsModal real-time subscription
- Ensure student is authenticated

---

## 📚 Related Files

- Component: `/src/components/owner/PGDetailsPage.tsx`
- Components: `/src/components/owner/{RoomCard,AddRoomModal,EditRoomModal,DeleteConfirmationModal}.tsx`
- Hook: `/src/hooks/useRooms.ts`
- Types: `/src/types/pg.ts` (Room, Amenity, Booking interfaces)
- Security: `/src/guidelines/RLS_Policies.md`
- Student Integration: `/src/components/student/PGDetailsModal.tsx`
- Guidelines: `/src/guidelines/`
