import { motion } from 'motion/react';
import { X, Bell } from 'lucide-react';
import { Notification } from '../../types/pg';

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  isLoading?: boolean;
}

export default function NotificationPanel({ notifications, onClose, isLoading = false }: NotificationPanelProps) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/20 z-40"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: 400, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 400, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 to-amber-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="w-6 h-6" />
            <h2 className="text-xl font-semibold">Notifications</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-stone-500">Loading notifications...</p>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-stone-400" />
                </div>
                <p className="text-stone-600 font-medium mb-2">No notifications yet!</p>
                <p className="text-stone-500 text-sm">You'll see updates about your bookings here</p>
              </div>
            </div>
          ) : (
            <div className="space-y-0">
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`border-b border-stone-200 p-4 hover:bg-stone-50 transition-colors cursor-pointer ${
                    !notification.read ? 'bg-amber-50' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                      !notification.read ? 'bg-amber-600' : 'bg-transparent'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-stone-900 font-semibold text-sm break-words">{notification.title}</h3>
                      <p className="text-stone-600 text-xs mt-1 break-words">{notification.message}</p>
                      <p className="text-stone-400 text-xs mt-2">
                        {new Date(notification.createdAt).toLocaleDateString()} at{' '}
                        {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}
