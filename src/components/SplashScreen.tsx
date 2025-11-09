import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin } from 'lucide-react';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [showContinue, setShowContinue] = useState(false);

  useEffect(() => {
    // Simulate asset loading with realistic progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        // Non-linear progress for realism
        const increment = Math.random() * 15 + 5;
        return Math.min(prev + increment, 100);
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress === 100) {
      setTimeout(() => {
        setIsComplete(true);
        setShowContinue(true);
      }, 800);
    }
  }, [progress]);

  const handleContinue = () => {
    onComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-gradient-to-br from-stone-900 via-amber-900 to-stone-900 overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.8 }}
      >
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <motion.div
            className="absolute inset-0 bg-gradient-to-tr from-amber-500/30 via-transparent to-amber-500/30"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        </div>

        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-amber-400/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -100, 0],
                opacity: [0.2, 0.5, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
          {/* Logo area */}
          <motion.div
            className="flex flex-col items-center mb-12"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8, type: 'spring', stiffness: 100 }}
          >
            {/* Animated logo icon */}
            <motion.div
              className="relative mb-6"
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <motion.div
                className="absolute inset-0 bg-amber-500 rounded-full blur-2xl opacity-50"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
              <div className="relative bg-gradient-to-br from-amber-400 to-amber-600 rounded-full p-6 shadow-2xl">
                <MapPin className="w-16 h-16 text-white" strokeWidth={2.5} />
              </div>
            </motion.div>

            {/* App name with type-on effect */}
            <motion.h1
              className="text-white text-center tracking-wider mb-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 1 }}
            >
              PG Locator
            </motion.h1>

            {/* Tagline */}
            <motion.p
              className="text-amber-200 text-center max-w-md"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              Find your perfect stay near ADTU
            </motion.p>
          </motion.div>

          {/* Loader area */}
          <motion.div
            className="w-full max-w-xs"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.6 }}
          >
            {/* Progress bar container */}
            <div className="relative mb-4">
              <div className="w-full h-1.5 bg-stone-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <motion.div
                    className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-50"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />
                </motion.div>
              </div>

              {/* Progress percentage */}
              <motion.div
                className="text-amber-300 text-center mt-3"
                animate={{ opacity: isComplete ? 0 : 1 }}
              >
                {Math.round(progress)}%
              </motion.div>
            </div>

            {/* Loading hint text */}
            <motion.p
              className="text-stone-400 text-center"
              animate={{ opacity: isComplete ? 0 : 1 }}
            >
              Setting up your neighborhood...
            </motion.p>
          </motion.div>

          {/* Continue button */}
          <AnimatePresence>
            {showContinue && (
              <motion.button
                className="mt-12 px-10 py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden group"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                onClick={handleContinue}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                aria-label="Tap to continue to onboarding"
              >
                {/* Breathing glow effect */}
                <motion.div
                  className="absolute inset-0 bg-white rounded-full opacity-0 group-hover:opacity-20"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.2, 0.1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
                <span className="relative z-10">Tap to Continue</span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* Screen reader announcement */}
        <div className="sr-only" role="status" aria-live="polite">
          {progress < 100 ? `Loading PG Locator, ${Math.round(progress)}% complete` : 'Loading complete. Tap to continue.'}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
