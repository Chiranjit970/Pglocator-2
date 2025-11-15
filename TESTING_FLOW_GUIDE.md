# Room Management Flow - Testing Guide

## ✅ Flow Linking Implementation Complete

All buttons and navigation have been successfully linked. You can now test the complete owner flow for room management.

---

## 🎯 Complete Owner Flow

### 1. **Dashboard → Manage PGs**
```
Dashboard Home
   ↓
Click "Manage PGs" button (Quick Actions or Side Nav)
   ↓
ManagePGs page shows list of all PG listings
```

**What to test:**
- Dashboard loads with stats cards
- "Manage PGs" button in Quick Actions section is clickable
- "Manage PGs" button in left sidebar is clickable
- Manage PGs page displays your PG listings with images

---

### 2. **Manage PGs → View/Edit Individual PG**
```
ManagePGs List
   ↓
Click "View" button (gray button with eye icon)
   ↓
PGDetailsPage loads with room management interface
```

OR

```
ManagePGs List
   ↓
Click "Edit & Manage Rooms" button (blue button with pencil icon)
   ↓
PGDetailsPage loads with room management interface
```

**What to test:**
- Both "View" and "Edit & Manage Rooms" buttons navigate to PGDetailsPage
- PGDetailsPage displays correct PG name and location
- PGDetailsPage shows "Back to Manage PGs" button
- Room list loads (initially empty if no rooms added)

---

### 3. **PGDetailsPage - Add New Room**
```
PGDetailsPage
   ↓
Click "+ Add Room" button (green button)
   ↓
AddRoomModal opens
   ↓
Fill in room details:
   - Room Number: e.g., "101"
   - Type: single/double/triple/quad
   - Bathroom Type: attached/common
   - Rent: e.g., "5000"
   - Total Beds: e.g., "2"
   - Select Amenities (checkboxes)
   ↓
Click "Add Room" button
   ↓
Modal closes, room appears in list with green border (available)
```

**What to test:**
- "+ Add Room" button opens AddRoomModal
- Form fields accept input
- Amenities dropdown/checkboxes work
- Form validation shows errors for missing/invalid fields
- Room successfully added and appears in list with status indicator

---

### 4. **PGDetailsPage - Edit Existing Room**
```
Room Card (appears in grid)
   ↓
Click "Edit" button (blue button on room card)
   ↓
EditRoomModal opens with pre-filled data
   ↓
Modify any room details
   ↓
Click "Update Room" button
   ↓
Modal closes, room updates in list
```

**What to test:**
- Edit button opens EditRoomModal with all current room data
- All fields are pre-filled correctly
- Can modify room details
- Amenities are pre-selected
- Room successfully updates

---

### 5. **PGDetailsPage - Toggle Room Availability**
```
Room Card
   ↓
Click Availability Toggle Switch (bottom right)
   ↓
Room status changes between:
   - "available" (green border)
   - "booked" (gray border)
   ↓
Status updates immediately (real-time sync)
```

**What to test:**
- Toggle switch works smoothly
- Room border color changes (green ↔ gray)
- Status label updates
- Change reflects instantly (real-time)

---

### 6. **PGDetailsPage - Delete Room**
```
Room Card
   ↓
Click "Delete" button (red button on room card)
   ↓
DeleteConfirmationModal opens
   ↓
Check booking count:
   - If bookings exist: "Cannot delete - X active bookings"
   - If no bookings: "Delete Room" button enabled
   ↓
If enabled: Click "Delete Room"
   ↓
Modal closes, room removed from list
```

**What to test:**
- Delete button opens confirmation modal
- Modal shows booking count if room is booked
- Delete button disabled if active bookings exist
- Room successfully deletes if no bookings

---

### 7. **Room Filtering Tabs**
```
PGDetailsPage
   ↓
Click "All" tab (shows all rooms)
Click "Available" tab (shows only status=available)
Click "Booked" tab (shows only status=booked)
   ↓
Room count displays next to each tab
```

**What to test:**
- Tabs switch between filtered views
- Room counts display correctly
- Only matching rooms appear when filter applied

---

## 🔄 Complete Test Scenario

### Step-by-step test flow:

