import { useEffect, useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const samplePGs = [
  {
    id: '1',
    name: 'ADTU Comfort Stay',
    description: 'Premium PG accommodation with modern amenities, just 5 minutes walk from campus. Fully furnished rooms with attached bathrooms.',
    price: 8500,
    location: 'Panikhaiti, Near ADTU Gate 1',
    distance: 0.5,
    gender: 'male',
    images: [
      'https://images.unsplash.com/photo-1668089677938-b52086753f77?w=800',
      'https://images.unsplash.com/photo-1709805619372-40de3f158e83?w=800',
      'https://images.unsplash.com/photo-1579632151052-92f741fb9b79?w=800',
    ],
    amenities: ['WiFi', 'AC', 'Meals', 'Laundry', 'Security'],
    rating: 4.5,
    reviews: 24,
    verified: true,
    ownerName: 'Rajesh Kumar',
    ownerPhone: '+91 98765 43210',
    roomTypes: [
      { type: 'Single', price: 8500, available: 2 },
      { type: 'Double', price: 6500, available: 3 },
    ],
  },
  {
    id: '2',
    name: 'Scholar\'s Den',
    description: 'Affordable and comfortable accommodation for female students. Safe neighborhood with 24/7 security.',
    price: 7000,
    location: 'Amingaon, 1.2 km from ADTU',
    distance: 1.2,
    gender: 'female',
    images: [
      'https://images.unsplash.com/photo-1579632151052-92f741fb9b79?w=800',
      'https://images.unsplash.com/photo-1761818645928-47e5dad8ec76?w=800',
      'https://images.unsplash.com/photo-1618831352005-83a8a8b65c6d?w=800',
    ],
    amenities: ['WiFi', 'Meals', 'Laundry', 'Security'],
    rating: 4.7,
    reviews: 31,
    verified: true,
    ownerName: 'Priya Sharma',
    ownerPhone: '+91 98765 43211',
    roomTypes: [
      { type: 'Single', price: 7000, available: 1 },
      { type: 'Double', price: 5500, available: 4 },
      { type: 'Triple', price: 4500, available: 2 },
    ],
  },
  {
    id: '3',
    name: 'Campus View Residency',
    description: 'Spacious rooms with excellent facilities. Close to local markets and public transport.',
    price: 9000,
    location: 'Khanapara, Near ADTU',
    distance: 0.8,
    gender: 'both',
    images: [
      'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800',
      'https://images.unsplash.com/photo-1668089677938-b52086753f77?w=800',
      'https://images.unsplash.com/photo-1709805619372-40de3f158e83?w=800',
    ],
    amenities: ['WiFi', 'AC', 'Meals', 'Security'],
    rating: 4.3,
    reviews: 18,
    verified: true,
    ownerName: 'Amit Borah',
    ownerPhone: '+91 98765 43212',
    roomTypes: [
      { type: 'Single', price: 9000, available: 3 },
      { type: 'Double', price: 7000, available: 2 },
    ],
  },
  {
    id: '4',
    name: 'Green Valley PG',
    description: 'Peaceful environment with home-cooked meals. Ideal for students who prefer a quiet study atmosphere.',
    price: 6500,
    location: 'Jalukbari, 2 km from ADTU',
    distance: 2.0,
    gender: 'male',
    images: [
      'https://images.unsplash.com/photo-1618831352005-83a8a8b65c6d?w=800',
      'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800',
      'https://images.unsplash.com/photo-1579632151052-92f741fb9b79?w=800',
    ],
    amenities: ['WiFi', 'Meals', 'Laundry'],
    rating: 4.1,
    reviews: 12,
    verified: false,
    ownerName: 'Suresh Das',
    ownerPhone: '+91 98765 43213',
    roomTypes: [
      { type: 'Double', price: 6500, available: 5 },
      { type: 'Triple', price: 5000, available: 3 },
    ],
  },
  {
    id: '5',
    name: 'Elite Student Housing',
    description: 'Premium accommodation with gym, study room, and recreational facilities. Perfect for serious students.',
    price: 10500,
    location: 'Panikhaiti, Adjacent to ADTU',
    distance: 0.3,
    gender: 'female',
    images: [
      'https://images.unsplash.com/photo-1761818645928-47e5dad8ec76?w=800',
      'https://images.unsplash.com/photo-1668089677938-b52086753f77?w=800',
      'https://images.unsplash.com/photo-1709805619372-40de3f158e83?w=800',
    ],
    amenities: ['WiFi', 'AC', 'Meals', 'Laundry', 'Security'],
    rating: 4.8,
    reviews: 42,
    verified: true,
    ownerName: 'Anjali Devi',
    ownerPhone: '+91 98765 43214',
    roomTypes: [
      { type: 'Single', price: 10500, available: 2 },
      { type: 'Double', price: 8000, available: 1 },
    ],
  },
  {
    id: '6',
    name: 'Budget Student Stay',
    description: 'Affordable option for students on a budget. Basic amenities with good connectivity to campus.',
    price: 5500,
    location: 'Amingaon, 1.5 km from ADTU',
    distance: 1.5,
    gender: 'both',
    images: [
      'https://images.unsplash.com/photo-1520277739336-7bf67edfa768?w=800',
      'https://images.unsplash.com/photo-1618831352005-83a8a8b65c6d?w=800',
      'https://images.unsplash.com/photo-1579632151052-92f741fb9b79?w=800',
    ],
    amenities: ['WiFi', 'Meals'],
    rating: 3.9,
    reviews: 8,
    verified: false,
    ownerName: 'Ramesh Saikia',
    ownerPhone: '+91 98765 43215',
    roomTypes: [
      { type: 'Double', price: 5500, available: 6 },
      { type: 'Triple', price: 4200, available: 4 },
    ],
  },
];

export default function InitializeData() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const checkAndInitialize = async () => {
      // Check if data is already initialized
      const initialized = localStorage.getItem('pgDataInitialized');
      const usersInitialized = localStorage.getItem('demoUsersInitialized');
      
      if (initialized && usersInitialized) {
        setIsInitialized(true);
        return;
      }

      try {
        // Initialize PG data
        if (!initialized) {
          console.log('Initializing PG data...');
          
          const pgResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/server/make-server-2c39c550/init-data`,
            {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${publicAnonKey}`,
              },
            }
          );

          if (pgResponse.ok) {
            console.log('PG data initialized successfully');
            localStorage.setItem('pgDataInitialized', 'true');
          }
        }

        // Initialize demo users
        if (!usersInitialized) {
          console.log('Initializing demo users...');
          
          try {
            const userResponse = await fetch(
              `https://${projectId}.supabase.co/functions/v1/server/make-server-2c39c550/init-demo-users`,
              {
                method: 'POST',
                headers: {
                  Authorization: `Bearer ${publicAnonKey}`,
                },
              }
            );

            if (userResponse.ok) {
              const result = await userResponse.json();
              console.log('Demo users initialization result:', result);
              localStorage.setItem('demoUsersInitialized', 'true');
            } else {
              const errorText = await userResponse.text();
              console.error('Failed to initialize demo users:', errorText);
              // Don't set flag so it can retry
            }
          } catch (error) {
            console.error('Error initializing demo users:', error);
            // Don't set flag so it can retry
          }
        }
        
        setIsInitialized(true);
        console.log('Data initialization complete');
        
      } catch (error) {
        console.error('Error initializing data:', error);
        setIsInitialized(true); // Still mark as initialized to prevent loops
      }
    };

    checkAndInitialize();
  }, []);

  // This component doesn't render anything
  return null;
}

// Export sample data for use elsewhere
export { samplePGs };
