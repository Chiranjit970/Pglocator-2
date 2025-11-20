import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  Users,
  Home,
  TrendingUp,
  LogOut,
  Bell,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { projectId } from '../../utils/supabase/info';
import PGVerification from './PGVerification';
import UserManagement from './UserManagement';
import ReportsAnalytics from './ReportsAnalytics';

type View = 'dashboard' | 'verification' | 'users' | 'reports';

interface Stats {
  totalPGs: number;
  pendingVerification: number;
  verifiedPGs: number;
  rejectedPGs: number;
  totalUsers: number;
  totalBookings: number;
  revenueThisMonth: number;
}

export default function AdminDashboard() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [stats, setStats] = useState<Stats>({
    totalPGs: 0,
    pendingVerification: 0,
    verifiedPGs: 0,
    rejectedPGs: 0,
    totalUsers: 0,
    totalBookings: 0,
    revenueThisMonth: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { user, logout, accessToken } = useAuthStore();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/admin/stats`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const renderView = () => {
    switch (currentView) {
      case 'verification':
        return <PGVerification onBack={() => setCurrentView('dashboard')} onUpdate={fetchStats} />;
      case 'users':
        return <UserManagement onBack={() => setCurrentView('dashboard')} />;
      case 'reports':
        return <ReportsAnalytics onBack={() => setCurrentView('dashboard')} />;
      default:
        return renderDashboardView();
    }
  };

  const renderDashboardView = () => (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-stone-800 mb-2">
          Admin Portal 🛡️
        </h1>
        <p className="text-stone-600">
          Welcome back, {user?.name}! Manage and verify PG listings
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl p-6 border border-amber-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-amber-600 rounded-xl flex items-center justify-center">
              <Home className="w-6 h-6 text-white" />
            </div>
            <span className="text-amber-700 bg-amber-200 px-3 py-1 rounded-full text-xs">
              {stats.pendingVerification} pending
            </span>
          </div>
          <p className="text-amber-900 mb-1">{stats.totalPGs}</p>
          <p className="text-stone-600 text-sm">Total PG Listings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <span className="text-green-700 bg-green-200 px-3 py-1 rounded-full text-xs">Active</span>
          </div>
          <p className="text-green-900 mb-1">{stats.verifiedPGs}</p>
          <p className="text-stone-600 text-sm">Verified Listings</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-blue-900 mb-1">{stats.totalUsers}</p>
          <p className="text-stone-600 text-sm">Total Users</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <p className="text-purple-900 mb-1">{stats.totalBookings}</p>
          <p className="text-stone-600 text-sm">Total Bookings</p>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200"
      >
        <h2 className="text-stone-800 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setCurrentView('verification')}
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl hover:shadow-md transition-all group border border-amber-200"
          >
            <div className="w-12 h-12 bg-amber-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform relative">
              <Clock className="w-6 h-6 text-white" />
              {stats.pendingVerification > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {stats.pendingVerification}
                </span>
              )}
            </div>
            <div className="text-left">
              <p className="text-stone-800">Verify Listings</p>
              <p className="text-stone-600 text-xs">{stats.pendingVerification} pending review</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('users')}
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-all group border border-blue-200"
          >
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-stone-800">Manage Users</p>
              <p className="text-stone-600 text-xs">View all users</p>
            </div>
          </button>

          <button
            onClick={() => setCurrentView('reports')}
            className="flex items-center gap-4 p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl hover:shadow-md transition-all group border border-green-200"
          >
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="text-left">
              <p className="text-stone-800">Analytics</p>
              <p className="text-stone-600 text-xs">View insights</p>
            </div>
          </button>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200"
      >
        <h2 className="text-stone-800 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-stone-800">New PG listing submitted</p>
              <p className="text-stone-600 text-sm">Campus View Residency - Pending verification</p>
            </div>
            <span className="text-stone-500 text-sm">2h ago</span>
          </div>

          <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-stone-800">PG listing verified</p>
              <p className="text-stone-600 text-sm">ADTU Comfort Stay - Now live</p>
            </div>
            <span className="text-stone-500 text-sm">5h ago</span>
          </div>

          <div className="flex items-center gap-4 p-4 bg-stone-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-stone-800">New user registered</p>
              <p className="text-stone-600 text-sm">Student account created</p>
            </div>
            <span className="text-stone-500 text-sm">1d ago</span>
          </div>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-stone-800">PG Locator</h1>
                <p className="text-stone-600 text-xs">Admin Portal</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-stone-600 hover:text-stone-900 transition-colors">
                <Bell className="w-5 h-5" />
                {stats.pendingVerification > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-stone-600 hover:text-stone-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Side Navigation */}
      <div className="flex">
        <aside className="hidden lg:block w-64 bg-white border-r border-stone-200 min-h-[calc(100vh-4rem)]">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === 'dashboard'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => setCurrentView('verification')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === 'verification'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>PG Verification</span>
              {stats.pendingVerification > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {stats.pendingVerification}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView('users')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === 'users'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <Users className="w-5 h-5" />
              <span>User Management</span>
            </button>

            <button
              onClick={() => setCurrentView('reports')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                currentView === 'reports'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'text-stone-600 hover:bg-stone-50'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
              <span>Analytics</span>
            </button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
