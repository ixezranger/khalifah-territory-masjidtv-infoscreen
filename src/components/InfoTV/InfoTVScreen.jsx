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
import { supabase } from '../../lib/supabase';
import {
  getSliderItems,
  getAudioItems,
  getTickerMessages,
  getHadithItems,
  getFeatureSettings,
  getActiveBlastNotifications,
} from '../../lib/supabase';

const ARABESQUE = `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23C9A84C' fill-opacity='0.04'%3E%3Cpath d='M20 0l4 8h8l-6 6 2 9-8-5-8 5 2-9-6-6h8z'/%3E%3C/g%3E%3C/svg%3E")`;

const DEMO_PROFILE = {
  masjid_name: 'Masjid Demo — MasjidTV',
  masjid_description: 'Sistem InfoTV Islamik oleh Khalifah Territory',
  zone_code: 'WLY01',
  background_image_url: null,
};

const DEFAULT_SETTINGS = {
  show_countdown: true,
  show_ticker: true,
  show_hadith: true,
  show_datetime: true,
  show_slider: true,
  show_audio_player: true,
  slider_limit: 10,
  ticker_speed: 50,
  hadith_rotation_minutes: 5,
  audio_autoplay: true,
  audio_volume: 60,
  audio_default_category: 'zikir',
  active_playlist_id: null,
};

const VIEWPORT_STYLES = {
  tv: {
    width: '100%',
    height: '100vh',
    border: 'none',
    borderRadius: 0,
    overflowY: 'auto',
  },
  tablet: {
    maxWidth: '1024px',
    margin: '0 auto',
    border: '1px solid rgba(201,168,76,0.4)',
    borderRadius: '12px',
    overflow: 'hidden',
  },
  mobile: {
    maxWidth: '390px',
    margin: '0 auto',
    border: '1px solid rgba(201,168,76,0.4)',
    borderRadius: '24px',
    height: '844px',
    overflowY: 'auto',
  },
};

// ── Blast notification toast ───────────────────────────────────────────────
function BlastToast({ notification, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 10000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  if (!notification) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '64px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      width: '100%',
      maxWidth: '480px',
      padding: '0 16px',
    }}>
      <GlassCard
        style={{
          padding: '16px',
          border: '1px solid #C9A84C',
          position: 'relative',
        }}
      >
        <button
          onClick={onDismiss}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'transparent',
            border: 'none',
            color: '#C9A84C',
            fontSize: '16px',
            cursor: 'pointer',
            lineHeight: 1,
          }}
        >
          ✕
        </button>
        <div style={{
          fontFamily: "'Cinzel Decorative', serif",
          color: '#C9A84C',
          fontSize: '1rem',
          paddingRight: '24px',
        }}>
          {notification.title}
        </div>
        <div style={{
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          color: '#F5EDD6',
          fontSize: '0.85rem',
          marginTop: '8px',
        }}>
          {notification.message}
        </div>
      </GlassCard>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────
