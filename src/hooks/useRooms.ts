import { useState, useEffect, useCallback } from 'react';
import { Room } from '../types/pg';
import { createClient } from '../utils/supabase/client';
import { projectId } from '../utils/supabase/info';
import { toast } from 'sonner';

export const useRooms = (pgId: string) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  // Fetch all rooms for a PG
  const fetchRooms = useCallback(async () => {
    if (!pgId) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('rooms')
        .select('*')
        .eq('pg_id', pgId)
        .order('room_number', { ascending: true });

      if (err) throw err;
      setRooms(data || []);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to load rooms';
      setError(errorMsg);
      console.error('Error fetching rooms:', err);
    } finally {
      setIsLoading(false);
    }
  }, [pgId, supabase]);

  // Set up real-time subscription
  useEffect(() => {
    if (!pgId) return;

    fetchRooms();

    // Subscribe to real-time changes on rooms table
    const channel = supabase
      .channel(`rooms_${pgId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `pg_id=eq.${pgId}`,
        },
        (payload) => {
          console.log('Room change received:', payload);
          
          if (payload.eventType === 'INSERT') {
            // Insert new room in sorted position using binary search
            const newRoom = payload.new as Room;
            setRooms((prev) => {
              // Find correct insertion position
              const insertIndex = prev.findIndex(
                (room) => room.room_number.localeCompare(newRoom.room_number) > 0
              );
              const newRooms = [...prev];
              insertIndex === -1 ? newRooms.push(newRoom) : newRooms.splice(insertIndex, 0, newRoom);
              return newRooms;
            });
          } else if (payload.eventType === 'UPDATE') {
            setRooms((prev) =>
              prev.map((room) =>
                room.id === (payload.new as Room).id ? (payload.new as Room) : room
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setRooms((prev) => prev.filter((room) => room.id !== (payload.old as Room).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [pgId, fetchRooms, supabase]);

  // Add a new room
  const addRoom = useCallback(
    async (roomData: Omit<Room, 'id' | 'created_at' | 'updated_at'>) => {
      try {
        const { data, error: err } = await (supabase as any)
          .from('rooms')
          .insert([
            {
              ...roomData,
              status: 'available',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            },
          ])
          .select();

        if (err) throw err;
        if (data) {
          toast.success(`Room ${roomData.room_number} added successfully`);
          return data[0];
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to add room';
        setError(errorMsg);
        toast.error(`Error: ${errorMsg}`);
        throw err;
      }
    },
    [supabase]
  );

  // Update a room
  const updateRoom = useCallback(
    async (roomId: string, updates: Partial<Room>) => {
      try {
        const { data, error: err } = await (supabase as any)
          .from('rooms')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', roomId)
          .select();

        if (err) throw err;
        if (data) {
          toast.success('Room updated successfully');
          return data[0];
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update room';
        setError(errorMsg);
        toast.error(`Error: ${errorMsg}`);
        throw err;
      }
    },
    [supabase]
  );

  // Toggle room availability status
  const toggleAvailability = useCallback(
    async (roomId: string, currentStatus: string) => {
      const newStatus = currentStatus === 'available' ? 'booked' : 'available';
      try {
        const { data, error: err } = await (supabase as any)
          .from('rooms')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', roomId)
          .select();

        if (err) throw err;
        if (data) {
          setRooms((prev) =>
            prev.map((room) => (room.id === roomId ? data[0] : room))
          );
          toast.success(`Room status updated to ${newStatus}`);
          return data[0];
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to update room status';
        setError(errorMsg);
        toast.error(`Error: ${errorMsg}`);
        throw err;
      }
    },
    [supabase]
  );

  // Delete a room
  const deleteRoom = useCallback(
    async (roomId: string) => {
      try {
        // Check for active bookings first (count only, more efficient)
        const { count, error: countErr } = await supabase
          .from('bookings')
          .select('id', { count: 'exact', head: true })
          .eq('room_id', roomId)
          .in('status', ['pending', 'approved', 'confirmed']);

        if (countErr) throw countErr;

        if ((count || 0) > 0) {
          throw new Error(
            `Cannot delete room with ${count} active booking(s). Please cancel bookings first.`
          );
        }

        const { error: err } = await supabase.from('rooms').delete().eq('id', roomId);

        if (err) throw err;
        toast.success('Room deleted successfully');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to delete room';
        setError(errorMsg);
        toast.error(`Error: ${errorMsg}`);
        throw err;
      }
    },
    [supabase]
  );

  return {
    rooms,
    isLoading,
    error,
    fetchRooms,
    addRoom,
    updateRoom,
    toggleAvailability,
    deleteRoom,
  };
};
