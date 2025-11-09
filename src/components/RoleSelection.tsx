import { motion } from 'motion/react';
import { GraduationCap, Home, Shield, ArrowRight, MapPin } from 'lucide-react';

interface RoleSelectionProps {
  onRoleSelect: (role: 'student' | 'owner' | 'admin') => void;
}

const roles = [
  {
    id: 'student',
    title: 'Student',
    description: 'Find and book verified PGs near ADTU campus',
    icon: GraduationCap,
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:from-blue-600 hover:to-blue-700',
    features: ['Browse listings', 'Read reviews', 'Book instantly', 'Connect with owners'],
  },
  {
    id: 'owner',
    title: 'Property Owner',
    description: 'List and manage your PG properties',
    icon: Home,
    color: 'from-amber-500 to-amber-600',
    hoverColor: 'hover:from-amber-600 hover:to-amber-700',
    features: ['List properties', 'Manage bookings', 'Track earnings', 'Verify students'],
  },
  {
    id: 'admin',
    title: 'Admin',
    description: 'Oversee and verify PG listings',
    icon: Shield,
    color: 'from-purple-500 to-purple-600',
    hoverColor: 'hover:from-purple-600 hover:to-purple-700',
    features: ['Verify listings', 'Manage users', 'View analytics', 'Handle disputes'],
  },
];

export default function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-0 left-1/4 w-96 h-96 bg-amber-200 rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1, 1.3, 1],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-200 rounded-full blur-3xl opacity-20"
          animate={{
            scale: [1.3, 1, 1.3],
            y: [0, -50, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="relative z-20 flex justify-center items-center p-6 md:p-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-6 h-6 text-amber-700" />
          <span className="text-amber-900">PG Locator</span>
        </div>
      </motion.header>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h1 className="text-amber-900 mb-4">Choose Your Role</h1>
          <p className="text-stone-600 max-w-2xl mx-auto">
            Select how you'd like to use PG Locator. You can always change this later in settings.
          </p>
        </motion.div>

        {/* Role cards grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {roles.map((role, index) => (
            <motion.button
              key={role.id}
              onClick={() => onRoleSelect(role.id as 'student' | 'owner' | 'admin')}
              className="group relative bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 text-left overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
              aria-label={`Select ${role.title} role`}
            >
              {/* Gradient background overlay on hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${role.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`} />

              {/* Icon container */}
              <motion.div
                className={`relative inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br ${role.color} mb-6 shadow-md`}
                whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <role.icon className="w-8 h-8 text-white" strokeWidth={2} />
              </motion.div>

              {/* Content */}
              <h3 className="text-stone-900 mb-2 group-hover:text-amber-900 transition-colors">
                {role.title}
              </h3>
              <p className="text-stone-600 mb-6">
                {role.description}
              </p>

              {/* Features list */}
              <ul className="space-y-2 mb-6">
                {role.features.map((feature, idx) => (
                  <motion.li
                    key={idx}
                    className="flex items-center gap-2 text-stone-500"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + idx * 0.05 }}
                  >
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-br ${role.color}`} />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA */}
              <div className="flex items-center gap-2 text-amber-700 group-hover:text-amber-800 transition-colors">
                <span>Select Role</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
              </div>

              {/* Decorative corner element */}
              <motion.div
                className={`absolute -bottom-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${role.color} opacity-10`}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 90, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: index * 0.5,
                }}
              />

              {/* Hover shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
                initial={{ x: '-100%' }}
                whileHover={{
                  x: '200%',
                  transition: { duration: 0.8 },
                }}
              />
            </motion.button>
          ))}
        </div>

        {/* Bottom info */}
        <motion.div
          className="text-center mt-16 text-stone-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>
            Your data is secure and you can switch roles anytime from your profile settings
          </p>
        </motion.div>
      </div>

      {/* Screen reader announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        Role selection screen. Choose between Student, Property Owner, or Admin roles.
      </div>
    </div>
  );
}
