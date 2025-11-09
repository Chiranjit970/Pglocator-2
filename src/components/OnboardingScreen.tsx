import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, MapPin, Star, Building2, Users, Home, Shield, GraduationCap } from 'lucide-react';
import RoleSelection from './RoleSelection';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface OnboardingScreenProps {
  onRoleSelect: (role: 'student' | 'owner' | 'admin') => void;
  onSkip: () => void;
}

const slides = [
  {
    id: 1,
    title: 'Find Trusted PGs Nearby ADTU',
    subtitle: 'Discover verified paying guest accommodations within walking distance of your campus',
    image: 'https://images.unsplash.com/photo-1668089677938-b52086753f77?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBiZWRyb29tJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzYyNDI0MTQzfDA&ixlib=rb-4.1.0&q=80&w=1080',
    icon: MapPin,
  },
  {
    id: 2,
    title: 'Verified Owners & Real Reviews',
    subtitle: 'Browse authentic reviews from fellow students and connect with verified property owners',
    image: 'https://images.unsplash.com/photo-1579632151052-92f741fb9b79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3p5JTIwc3R1ZGVudCUyMHJvb218ZW58MXx8fHwxNzYyMzc0OTQ3fDA&ixlib=rb-4.1.0&q=80&w=1080',
    icon: Star,
  },
  {
    id: 3,
    title: 'Manage or List Your Property With Ease',
    subtitle: 'Property owners can list, manage bookings, and connect with students effortlessly',
    image: 'https://images.unsplash.com/photo-1658248709868-3b5ab38c7c8d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9wZXJ0eSUyMG1hbmFnZW1lbnQlMjBkYXNoYm9hcmR8ZW58MXx8fHwxNzYyNDE1ODgyfDA&ixlib=rb-4.1.0&q=80&w=1080',
    icon: Building2,
  },
];

export default function OnboardingScreen({ onRoleSelect, onSkip }: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setDirection(1);
      setCurrentSlide(currentSlide + 1);
    } else {
      setShowRoleSelection(true);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) {
      setDirection(-1);
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleDotClick = (index: number) => {
    setDirection(index > currentSlide ? 1 : -1);
    setCurrentSlide(index);
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    }),
  };

  if (showRoleSelection) {
    return <RoleSelection onRoleSelect={onRoleSelect} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 -right-20 w-64 h-64 bg-amber-200 rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 30, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-64 h-64 bg-stone-300 rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1.2, 1, 1.2],
            x: [0, -30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Header nav */}
      <motion.header
        className="relative z-20 flex justify-between items-center p-6 md:p-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-amber-700" />
          <span className="text-amber-900">PG Locator</span>
        </div>
        <button
          onClick={() => setShowRoleSelection(true)}
          className="text-stone-600 hover:text-amber-700 transition-colors duration-300 px-4 py-2 rounded-full hover:bg-white/50"
          aria-label="Skip onboarding"
        >
          Skip
        </button>
      </motion.header>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pb-12">
        <div className="min-h-[calc(100vh-200px)] flex flex-col justify-center">
          {/* Slides container */}
          <div className="relative overflow-hidden mb-12">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { type: 'spring', stiffness: 300, damping: 30 },
                  opacity: { duration: 0.3 },
                }}
                className="grid md:grid-cols-2 gap-8 md:gap-16 items-center"
              >
                {/* Image side */}
                <motion.div
                  className="relative order-2 md:order-1"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
                    <ImageWithFallback
                      src={slides[currentSlide].image}
                      alt={slides[currentSlide].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-amber-900/30 to-transparent" />
                    
                    {/* Floating icon */}
                    <motion.div
                      className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg"
                      animate={{
                        y: [0, -10, 0],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      {(() => {
                        const Icon = slides[currentSlide].icon;
                        return Icon ? <Icon className="w-8 h-8 text-amber-700" /> : null;
                      })()}
                    </motion.div>
                  </div>

                  {/* Decorative elements */}
                  <motion.div
                    className="absolute -bottom-4 -right-4 w-32 h-32 bg-amber-400 rounded-full blur-2xl opacity-20 -z-10"
                    animate={{
                      scale: [1, 1.3, 1],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </motion.div>

                {/* Content side */}
                <motion.div
                  className="order-1 md:order-2 text-center md:text-left"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                >
                  <motion.h2
                    className="text-amber-900 mb-6 max-w-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {slides[currentSlide].title}
                  </motion.h2>
                  <motion.p
                    className="text-stone-600 mb-8 max-w-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    {slides[currentSlide].subtitle}
                  </motion.p>

                  {/* CTA Button */}
                  <motion.button
                    onClick={handleNext}
                    className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 relative overflow-hidden"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span>{currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    
                    {/* Button shine effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      animate={{
                        x: ['-100%', '200%'],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatDelay: 1,
                      }}
                    />
                  </motion.button>
                </motion.div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation controls */}
          <div className="flex items-center justify-center gap-8">
            {/* Previous button */}
            <button
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className="p-3 rounded-full bg-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110 active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6 text-amber-700" />
            </button>

            {/* Progress dots */}
            <div className="flex gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleDotClick(index)}
                  className="relative group"
                  aria-label={`Go to slide ${index + 1}`}
                  aria-current={currentSlide === index ? 'true' : 'false'}
                >
                  <motion.div
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentSlide === index
                        ? 'bg-amber-600 w-12'
                        : 'bg-stone-300 hover:bg-amber-400'
                    }`}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.9 }}
                  />
                </button>
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={handleNext}
              className="p-3 rounded-full bg-amber-600 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label={currentSlide === slides.length - 1 ? 'Get started' : 'Next slide'}
            >
              <ChevronRight className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Screen reader progress */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        Slide {currentSlide + 1} of {slides.length}: {slides[currentSlide].title}
      </div>
    </div>
  );
}
