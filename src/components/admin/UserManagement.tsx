import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Users, Search, Filter, MoreVertical, Ban, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '../../store/authStore';
import { projectId } from '../../utils/supabase/info';

interface UserManagementProps {
  onBack: () => void;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'owner' | 'admin';
  createdAt: string;
  phone?: string;
  course?: string;
  rollNo?: string;
  businessName?: string;
  isActive: boolean;
}

export default function UserManagement({ onBack }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'owner' | 'admin'>('all');
  const { accessToken } = useAuthStore();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/admin/users`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, isActive: boolean) => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/admin/users/${userId}/toggle-status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ isActive: !isActive }),
        }
      );

      if (response.ok) {
        toast.success(`User ${!isActive ? 'activated' : 'deactivated'} successfully`);
        fetchUsers();
      } else {
        toast.error('Failed to update user status');
      }
    } catch (error) {
      console.error('Error toggling user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const filteredUsers = users.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (
      searchQuery &&
      !user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
      return false;
    return true;
  });

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student':
        return 'bg-blue-100 text-blue-700';
      case 'owner':
        return 'bg-green-100 text-green-700';
      case 'admin':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-stone-100 text-stone-700';
    }
  };

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
          <h1 className="text-stone-800">User Management</h1>
          <p className="text-stone-600">Manage all platform users</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-4 border border-stone-200"
        >
          <p className="text-stone-600 text-sm mb-1">Total Users</p>
          <p className="text-stone-800">{users.length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-4 border border-stone-200"
        >
          <p className="text-stone-600 text-sm mb-1">Students</p>
          <p className="text-stone-800">{users.filter(u => u.role === 'student').length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl p-4 border border-stone-200"
        >
          <p className="text-stone-600 text-sm mb-1">Owners</p>
          <p className="text-stone-800">{users.filter(u => u.role === 'owner').length}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl p-4 border border-stone-200"
        >
          <p className="text-stone-600 text-sm mb-1">Active Users</p>
          <p className="text-stone-800">{users.filter(u => u.isActive !== false).length}</p>
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
            placeholder="Search users by name or email..."
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setRoleFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              roleFilter === 'all'
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setRoleFilter('student')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              roleFilter === 'student'
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Students
          </button>
          <button
            onClick={() => setRoleFilter('owner')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              roleFilter === 'owner'
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Owners
          </button>
          <button
            onClick={() => setRoleFilter('admin')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              roleFilter === 'admin'
                ? 'bg-amber-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            Admins
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-stone-600">Loading users...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-stone-300 mx-auto mb-4" />
            <p className="text-stone-600">
              {searchQuery || roleFilter !== 'all' ? 'No users match your filters' : 'No users found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 text-left text-stone-700">User</th>
                  <th className="px-6 py-4 text-left text-stone-700">Email</th>
                  <th className="px-6 py-4 text-left text-stone-700">Role</th>
                  <th className="px-6 py-4 text-left text-stone-700">Joined</th>
                  <th className="px-6 py-4 text-left text-stone-700">Status</th>
                  <th className="px-6 py-4 text-left text-stone-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-stone-100 hover:bg-stone-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center text-white">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-stone-800">{user.name}</p>
                          {user.role === 'student' && user.rollNo && (
                            <p className="text-stone-500 text-xs">{user.rollNo}</p>
                          )}
                          {user.role === 'owner' && user.businessName && (
                            <p className="text-stone-500 text-xs">{user.businessName}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-stone-600">{user.email}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs capitalize ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-600">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-6 py-4">
                      {user.isActive !== false ? (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs flex items-center gap-1 w-fit">
                          <Ban className="w-3 h-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.isActive !== false)}
                        className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                          user.isActive !== false
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {user.isActive !== false ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
