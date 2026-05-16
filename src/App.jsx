import React, { useEffect, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { supabase, getProfile } from './lib/supabase';
import useStore from './store/useStore';
import ProtectedRoute from './components/shared/ProtectedRoute';
import LoadingSpinner from './components/shared/LoadingSpinner';
import DemoBanner from './components/shared/DemoBanner';
import InfoTVPage from './pages/InfoTVPage';
import LoginPage from './pages/LoginPage';

// Lazy-load heavy admin bundle
const AdminPage = React.lazy(() => import('./pages/AdminPage'));

function AdminFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-navy)',
    }}>
      <LoadingSpinner size="lg" text="Memuatkan CMS..." />
    </div>
  );
}

export default function App() {
  const { setUser, setSession, setProfile } = useStore();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id).then(({ data }) => {
          if (data) setProfile(data);
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        getProfile(session.user.id).then(({ data }) => {
          if (data) setProfile(data);
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [setUser, setSession, setProfile]);

  return (
    <>
    <DemoBanner />
    <HashRouter>
      <Routes>
        <Route path="/" element={<InfoTVPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <Suspense fallback={<AdminFallback />}>
                <AdminPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
      </Routes>
    </HashRouter>
    </>
  );
}
