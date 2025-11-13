import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { createClient } from '../../utils/supabase/client';
import { useAuthStore } from '../../store/authStore';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

interface LoginFormProps {
  role: 'student' | 'owner' | 'admin';
  onSwitchToSignup: () => void;
  onForgotPassword: () => void;
  onSuccess: () => void;
}

export default function LoginForm({ role, onSwitchToSignup, onForgotPassword, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const { setUser, setAccessToken } = useAuthStore();

  // Quick fill demo credentials
  const fillDemoCredentials = async () => {
    const credentials = {
      student: { email: 'teststuff677+test@gmail.com', password: '123456' },
      owner: { email: 'teststuff677+test1@gmail.com', password: '123456' },
      admin: { email: 'teststuff677@gmail.com', password: 'akash97' },
    };
    
    const creds = credentials[role];
    setEmail(creds.email);
    setPassword(creds.password);
    
    // Ensure demo users are initialized
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/init-demo-users`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${publicAnonKey}`,
          },
        }
      );
      
      if (response.ok) {
        const result = await response.json();
        console.log('Demo users initialization:', result);
        
        // Check if admin user was initialized successfully
        if (role === 'admin') {
          const adminResult = result.results?.find((r: any) => r.email === 'teststuff677@gmail.com');
          if (adminResult) {
            console.log('Admin user status:', adminResult);
            if (adminResult.status === 'error') {
              toast.warning(`Admin user initialization had issues: ${adminResult.error || 'Unknown error'}`);
            } else {
              toast.success('Demo credentials filled! Admin user is ready.');
            }
          } else {
            toast.info('Demo credentials filled! Admin user may need initialization.');
          }
        } else {
          toast.success('Demo credentials filled! Users are ready.');
        }
      } else {
        const errorText = await response.text();
        console.error('Failed to initialize demo users:', errorText);
        toast.info('Demo credentials filled! If login fails, wait a moment and try again.');
      }
    } catch (error) {
      console.error('Error initializing demo users:', error);
      toast.info('Demo credentials filled!');
    }
  };

  const validateForm = () => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Provide helpful error messages
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials') || error.message.includes('Invalid credentials')) {
          // For admin, provide more specific guidance
          if (role === 'admin') {
            errorMessage = 'Invalid email or password. For admin: Ensure the account exists and password is "akash97". Try clicking "Quick Fill Demo" again to reinitialize.';
            console.error('Admin login failed:', {
              email,
              role,
              error: error.message,
              suggestion: 'Check if admin user exists in Supabase Auth',
            });
          } else {
            errorMessage = 'Invalid email or password. If using demo credentials, please wait a few seconds for initialization to complete.';
          }
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Please check your email to confirm your account.';
        }
        toast.error('Login failed: ' + errorMessage);
        setIsLoading(false);
        return;
      }

      if (data.session) {
        setAccessToken(data.session.access_token);

        // Fetch user profile from server
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${data.session.access_token}`,
            },
          }
        );

        if (response.ok) {
          const profile = await response.json();
          console.log('Login successful - Profile fetched:', profile);
          
          // Verify role matches
          if (profile.role !== role) {
            const errorMsg = `This account is registered as ${profile.role}, not ${role}. Please select the correct role.`;
            console.error('Role mismatch:', { expected: role, actual: profile.role, profile });
            toast.error(errorMsg);
            await supabase.auth.signOut();
            setIsLoading(false);
            return;
          }
          
          // Additional logging for admin
          if (role === 'admin') {
            console.log('Admin login successful:', {
              userId: profile.id,
              email: profile.email,
              role: profile.role,
              name: profile.name,
            });
          }

          // Update user in store
          setUser(profile);
          localStorage.setItem('userRole', profile.role);
          
          console.log('User set in store, calling onSuccess...');
          toast.success(`Welcome back, ${profile.name}!`);
          
          // Set loading to false
          setIsLoading(false);
          
          // Notify parent that login was successful
          onSuccess();
        } else {
          const errorText = await response.text();
          console.error('Failed to fetch user profile:', response.status, errorText);
          toast.error('Failed to fetch user profile. Please try again.');
          setIsLoading(false);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        toast.error('Google login failed: ' + error.message);
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Failed to initiate Google login');
    }
  };

  return (
    <motion.form
      onSubmit={handleLogin}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      {/* Email field */}
      <div>
        <label htmlFor="email" className="block text-stone-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={validateForm}
            className={`w-full pl-12 pr-4 py-3 bg-white border ${
              errors.email ? 'border-red-400' : 'border-stone-300'
            } rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
            placeholder="you@example.com"
          />
        </div>
        {errors.email && (
          <motion.p
            className="mt-1 text-red-600"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {errors.email}
          </motion.p>
        )}
      </div>

      {/* Password field */}
      <div>
        <label htmlFor="password" className="block text-stone-700 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={validateForm}
            className={`w-full pl-12 pr-12 py-3 bg-white border ${
              errors.password ? 'border-red-400' : 'border-stone-300'
            } rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>
        {errors.password && (
          <motion.p
            className="mt-1 text-red-600"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {errors.password}
          </motion.p>
        )}
      </div>

      {/* Forgot password & Quick fill */}
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={fillDemoCredentials}
          className="text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
        >
          ⚡ Quick Fill Demo
        </button>
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-amber-700 hover:text-amber-800 transition-colors"
        >
          Forgot Password?
        </button>
      </div>

      {/* Login button */}
      <motion.button
        type="submit"
        disabled={isLoading}
        className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Logging in...</span>
          </div>
        ) : (
          'Login'
        )}

        {/* Ripple effect */}
        <motion.div
          className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10"
          initial={false}
        />
      </motion.button>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-stone-300" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-stone-50 text-stone-500">Or continue with</span>
        </div>
      </div>

      {/* Google login */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        className="w-full py-3 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 transition-all duration-300 flex items-center justify-center gap-3 group"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        <span className="text-stone-700">Continue with Google</span>
      </button>

      {/* Switch to signup */}
      <div className="text-center text-stone-600">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-amber-700 hover:text-amber-800 transition-colors"
        >
          Sign up
        </button>
      </div>
    </motion.form>
  );
}
