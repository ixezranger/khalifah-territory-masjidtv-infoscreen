import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

import MasjidHeader from './MasjidHeader';
import DateTimeWidget from './DateTimeWidget';
import WaktuSolatWidget from './WaktuSolatWidget';
import CountdownWidget from './CountdownWidget';
import HadithWidget from './HadithWidget';
import InfoTicker from './InfoTicker';
import AudioPlayer from './AudioPlayer';
import MediaSlider from './MediaSlider';
import GlassCard from '../shared/GlassCard';
import ViewportSwitcher from '../shared/ViewportSwitcher';
import LoadingSpinner from '../shared/LoadingSpinner';
import CrescentIcon from '../shared/CrescentIcon';

import useWaktuSolat from '../../hooks/useWaktuSolat';
import useStore from '../../store/useStore';
import { supabase, isDemoMode } from '../../lib/supabase';
import {
  getSliderItems,
  getAudioItems,
  getTickerMessages,
  getHadithItems,
  getFeatureSettings,
  getActiveBlastNotifications,
} from '../../lib/supabase';

const DEMO_PROFILE = {
  masjid_name: 'Masjid Demo — MasjidTV',
  masjid_description: 'Sistem InfoTV Islamik oleh Khalifah Territory',
  zone_code: 'WLY01',
  background_image_url: null,
};

const DEFAULT_SETTINGS = {
  show_countdown: true, show_ticker: true, show_hadith: true,
  show_datetime: true, show_slider: true, show_audio_player: true,
  slider_limit: 10, ticker_speed: 50, hadith_rotation_minutes: 5,
  audio_autoplay: true, audio_volume: 60, audio_default_category: 'zikir',
  active_playlist_id: null,
};

const VIEWPORT_STYLES = {
  tv: { width: '100%', minHeight: '100vh' },
  tablet: { maxWidth: 1024, margin: '0 auto', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' },
  mobile: { maxWidth: 390, margin: '0 auto', border: '1px solid var(--glass-border)', borderRadius: 24, minHeight: 844, overflow: 'hidden' },
};

function BlastToast({ notification, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 10000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!notification) return null;
  return (
    <div style={{
      position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)',
      zIndex: 9999, width: '100%', maxWidth: 480, padding: '0 16px',
    }}>
      <GlassCard style={{ padding: 16, border: '1px solid var(--ms-blue)', position: 'relative' }}>
        <button onClick={onDismiss} style={{
          position: 'absolute', top: 10, right: 10,
          background: 'transparent', border: 'none',
          color: 'var(--ms-blue)', fontSize: 16, cursor: 'pointer',
        }}>✕</button>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ms-blue)', paddingRight: 24 }}>
          {notification.title}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>
          {notification.message}
        </div>
      </GlassCard>
    </div>
  );
}

