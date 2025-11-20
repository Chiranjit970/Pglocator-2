import { useState, useEffect, ReactNode } from 'react';
import { motion } from 'motion/react';
import { Heart, MapPin, Star, ArrowLeft, Trash2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { projectId } from '../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner';
import { PG } from '../../types/pg';
import PGDetailsModal from './PGDetailsModal';

interface FavoritesPageProps {
  onBack: () => void;
}

export default function FavoritesPage({ onBack }: FavoritesPageProps) {
  const { accessToken } = useAuthStore();
  const [favorites, setFavorites] = useState<PG[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPG, setSelectedPG] = useState<PG | null>(null);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-2c39c550/user/favorites`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setFavorites(data);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  };

  const removeFavorite = async (pgId: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-2c39c550/user/favorites/${pgId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        setFavorites(favorites.filter((pg) => pg.id !== pgId));
        toast.success('Removed from favorites');
      }
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove favorite');
    }
  };

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
            <Heart className="w-6 h-6 text-red-500 fill-red-500" />
            <h2 className="text-stone-900">My Favorites</h2>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-600">Loading favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          <motion.div
            className="text-center py-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Heart className="w-24 h-24 text-stone-300 mx-auto mb-6" />
            <h3 className="text-stone-900 mb-4">No favorites yet</h3>
            <p className="text-stone-600 mb-8 max-w-md mx-auto">
              Start exploring PGs near ADTU and add your favorites to compare and book later!
            </p>
            <button
              onClick={onBack}
              className="px-8 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-lg transition-all"
            >
              Browse PGs
            </button>
          </motion.div>
        ) : (
          <>
            <div className="mb-6 text-stone-600">
              {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favorites.map((pg: PG, index: number) => (
                <motion.div
                  key={pg.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer group"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedPG(pg)}
                  whileHover={{ y: -5 }}
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden">
                    <ImageWithFallback
                      src={pg.images[0]}
                      alt={pg.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Remove button */}
                    <button
                      onClick={(e) => removeFavorite(pg.id, e)}
                      className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 hover:scale-110 transition-all group/btn"
                      aria-label="Remove from favorites"
                    >
                      <Trash2 className="w-5 h-5 text-stone-600 group-hover/btn:text-red-600" />
                    </button>

                    {/* Verified badge */}
                    {pg.verified && (
                      <div className="absolute top-3 left-3 px-3 py-1 bg-green-500 text-white rounded-full flex items-center gap-1">
                        <span className="text-xs">✓ Verified</span>
                      </div>
                    )}

                    {/* Distance */}
                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-amber-600" />
                      <span className="text-xs">{pg.distance} km</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <h3 className="text-stone-900 mb-2 line-clamp-1">{pg.name}</h3>
                    <p className="text-stone-600 mb-3 line-clamp-2">{pg.description}</p>

                    <div className="flex items-center gap-2 mb-3">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      <span className="text-stone-900">{pg.rating}</span>
                      <span className="text-stone-500">({pg.reviews} reviews)</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-amber-700">₹{pg.price}</span>
                        <span className="text-stone-500">/month</span>
                      </div>
                      <div className="px-3 py-1 bg-stone-100 rounded-full text-stone-700 capitalize">
                        {pg.gender}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* PG Details Modal */}
      {selectedPG && (
        <PGDetailsModal pg={selectedPG} onClose={() => setSelectedPG(null)} />
      )}
    </div>
  );
}
