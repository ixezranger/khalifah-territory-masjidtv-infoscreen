import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase, isDemoMode } from '../../lib/supabase';
import LoadingSpinner from './LoadingSpinner';

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(!isDemoMode);
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (isDemoMode) return; // skip auth check in demo mode

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Demo mode: allow access without auth
  if (isDemoMode) return children;

  if (loading) return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--color-navy)',
    }}>
      <LoadingSpinner size="lg" text="Mengesahkan sesi..." />
    </div>
  );

  if (!session) return <Navigate to="/login" replace />;
  return children;
}
