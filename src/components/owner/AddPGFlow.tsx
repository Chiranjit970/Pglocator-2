import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  ArrowRight, 
  Home, 
  MapPin, 
  Image as ImageIcon, 
  Check,
  Upload,
  X,
  Plus,
  IndianRupee
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAuthStore } from '../../store/authStore';
import { projectId } from '../../utils/supabase/info';

interface AddPGFlowProps {
  onBack: () => void;
  onSuccess: () => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

interface RoomType {
  type: string;
  price: number;
  available: number;
}

interface FormData {
  name: string;
  description: string;
  location: string;
  distance: number;
  gender: 'male' | 'female' | 'both';
  images: string[];
  amenities: string[];
  roomTypes: RoomType[];
  ownerPhone: string;
}

const AVAILABLE_AMENITIES = [
  'WiFi',
  'AC',
  'Meals',
  'Laundry',
  'Security',
  'Parking',
  'Gym',
  'Study Room',
  'TV',
  'Refrigerator',
  'Water Purifier',
  'Power Backup',
];

export default function AddPGFlow({ onBack, onSuccess }: AddPGFlowProps) {
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, accessToken } = useAuthStore();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    location: '',
    distance: 0,
    gender: 'both',
    images: [],
    amenities: [],
    roomTypes: [],
    ownerPhone: user?.phone || '',
  });

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep((currentStep + 1) as Step);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((currentStep - 1) as Step);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/owner/pgs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            ...formData,
            price: formData.roomTypes[0]?.price || 0,
            ownerName: user?.name,
            verified: false,
            rating: 0,
            reviews: 0,
          }),
        }
      );

      if (response.ok) {
        toast.success('PG listed successfully! Awaiting admin verification.');
        onSuccess();
      } else {
        const error = await response.text();
        toast.error('Failed to list PG: ' + error);
      }
    } catch (error) {
      console.error('Error submitting PG:', error);
      toast.error('Failed to submit PG listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addRoomType = () => {
    updateFormData({
      roomTypes: [...formData.roomTypes, { type: '', price: 0, available: 0 }]
    });
  };

  const updateRoomType = (index: number, updates: Partial<RoomType>) => {
    const newRoomTypes = [...formData.roomTypes];
    newRoomTypes[index] = { ...newRoomTypes[index], ...updates };
    updateFormData({ roomTypes: newRoomTypes });
  };

  const removeRoomType = (index: number) => {
    updateFormData({
      roomTypes: formData.roomTypes.filter((_, i) => i !== index)
    });
  };

  const toggleAmenity = (amenity: string) => {
    if (formData.amenities.includes(amenity)) {
      updateFormData({
        amenities: formData.amenities.filter(a => a !== amenity)
      });
    } else {
      updateFormData({
        amenities: [...formData.amenities, amenity]
      });
    }
  };

  const addImageURL = (url: string) => {
    if (url && formData.images.length < 5) {
      updateFormData({
        images: [...formData.images, url]
      });
    }
  };

  const removeImage = (index: number) => {
    updateFormData({
      images: formData.images.filter((_, i) => i !== index)
    });
  };

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-stone-700 mb-2">PG Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateFormData({ name: e.target.value })}
          className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="e.g., ADTU Comfort Stay"
        />
      </div>

      <div>
        <label className="block text-stone-700 mb-2">Description *</label>
        <textarea
          value={formData.description}
          onChange={(e) => updateFormData({ description: e.target.value })}
          rows={4}
          className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Describe your PG facilities, rules, and highlights..."
        />
      </div>

      <div>
        <label className="block text-stone-700 mb-2">Address *</label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={formData.location}
            onChange={(e) => updateFormData({ location: e.target.value })}
            className="w-full pl-12 pr-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
            placeholder="Full address"
          />
        </div>
      </div>

      <div>
        <label className="block text-stone-700 mb-2">Distance from ADTU (km) *</label>
        <input
          type="number"
          step="0.1"
          value={formData.distance}
          onChange={(e) => updateFormData({ distance: parseFloat(e.target.value) })}
          className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="e.g., 0.5"
        />
      </div>

      <div>
        <label className="block text-stone-700 mb-2">Gender Preference *</label>
        <div className="grid grid-cols-3 gap-3">
          {(['male', 'female', 'both'] as const).map((gender) => (
            <button
              key={gender}
              onClick={() => updateFormData({ gender })}
              className={`py-3 px-4 rounded-xl border-2 transition-all capitalize ${
                formData.gender === gender
                  ? 'border-amber-600 bg-amber-50 text-amber-700'
                  : 'border-stone-300 text-stone-600 hover:border-stone-400'
              }`}
            >
              {gender}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-stone-700 mb-2">Contact Phone *</label>
        <input
          type="tel"
          value={formData.ownerPhone}
          onChange={(e) => updateFormData({ ownerPhone: e.target.value })}
          className="w-full px-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="+91 98765 43210"
        />
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-stone-700 mb-2">Property Images</label>
        <p className="text-stone-600 text-sm mb-4">Add image URLs (up to 5 images)</p>
        
        <div className="space-y-3">
          {formData.images.map((url, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={url}
                onChange={(e) => {
                  const newImages = [...formData.images];
                  newImages[index] = e.target.value;
                  updateFormData({ images: newImages });
                }}
                className="flex-1 px-4 py-3 bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="https://example.com/image.jpg"
              />
              <button
                onClick={() => removeImage(index)}
                className="px-4 py-3 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}
          
          {formData.images.length < 5 && (
            <button
              onClick={() => addImageURL('')}
              className="w-full py-3 px-4 border-2 border-dashed border-stone-300 rounded-xl text-stone-600 hover:border-amber-500 hover:text-amber-600 transition-all flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Image URL
            </button>
          )}
        </div>

        {/* Image Preview */}
        {formData.images.filter(url => url).length > 0 && (
          <div className="mt-6">
            <p className="text-stone-700 mb-3">Preview:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {formData.images.filter(url => url).map((url, index) => (
                <div key={index} className="relative aspect-video bg-stone-100 rounded-xl overflow-hidden">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23ddd" width="100" height="100"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-900 text-sm">
          💡 Tip: Use high-quality images that showcase your rooms, common areas, and facilities.
          You can use image hosting services like Unsplash or upload to your own server.
        </p>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-stone-700 mb-2">Select Amenities</label>
        <p className="text-stone-600 text-sm mb-4">Choose all that apply</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {AVAILABLE_AMENITIES.map((amenity) => (
            <button
              key={amenity}
              onClick={() => toggleAmenity(amenity)}
              className={`py-3 px-4 rounded-xl border-2 transition-all ${
                formData.amenities.includes(amenity)
                  ? 'border-amber-600 bg-amber-50 text-amber-700'
                  : 'border-stone-300 text-stone-600 hover:border-stone-400'
              }`}
            >
              {amenity}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <p className="text-green-900 text-sm">
          ✓ {formData.amenities.length} amenities selected
        </p>
      </div>
    </motion.div>
  );

  const renderStep4 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <label className="block text-stone-700 mb-2">Room Types & Pricing *</label>
        <p className="text-stone-600 text-sm mb-4">Add different room configurations you offer</p>
        
        <div className="space-y-4">
          {formData.roomTypes.map((room, index) => (
            <div key={index} className="bg-stone-50 rounded-xl p-4 border border-stone-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-stone-700">Room Type {index + 1}</h3>
                <button
                  onClick={() => removeRoomType(index)}
                  className="text-red-600 hover:text-red-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-stone-600 text-sm mb-2">Type</label>
                  <select
                    value={room.type}
                    onChange={(e) => updateRoomType(index, { type: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="">Select...</option>
                    <option value="Single">Single</option>
                    <option value="Double">Double</option>
                    <option value="Triple">Triple</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-stone-600 text-sm mb-2">Price (₹/month)</label>
                  <input
                    type="number"
                    value={room.price}
                    onChange={(e) => updateRoomType(index, { price: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="8500"
                  />
                </div>
                
                <div>
                  <label className="block text-stone-600 text-sm mb-2">Available</label>
                  <input
                    type="number"
                    value={room.available}
                    onChange={(e) => updateRoomType(index, { available: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="2"
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button
            onClick={addRoomType}
            className="w-full py-3 px-4 border-2 border-dashed border-stone-300 rounded-xl text-stone-600 hover:border-amber-500 hover:text-amber-600 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Room Type
          </button>
        </div>
      </div>
    </motion.div>
  );

  const renderStep5 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-stone-800 mb-2">Review Your Listing</h2>
        <p className="text-stone-600">Please verify all details before submitting</p>
      </div>

      <div className="bg-white rounded-xl p-6 border border-stone-200 space-y-4">
        <div>
          <p className="text-stone-500 text-sm">PG Name</p>
          <p className="text-stone-800">{formData.name}</p>
        </div>
        
        <div>
          <p className="text-stone-500 text-sm">Location</p>
          <p className="text-stone-800">{formData.location}</p>
          <p className="text-stone-600 text-sm">{formData.distance} km from ADTU</p>
        </div>
        
        <div>
          <p className="text-stone-500 text-sm">Gender Preference</p>
          <p className="text-stone-800 capitalize">{formData.gender}</p>
        </div>
        
        <div>
          <p className="text-stone-500 text-sm">Images</p>
          <p className="text-stone-800">{formData.images.filter(url => url).length} images uploaded</p>
        </div>
        
        <div>
          <p className="text-stone-500 text-sm">Amenities</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.amenities.map(amenity => (
              <span key={amenity} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                {amenity}
              </span>
            ))}
          </div>
        </div>
        
        <div>
          <p className="text-stone-500 text-sm">Room Types</p>
          <div className="space-y-2 mt-2">
            {formData.roomTypes.map((room, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-stone-50 rounded-lg">
                <span className="text-stone-800">{room.type}</span>
                <span className="text-amber-700">₹{room.price}/month</span>
                <span className="text-stone-600 text-sm">{room.available} available</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-900 text-sm">
          ℹ️ Your listing will be reviewed by our admin team before being published to students.
          This usually takes 24-48 hours.
        </p>
      </div>
    </motion.div>
  );

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.description && formData.location && formData.distance && formData.ownerPhone;
      case 2:
        return formData.images.filter(url => url).length > 0;
      case 3:
        return formData.amenities.length > 0;
      case 4:
        return formData.roomTypes.length > 0 && formData.roomTypes.every(r => r.type && r.price && r.available);
      case 5:
        return true;
      default:
        return false;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="p-2 text-stone-600 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-stone-800">Add New PG</h1>
          <p className="text-stone-600">Step {currentStep} of 5</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {[1, 2, 3, 4, 5].map((step) => (
            <div
              key={step}
              className={`flex-1 h-2 rounded-full mx-1 transition-all ${
                step <= currentStep ? 'bg-amber-600' : 'bg-stone-200'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between text-sm">
          <span className={currentStep >= 1 ? 'text-amber-600' : 'text-stone-400'}>Basic Info</span>
          <span className={currentStep >= 2 ? 'text-amber-600' : 'text-stone-400'}>Photos</span>
          <span className={currentStep >= 3 ? 'text-amber-600' : 'text-stone-400'}>Amenities</span>
          <span className={currentStep >= 4 ? 'text-amber-600' : 'text-stone-400'}>Pricing</span>
          <span className={currentStep >= 5 ? 'text-amber-600' : 'text-stone-400'}>Review</span>
        </div>
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-stone-200 mb-8">
        <AnimatePresence mode="wait">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}
          {currentStep === 5 && renderStep5()}
        </AnimatePresence>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="px-6 py-3 text-stone-600 hover:text-stone-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5" />
          Previous
        </button>

        {currentStep < 5 ? (
          <button
            onClick={nextStep}
            disabled={!canProceed()}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            Next
            <ArrowRight className="w-5 h-5" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !canProceed()}
            className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Submit Listing
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
