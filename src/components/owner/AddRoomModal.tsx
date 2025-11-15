import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Amenity } from '../../types/pg';
import { createClient } from '../../utils/supabase/client';
import { toast } from 'sonner';

interface AddRoomModalProps {
  pgId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (roomData: any) => Promise<void>;
  isSubmitting: boolean;
}

export default function AddRoomModal({
  pgId,
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}: AddRoomModalProps) {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [isLoadingAmenities, setIsLoadingAmenities] = useState(false);

  const [formData, setFormData] = useState({
    room_number: '',
    type: 'single',
    bathroom_type: 'common',
    rent: '',
    beds_total: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const supabase = createClient();

  // Fetch amenities on mount
  useEffect(() => {
    const fetchAmenities = async () => {
      setIsLoadingAmenities(true);
      try {
        const { data, error } = await (supabase as any)
          .from('amenities')
          .select('*');
        if (error) {
          console.warn('Amenities table not found yet - this is normal during setup');
          setAmenities([]);
          return;
        }
        setAmenities(data || []);
      } catch (err) {
        console.warn('Error fetching amenities (table may not exist yet):', err);
        setAmenities([]);
      } finally {
        setIsLoadingAmenities(false);
      }
    };

    if (isOpen) {
      fetchAmenities();
    }
  }, [isOpen, supabase]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.room_number.trim()) newErrors.room_number = 'Room number is required';
    if (!formData.rent || parseFloat(formData.rent) <= 0)
      newErrors.rent = 'Rent must be greater than 0';
    if (!formData.beds_total || parseInt(formData.beds_total) <= 0)
      newErrors.beds_total = 'Total beds must be at least 1';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    try {
      await onSubmit({
        pg_id: pgId,
        room_number: formData.room_number,
        type: formData.type,
        bathroom_type: formData.bathroom_type,
        rent: parseFloat(formData.rent),
        beds_total: parseInt(formData.beds_total),
        beds_available: parseInt(formData.beds_total),
        amenities: selectedAmenities,
      });

      // Reset form
      setFormData({
        room_number: '',
        type: 'single',
        bathroom_type: 'common',
        rent: '',
        beds_total: '',
      });
      setSelectedAmenities([]);
      setErrors({});
      onClose();
    } catch (err) {
      console.error('Error submitting form:', err);
    }
  };

  const handleAmenityToggle = (amenityId: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId) ? prev.filter((id) => id !== amenityId) : [...prev, amenityId]
    );
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto my-8">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-red-600 to-red-700 text-white p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold">Add New Room</h2>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                {/* Room Number */}
                <div>
                  <label className="block text-stone-900 font-medium mb-2">Room Number *</label>
                  <input
                    type="text"
                    placeholder="e.g., 101, A1, etc."
                    value={formData.room_number}
                    onChange={(e) =>
                      setFormData({ ...formData, room_number: e.target.value })
                    }
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.room_number ? 'border-red-500' : 'border-stone-300'
                    }`}
                  />
                  {errors.room_number && (
                    <p className="text-red-600 text-sm mt-1">{errors.room_number}</p>
                  )}
                </div>

                {/* Room Type & Bathroom Type */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-stone-900 font-medium mb-2">Room Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="single">Single</option>
                      <option value="double">Double</option>
                      <option value="triple">Triple</option>
                      <option value="quad">Quad</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-stone-900 font-medium mb-2">
                      Bathroom Type
                    </label>
                    <select
                      value={formData.bathroom_type}
                      onChange={(e) =>
                        setFormData({ ...formData, bathroom_type: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="common">Common</option>
                      <option value="attached">Attached</option>
                    </select>
                  </div>
                </div>

                {/* Monthly Rent */}
                <div>
                  <label className="block text-stone-900 font-medium mb-2">Monthly Rent (₹) *</label>
                  <input
                    type="number"
                    placeholder="8000"
                    value={formData.rent}
                    onChange={(e) => setFormData({ ...formData, rent: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.rent ? 'border-red-500' : 'border-stone-300'
                    }`}
                  />
                  {errors.rent && <p className="text-red-600 text-sm mt-1">{errors.rent}</p>}
                </div>

                {/* Total Beds */}
                <div>
                  <label className="block text-stone-900 font-medium mb-2">Total Beds *</label>
                  <input
                    type="number"
                    placeholder="1"
                    value={formData.beds_total}
                    onChange={(e) => setFormData({ ...formData, beds_total: e.target.value })}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                      errors.beds_total ? 'border-red-500' : 'border-stone-300'
                    }`}
                  />
                  {errors.beds_total && (
                    <p className="text-red-600 text-sm mt-1">{errors.beds_total}</p>
                  )}
                </div>

                {/* Amenities */}
                <div>
                  <label className="block text-stone-900 font-medium mb-3">Amenities</label>
                  {isLoadingAmenities ? (
                    <p className="text-stone-500 text-sm">Loading amenities...</p>
                  ) : amenities.length > 0 ? (
                    <div className="space-y-2">
                      {amenities.map((amenity) => (
                        <label
                          key={amenity.id}
                          className="flex items-center gap-3 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedAmenities.includes(amenity.id)}
                            onChange={() => handleAmenityToggle(amenity.id)}
                            className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                          />
                          <span className="text-stone-700">{amenity.name}</span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <p className="text-stone-500 text-sm">No amenities available</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-4 border-t border-stone-200 sticky bottom-0 bg-white">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 bg-stone-200 hover:bg-stone-300 text-stone-900 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg font-medium transition-colors disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Adding...' : 'Add Room'}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