export default function InfoTVScreen() {
  const { user, profile, setProfile, featureSettings, setFeatureSettings,
    sliderItems, setSliderItems, audioItems, setAudioItems,
    tickerMessages, setTickerMessages, hadithItems, setHadithItems,
    blastNotifications, setBlastNotifications,
    viewportMode, setViewportMode, currentZone, setZone } = useStore();

  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState(DEMO_PROFILE);
  const [activeSettings, setActiveSettings] = useState(DEFAULT_SETTINGS);
  const [blastToast, setBlastToast] = useState(null);

  const gsapCtxRef = useRef(null);
  const channelsRef = useRef([]);

  const { nextSolat, nextSolatName } = useWaktuSolat(
    activeProfile?.zone_code || currentZone || 'WLY01'
  );

  // ── Load all data ──────────────────────────────────────────────────────
  const loadData = useCallback(async (userId) => {
    try {
      const [sliderRes, audioRes, tickerRes, hadithRes, settingsRes, blastRes] =
        await Promise.all([
          getSliderItems(userId),
          getAudioItems(userId),
          getTickerMessages(userId),
          getHadithItems(userId),
          getFeatureSettings(userId),
          getActiveBlastNotifications(),
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

  // ── Mount: auth + data ─────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;

    async function init() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!isMounted) return;

      if (session?.user) {
        // Load profile
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (prof) {
          setProfile(prof);
          setActiveProfile(prof);
          if (prof.zone_code) setZone(prof.zone_code);
        }
        await loadData(session.user.id);
      } else {
        // Demo mode — no user
        setActiveProfile(DEMO_PROFILE);
        setActiveSettings(DEFAULT_SETTINGS);
      }

      if (isMounted) setLoading(false);
    }

    init();
    return () => { isMounted = false; };
  }, [loadData, setProfile, setZone]);

  // ── GSAP entrance (runs after loading completes) ───────────────────────
  useEffect(() => {
    if (loading) return;

    gsapCtxRef.current = gsap.context(() => {
      gsap.from('.infotv-widget', {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power3.out',
        delay: 0.2,
      });
    });

    return () => gsapCtxRef.current?.revert();
  }, [loading]);

  // ── Supabase realtime ──────────────────────────────────────────────────
  useEffect(() => {
    const session = supabase.auth.getSession();
    let userId = null;
    session.then(({ data: { session: s } }) => { userId = s?.user?.id; });

    const tickerCh = supabase
      .channel('ticker_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'ticker_messages' }, async () => {
        if (userId) {
          const { data } = await getTickerMessages(userId);
          if (data) setTickerMessages(data);
        }
      })
      .subscribe();

    const blastCh = supabase
      .channel('blast_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'blast_notifications' }, async () => {
        const { data } = await getActiveBlastNotifications();
        if (data) {
          setBlastNotifications(data);
          if (data.length) setBlastToast(data[0]);
        }
      })
      .subscribe();

    const sliderCh = supabase
      .channel('slider_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'slider_items' }, async () => {
        if (userId) {
          const { data } = await getSliderItems(userId);
          if (data) setSliderItems(data);
        }
      })
      .subscribe();

    channelsRef.current = [tickerCh, blastCh, sliderCh];

    return () => {
      channelsRef.current.forEach((ch) => supabase.removeChannel(ch));
    };
  }, [setTickerMessages, setBlastNotifications, setSliderItems]);

  // ── Derived state ──────────────────────────────────────────────────────
  const settings = featureSettings?.show_datetime !== undefined
    ? { ...DEFAULT_SETTINGS, ...featureSettings }
    : activeSettings;

  const prof = profile || activeProfile;

  // ── Loading state ──────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'var(--color-navy)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <LoadingSpinner size="lg" text="Memuatkan..." />
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden', background: 'var(--color-navy)' }}>
      {/* Background layer */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        background: prof.background_image_url
          ? `url(${prof.background_image_url})`
          : 'var(--color-navy)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }} />

      {/* Dark overlay */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 1, background: 'rgba(5,14,26,0.82)' }} />

      {/* Arabesque pattern */}
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2,
        backgroundImage: ARABESQUE,
        backgroundRepeat: 'repeat',
        pointerEvents: 'none',
      }} />

      {/* Top nav bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        height: '40px',
        background: 'rgba(5,14,26,0.9)',
        borderBottom: '1px solid rgba(201,168,76,0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CrescentIcon size={16} color="#C9A84C" />
          <span style={{
            fontFamily: "'Cinzel Decorative', serif",
            color: '#C9A84C',
            fontSize: '0.75rem',
            letterSpacing: '0.08em',
          }}>
            MasjidTV
          </span>
        </div>
        <Link
          to="/admin"
          style={{
            color: '#C9A84C',
            fontSize: '0.8rem',
            textDecoration: 'none',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          CMS Admin →
        </Link>
      </div>

      {/* Blast toast */}
      {blastToast && (
        <BlastToast
          notification={blastToast}
          onDismiss={() => setBlastToast(null)}
        />
      )}

      {/* Viewport wrapper */}
      <div style={{ position: 'relative', zIndex: 3, paddingTop: '40px' }}>
        <div style={VIEWPORT_STYLES[viewportMode] || VIEWPORT_STYLES.tv}>

          {/* Content grid */}
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Section 1 — Header */}
            <div className="infotv-widget">
              <MasjidHeader
                masjidName={prof.masjid_name || 'MasjidTV'}
                description={prof.masjid_description || ''}
              />
            </div>

            {/* Section 2 — DateTime + Countdown | WaktuSolat */}
            <div
              className="infotv-widget"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 2fr',
                gap: '16px',
              }}
            >
              {/* Left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {settings.show_datetime && <DateTimeWidget />}
                {settings.show_countdown && (
                  <CountdownWidget
                    nextSolatTime={nextSolat}
                    nextSolatName={nextSolatName}
                  />
                )}
              </div>

              {/* Right column */}
              <WaktuSolatWidget zone={prof.zone_code || currentZone || 'WLY01'} />
            </div>

            {/* Section 3 — Slider */}
            {settings.show_slider && (
              <div className="infotv-widget">
                <MediaSlider items={sliderItems} settings={settings} />
              </div>
            )}

            {/* Section 4 — Hadith | AudioPlayer */}
            <div
              className="infotv-widget"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
              }}
            >
              {settings.show_hadith && (
                <HadithWidget
                  hadithItems={hadithItems}
                  rotationMinutes={settings.hadith_rotation_minutes}
                />
              )}
              {settings.show_audio_player && (
                <AudioPlayer
                  audioItems={audioItems}
                  featureSettings={settings}
                />
              )}
            </div>

            {/* Section 5 — Ticker */}
            {settings.show_ticker && (
              <div className="infotv-widget">
                <InfoTicker
                  messages={tickerMessages.map((t) => t.message)}
                  speed={settings.ticker_speed}
                />
              </div>
            )}

            {/* Section 6 — Footer */}
            <div className="infotv-widget">
              <footer style={{
                textAlign: 'center',
                fontSize: '0.7rem',
                color: 'rgba(201,168,76,0.6)',
                padding: '8px 0',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                © 2025 Khalifah Territory. All rights reserved.
              </footer>
            </div>

          </div>
        </div>
      </div>

      {/* Viewport switcher */}
      <ViewportSwitcher currentView={viewportMode} onViewChange={setViewportMode} />
    </div>
  );
}
