import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Plus, Check, AlertCircle } from 'lucide-react';
import { PG, Room, Amenity } from '../../types/pg';
import { useRooms } from '../../hooks/useRooms';
import { createClient } from '../../utils/supabase/client';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';

import RoomCard from './RoomCard';
import AddRoomModal from './AddRoomModal';
import EditRoomModal from './EditRoomModal';
import DeleteConfirmationModal from './DeleteConfirmationModal';

interface PGDetailsPageProps {
  pgId: string;
  onBack: () => void;
}

export default function PGDetailsPage({ pgId, onBack }: PGDetailsPageProps) {
  const { accessToken } = useAuthStore();

  const [pg, setPg] = useState<PG | null>(null);
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [pgLoading, setPgLoading] = useState(true);
  const [pgError, setPgError] = useState<string | null>(null);

  const { rooms, isLoading, fetchRooms, addRoom, updateRoom, toggleAvailability, deleteRoom } =
    useRooms(pgId || '');

  const [addRoomOpen, setAddRoomOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [deletingRoomNumber, setDeletingRoomNumber] = useState('');
  const [deletingBookingCount, setDeletingBookingCount] = useState(0);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTogglingAvailability, setIsTogglingAvailability] = useState<string | null>(null);

  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [roomFilter, setRoomFilter] = useState<'all' | 'available' | 'booked'>('all');

  const supabase = createClient();

  // Fetch PG details
  useEffect(() => {
    const fetchPG = async () => {
      if (!pgId || !accessToken) return;

      setPgLoading(true);
      setPgError(null);
      try {
        const response = await fetch(
          `https://odxrugzhcfeksxvnfmyn.supabase.co/functions/v1/make-server-2c39c550/pgs/${pgId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) throw new Error('Failed to fetch PG details');
        const data = await response.json();
        setPg(data);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to load PG details';
        setPgError(errorMsg);
        console.error('Error fetching PG:', err);
        toast.error(errorMsg);
      } finally {
        setPgLoading(false);
      }
    };

    fetchPG();
  }, [pgId, accessToken]);

  // Fetch amenities
  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const { data, error } = await supabase.from('amenities').select('*');
        if (error) throw error;
        setAmenities(data || []);
      } catch (err) {
        console.error('Error fetching amenities:', err);
      }
    };

    fetchAmenities();
  }, [supabase]);

  // Apply filter to rooms
  useEffect(() => {
    let filtered = rooms;
    if (roomFilter === 'available') {
      filtered = rooms.filter((room) => room.status === 'available');
    } else if (roomFilter === 'booked') {
      filtered = rooms.filter((room) => room.status === 'booked');
    }
    setFilteredRooms(filtered);
  }, [rooms, roomFilter]);

  const handleAddRoom = async (roomData: any) => {
    setIsSubmitting(true);
    try {
      await addRoom(roomData);
      setAddRoomOpen(false);
    } catch (err) {
      console.error('Error adding room:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRoom = (room: Room) => {
    setEditingRoom(room);
  };

  const handleSaveEdit = async (roomId: string, updates: any) => {
    setIsSubmitting(true);
    try {
      await updateRoom(roomId, updates);
      setEditingRoom(null);
    } catch (err) {
      console.error('Error updating room:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async (roomId: string, roomNumber: string) => {
    try {
      // Check for active bookings
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_id', roomId)
        .in('status', ['pending', 'approved', 'confirmed']);

      setDeletingRoomId(roomId);
      setDeletingRoomNumber(roomNumber);
      setDeletingBookingCount(bookings?.length || 0);
    } catch (err) {
      console.error('Error checking bookings:', err);
      toast.error('Failed to check room bookings');
    }
  };

  const confirmDelete = async () => {
    if (!deletingRoomId) return;

    setIsSubmitting(true);
    try {
      await deleteRoom(deletingRoomId);
      setDeletingRoomId(null);
      setDeletingRoomNumber('');
      setDeletingBookingCount(0);
    } catch (err) {
      console.error('Error deleting room:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailability = async (roomId: string) => {
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return;

    setIsTogglingAvailability(roomId);
    try {
      await toggleAvailability(roomId, room.status);
    } catch (err) {
      console.error('Error toggling availability:', err);
    } finally {
      setIsTogglingAvailability(null);
    }
  };

  const amenityMap = amenities.reduce(
    (acc, amenity) => ({ ...acc, [amenity.id]: amenity.name }),
    {}
  );

  if (pgLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600">Loading PG details...</p>
        </div>
      </div>
    );
  }

  if (pgError || !pg) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-stone-900 font-semibold mb-4">{pgError || 'PG not found'}</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Back to Manage PGs
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-stone-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start justify-between mb-8"
        >
          <div>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Manage PGs
            </button>

            <h1 className="text-4xl font-bold text-stone-900 mb-2">{pg.name}</h1>
            <div className="flex items-center gap-3">
              <p className="text-stone-600">{pg.location}</p>
              {pg.verified && (
                <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  <Check className="w-4 h-4" />
                  Verified
                </span>
              )}
            </div>
          </div>

          {/* Add Room Button */}
          <button
            onClick={() => setAddRoomOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold transition-all hover:shadow-lg hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            Add Room
          </button>
        </motion.div>

        {/* Room Filter Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 mb-8"
        >
          {(['all', 'available', 'booked'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setRoomFilter(filter)}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                roomFilter === filter
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-white text-stone-700 hover:bg-stone-100'
              }`}
            >
              {filter === 'all' ? 'All Rooms' : filter === 'available' ? 'Available' : 'Booked'}
              <span className="ml-2 text-sm">
                (
                {
                  rooms.filter((r) =>
                    filter === 'all' ? true : filter === 'available' ? r.status === 'available' : r.status === 'booked'
                  ).length
                }
                )
              </span>
            </button>
          ))}
        </motion.div>

        {/* Rooms Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-stone-600">Loading rooms...</p>
            </div>
          </div>
        ) : filteredRooms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white rounded-2xl p-12 text-center"
          >
            <p className="text-stone-600 text-lg mb-4">
              {roomFilter === 'all'
                ? 'No rooms added yet. Click "Add Room" to create your first room.'
                : `No ${roomFilter} rooms.`}
            </p>
            {roomFilter === 'all' && (
              <button
                onClick={() => setAddRoomOpen(true)}
                className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
              >
                Add First Room
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map((room) => (
              <RoomCard
                key={room.id}
                room={room}
                amenityNames={amenityMap}
                onEdit={handleEditRoom}
                onDelete={handleDeleteRoom}
                onToggleAvailability={handleToggleAvailability}
                isTogglingAvailability={isTogglingAvailability === room.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <AddRoomModal
        pgId={pgId || ''}
        isOpen={addRoomOpen}
        onClose={() => setAddRoomOpen(false)}
        onSubmit={handleAddRoom}
        isSubmitting={isSubmitting}
      />

      <EditRoomModal
        room={editingRoom}
        isOpen={!!editingRoom}
        onClose={() => setEditingRoom(null)}
        onSubmit={handleSaveEdit}
        isSubmitting={isSubmitting}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingRoomId}
        roomNumber={deletingRoomNumber}
        bookingCount={deletingBookingCount}
        onConfirm={confirmDelete}
        onCancel={() => {
          setDeletingRoomId(null);
          setDeletingRoomNumber('');
          setDeletingBookingCount(0);
        }}
        isDeleting={isSubmitting}
      />
    </div>
  );
}