export default function InfoTVScreen() {
  const {
    user, profile, setProfile, featureSettings, setFeatureSettings,
    sliderItems, setSliderItems, audioItems, setAudioItems,
    tickerMessages, setTickerMessages, hadithItems, setHadithItems,
    blastNotifications, setBlastNotifications,
    viewportMode, setViewportMode, currentZone, setZone,
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState(DEMO_PROFILE);
  const [activeSettings, setActiveSettings] = useState(DEFAULT_SETTINGS);
  const [blastToast, setBlastToast] = useState(null);

  const gsapCtxRef = useRef(null);
  const channelsRef = useRef([]);

  const { nextSolat, nextSolatName } = useWaktuSolat(
    activeProfile?.zone_code || currentZone || 'WLY01'
  );

  const loadData = useCallback(async (userId) => {
    try {
      const [sliderRes, audioRes, tickerRes, hadithRes, settingsRes, blastRes] = await Promise.all([
        getSliderItems(userId), getAudioItems(userId), getTickerMessages(userId),
        getHadithItems(userId), getFeatureSettings(userId), getActiveBlastNotifications(),
      ]);
      if (sliderRes.data) setSliderItems(sliderRes.data);
      if (audioRes.data) setAudioItems(audioRes.data);
      if (tickerRes.data) setTickerMessages(tickerRes.data);
      if (hadithRes.data) setHadithItems(hadithRes.data);
      if (settingsRes.data) {
        setFeatureSettings({ ...DEFAULT_SETTINGS, ...settingsRes.data });
        setActiveSettings({ ...DEFAULT_SETTINGS, ...settingsRes.data });
      }
      if (blastRes.data) {
        setBlastNotifications(blastRes.data);
        if (blastRes.data.length) setBlastToast(blastRes.data[0]);
      }
    } catch (err) {
      console.error('Data load error:', err);
    }
  }, [setSliderItems, setAudioItems, setTickerMessages, setHadithItems,
    setFeatureSettings, setBlastNotifications]);

  useEffect(() => {
    let isMounted = true;

    async function init() {
      if (isDemoMode) {
        if (!isMounted) return;
        const [tickerRes, hadithRes, settingsRes] = await Promise.all([
          getTickerMessages('demo'), getHadithItems('demo'), getFeatureSettings('demo'),
        ]);
        setActiveProfile(DEMO_PROFILE);
        if (tickerRes.data) setTickerMessages(tickerRes.data);
        if (hadithRes.data) setHadithItems(hadithRes.data);
        if (settingsRes.data) {
          setFeatureSettings({ ...DEFAULT_SETTINGS, ...settingsRes.data });
          setActiveSettings({ ...DEFAULT_SETTINGS, ...settingsRes.data });
        }
        if (isMounted) setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (session?.user) {
        const { data: prof } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
        if (prof) { setProfile(prof); setActiveProfile(prof); if (prof.zone_code) setZone(prof.zone_code); }
        await loadData(session.user.id);
      } else {
        setActiveProfile(DEMO_PROFILE);
        setActiveSettings(DEFAULT_SETTINGS);
      }

      if (isMounted) setLoading(false);
    }

    init();
    return () => { isMounted = false; };
  }, [loadData, setProfile, setZone]);

  useEffect(() => {
    if (loading) return;
    gsapCtxRef.current = gsap.context(() => {
      gsap.from('.infotv-widget', {
        opacity: 0, y: 40, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.1,
      });
    });
    return () => gsapCtxRef.current?.revert();
  }, [loading]);

  useEffect(() => {
    if (isDemoMode) return;

    const session = supabase.auth.getSession();
    let userId = null;
    session.then(({ data: { session: s } }) => { userId = s?.user?.id; });

    const tickerCh = supabase.channel('ticker_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticker_messages' }, async () => {
        if (userId) { const { data } = await getTickerMessages(userId); if (data) setTickerMessages(data); }
      }).subscribe();

    const blastCh = supabase.channel('blast_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blast_notifications' }, async () => {
        const { data } = await getActiveBlastNotifications();
        if (data) { setBlastNotifications(data); if (data.length) setBlastToast(data[0]); }
      }).subscribe();

    const sliderCh = supabase.channel('slider_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slider_items' }, async () => {
        if (userId) { const { data } = await getSliderItems(userId); if (data) setSliderItems(data); }
      }).subscribe();

    channelsRef.current = [tickerCh, blastCh, sliderCh];
    return () => { channelsRef.current.forEach((ch) => supabase.removeChannel(ch)); };
  }, [setTickerMessages, setBlastNotifications, setSliderItems]);

  const settings = featureSettings?.show_datetime !== undefined
    ? { ...DEFAULT_SETTINGS, ...featureSettings }
    : activeSettings;

  const prof = profile || activeProfile;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--bg-primary)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <LoadingSpinner size="lg" text="Memuatkan..." />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      {/* Background */}
      {prof.background_image_url && (
        <>
          <div style={{
            position: 'fixed', inset: 0, zIndex: 0,
            background: `url(${prof.background_image_url})`,
            backgroundSize: 'cover', backgroundPosition: 'center',
          }} />
          <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(15,17,23,0.88)' }} />
        </>
      )}

      {/* Subtle grid pattern */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 2, pointerEvents: 'none',
        backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)',
        backgroundSize: '32px 32px',
      }} />

      {/* Top bar */}
      <div style={{
        position: 'fixed',
        top: isDemoMode ? '32px' : 0,
        left: 0, right: 0, zIndex: 1000,
        height: 44, padding: '0 24px',
        background: 'rgba(15,17,23,0.9)',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <CrescentIcon size={16} color="var(--ms-blue)" />
          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>MasjidTV</span>
        </div>
        <Link to="/admin" style={{
          color: 'var(--ms-blue)', fontSize: '0.8rem', textDecoration: 'none',
        }}>
          Admin Panel →
        </Link>
      </div>

      {blastToast && <BlastToast notification={blastToast} onDismiss={() => setBlastToast(null)} />}

      {/* Main content */}
      <div style={{
        position: 'relative', zIndex: 3,
        paddingTop: isDemoMode ? 76 : 44,
        paddingBottom: 16,
      }}>
        <div style={VIEWPORT_STYLES[viewportMode] || VIEWPORT_STYLES.tv}>
          <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Row 1 — Header */}
            <div className="infotv-widget">
              <MasjidHeader masjidName={prof.masjid_name || 'MasjidTV'} description={prof.masjid_description || ''} />
            </div>

            {/* Row 2 — DateTime+Countdown | WaktuSolat */}
            <div className="infotv-widget" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 2fr',
              gap: 16,
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {settings.show_datetime && <DateTimeWidget />}
                {settings.show_countdown && (
                  <CountdownWidget nextSolatTime={nextSolat} nextSolatName={nextSolatName} />
                )}
              </div>
              <WaktuSolatWidget zone={prof.zone_code || currentZone || 'WLY01'} />
            </div>

            {/* Row 3 — Slider */}
            {settings.show_slider && (
              <div className="infotv-widget">
                <MediaSlider items={sliderItems} settings={settings} />
              </div>
            )}

            {/* Row 4 — Hadith | Audio */}
            <div className="infotv-widget" style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}>
              {settings.show_hadith && (
                <HadithWidget hadithItems={hadithItems} rotationMinutes={settings.hadith_rotation_minutes} />
              )}
              {settings.show_audio_player && (
                <AudioPlayer audioItems={audioItems} featureSettings={settings} />
              )}
            </div>

            {/* Row 5 — Ticker */}
            {settings.show_ticker && (
              <div className="infotv-widget">
                <InfoTicker messages={tickerMessages.map((t) => t.message)} speed={settings.ticker_speed} />
              </div>
            )}

            {/* Row 6 — Footer */}
            <div className="infotv-widget">
              <footer style={{
                textAlign: 'center', fontSize: '0.7rem',
                color: 'var(--text-muted)', padding: '8px 0',
              }}>
                © 2025 Khalifah Territory. All rights reserved.
              </footer>
            </div>

          </div>
        </div>
      </div>

      <ViewportSwitcher currentView={viewportMode} onViewChange={setViewportMode} />
    </div>
  );
}
