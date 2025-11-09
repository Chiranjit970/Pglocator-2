import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, SlidersHorizontal, MapPin, Star, Heart, LogOut, User, BookmarkCheck } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { projectId } from '../../utils/supabase/info';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import PGDetailsModal from './PGDetailsModal';
import FavoritesPage from './FavoritesPage';
import MyBookingsPage from './MyBookingsPage';

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
}

export default function StudentHome() {
  const { user, accessToken, logout } = useAuthStore();
  const [pgs, setPgs] = useState<PG[]>([]);
  const [filteredPgs, setFilteredPgs] = useState<PG[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPG, setSelectedPG] = useState<PG | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState<'home' | 'favorites' | 'bookings'>('home');
  
  const [filters, setFilters] = useState({
    minPrice: 0,
    maxPrice: 20000,
    gender: '',
    amenities: [] as string[],
  });

  useEffect(() => {
    fetchPGs();
    fetchFavorites();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [pgs, searchQuery, filters]);

  const fetchPGs = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/pgs`
      );
      if (response.ok) {
        const data = await response.json();
        setPgs(data);
      }
    } catch (error) {
      console.error('Error fetching PGs:', error);
      toast.error('Failed to load PG listings');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFavorites = async () => {
    if (!accessToken) return;
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/user/favorites`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setFavorites(new Set(data.map((fav: PG) => fav.id)));
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
    }
  };

  const applyFilters = () => {
    let filtered = pgs;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (pg) =>
          pg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pg.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Price filter
    filtered = filtered.filter(
      (pg) => pg.price >= filters.minPrice && pg.price <= filters.maxPrice
    );

    // Gender filter
    if (filters.gender) {
      filtered = filtered.filter(
        (pg) => pg.gender === filters.gender || pg.gender === 'both'
      );
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      filtered = filtered.filter((pg) =>
        filters.amenities.every((amenity) => pg.amenities?.includes(amenity))
      );
    }

    setFilteredPgs(filtered);
  };

  const toggleFavorite = async (pgId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!accessToken) {
      toast.error('Please login to add favorites');
      return;
    }

    const isFavorite = favorites.has(pgId);
    const url = `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/user/favorites/${pgId}`;

    try {
      const response = await fetch(url, {
        method: isFavorite ? 'DELETE' : 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        setFavorites((prev) => {
          const updated = new Set(prev);
          if (isFavorite) {
            updated.delete(pgId);
            toast.success('Removed from favorites');
          } else {
            updated.add(pgId);
            toast.success('Added to favorites');
          }
          return updated;
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.error('Failed to update favorites');
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  // Show different pages based on navigation
  if (currentPage === 'favorites') {
    return <FavoritesPage onBack={() => setCurrentPage('home')} />;
  }

  if (currentPage === 'bookings') {
    return <MyBookingsPage onBack={() => setCurrentPage('home')} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50">
      {/* Header */}
      <motion.header
        className="bg-white border-b border-stone-200 sticky top-0 z-50 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 rounded-full p-2">
              <MapPin className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-stone-900">PG Locator</h2>
              <p className="text-stone-500">Welcome, {user?.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setCurrentPage('favorites')}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors relative"
              aria-label="Favorites"
            >
              <Heart className="w-5 h-5 text-stone-600" />
              {favorites.size > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">
                  {favorites.size}
                </span>
              )}
            </button>
            <button
              onClick={() => setCurrentPage('bookings')}
              className="p-2 hover:bg-stone-100 rounded-lg transition-colors"
              aria-label="My bookings"
            >
              <BookmarkCheck className="w-5 h-5 text-stone-600" />
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-600"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Search and filters */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name or location..."
                className="w-full pl-12 pr-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-colors flex items-center gap-2"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>

          {/* Filter panel */}
          {showFilters && (
            <motion.div
              className="bg-white border border-stone-200 rounded-xl p-6"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-stone-700 mb-2">Price Range</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, minPrice: parseInt(e.target.value) || 0 })
                      }
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                      placeholder="Min"
                    />
                    <span>-</span>
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters({ ...filters, maxPrice: parseInt(e.target.value) || 20000 })
                      }
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                      placeholder="Max"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-stone-700 mb-2">Gender</label>
                  <select
                    value={filters.gender}
                    onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  >
                    <option value="">All</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-stone-700 mb-2">Amenities</label>
                  <div className="flex flex-wrap gap-2">
                    {['WiFi', 'AC', 'Meals', 'Laundry', 'Security'].map((amenity) => (
                      <button
                        key={amenity}
                        onClick={() => {
                          setFilters((prev) => ({
                            ...prev,
                            amenities: prev.amenities.includes(amenity)
                              ? prev.amenities.filter((a) => a !== amenity)
                              : [...prev.amenities, amenity],
                          }));
                        }}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          filters.amenities.includes(amenity)
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                      >
                        {amenity}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Results count */}
        <div className="mb-4 text-stone-600">
          {isLoading ? 'Loading...' : `${filteredPgs.length} PG${filteredPgs.length !== 1 ? 's' : ''} found`}
        </div>

        {/* PG listings grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPgs.map((pg, index) => (
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

                {/* Favorite button */}
                <button
                  onClick={(e) => toggleFavorite(pg.id, e)}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:scale-110 transition-transform"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      favorites.has(pg.id) ? 'fill-red-500 text-red-500' : 'text-stone-600'
                    }`}
                  />
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

        {/* Empty state */}
        {!isLoading && filteredPgs.length === 0 && (
          <div className="text-center py-20">
            <p className="text-stone-500 mb-4">No PGs found matching your criteria</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilters({ minPrice: 0, maxPrice: 20000, gender: '', amenities: [] });
              }}
              className="px-6 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* PG Details Modal */}
      {selectedPG && (
        <PGDetailsModal pg={selectedPG} onClose={() => setSelectedPG(null)} />
      )}
    </div>
  );
}
