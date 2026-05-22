import React, { useEffect, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { supabase, getProfile, isDemoMode } from './lib/supabase';
import { loadXmlConfig } from './lib/xmlConfig';
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
  const { setUser, setSession, setProfile, setSliderItems, setTickerMessages, setHadithItems, setFeatureSettings, setZone } = useStore();

  useEffect(() => {
    // ── Load config.xml first (works in both demo & live mode) ──
    loadXmlConfig().then((cfg) => {
      if (!cfg) return;
      // Merge profile fields
      if (cfg.profile) {
        setProfile((prev) => ({
          ...prev,
          ...Object.fromEntries(
            Object.entries(cfg.profile).filter(([, v]) => v !== null && v !== '')
          ),
        }));
        if (cfg.profile.zone_code) setZone(cfg.profile.zone_code);
      }
      if (cfg.sliderItems?.length)   setSliderItems(cfg.sliderItems);
      if (cfg.tickerMessages?.length) setTickerMessages(cfg.tickerMessages);
      if (cfg.hadithItems?.length)   setHadithItems(cfg.hadithItems);
      if (cfg.featureSettings)       setFeatureSettings(cfg.featureSettings);
    });

    if (isDemoMode) {
      setProfile((prev) => ({
        id: 'demo', full_name: 'Admin Demo', role: 'admin',
        masjid_name: 'Masjid Demo — MasjidTV',
        masjid_description: 'Sistem InfoTV Islamik oleh Khalifah Territory',
        zone_code: 'WLY01', background_image_url: null, is_active: true,
        ...prev, // xml values override demo defaults
      }));
      return;
    }

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
