import { useState, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Star, Wifi, Wind, Utensils, Shirt, Shield, BookOpen, Dumbbell, Phone, Mail, Calendar, AlertCircle } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useAuthStore } from '../../store/authStore';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner';
import { createClient } from '../../utils/supabase/client';

import { PG, Review, Room } from '../../types/pg';

interface PGDetailsModalProps {
  pg: PG;
  onClose: () => void;
}

const amenityIcons: Record<string, any> = {
  WiFi: Wifi,
  AC: Wind,
  Meals: Utensils,
  Laundry: Shirt,
  Security: Shield,
  'Study Room': BookOpen,
  Gym: Dumbbell,
  Parking: MapPin,
};

export default function PGDetailsModal({ pg, onClose }: PGDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingData, setBookingData] = useState({
    roomId: '',
    checkIn: '',
    checkOut: '',
  });
  const { accessToken } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    fetchReviews();
    fetchAvailableRooms();
  }, []);

  // Fetch only available rooms
  const fetchAvailableRooms = async () => {
    setRoomsLoading(true);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .eq('pg_id', pg.id)
        .eq('status', 'available')
        .order('room_number', { ascending: true });

      if (error) throw error;
      setRooms(data || []);

      // If no available rooms, show banner
      if (!data || data.length === 0) {
        console.log('No available rooms for this PG');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to load available rooms');
    } finally {
      setRoomsLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/pgs/${pg.id}/reviews`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const handleBooking = async () => {
    if (!accessToken) {
      toast.error('Please login to book');
      return;
    }

    if (!bookingData.roomId) {
      toast.error('Please select a room');
      return;
    }

    if (!bookingData.checkIn || !bookingData.checkOut) {
      toast.error('Please select check-in and check-out dates');
      return;
    }

    // Calculate duration in months
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const duration = Math.ceil(diffDays / 30); // Approximate months

    if (duration <= 0) {
      toast.error('Check-out date must be after check-in date');
      return;
    }

    // Get selected room
    const selectedRoom = rooms.find((r) => r.id === bookingData.roomId);
    if (!selectedRoom) {
      toast.error('Selected room not found');
      return;
    }

    const totalAmount = selectedRoom.rent * duration;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/bookings`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            pgId: pg.id,
            roomType: selectedRoom.type,
            checkIn: bookingData.checkIn,
            duration,
            totalAmount,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success('Booking request sent successfully!');
        setShowBooking(false);
        onClose();
      } else {
        const error = await response.text();
        console.error('Booking failed:', error);
        toast.error('Failed to create booking');
      }
    } catch (error) {
      console.error('Booking error:', error);
      toast.error('An error occurred while booking');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="sticky top-4 left-full ml-4 p-2 bg-white rounded-full shadow-lg hover:bg-stone-100 transition-colors z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image carousel */}
          <div className="relative h-96 overflow-hidden rounded-t-3xl">
            <ImageWithFallback
              src={pg.images[currentImageIndex]}
              alt={pg.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Image navigation dots */}
            {pg.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {pg.images.map((_: string, index: number) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      index === currentImageIndex ? 'bg-white w-8' : 'bg-white/50'
                    }`}
                  />
                ))}
              </div>
            )}

            {/* Verified badge */}
            {pg.verified && (
              <div className="absolute top-4 left-4 px-4 py-2 bg-green-500 text-white rounded-full">
                ✓ Verified Property
              </div>
            )}
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="text-stone-900 mb-2">{pg.name}</h2>
                  <div className="flex items-center gap-2 text-stone-600">
                    <MapPin className="w-4 h-4" />
                    <span>{pg.location}</span>
                    <span>•</span>
                    <span>{pg.distance} km from ADTU</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-amber-700 mb-1">₹{pg.price}</div>
                  <div className="text-stone-500">/month</div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                  <span className="text-stone-900">{pg.rating}</span>
                  <span className="text-stone-500">({pg.reviews} reviews)</span>
                </div>
                <div className="px-3 py-1 bg-stone-100 rounded-full text-stone-700 capitalize">
                  {pg.gender}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-stone-900 mb-2">About this PG</h3>
              <p className="text-stone-600 leading-relaxed">{pg.description}</p>
            </div>

            {/* Amenities */}
            <div className="mb-6">
              <h3 className="text-stone-900 mb-4">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pg.amenities.map((amenity: string) => {
                  const Icon = amenityIcons[amenity] || Wifi;
                  return (
                    <div
                      key={amenity}
                      className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl"
                    >
                      <Icon className="w-5 h-5 text-amber-700" />
                      <span className="text-stone-700">{amenity}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Owner info */}
            <div className="mb-6 p-4 bg-stone-50 rounded-xl">
              <h3 className="text-stone-900 mb-3">Contact Owner</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-stone-600">
                  <Phone className="w-4 h-4" />
                  <span>{pg.ownerName}</span>
                </div>
                <div className="flex items-center gap-3 text-stone-600">
                  <Mail className="w-4 h-4" />
                  <span>{pg.ownerPhone}</span>
                </div>
              </div>
            </div>

            {/* Reviews */}
            <div className="mb-6">
              <h3 className="text-stone-900 mb-4">
                Reviews ({reviews.length})
              </h3>
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.slice(0, 3).map((review: any) => (
                    <div key={review.id} className="p-4 bg-stone-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-stone-900">{review.userName}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                          <span>{review.rating}</span>
                        </div>
                      </div>
                      <p className="text-stone-600">{review.comment}</p>
                      <p className="text-stone-400 mt-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-stone-500">No reviews yet</p>
              )}
            </div>

            {/* Available Rooms */}
            <div className="mb-6">
              <h3 className="text-stone-900 mb-4">Available Rooms</h3>
              {roomsLoading ? (
                <div className="text-center py-6">
                  <div className="w-8 h-8 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-2"></div>
                  <p className="text-stone-500">Loading rooms...</p>
                </div>
              ) : rooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {rooms.map((room) => (
                    <div key={room.id} className="p-4 border border-stone-200 rounded-xl hover:border-amber-500 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-semibold text-stone-900">Room {room.room_number}</h4>
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Available
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-stone-600 mb-2">
                        <p>📝 {room.type.charAt(0).toUpperCase() + room.type.slice(1)} room</p>
                        <p>🚿 {room.bathroom_type === 'attached' ? 'Attached' : 'Common'} bathroom</p>
                        <p>🛏️ {room.beds_available}/{room.beds_total} beds available</p>
                        <p className="text-amber-700 font-semibold">₹{room.rent.toLocaleString()}/month</p>
                      </div>
                      {room.amenities && room.amenities.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {room.amenities.slice(0, 3).map((amenity) => (
                            <span
                              key={amenity}
                              className="text-xs px-2 py-1 bg-stone-100 text-stone-700 rounded"
                            >
                              {amenity}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-xl flex gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                  <div>
                    <p className="text-yellow-800 font-medium">This PG is currently full</p>
                    <p className="text-yellow-700 text-sm">All rooms are booked. Check back soon!</p>
                  </div>
                </div>
              )}
            </div>

            {/* Booking section */}
            {!showBooking ? (
              <button
                onClick={() => setShowBooking(true)}
                disabled={rooms.length === 0}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {rooms.length === 0 ? 'No Available Rooms' : 'Book Now'}
              </button>
            ) : (
              <motion.div
                className="p-6 bg-stone-50 rounded-xl"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <h3 className="text-stone-900 mb-4">Booking Details</h3>
                
                {rooms.length === 0 ? (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex gap-3 mb-4">
                    <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                    <div>
                      <p className="text-yellow-800 font-medium">This PG is currently full</p>
                      <p className="text-yellow-700 text-sm">All rooms are booked. Check back soon!</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-stone-700 mb-2">Select Room *</label>
                      <select
                        value={bookingData.roomId}
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                          setBookingData({ ...bookingData, roomId: e.target.value })
                        }
                        className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="">Choose a room...</option>
                        {rooms.map((room) => (
                          <option key={room.id} value={room.id}>
                            Room {room.room_number} - {room.type} ({room.beds_available}/{room.beds_total} beds) -
                            ₹{room.rent}/month
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-stone-700 mb-2">Check-in Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                          <input
                            type="date"
                            value={bookingData.checkIn}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setBookingData({ ...bookingData, checkIn: e.target.value })
                            }
                            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-stone-700 mb-2">Check-out Date</label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                          <input
                            type="date"
                            value={bookingData.checkOut}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              setBookingData({ ...bookingData, checkOut: e.target.value })
                            }
                            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBooking(false)}
                    className="flex-1 py-3 bg-stone-200 text-stone-700 rounded-xl hover:bg-stone-300 transition-colors"
                  >
                    Cancel
                  </button>
                  {rooms.length > 0 && (
                    <button
                      onClick={handleBooking}
                      className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-lg transition-all"
                    >
                      Confirm Booking
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
