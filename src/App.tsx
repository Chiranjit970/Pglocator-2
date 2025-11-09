import { useState, useEffect, useRef } from 'react';
import { Toaster } from 'sonner@2.0.3';
import SplashScreen from './components/SplashScreen';
import OnboardingScreen from './components/OnboardingScreen';
import AuthScreen from './components/auth/AuthScreen';
import StudentHome from './components/student/StudentHome';
import OwnerDashboard from './components/owner/OwnerDashboard';
import AdminDashboard from './components/admin/AdminDashboard';
import InitializeData from './components/InitializeData';
import { useAuthStore } from './store/authStore';
import { createClient } from './utils/supabase/client';
import { projectId } from './utils/supabase/info';

type AppState = 'loading' | 'splash' | 'onboarding' | 'auth' | 'app';
type UserRole = 'student' | 'owner' | 'admin' | null;

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const { user, setUser, setAccessToken, setIsLoading } = useAuthStore();
  const isLoggingIn = useRef(false);

  // Debug logging
  console.log('App render - appState:', appState, 'user:', user?.role, user?.name);

  useEffect(() => {
    initializeApp();
    initializeData();
  }, []);

  // Watch for user changes after login
  useEffect(() => {
    if (user && isLoggingIn.current && appState === 'auth') {
      console.log('User logged in successfully, navigating to app...');
      isLoggingIn.current = false;
      setAppState('app');
    }
  }, [user, appState]);

  const initializeApp = async () => {
    // Check for existing auth session
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      // User is logged in, fetch their profile
      setAccessToken(session.access_token);
      
      try {
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/user/profile`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (response.ok) {
          const profile = await response.json();
          setUser(profile);
          localStorage.setItem('userRole', profile.role);
          setSelectedRole(profile.role);
          setAppState('app');
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    }

    // No active session, check if they've seen onboarding
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    setAppState(hasSeenOnboarding ? 'onboarding' : 'splash');
    setIsLoading(false);
  };

  const initializeData = async () => {
    // Initialize sample PG data and demo users
    const isPGInitialized = localStorage.getItem('pgDataInitialized');
    const areUsersInitialized = localStorage.getItem('demoUsersInitialized');
    
    try {
      if (!isPGInitialized) {
        console.log('Initializing PG data...');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/init-data`,
          {
            method: 'POST',
          }
        );
        if (response.ok) {
          const result = await response.json();
          console.log('PG data initialization result:', result);
          localStorage.setItem('pgDataInitialized', 'true');
        } else {
          console.error('Failed to initialize PG data:', response.status);
        }
      } else {
        console.log('PG data already initialized');
      }

      if (!areUsersInitialized) {
        console.log('Initializing demo users...');
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2c39c550/init-demo-users`,
          {
            method: 'POST',
          }
        );
        if (response.ok) {
          const result = await response.json();
          console.log('Demo users initialization result:', result);
          
          // Check if initialization was successful
          if (result.results && result.results.some((r: any) => r.status === 'created' || r.status === 'already_exists')) {
            localStorage.setItem('demoUsersInitialized', 'true');
          } else {
            console.warn('Demo user initialization may have failed:', result);
          }
        } else {
          console.error('Failed to initialize demo users:', response.status, await response.text());
        }
      } else {
        console.log('Demo users already initialized');
      }
    } catch (error) {
      console.error('Error initializing data:', error);
    }
  };

  const handleSplashComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setAppState('onboarding');
  };

  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setAppState('auth');
  };

  const handleAuthSuccess = () => {
    console.log('handleAuthSuccess called - Marking login in progress');
    isLoggingIn.current = true;
    // The useEffect watching user changes will handle the actual navigation
  };

  if (appState === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (appState === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (appState === 'onboarding') {
    return <OnboardingScreen onRoleSelect={handleRoleSelect} onSkip={() => setAppState('onboarding')} />;
  }

  if (appState === 'auth' && selectedRole) {
    return <AuthScreen initialRole={selectedRole} onSuccess={handleAuthSuccess} />;
  }

  if (appState === 'app' && user) {
    console.log('Rendering app for user:', user.role, user.name);
    // Route to appropriate dashboard based on role
    if (user.role === 'student') {
      return (
        <>
          <StudentHome />
          <InitializeData />
          <Toaster position="bottom-right" richColors />
        </>
      );
    }

    if (user.role === 'owner') {
      return (
        <>
          <OwnerDashboard />
          <Toaster position="bottom-right" richColors />
        </>
      );
    }

    if (user.role === 'admin') {
      return (
        <>
          <AdminDashboard />
          <Toaster position="bottom-right" richColors />
        </>
      );
    }
  }

  // Fallback - Loading state if app is ready but user not yet loaded
  if (appState === 'app' && !user) {
    console.log('Waiting for user data...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-stone-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Fallback for unexpected states
  console.warn('Unexpected app state:', appState, 'user:', user);
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-stone-50 to-amber-50 flex items-center justify-center">
      <div className="text-center">
        <p className="text-stone-600">Something went wrong. Please refresh the page.</p>
        <p className="text-stone-500 mt-2">State: {appState}, User: {user ? 'Set' : 'Not set'}</p>
      </div>
    </div>
  );
}
