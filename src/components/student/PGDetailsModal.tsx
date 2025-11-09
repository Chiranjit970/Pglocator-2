import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Star, Wifi, Wind, Utensils, Shirt, Shield, BookOpen, Dumbbell, Phone, Mail, Calendar } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useAuthStore } from '../../store/authStore';
import { projectId } from '../../utils/supabase/info';
import { toast } from 'sonner@2.0.3';

interface PG {
  id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  distance: number;
  gender: string;
  images: string[];
  amenities: string[];
  rating: number;
  reviews: number;
  verified: boolean;
  ownerName: string;
  ownerPhone: string;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

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
  const [showBooking, setShowBooking] = useState(false);
  const [bookingData, setBookingData] = useState({
    roomType: 'single',
    checkIn: '',
    checkOut: '',
  });
  const { accessToken } = useAuthStore();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/pgs/${pg.id}/reviews`
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

    const totalAmount = pg.price * duration;

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
            roomType: bookingData.roomType,
            checkIn: bookingData.checkIn,
            duration,
            totalAmount,
          }),
        }
      );

      if (response.ok) {
        const result = await response.json();
        toast.success('Booking confirmed successfully!');
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
                {pg.images.map((_, index) => (
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
                {pg.amenities.map((amenity) => {
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
                  {reviews.slice(0, 3).map((review) => (
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

            {/* Booking section */}
            {!showBooking ? (
              <button
                onClick={() => setShowBooking(true)}
                className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-lg transition-all duration-300"
              >
                Book Now
              </button>
            ) : (
              <motion.div
                className="p-6 bg-stone-50 rounded-xl"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <h3 className="text-stone-900 mb-4">Booking Details</h3>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-stone-700 mb-2">Room Type</label>
                    <select
                      value={bookingData.roomType}
                      onChange={(e) =>
                        setBookingData({ ...bookingData, roomType: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="single">Single Room</option>
                      <option value="double">Double Sharing</option>
                      <option value="triple">Triple Sharing</option>
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
                          onChange={(e) =>
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
                          onChange={(e) =>
                            setBookingData({ ...bookingData, checkOut: e.target.value })
                          }
                          className="w-full pl-10 pr-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowBooking(false)}
                    className="flex-1 py-3 bg-stone-200 text-stone-700 rounded-xl hover:bg-stone-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBooking}
                    className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    Confirm Booking
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
