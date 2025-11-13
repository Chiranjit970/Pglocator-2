import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, XCircle, Clock, User, Home, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { projectId } from '../../utils/supabase/info';

interface BookingRequestsProps {
  onBack: () => void;
}

interface Booking {
  id: string;
  userId: string;
  pgId: string;
  roomType: string;
  checkIn: string;
  duration: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'declined';
  createdAt: string;
  pg: {
    name: string;
    location: string;
  };
  user: {
    name: string;
    email: string;
    phone?: string;
  };
}

export default function BookingRequests({ onBack }: BookingRequestsProps) {
  const [allBookings, setAllBookings] = useState<{ [key: string]: Booking[] }>({
    pending: [],
    approved: [],
    declined: [],
  });
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'declined'>('pending');
  const [isLoading, setIsLoading] = useState(true);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    fetchAllBookings();
  }, []);

  const fetchAllBookings = async () => {
    setIsLoading(true);
    try {
      const statuses: ('pending' | 'approved' | 'declined')[] = ['pending', 'approved', 'declined'];
      const bookingPromises = statuses.map(status =>
        fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/owner/bookings?status=${status}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        ).then(res => res.json())
      );

      const results = await Promise.all(bookingPromises);
      
      setAllBookings({
        pending: results[0] || [],
        approved: results[1] || [],
        declined: results[2] || [],
      });

    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (bookingId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/owner/bookings/${bookingId}/approve`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success('Booking approved successfully');
        fetchAllBookings(); // Refetch all bookings
      } else {
        toast.error('Failed to approve booking');
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      toast.error('Failed to approve booking');
    }
  };

  const handleDecline = async (bookingId: string) => {
    const reason = prompt('Please provide a reason for declining (optional):');
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/owner/bookings/${bookingId}/decline`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ reason }),
        }
      );

      if (response.ok) {
        toast.success('Booking declined');
        fetchAllBookings(); // Refetch all bookings
      } else {
        toast.error('Failed to decline booking');
      }
    } catch (error) {
      console.error('Error declining booking:', error);
      toast.error('Failed to decline booking');
    }
  };

  const filteredBookings = allBookings[activeTab] || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-stone-800">Booking Requests</h1>
          <p className="text-stone-600">Manage student booking requests</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-6 py-3 rounded-xl transition-all ${
            activeTab === 'pending'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
          }`}
        >
<div className="flex items-center gap-2">
  <Clock className="w-5 h-5" />
  Pending ({allBookings.pending.length})
</div>
        </button>
        <button
          onClick={() => setActiveTab('approved')}
          className={`px-6 py-3 rounded-xl transition-all ${
            activeTab === 'approved'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
          }`}
        >
<div className="flex items-center gap-2">
  <CheckCircle className="w-5 h-5" />
  Approved ({allBookings.approved.length})
</div>
        </button>
        <button
          onClick={() => setActiveTab('declined')}
          className={`px-6 py-3 rounded-xl transition-all ${
            activeTab === 'declined'
              ? 'bg-amber-600 text-white shadow-lg'
              : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-200'
          }`}
        >
<div className="flex items-center gap-2">
  <XCircle className="w-5 h-5" />
  Declined ({allBookings.declined.length})
</div>
        </button>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-stone-400" />
          </div>
          <p className="text-stone-600 mb-2">No {activeTab} bookings</p>
          <p className="text-stone-500 text-sm">
            {activeTab === 'pending'
              ? 'New booking requests will appear here'
              : `No bookings have been ${activeTab} yet`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200"
            >
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Booking Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-stone-800 mb-1">{booking.pg.name}</h3>
                      <p className="text-stone-600 text-sm">{booking.pg.location}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs ${
                      booking.status === 'pending'
                        ? 'bg-amber-100 text-amber-700'
                        : booking.status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-stone-500 text-xs mb-1">Room Type</p>
                      <p className="text-stone-800">{booking.roomType}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs mb-1">Check-in</p>
                      <p className="text-stone-800">{new Date(booking.checkIn).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs mb-1">Duration</p>
                      <p className="text-stone-800">{booking.duration} months</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs mb-1">Amount</p>
                      <p className="text-amber-700">₹{booking.totalAmount.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Student Info */}
                  <div className="bg-stone-50 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-stone-800">{booking.user.name}</p>
                        <p className="text-stone-600 text-sm">{booking.user.email}</p>
                      </div>
                    </div>
                    {booking.user.phone && (
                      <p className="text-stone-600 text-sm ml-13">📞 {booking.user.phone}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {booking.status === 'pending' && (
                  <div className="flex lg:flex-col gap-3 lg:w-48">
                    <button
                      onClick={() => handleApprove(booking.id)}
                      className="flex-1 lg:flex-none px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecline(booking.id)}
                      className="flex-1 lg:flex-none px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-all flex items-center justify-center gap-2"
                    >
                      <XCircle className="w-5 h-5" />
                      Decline
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-stone-200">
                <p className="text-stone-500 text-xs">
                  Requested on {new Date(booking.createdAt).toLocaleDateString()} at{' '}
                  {new Date(booking.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
