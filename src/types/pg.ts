

export interface PG {
  id: string;
  name: string;
  description: string;
  price: number;
  location: string;
  distance: number;
  gender: string;
  images: string[];
  amenities: string[];
  rating: number;
  reviews: number;
  verified: boolean;
  ownerName: string;
  ownerPhone: string;
}

export interface Review {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: 'booking' | 'review' | 'payment' | 'system';
  relatedBookingId?: string;
  relatedPGId?: string;
}

export interface Amenity {
  id: string;
  name: string;
  icon?: string;
  category?: string;
}

export interface Room {
  id: string;
  pg_id: string;
  room_number: string;
  type: 'single' | 'double' | 'triple' | 'quad';
  bathroom_type: 'attached' | 'common';
  rent: number;
  beds_total: number;
  beds_available: number;
  amenities: string[]; // amenity IDs
  status: 'available' | 'booked' | 'maintenance';
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  pg_id: string;
  room_id: string;
  user_id: string;
  check_in: string;
  duration: number;
  total_amount: number;
  status: 'pending' | 'approved' | 'confirmed' | 'declined' | 'completed';
  created_at: string;
  updated_at: string;
}
