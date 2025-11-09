import { useState } from 'react';
import { motion } from 'motion/react';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '../../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

interface PasswordResetFormProps {
  onBack: () => void;
}

export default function PasswordResetForm({ onBack }: PasswordResetFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Invalid email format');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });

      if (error) {
        let errorMessage = error.message;
        if (error.message.includes('rate limit')) {
          errorMessage = 'Too many requests. Please wait a few minutes and try again.';
        } else if (error.message.includes('email')) {
          errorMessage = 'Unable to send email. Please check your email address or contact support.';
        }
        toast.error('Failed to send reset email: ' + errorMessage);
        setIsLoading(false);
        return;
      }

      setEmailSent(true);
      toast.success('Password reset email sent! Check your inbox and spam folder.');
    } catch (error) {
      console.error('Password reset error:', error);
      toast.error('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <motion.div
        className="space-y-6 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="w-10 h-10 text-green-600" />
        </div>
        <h3 className="text-stone-900">Check Your Email</h3>
        <p className="text-stone-600 max-w-md mx-auto">
          We've sent a password reset link to <strong>{email}</strong>. Click the link in the email to reset your password.
        </p>
        <p className="text-stone-500 text-sm max-w-md mx-auto mt-2">
          💡 Don't see the email? Check your spam folder. If email is not configured, contact your administrator.
        </p>
        <button
          onClick={onBack}
          className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-lg transition-all duration-300"
        >
          Back to Login
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleReset}
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div>
        <label htmlFor="reset-email" className="block text-stone-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            id="reset-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full pl-12 pr-4 py-3 bg-white border ${
              error ? 'border-red-400' : 'border-stone-300'
            } rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
            placeholder="you@example.com"
          />
        </div>
        {error && (
          <motion.p
            className="mt-1 text-red-600"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {error}
          </motion.p>
        )}
      </div>

      <p className="text-stone-600">
        Enter your email address and we'll send you a link to reset your password.
      </p>

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
            <span>Sending...</span>
          </div>
        ) : (
          'Send Reset Link'
        )}
      </motion.button>

      <div className="text-center">
        <button
          type="button"
          onClick={onBack}
          className="text-amber-700 hover:text-amber-800 transition-colors inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </button>
      </div>
    </motion.form>
  );
}
