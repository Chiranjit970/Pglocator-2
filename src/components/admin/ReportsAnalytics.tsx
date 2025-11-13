import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, TrendingUp, Users, Home, IndianRupee, Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { projectId } from '../../utils/supabase/info';

interface ReportsAnalyticsProps {
  onBack: () => void;
}

interface Analytics {
  totalRevenue: number;
  revenueGrowth: number;
  totalBookings: number;
  bookingsGrowth: number;
  newUsers: number;
  userGrowth: number;
  activePGs: number;
  pgGrowth: number;
  popularAmenities: { name: string; count: number }[];
  topPGs: { id: string; name: string; bookings: number; revenue: number }[];
  userDistribution: { students: number; owners: number; admins: number };
  monthlyData: { month: string; bookings: number; revenue: number }[];
}

export default function ReportsAnalytics({ onBack }: ReportsAnalyticsProps) {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  const { accessToken } = useAuthStore();

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/admin/analytics?range=${timeRange}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        toast.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = () => {
    toast.info('Export feature coming soon!');
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-stone-600">Loading analytics...</p>
      </div>
    );
  }

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
            <h1 className="text-stone-800">Reports & Analytics</h1>
            <p className="text-stone-600">Platform insights and statistics</p>
          </div>
        </div>
        <div className="flex gap-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
            className="px-4 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="year">Last Year</option>
          </select>
          <button
            onClick={handleExportReport}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-lg hover:shadow-lg transition-all"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <IndianRupee className="w-6 h-6 text-white" />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs ${
              (analytics?.revenueGrowth || 0) >= 0
                ? 'bg-green-200 text-green-700'
                : 'bg-red-200 text-red-700'
            }`}>
              {(analytics?.revenueGrowth || 0) >= 0 ? '↑' : '↓'} {Math.abs(analytics?.revenueGrowth || 0)}%
            </span>
          </div>
          <p className="text-green-900 mb-1">
            ₹{(analytics?.totalRevenue || 0).toLocaleString()}
          </p>
          <p className="text-stone-600 text-sm">Total Revenue</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs ${
              (analytics?.bookingsGrowth || 0) >= 0
                ? 'bg-green-200 text-green-700'
                : 'bg-red-200 text-red-700'
            }`}>
              {(analytics?.bookingsGrowth || 0) >= 0 ? '↑' : '↓'} {Math.abs(analytics?.bookingsGrowth || 0)}%
            </span>
          </div>
          <p className="text-blue-900 mb-1">{analytics?.totalBookings || 0}</p>
          <p className="text-stone-600 text-sm">Total Bookings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs ${
              (analytics?.userGrowth || 0) >= 0
                ? 'bg-green-200 text-green-700'
                : 'bg-red-200 text-red-700'
            }`}>
              {(analytics?.userGrowth || 0) >= 0 ? '↑' : '↓'} {Math.abs(analytics?.userGrowth || 0)}%
            </span>
          </div>
          <p className="text-purple-900 mb-1">{analytics?.newUsers || 0}</p>
          <p className="text-stone-600 text-sm">New Users</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className={`px-3 py-1 rounded-full text-xs ${
              (analytics?.pgGrowth || 0) >= 0
                ? 'bg-green-200 text-green-700'
                : 'bg-red-200 text-red-700'
            }`}>
              {(analytics?.pgGrowth || 0) >= 0 ? '↑' : '↓'} {Math.abs(analytics?.pgGrowth || 0)}%
            </span>
          </div>
          <p className="text-amber-900 mb-1">{analytics?.activePGs || 0}</p>
          <p className="text-stone-600 text-sm">Active PGs</p>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top PGs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200"
        >
          <h3 className="text-stone-800 mb-4">Top Performing PGs</h3>
          <div className="space-y-3">
            {analytics?.topPGs && analytics.topPGs.length > 0 ? (
              analytics.topPGs.map((pg, index) => (
                <div key={pg.id} className="flex items-center gap-4 p-3 bg-stone-50 rounded-lg">
                  <div className="w-8 h-8 bg-amber-600 rounded-lg flex items-center justify-center text-white">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="text-stone-800">{pg.name}</p>
                    <p className="text-stone-600 text-sm">{pg.bookings} bookings</p>
                  </div>
                  <p className="text-green-700">₹{pg.revenue.toLocaleString()}</p>
                </div>
              ))
            ) : (
              <p className="text-stone-500 text-center py-4">No data available</p>
            )}
          </div>
        </motion.div>

        {/* User Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200"
        >
          <h3 className="text-stone-800 mb-4">User Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-stone-600">Students</span>
                <span className="text-stone-800">{analytics?.userDistribution?.students || 0}</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2">
                <div
                  className="bg-blue-600 rounded-full h-2"
                  style={{
                    width: `${
                      analytics?.userDistribution
                        ? (analytics.userDistribution.students /
                            (analytics.userDistribution.students +
                              analytics.userDistribution.owners +
                              analytics.userDistribution.admins)) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-stone-600">Owners</span>
                <span className="text-stone-800">{analytics?.userDistribution?.owners || 0}</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2">
                <div
                  className="bg-green-600 rounded-full h-2"
                  style={{
                    width: `${
                      analytics?.userDistribution
                        ? (analytics.userDistribution.owners /
                            (analytics.userDistribution.students +
                              analytics.userDistribution.owners +
                              analytics.userDistribution.admins)) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-stone-600">Admins</span>
                <span className="text-stone-800">{analytics?.userDistribution?.admins || 0}</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2">
                <div
                  className="bg-purple-600 rounded-full h-2"
                  style={{
                    width: `${
                      analytics?.userDistribution
                        ? (analytics.userDistribution.admins /
                            (analytics.userDistribution.students +
                              analytics.userDistribution.owners +
                              analytics.userDistribution.admins)) *
                          100
                        : 0
                    }%`,
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Popular Amenities */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200"
      >
        <h3 className="text-stone-800 mb-4">Popular Amenities</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {analytics?.popularAmenities && analytics.popularAmenities.length > 0 ? (
            analytics.popularAmenities.map((amenity) => (
              <div key={amenity.name} className="bg-amber-50 rounded-lg p-4 text-center">
                <p className="text-amber-900 mb-1">{amenity.count}</p>
                <p className="text-stone-600 text-sm">{amenity.name}</p>
              </div>
            ))
          ) : (
            <p className="text-stone-500 col-span-full text-center py-4">No data available</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
