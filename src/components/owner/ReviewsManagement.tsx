import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Star, ThumbsUp, MessageCircle, Filter, Search } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAuthStore } from '../../store/authStore';
import { projectId } from '../../utils/supabase/info';

interface ReviewsManagementProps {
  onBack: () => void;
}

interface Review {
  id: string;
  userId: string;
  userName: string;
  pgId: string;
  pgName: string;
  rating: number;
  comment: string;
  createdAt: string;
  helpful: number;
}

export default function ReviewsManagement({ onBack }: ReviewsManagementProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const { accessToken } = useAuthStore();

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/owner/reviews`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        toast.error('Failed to fetch reviews');
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to fetch reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReplyToReview = async (reviewId: string) => {
    toast.info('Reply feature coming soon!');
  };

  const filteredReviews = reviews
    .filter(review => {
      if (filterRating && review.rating !== filterRating) return false;
      if (searchQuery && !review.pgName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !review.comment.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const averageRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-stone-600" />
        </button>
        <div className="flex-1">
          <h1 className="text-stone-800">Reviews & Ratings</h1>
          <p className="text-stone-600">Manage feedback from students</p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-amber-900">{averageRating}</p>
              <p className="text-stone-600 text-sm">Average Rating</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-blue-900">{reviews.length}</p>
              <p className="text-stone-600 text-sm">Total Reviews</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <ThumbsUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-green-900">
                {reviews.filter(r => r.rating >= 4).length}
              </p>
              <p className="text-stone-600 text-sm">Positive Reviews</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search reviews..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterRating(null)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filterRating === null
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All
          </button>
          {[5, 4, 3, 2, 1].map((rating) => (
            <button
              key={rating}
              onClick={() => setFilterRating(rating)}
              className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-1 ${
                filterRating === rating
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {rating}
              <Star className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-600">Loading reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200">
            <MessageCircle className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-600">
              {searchQuery || filterRating
                ? 'No reviews match your filters'
                : 'No reviews yet'}
            </p>
          </div>
        ) : (
          filteredReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center text-white">
                      {review.userName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-stone-800">{review.userName}</p>
                      <p className="text-stone-500 text-sm">
                        {new Date(review.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-stone-700 mb-2">{review.pgName}</p>
                  {renderStars(review.rating)}
                </div>
              </div>

              {review.comment && (
                <p className="text-stone-600 mb-4 bg-stone-50 rounded-lg p-4">
                  "{review.comment}"
                </p>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => handleReplyToReview(review.id)}
                  className="flex items-center gap-2 px-4 py-2 text-amber-700 hover:bg-amber-50 rounded-lg transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Reply</span>
                </button>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