1. **Login** as owner
2. **Navigate** to Owner Dashboard
3. **Click** "Manage PGs" → ManagePGs page loads ✓
4. **Click** "Edit & Manage Rooms" on any PG → PGDetailsPage loads ✓
5. **Click** "+ Add Room" → Modal opens ✓
6. **Fill** room form (101, double, attached, ₹8000, 2 beds, select amenities) ✓
7. **Click** "Add Room" → Room 101 appears with green border ✓
8. **Click** "Edit" on Room 101 → EditRoomModal opens with data ✓
9. **Change** rent to ₹8500 → Click "Update Room" ✓
10. **Click** toggle switch → Room border becomes gray (booked) ✓
11. **Click** toggle again → Room border becomes green (available) ✓
12. **Click** "Available" tab → See only Room 101 ✓
13. **Click** "Booked" tab → Room disappears (showing no rooms) ✓
14. **Click** "All" tab → Room 101 reappears ✓
15. **Add** second room (102, single, common, ₹6000, 1 bed) ✓
16. **Toggle** Room 102 to booked ✓
17. **Click** "Delete" on Room 102 → Modal shows "1 active booking" ✓
18. **Delete button** is DISABLED (can't delete booked room) ✓
19. **Toggle** Room 102 back to available ✓
20. **Click** "Delete" on Room 102 → Modal shows "0 active bookings" ✓
21. **Delete button** is ENABLED → Click delete ✓
22. **Room 102** removed from list ✓
23. **Click** "Back to Manage PGs" → Returns to ManagePGs list ✓

---

## 📋 Navigation Map

```
OwnerDashboard
├── Dashboard View (default)
│   ├── Quick Actions
│   │   ├── "Add New PG" → AddPGFlow
│   │   ├── "Manage PGs" → ManagePGs
│   │   └── "View Bookings" → BookingRequests
│   └── Side Sidebar
│       ├── Dashboard
│       ├── Add PG
│       ├── Manage PGs
│       ├── Bookings
│       ├── Reviews
│       └── Profile
│
├── ManagePGs View
│   ├── List of PG listings
│   ├── Each PG Card has:
│   │   ├── "View" button → PGDetailsPage
│   │   ├── "Edit & Manage Rooms" button → PGDetailsPage
│   │   └── "Delete" button → Delete PG
│   └── Back button → Dashboard
│
└── PGDetailsPage (pg-details view)
    ├── Room Management Interface
    ├── "+ Add Room" button → AddRoomModal
    ├── Room Grid with:
    │   ├── RoomCard (each room)
    │   │   ├── "Edit" button → EditRoomModal
    │   │   ├── "Delete" button → DeleteConfirmationModal
    │   │   └── Availability Toggle
    │   ├── "All" filter tab
    │   ├── "Available" filter tab
    │   └── "Booked" filter tab
    └── Back button → ManagePGs
```

---

## 🔗 Modified Files

1. **`src/components/owner/OwnerDashboard.tsx`**
   - Added PGDetailsPage import
   - Added selectedPGId state
   - Added 'pg-details' view type
   - Added onSelectPG callback to ManagePGs
   - Added PGDetailsPage case in renderView()

2. **`src/components/owner/ManagePGs.tsx`**
   - Added onSelectPG prop to interface
   - Added onClick handlers to View and Edit buttons
   - Updated button labels ("Edit & Manage Rooms")

3. **`src/components/owner/PGDetailsPage.tsx`**
   - Removed useParams/useNavigate imports
   - Added PGDetailsPageProps interface
   - Changed to accept pgId and onBack as props
   - Replaced navigate() calls with onBack() callback

---

## ✅ Build Status

```
✓ built in 4.87s
✓ All TypeScript compilation successful
✓ Zero errors
✓ Ready for testing
```

---

## 🧪 Testing Checklist

### Navigation
- [ ] Dashboard → Manage PGs (button click)
- [ ] Manage PGs → PGDetailsPage (View button)
- [ ] Manage PGs → PGDetailsPage (Edit & Manage Rooms button)
- [ ] PGDetailsPage → Manage PGs (Back button)
- [ ] Manage PGs → Dashboard (Back button)

### Room Operations
- [ ] Add new room form opens
- [ ] Add room successfully creates entry
- [ ] Edit room form pre-fills data
- [ ] Edit room updates successfully
- [ ] Toggle availability switches status
- [ ] Delete confirmation modal shows
- [ ] Can't delete room with active bookings
- [ ] Can delete room with no bookings

### Filtering
- [ ] "All" tab shows all rooms
- [ ] "Available" tab filters to available only
- [ ] "Booked" tab filters to booked only
- [ ] Room counts display correctly

### Real-time Updates
- [ ] Room appears immediately after add
- [ ] Room updates immediately after edit
- [ ] Status change reflects instantly
- [ ] Deleted room disappears immediately

### UI/UX
- [ ] Loading states display properly
- [ ] Error messages show when needed
- [ ] Success toast notifications appear
- [ ] Smooth animations on transitions
- [ ] Responsive on mobile/tablet/desktop

---

## 🐛 Troubleshooting

### Issue: Button not responding
**Solution:** Ensure click handler is calling onSelectPG with correct pgId

### Issue: Page doesn't load after button click
**Solution:** Check that selectedPGId is being set and View type is changed to 'pg-details'

### Issue: Back button not working
**Solution:** Verify onBack callback is properly passed from OwnerDashboard to PGDetailsPage

### Issue: Room data not showing
**Solution:** Check that pgId is properly passed to useRooms hook and subscription is active

---

## 📞 Quick Reference

| Action | Component | Handler |
|--------|-----------|---------|
| Navigate to PGDetailsPage | ManagePGs | `onSelectPG(pg.id)` |
| Return to ManagePGs | PGDetailsPage | `onBack()` |
| Add room | PGDetailsPage | `addRoom()` |
| Edit room | PGDetailsPage | `updateRoom()` |
| Toggle status | RoomCard | `toggleAvailability()` |
| Delete room | PGDetailsPage | `deleteRoom()` |
| Filter rooms | PGDetailsPage | `setRoomFilter()` |

---

Generated: November 15, 2025  
Status: ✅ Ready for Testing
