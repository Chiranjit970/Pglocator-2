import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Clock,
  MapPin,
  Home,
  IndianRupee,
  Image as ImageIcon,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { projectId } from '../../utils/supabase/info';

interface PGVerificationProps {
  onBack: () => void;
  onUpdate: () => void;
}

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
  roomTypes: { type: string; price: number; available: number }[];
  verificationStatus?: 'pending' | 'verified' | 'rejected';
  submittedAt?: string;
}

export default function PGVerification({ onBack, onUpdate }: PGVerificationProps) {
  const [pgs, setPgs] = useState<PG[]>([]);
  const [selectedPG, setSelectedPG] = useState<PG | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const { accessToken } = useAuthStore();

  useEffect(() => {
    fetchPGs();
  }, []);

  const fetchPGs = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/admin/pgs`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPgs(data);
      } else {
        toast.error('Failed to fetch PG listings');
      }
    } catch (error) {
      console.error('Error fetching PGs:', error);
      toast.error('Failed to fetch PG listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (pgId: string) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/admin/pgs/${pgId}/verify`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success('PG listing verified successfully!');
        fetchPGs();
        onUpdate();
        setSelectedPG(null);
      } else {
        toast.error('Failed to verify PG listing');
      }
    } catch (error) {
      console.error('Error verifying PG:', error);
      toast.error('Failed to verify PG listing');
    }
  };

  const handleReject = async () => {
    if (!selectedPG || !rejectionReason) {
      toast.error('Please provide a reason for rejection');
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/admin/pgs/${selectedPG.id}/reject`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ reason: rejectionReason }),
        }
      );

      if (response.ok) {
        toast.success('PG listing rejected');
        fetchPGs();
        onUpdate();
        setSelectedPG(null);
        setShowRejectModal(false);
        setRejectionReason('');
      } else {
        toast.error('Failed to reject PG listing');
      }
    } catch (error) {
      console.error('Error rejecting PG:', error);
      toast.error('Failed to reject PG listing');
    }
  };

  const filteredPGs = pgs.filter((pg) => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !pg.verified && pg.verificationStatus !== 'rejected';
    if (filter === 'verified') return pg.verified;
    if (filter === 'rejected') return pg.verificationStatus === 'rejected';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-stone-600" />
          </button>
          <div>
            <h1 className="text-stone-800">PG Verification</h1>
            <p className="text-stone-600">Review and verify new listings</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilter('pending')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            filter === 'pending'
              ? 'bg-amber-600 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          Pending ({pgs.filter(p => !p.verified && p.verificationStatus !== 'rejected').length})
        </button>
        <button
          onClick={() => setFilter('verified')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            filter === 'verified'
              ? 'bg-amber-600 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          Verified ({pgs.filter(p => p.verified).length})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            filter === 'rejected'
              ? 'bg-amber-600 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <XCircle className="w-4 h-4" />
          Rejected ({pgs.filter(p => p.verificationStatus === 'rejected').length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
            filter === 'all'
              ? 'bg-amber-600 text-white'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          All ({pgs.length})
        </button>
      </div>

      {/* PG List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600">Loading listings...</p>
        </div>
      ) : filteredPGs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
          <Home className="w-16 h-16 text-stone-300 mx-auto mb-4" />
          <p className="text-stone-600">No listings found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPGs.map((pg, index) => (
            <motion.div
              key={pg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedPG(pg)}
            >
              {/* Image */}
              <div className="relative h-48 bg-stone-200">
                {pg.images && pg.images[0] ? (
                  <img
                    src={pg.images[0]}
                    alt={pg.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-stone-400" />
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  {pg.verified ? (
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Verified
                    </span>
                  ) : pg.verificationStatus === 'rejected' ? (
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      <XCircle className="w-3 h-3" />
                      Rejected
                    </span>
                  ) : (
                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-stone-800 mb-2">{pg.name}</h3>
                <div className="flex items-center gap-2 text-stone-600 mb-2">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{pg.location}</span>
                </div>
                <div className="flex items-center gap-2 text-amber-700 mb-4">
                  <IndianRupee className="w-4 h-4" />
                  <span>₹{pg.price}/month</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pg.amenities?.slice(0, 3).map((amenity) => (
                    <span
                      key={amenity}
                      className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs"
                    >
                      {amenity}
                    </span>
                  ))}
                  {pg.amenities?.length > 3 && (
                    <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-full text-xs">
                      +{pg.amenities.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedPG && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={() => setSelectedPG(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-stone-800">{selectedPG.name}</h2>
                <button
                  onClick={() => setSelectedPG(null)}
                  className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
                >
                  <XCircle className="w-6 h-6 text-stone-600" />
                </button>
              </div>

              {/* Images */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {selectedPG.images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`${selectedPG.name} ${idx + 1}`}
                    className="w-full h-48 object-cover rounded-xl"
                  />
                ))}
              </div>

              {/* Details */}
              <div className="space-y-4 mb-6">
                <div>
                  <p className="text-stone-700 mb-1">Description</p>
                  <p className="text-stone-600">{selectedPG.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-stone-700 mb-1">Location</p>
                    <p className="text-stone-600">{selectedPG.location}</p>
                  </div>
                  <div>
                    <p className="text-stone-700 mb-1">Distance from ADTU</p>
                    <p className="text-stone-600">{selectedPG.distance} km</p>
                  </div>
                  <div>
                    <p className="text-stone-700 mb-1">Gender</p>
                    <p className="text-stone-600 capitalize">{selectedPG.gender}</p>
                  </div>
                  <div>
                    <p className="text-stone-700 mb-1">Price</p>
                    <p className="text-stone-600">₹{selectedPG.price}/month</p>
                  </div>
                </div>
                <div>
                  <p className="text-stone-700 mb-2">Owner Details</p>
                  <p className="text-stone-600">Name: {selectedPG.ownerName}</p>
                  <p className="text-stone-600">Phone: {selectedPG.ownerPhone}</p>
                </div>
                <div>
                  <p className="text-stone-700 mb-2">Amenities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedPG.amenities?.map((amenity) => (
                      <span
                        key={amenity}
                        className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions */}
              {!selectedPG.verified && selectedPG.verificationStatus !== 'rejected' && (
                <div className="flex gap-4">
                  <button
                    onClick={() => handleVerify(selectedPG.id)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Verify & Approve
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg transition-all"
                  >
                    <XCircle className="w-5 h-5" />
                    Reject
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-md w-full p-6"
          >
            <h3 className="text-stone-800 mb-4">Reject Listing</h3>
            <p className="text-stone-600 mb-4">
              Please provide a reason for rejecting this listing:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              rows={4}
              placeholder="Enter rejection reason..."
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectionReason('');
                }}
                className="flex-1 py-3 bg-stone-200 text-stone-700 rounded-xl hover:bg-stone-300 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg transition-all"
              >
                Confirm Reject
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
