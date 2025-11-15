import { motion } from 'motion/react';
import { Trash2, Edit2, Zap } from 'lucide-react';
import { Room } from '../../types/pg';

interface RoomCardProps {
  room: Room;
  amenityNames: Record<string, string>;
  onEdit: (room: Room) => void;
  onDelete: (roomId: string, roomNumber: string) => void;
  onToggleAvailability: (roomId: string) => void;
  isTogglingAvailability: boolean;
}

export default function RoomCard({
  room,
  amenityNames,
  onEdit,
  onDelete,
  onToggleAvailability,
  isTogglingAvailability,
}: RoomCardProps) {
  const isAvailable = room.status === 'available';
  const borderColor = isAvailable ? 'border-green-500' : 'border-gray-400';
  const statusColor = isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  const statusText = isAvailable ? '🟢 Available' : '⚫ Booked';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      whileHover={{ y: -4, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
      className={`border-t-4 ${borderColor} bg-white rounded-xl shadow-md p-4 hover:shadow-lg transition-all duration-300`}
    >
      {/* Header Row */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-stone-900">Room {room.room_number}</h3>
          <p className="text-stone-500 text-sm">{room.pg_id}</p>
        </div>
        <button
          onClick={() => onDelete(room.id, room.room_number)}
          className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 hover:text-red-700 hover:scale-110"
          title="Delete room"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Room Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-3">
          <span className="text-stone-600 text-sm font-medium">👥 Type:</span>
          <span className="text-stone-900 capitalize">{room.type}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-stone-600 text-sm font-medium">🚿 Bathroom:</span>
          <span className="text-stone-900 capitalize">{room.bathroom_type}</span>
        </div>
      </div>

      {/* Rent & Beds Row */}
      <div className="flex items-center justify-between mb-4 p-3 bg-stone-50 rounded-lg">
        <div>
          <p className="text-stone-600 text-sm">Monthly Rent</p>
          <p className="text-lg font-semibold text-amber-700">₹{room.rent.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-stone-600 text-sm">Beds Available</p>
          <p className="text-lg font-semibold text-stone-900">
            {room.beds_available}/{room.beds_total}
          </p>
        </div>
      </div>

      {/* Amenities */}
      {room.amenities && room.amenities.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {room.amenities.map((amenityId) => (
            <span
              key={amenityId}
              className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-medium rounded-full"
            >
              {amenityNames[amenityId] || amenityId}
            </span>
          ))}
        </div>
      )}

      {/* Status Badge */}
      <div className={`mb-4 px-3 py-1.5 ${statusColor} rounded-lg text-sm font-medium inline-block`}>
        {statusText}
      </div>

      {/* Footer - Edit & Toggle */}
      <div className="flex items-center gap-2 pt-3 border-t border-stone-200">
        <button
          onClick={() => onEdit(room)}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>

        {/* Availability Toggle Switch */}
        <button
          onClick={() => onToggleAvailability(room.id)}
          disabled={isTogglingAvailability}
          className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
            isAvailable
              ? 'bg-green-100 hover:bg-green-200 text-green-800'
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
          title={`Click to mark as ${isAvailable ? 'booked' : 'available'}`}
        >
          <Zap className={`w-4 h-4 ${isTogglingAvailability ? 'animate-spin' : ''}`} />
          {isAvailable ? 'Available' : 'Booked'}
        </button>
      </div>
    </motion.div>
  );
}
