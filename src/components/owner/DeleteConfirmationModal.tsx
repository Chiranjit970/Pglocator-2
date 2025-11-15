import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle } from 'lucide-react';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  roomNumber: string;
  bookingCount?: number;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  roomNumber,
  bookingCount = 0,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteConfirmationModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
              {/* Icon */}
              <div className="flex justify-center pt-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>

              {/* Content */}
              <div className="p-6 text-center space-y-4">
                <div>
                  <h2 className="text-2xl font-bold text-stone-900 mb-2">Delete Room {roomNumber}?</h2>
                  <p className="text-stone-600">This action cannot be reversed.</p>
                </div>

                {/* Booking Impact Notice */}
                {bookingCount > 0 && (
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-left">
                    <p className="text-yellow-800 font-medium text-sm">
                      ⚠️ This room has {bookingCount} active booking(s)
                    </p>
                    <p className="text-yellow-700 text-xs mt-1">
                      Please cancel these bookings before deleting the room.
                    </p>
                  </div>
                )}

                {/* Confirmation Message */}
                <p className="text-stone-700 text-sm">
                  Are you absolutely sure you want to delete this room?
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 p-6 border-t border-stone-200">
                <button
                  onClick={onCancel}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-stone-200 hover:bg-stone-300 disabled:bg-stone-100 text-stone-900 rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isDeleting || bookingCount > 0}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
