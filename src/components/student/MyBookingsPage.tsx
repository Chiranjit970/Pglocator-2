import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { BookmarkCheck, ArrowLeft, MapPin, Calendar, DollarSign, Download, Star } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { projectId } from '../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

interface Booking {
  id: string;
  pgId: string;
  roomType: string;
  checkIn: string;
  duration: number;
  totalAmount: number;
  status: string;
  createdAt: string;
  pg: {
    id: string;
    name: string;
    location: string;
    images: string[];
    ownerName: string;
    ownerPhone: string;
  };
}

interface MyBookingsPageProps {
  onBack: () => void;
}

export default function MyBookingsPage({ onBack }: MyBookingsPageProps) {
  const { accessToken } = useAuthStore();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [reviewData, setReviewData] = useState({
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/user/bookings`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadInvoice = (booking: Booking) => {
    // Create a simple text invoice
    const invoiceText = `
PG LOCATOR - BOOKING INVOICE
============================

Booking ID: ${booking.id}
Date: ${new Date(booking.createdAt).toLocaleDateString()}

PG Details:
-----------
Name: ${booking.pg.name}
Location: ${booking.pg.location}
Room Type: ${booking.roomType}

Booking Details:
---------------
Check-in: ${new Date(booking.checkIn).toLocaleDateString()}
Duration: ${booking.duration} months
Total Amount: ₹${booking.totalAmount}
Status: ${booking.status}

Owner Contact:
--------------
Name: ${booking.pg.ownerName}
Phone: ${booking.pg.ownerPhone}

============================
Thank you for using PG Locator!
    `;

    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `invoice-${booking.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    toast.success('Invoice downloaded!');
  };

  const handleSubmitReview = async () => {
    if (!selectedBooking || !accessToken) return;

    if (!reviewData.comment.trim()) {
      toast.error('Please write a review comment');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/reviews`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            pgId: selectedBooking.pgId,
            rating: reviewData.rating,
            comment: reviewData.comment,
          }),
        }
      );

      if (response.ok) {
        toast.success('Review submitted successfully!');
        setShowReviewModal(false);
        setReviewData({ rating: 5, comment: '' });
        setSelectedBooking(null);
      } else {
        toast.error('Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    }
  };

  const activeBookings = bookings.filter((b) => b.status === 'confirmed');
  const pastBookings = bookings.filter((b) => b.status !== 'confirmed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50">
      {/* Header */}
      <motion.header
        className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </button>
          <div className="flex items-center gap-3">
            <BookmarkCheck className="w-6 h-6 text-amber-600" />
            <h2 className="text-stone-900">My Bookings</h2>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-600">Loading bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <BookmarkCheck className="w-24 h-24 text-stone-300 mx-auto mb-6" />
            <h3 className="text-stone-900 mb-4">No bookings yet</h3>
            <p className="text-stone-600 mb-8 max-w-md mx-auto">
              Find your perfect PG and make your first booking!
            </p>
            <button
              onClick={onBack}
              className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Browse PGs
            </button>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {/* Active Bookings */}
            {activeBookings.length > 0 && (
              <div>
                <h3 className="text-stone-900 mb-4">Active Bookings ({activeBookings.length})</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {activeBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      className="bg-white rounded-2xl overflow-hidden shadow-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="relative h-40">
                        <ImageWithFallback
                          src={booking.pg.images[0]}
                          alt={booking.pg.name}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white rounded-full">
                          Active
                        </div>
                      </div>

                      <div className="p-6">
                        <h4 className="text-stone-900 mb-2">{booking.pg.name}</h4>
                        <div className="flex items-center gap-2 text-stone-600 mb-4">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.pg.location}</span>
                        </div>

                        <div className="space-y-2 mb-4 text-stone-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>Check-in: {new Date(booking.checkIn).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            <span>₹{booking.totalAmount} ({booking.duration} months)</span>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownloadInvoice(booking)}
                            className="flex-1 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
                          >
                            <Download className="w-4 h-4" />
                            Invoice
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowReviewModal(true);
                            }}
                            className="flex-1 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
                          >
                            <Star className="w-4 h-4" />
                            Review
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Past Bookings */}
            {pastBookings.length > 0 && (
              <div>
                <h3 className="text-stone-900 mb-4">Past Bookings ({pastBookings.length})</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {pastBookings.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      className="bg-white rounded-2xl overflow-hidden shadow-lg opacity-70"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 0.7, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="relative h-40">
                        <ImageWithFallback
                          src={booking.pg.images[0]}
                          alt={booking.pg.name}
                          className="w-full h-full object-cover grayscale"
                        />
                      </div>

                      <div className="p-6">
                        <h4 className="text-stone-900 mb-2">{booking.pg.name}</h4>
                        <div className="flex items-center gap-2 text-stone-600 mb-4">
                          <MapPin className="w-4 h-4" />
                          <span>{booking.pg.location}</span>
                        </div>

                        <div className="text-stone-500">
                          Completed on {new Date(booking.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl max-w-md w-full p-6"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <h3 className="text-stone-900 mb-4">Write a Review</h3>
            <p className="text-stone-600 mb-6">{selectedBooking.pg.name}</p>

            <div className="mb-6">
              <label className="block text-stone-700 mb-2">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setReviewData({ ...reviewData, rating: star })}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= reviewData.rating
                          ? 'fill-amber-500 text-amber-500'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-stone-700 mb-2">Your Review</label>
              <textarea
                value={reviewData.comment}
                onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                rows={4}
                placeholder="Share your experience..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setReviewData({ rating: 5, comment: '' });
                  setSelectedBooking(null);
                }}
                className="flex-1 py-3 bg-stone-100 text-stone-700 rounded-xl hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReview}
                className="flex-1 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Submit Review
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
