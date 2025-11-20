import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, User, Phone, BookOpen, Hash, Eye, EyeOff, Loader2, Building2 } from 'lucide-react';
import { toast } from 'sonner';
import { projectId } from '../../utils/supabase/info';

interface SignupFormProps {
  role: 'student' | 'owner' | 'admin';
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

export default function SignupForm({ role, onSwitchToLogin, onSuccess }: SignupFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    // Student specific
    course: '',
    rollNo: '',
    gender: '',
    // Owner specific
    businessName: '',
    // Admin specific
    adminCode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Role-specific validation
    if (role === 'student') {
      if (!formData.course) newErrors.course = 'Course is required';
      if (!formData.rollNo) newErrors.rollNo = 'Roll number is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
    }

    if (role === 'owner') {
      if (!formData.phone) newErrors.phone = 'Phone number is required';
    }

    if (role === 'admin') {
      if (!formData.adminCode) {
        newErrors.adminCode = 'Admin invitation code is required';
      } else if (formData.adminCode !== 'ADTU-ADMIN-2024') {
        newErrors.adminCode = 'Invalid admin invitation code. Please contact your administrator.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/server/make-server-2c39c550/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            role,
            phone: formData.phone,
            course: formData.course,
            rollNo: formData.rollNo,
            gender: formData.gender,
            businessName: formData.businessName,
            adminCode: formData.adminCode, // Include admin code for server validation
          }),
        }
      );

      if (!response.ok) {
        const error = await response.text();
        toast.error('Signup failed: ' + error);
        setIsLoading(false);
        return;
      }

      toast.success('Account created successfully! Please login.');
      onSuccess();
    } catch (error) {
      console.error('Signup error:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSignup}
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
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
            className={`w-full pl-12 pr-4 py-3 bg-white border ${
              errors.name ? 'border-red-400' : 'border-stone-300'
            } rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all`}
            placeholder="John Doe"
          />
        </div>
        {errors.name && <p className="mt-1 text-red-600">{errors.name}</p>}
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
            className={`w-full pl-12 pr-4 py-3 bg-white border ${
              errors.email ? 'border-red-400' : 'border-stone-300'
            } rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all`}
            placeholder="you@example.com"
          />
        </div>
        {errors.email && <p className="mt-1 text-red-600">{errors.email}</p>}
      </div>

      {/* Student-specific fields */}
      {role === 'student' && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="course" className="block text-stone-700 mb-2">
                Course
              </label>
              <div className="relative">
                <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  id="course"
                  name="course"
                  type="text"
                  value={formData.course}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 bg-white border ${
                    errors.course ? 'border-red-400' : 'border-stone-300'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all`}
                  placeholder="B.Tech CSE"
                />
              </div>
              {errors.course && <p className="mt-1 text-red-600">{errors.course}</p>}
            </div>

            <div>
              <label htmlFor="rollNo" className="block text-stone-700 mb-2">
                Roll No
              </label>
              <div className="relative">
                <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
                <input
                  id="rollNo"
                  name="rollNo"
                  type="text"
                  value={formData.rollNo}
                  onChange={handleChange}
                  className={`w-full pl-12 pr-4 py-3 bg-white border ${
                    errors.rollNo ? 'border-red-400' : 'border-stone-300'
                  } rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all`}
                  placeholder="2024001"
                />
              </div>
              {errors.rollNo && <p className="mt-1 text-red-600">{errors.rollNo}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="gender" className="block text-stone-700 mb-2">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className={`w-full px-4 py-3 bg-white border ${
                errors.gender ? 'border-red-400' : 'border-stone-300'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all`}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && <p className="mt-1 text-red-600">{errors.gender}</p>}
          </div>
        </>
      )}

      {/* Owner-specific fields */}
      {role === 'owner' && (
        <>
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
                className={`w-full pl-12 pr-4 py-3 bg-white border ${
                  errors.phone ? 'border-red-400' : 'border-stone-300'
                } rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all`}
                placeholder="+91 98765 43210"
              />
            </div>
            {errors.phone && <p className="mt-1 text-red-600">{errors.phone}</p>}
          </div>

          <div>
            <label htmlFor="businessName" className="block text-stone-700 mb-2">
              Business Name (Optional)
            </label>
            <div className="relative">
              <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
              <input
                id="businessName"
                name="businessName"
                type="text"
                value={formData.businessName}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                placeholder="PG Properties Ltd."
              />
            </div>
          </div>
        </>
      )}

      {/* Admin-specific fields */}
      {role === 'admin' && (
        <div>
          <label htmlFor="adminCode" className="block text-stone-700 mb-2">
            Admin Invitation Code
          </label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              id="adminCode"
              name="adminCode"
              type="text"
              value={formData.adminCode}
              onChange={handleChange}
              className={`w-full pl-12 pr-4 py-3 bg-white border ${
                errors.adminCode ? 'border-red-400' : 'border-stone-300'
              } rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all`}
              placeholder="Enter admin invitation code"
            />
          </div>
          {errors.adminCode && (
            <p className="mt-1 text-red-600 text-sm">{errors.adminCode}</p>
          )}
          <p className="mt-1 text-stone-500 text-sm">
            💡 Contact your system administrator or university to obtain the admin invitation code.
          </p>
        </div>
      )}

      {/* Password */}
      <div>
        <label htmlFor="password" className="block text-stone-700 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            className={`w-full pl-12 pr-12 py-3 bg-white border ${
              errors.password ? 'border-red-400' : 'border-stone-300'
            } rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && <p className="mt-1 text-red-600">{errors.password}</p>}
      </div>

      {/* Confirm Password */}
      <div>
        <label htmlFor="confirmPassword" className="block text-stone-700 mb-2">
          Confirm Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            className={`w-full pl-12 pr-12 py-3 bg-white border ${
              errors.confirmPassword ? 'border-red-400' : 'border-stone-300'
            } rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
          >
            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.confirmPassword && <p className="mt-1 text-red-600">{errors.confirmPassword}</p>}
      </div>

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Creating account...</span>
          </div>
        ) : (
          'Create Account'
        )}
      </motion.button>

      {/* Switch to login */}
      <div className="text-center text-stone-600">
        Already have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-amber-700 hover:text-amber-800 transition-colors"
        >
          Login
        </button>
      </div>
    </motion.form>
  );
}
