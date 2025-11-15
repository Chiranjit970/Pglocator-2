

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
