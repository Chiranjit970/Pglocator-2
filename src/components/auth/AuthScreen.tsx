import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from 'sonner';
import AuthLayout from './AuthLayout';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';
import PasswordResetForm from './PasswordResetForm';
import { UserRole } from '../../store/authStore';

interface AuthScreenProps {
  initialRole: UserRole;
  onSuccess: () => void;
}

type AuthMode = 'login' | 'signup' | 'reset';

export default function AuthScreen({ initialRole, onSuccess }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [role, setRole] = useState<UserRole>(initialRole);

  const titles = {
    login: 'Welcome Back',
    signup: 'Create Account',
    reset: 'Reset Password',
  };

  const subtitles = {
    login: `Login to your ${role} account`,
    signup: `Sign up as a ${role}`,
    reset: 'Enter your email to reset your password',
  };

  return (
    <>
      <AuthLayout title={titles[mode]} subtitle={subtitles[mode]}>
        {/* Role tabs */}
        <div className="flex gap-2 p-1 bg-stone-100 rounded-xl mb-6">
          {(['student', 'owner', 'admin'] as UserRole[]).map((r) => (
            <button
              key={r}
              onClick={() => setRole(r)}
              className={`flex-1 py-2 px-4 rounded-lg transition-all duration-300 capitalize ${
                role === r
                  ? 'bg-white shadow-md text-amber-700'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

      <AnimatePresence mode="wait">
        {mode === 'login' && (
          <motion.div
            key="login"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <LoginForm
              role={role}
              onSwitchToSignup={() => setMode('signup')}
              onForgotPassword={() => setMode('reset')}
              onSuccess={onSuccess}
            />
          </motion.div>
        )}

        {mode === 'signup' && (
          <motion.div
            key="signup"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <SignupForm
              role={role}
              onSwitchToLogin={() => setMode('login')}
              onSuccess={() => setMode('login')}
            />
          </motion.div>
        )}

        {mode === 'reset' && (
          <motion.div
            key="reset"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            <PasswordResetForm onBack={() => setMode('login')} />
          </motion.div>
        )}
      </AnimatePresence>
      </AuthLayout>
      <Toaster position="bottom-right" richColors />
    </>
  );
}
