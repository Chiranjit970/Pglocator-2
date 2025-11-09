import { ReactNode } from 'react';
import { motion } from 'motion/react';
import { MapPin } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50 to-stone-50 flex">
      {/* Left Panel - Illustrative Scene */}
      <motion.div
        className="hidden lg:flex lg:w-2/5 xl:w-1/2 bg-gradient-to-br from-amber-900 via-stone-900 to-amber-900 relative overflow-hidden"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        {/* Background image */}
        <div className="absolute inset-0 opacity-30">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1724204401208-6349fc373543?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb2dpbiUyMGF1dGhlbnRpY2F0aW9uJTIwaWxsdXN0cmF0aW9ufGVufDF8fHx8MTc2MjQzMTk5NXww&ixlib=rb-4.1.0&q=80&w=1080"
            alt="Authentication background"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Animated overlay */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-tr from-amber-600/20 via-transparent to-amber-600/20"
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 xl:px-20">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="bg-amber-500 rounded-full p-3">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              <span className="text-white text-2xl">PG Locator</span>
            </div>

            <h2 className="text-white mb-6 leading-tight">
              Find Your Perfect Stay Near ADTU
            </h2>
            <p className="text-amber-200 text-xl leading-relaxed max-w-md">
              Trusted by thousands of students. Verified properties, authentic reviews, and seamless booking experience.
            </p>

            <div className="mt-12 space-y-4">
              {[
                '🏠 Verified PG accommodations',
                '⭐ Real student reviews',
                '📍 Near campus locations',
                '🔒 Secure booking process',
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  className="flex items-center gap-3 text-amber-100"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                >
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>{feature}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <motion.div
          className="absolute bottom-10 right-10 w-64 h-64 rounded-full bg-amber-500 blur-3xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </motion.div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12">
        <motion.div
          className="w-full max-w-md"
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          {/* Header */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <MapPin className="w-6 h-6 text-amber-700" />
            <span className="text-amber-900">PG Locator</span>
          </div>

          <div className="mb-8">
            <h1 className="text-stone-900 mb-2">{title}</h1>
            <p className="text-stone-600">{subtitle}</p>
          </div>

          {/* Form Content */}
          {children}

          {/* Security note */}
          <motion.div
            className="mt-8 p-4 bg-amber-50 rounded-xl border border-amber-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <p className="text-stone-600 text-center">
              🔒 Your privacy is our priority. All data is encrypted and secure.
            </p>
          </motion.div>

          {/* Demo Credentials */}
          <motion.div
            className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <p className="text-blue-900 mb-2 text-center">🎯 Demo Credentials</p>
            <div className="space-y-2 text-xs text-blue-800">
              <div className="bg-white rounded p-2">
                <p className="font-medium">Student:</p>
                <p>teststuff677+test@gmail.com</p>
                <p>Password: 123456</p>
              </div>
              <div className="bg-white rounded p-2">
                <p className="font-medium">Owner:</p>
                <p>teststuff677+test1@gmail.com</p>
                <p>Password: 123456</p>
              </div>
              <div className="bg-white rounded p-2">
                <p className="font-medium">Admin:</p>
                <p>teststuff677@gmail.com</p>
                <p>Password: akash97</p>
              </div>
            </div>
          </motion.div>

          {/* Footer links */}
          <div className="mt-6 flex items-center justify-center gap-6 text-stone-500">
            <a href="#" className="hover:text-amber-700 transition-colors">
              Help
            </a>
            <span>•</span>
            <a href="#" className="hover:text-amber-700 transition-colors">
              Privacy
            </a>
            <span>•</span>
            <a href="#" className="hover:text-amber-700 transition-colors">
              Contact
            </a>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
