import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Edit2, 
  Save,
  X,
  Camera
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAuthStore } from '../../store/authStore';
import { projectId } from '../../utils/supabase/info';

interface OwnerProfileProps {
  onBack: () => void;
}

export default function OwnerProfile({ onBack }: OwnerProfileProps) {
  const { user, accessToken, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    businessName: user?.businessName || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/user/profile`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (response.ok) {
        const updatedProfile = await response.json();
        setUser(updatedProfile);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      businessName: user?.businessName || '',
    });
    setIsEditing(false);
  };

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
            <h1 className="text-stone-800">Profile Settings</h1>
            <p className="text-stone-600">Manage your account information</p>
          </div>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Edit2 className="w-4 h-4" />
            <span>Edit Profile</span>
          </button>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-6 py-3 bg-stone-200 text-stone-700 rounded-xl hover:bg-stone-300 transition-all"
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-stone-200 h-fit"
        >
          <div className="text-center">
            <div className="relative inline-block mb-4">
              <div className="w-32 h-32 bg-gradient-to-br from-amber-600 to-amber-700 rounded-full flex items-center justify-center text-white mx-auto">
                <span className="text-5xl">{user?.name?.charAt(0).toUpperCase()}</span>
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-stone-50 transition-colors border-2 border-stone-200">
                <Camera className="w-5 h-5 text-stone-600" />
              </button>
            </div>
            <h2 className="text-stone-800 mb-1">{user?.name}</h2>
            <p className="text-stone-600 mb-4">Property Owner</p>
            <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
              <p className="text-amber-900 text-sm">Account Status</p>
              <p className="text-amber-700">✓ Verified</p>
            </div>
          </div>
        </motion.div>

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-stone-200"
        >
          <h2 className="text-stone-800 mb-6">Personal Information</h2>
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-stone-700 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-12 pr-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                    !isEditing ? 'bg-stone-50 cursor-not-allowed' : ''
                  }`}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-stone-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={true}
                  className="w-full pl-12 pr-4 py-3 bg-stone-50 border border-stone-300 rounded-xl cursor-not-allowed"
                />
              </div>
              <p className="text-stone-500 text-sm mt-1">Email cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-stone-700 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-12 pr-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                    !isEditing ? 'bg-stone-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="+91 98765 43210"
                />
              </div>
            </div>

            {/* Business Name */}
            <div>
              <label htmlFor="businessName" className="block text-stone-700 mb-2">
                Business Name
              </label>
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  id="businessName"
                  name="businessName"
                  type="text"
                  value={formData.businessName}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={`w-full pl-12 pr-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all ${
                    !isEditing ? 'bg-stone-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="Your Business Name"
                />
              </div>
            </div>
          </div>

          {/* Account Statistics */}
          <div className="mt-8 pt-6 border-t border-stone-200">
            <h3 className="text-stone-800 mb-4">Account Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-stone-50 rounded-lg p-4">
                <p className="text-stone-600 text-sm">Member Since</p>
                <p className="text-stone-800">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })
                    : 'N/A'}
                </p>
              </div>
              <div className="bg-stone-50 rounded-lg p-4">
                <p className="text-stone-600 text-sm">Total Listings</p>
                <p className="text-stone-800">0</p>
              </div>
              <div className="bg-stone-50 rounded-lg p-4">
                <p className="text-stone-600 text-sm">Total Bookings</p>
                <p className="text-stone-800">0</p>
              </div>
              <div className="bg-stone-50 rounded-lg p-4">
                <p className="text-stone-600 text-sm">Avg. Rating</p>
                <p className="text-stone-800">0.0 ⭐</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
