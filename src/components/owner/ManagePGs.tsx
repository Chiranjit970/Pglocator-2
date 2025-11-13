import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Edit, Trash2, Eye, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { projectId } from '../../utils/supabase/info';

interface ManagePGsProps {
  onBack: () => void;
}

interface PG {
  id: string;
  name: string;
  location: string;
  price: number;
  verified: boolean;
  roomTypes: Array<{
    type: string;
    available: number;
  }>;
  images: string[];
}

export default function ManagePGs({ onBack }: ManagePGsProps) {
  const [pgs, setPgs] = useState<PG[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'verified' | 'pending'>('all');
  const { accessToken } = useAuthStore();

  useEffect(() => {
    fetchPGs();
  }, []);

  const fetchPGs = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/owner/pgs`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPgs(data);
      }
    } catch (error) {
      console.error('Error fetching PGs:', error);
      toast.error('Failed to load your listings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this PG listing?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/owner/pgs/${id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        toast.success('PG deleted successfully');
        fetchPGs();
      } else {
        toast.error('Failed to delete PG');
      }
    } catch (error) {
      console.error('Error deleting PG:', error);
      toast.error('Failed to delete PG');
    }
  };

  const filteredPGs = pgs.filter(pg => {
    const matchesSearch = pg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         pg.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'verified' && pg.verified) ||
                         (filterStatus === 'pending' && !pg.verified);
    return matchesSearch && matchesFilter;
  });

  const getTotalOccupancy = (pg: PG) => {
    return pg.roomTypes.reduce((sum, room) => sum + room.available, 0);
  };

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
          <h1 className="text-stone-800">Manage PGs</h1>
          <p className="text-stone-600">{pgs.length} total listings</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or location..."
              className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-3 rounded-xl transition-all ${
                filterStatus === 'all'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('verified')}
              className={`px-4 py-3 rounded-xl transition-all ${
                filterStatus === 'verified'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Verified
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-3 rounded-xl transition-all ${
                filterStatus === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Pending
            </button>
          </div>
        </div>
      </div>

      {/* PG List */}
      {filteredPGs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-stone-200">
          <p className="text-stone-600 mb-4">No PGs found</p>
          <p className="text-stone-500 text-sm">
            {searchQuery || filterStatus !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first PG listing'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPGs.map((pg, index) => (
            <motion.div
              key={pg.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Image */}
                <div className="w-full md:w-48 h-32 bg-stone-100 rounded-xl overflow-hidden flex-shrink-0">
                  <img
                    src={pg.images[0] || ''}
                    alt={pg.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>

                {/* Details */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-stone-800 mb-1">{pg.name}</h3>
                      <p className="text-stone-600 text-sm">{pg.location}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {pg.verified ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                          Verified
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                          Pending Verification
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <p className="text-stone-500 text-xs mb-1">Starting Price</p>
                      <p className="text-amber-700">₹{pg.price.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs mb-1">Room Types</p>
                      <p className="text-stone-800">{pg.roomTypes.length}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs mb-1">Total Occupancy</p>
                      <p className="text-stone-800">{getTotalOccupancy(pg)}</p>
                    </div>
                    <div>
                      <p className="text-stone-500 text-xs mb-1">Status</p>
                      <p className={pg.verified ? 'text-green-600' : 'text-amber-600'}>
                        {pg.verified ? 'Active' : 'Pending'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg hover:bg-stone-200 transition-colors flex items-center gap-2 text-sm">
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center gap-2 text-sm">
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(pg.id)}
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
