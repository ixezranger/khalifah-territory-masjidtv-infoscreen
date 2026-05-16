import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { gsap } from 'gsap';

import DateTimeWidget from './DateTimeWidget';
import CountdownWidget from './CountdownWidget';
import HadithWidget from './HadithWidget';
import InfoTicker from './InfoTicker';
import AudioPlayer from './AudioPlayer';
import MediaSlider from './MediaSlider';
import PrayerTimesBar from './PrayerTimesBar';
import GlassCard from '../shared/GlassCard';
import ViewportSwitcher from '../shared/ViewportSwitcher';
import LoadingSpinner from '../shared/LoadingSpinner';
import CrescentIcon from '../shared/CrescentIcon';

import useWaktuSolat from '../../hooks/useWaktuSolat';
import useStore from '../../store/useStore';
import { supabase, isDemoMode } from '../../lib/supabase';
import {
  getSliderItems, getAudioItems, getTickerMessages,
  getHadithItems, getFeatureSettings, getActiveBlastNotifications,
} from '../../lib/supabase';

const DEMO_PROFILE = {
  masjid_name: 'MASJID AL IKHLAS',
  masjid_description: 'Saujana Impian, Kajang',
  zone_code: 'WLY01',
  background_image_url: null,
};

const DEFAULT_SETTINGS = {
  show_countdown: true, show_ticker: true, show_hadith: true,
  show_datetime: true, show_slider: true, show_audio_player: false,
  slider_limit: 10, ticker_speed: 50, hadith_rotation_minutes: 5,
  audio_autoplay: false, audio_volume: 60, audio_default_category: 'zikir',
  active_playlist_id: null,
};

// ── Masjid branding left panel ────────────────────────────────────────────
function MasjidBrandingPanel({ prof }) {
  const hasBg = !!prof.background_image_url;
  return (
    <div style={{
      position: 'relative', borderRadius: 16, overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
      justifyContent: 'space-between', padding: 20,
      height: '100%',
    }}>
      {/* Background */}
      {hasBg ? (
        <img src={prof.background_image_url} alt=""
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, #1E3A8A 0%, #5B21B6 50%, #0F172A 100%)',
        }} />
      )}

      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: -60, right: -60,
        width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(139,92,246,0.25)', filter: 'blur(50px)',
      }} />
      <div style={{
        position: 'absolute', bottom: 80, left: -40,
        width: 160, height: 160, borderRadius: '50%',
        background: 'rgba(59,130,246,0.2)', filter: 'blur(40px)',
      }} />

      {/* Gradient overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, rgba(0,0,0,0.05) 40%, rgba(0,0,0,0.6) 100%)',
      }} />

      {/* Subtle grid lines */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.08,
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
      }} />

      {/* Top: Logo + Admin link */}
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{
          width: 'clamp(48px,5vw,72px)', height: 'clamp(48px,5vw,72px)',
          borderRadius: 'var(--radius-lg)',
          background: 'rgba(255,255,255,0.15)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        }}>
          <CrescentIcon size={36} color="white" />
        </div>
        <Link to="/admin" style={{
          color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem',
          textDecoration: 'none', marginTop: 4,
        }}>
          Admin →
        </Link>
      </div>

      {/* Bottom: Masjid info */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Decorative accent bar */}
        <div style={{
          width: 'clamp(28px,3vw,40px)', height: 3,
          background: 'linear-gradient(to right, #3B82F6, #8B5CF6)',
          borderRadius: 2, marginBottom: 10,
        }} />

        <h1 style={{
          fontSize: 'clamp(1.1rem, 2vw, 2.4rem)',
          fontWeight: 900, color: 'white',
          margin: '0 0 6px', lineHeight: 1.1,
          letterSpacing: '-0.02em',
          textShadow: '0 2px 16px rgba(0,0,0,0.6)',
          textTransform: 'uppercase',
        }}>
          {prof.masjid_name || 'MasjidTV'}
        </h1>

        {prof.masjid_description && (
          <p style={{
            fontSize: 'clamp(0.7rem, 1vw, 0.9rem)',
            color: 'rgba(255,255,255,0.65)',
            margin: '0 0 14px', lineHeight: 1.4,
          }}>
            {prof.masjid_description}
          </p>
        )}

        {/* Bottom pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['🇲🇾 Malaysia', '🕌 InfoTV'].map((text) => (
            <span key={text} style={{
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 20, padding: '3px 10px',
              fontSize: 'clamp(0.58rem, 0.7vw, 0.7rem)',
              color: 'rgba(255,255,255,0.8)',
              whiteSpace: 'nowrap',
            }}>
              {text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Blast toast ────────────────────────────────────────────────────────────
function BlastToast({ notification, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 10000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  if (!notification) return null;
  return (
    <div style={{
      position: 'fixed', top: isDemoMode ? 80 : 52, left: '50%',
      transform: 'translateX(-50%)', zIndex: 9999,
      width: '100%', maxWidth: 480, padding: '0 16px',
    }}>
      <GlassCard style={{ padding: 16, border: '1px solid rgba(59,130,246,0.5)', position: 'relative' }}>
        <button onClick={onDismiss} style={{
          position: 'absolute', top: 10, right: 10,
          background: 'transparent', border: 'none', color: '#93C5FD', fontSize: 16, cursor: 'pointer',
        }}>✕</button>
        <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#93C5FD', paddingRight: 24 }}>
          {notification.title}
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 8 }}>
          {notification.message}
        </div>
      </GlassCard>
    </div>
  );
}

// ── Main screen ────────────────────────────────────────────────────────────
export default function InfoTVScreen() {
  const {
    profile, setProfile, featureSettings, setFeatureSettings,
    sliderItems, setSliderItems, audioItems, setAudioItems,
    tickerMessages, setTickerMessages, hadithItems, setHadithItems,
    blastNotifications, setBlastNotifications,
    viewportMode, setViewportMode, currentZone, setZone,
  } = useStore();

  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState(DEMO_PROFILE);
  const [activeSettings, setActiveSettings] = useState(DEFAULT_SETTINGS);
  const [blastToast, setBlastToast] = useState(null);

  const channelsRef = useRef([]);

  const { nextSolat, nextSolatName } = useWaktuSolat(
    (profile || activeProfile)?.zone_code || currentZone || 'WLY01'
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
    } catch (err) { console.error('Data load error:', err); }
  }, [setSliderItems, setAudioItems, setTickerMessages, setHadithItems, setFeatureSettings, setBlastNotifications]);

  useEffect(() => {
    let isMounted = true;
    async function init() {
      if (isDemoMode) {
        const [tickerRes, hadithRes, settingsRes] = await Promise.all([
          getTickerMessages('demo'), getHadithItems('demo'), getFeatureSettings('demo'),
        ]);
        if (!isMounted) return;
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
    if (isDemoMode) return;
    const session = supabase.auth.getSession();
    let userId = null;
    session.then(({ data: { session: s } }) => { userId = s?.user?.id; });

    const tickerCh = supabase.channel('ticker_ch').on('postgres_changes',
      { event: '*', schema: 'public', table: 'ticker_messages' }, async () => {
        if (userId) { const { data } = await getTickerMessages(userId); if (data) setTickerMessages(data); }
      }).subscribe();
    const blastCh = supabase.channel('blast_ch').on('postgres_changes',
      { event: '*', schema: 'public', table: 'blast_notifications' }, async () => {
        const { data } = await getActiveBlastNotifications();
        if (data) { setBlastNotifications(data); if (data.length) setBlastToast(data[0]); }
      }).subscribe();
    const sliderCh = supabase.channel('slider_ch').on('postgres_changes',
      { event: '*', schema: 'public', table: 'slider_items' }, async () => {
        if (userId) { const { data } = await getSliderItems(userId); if (data) setSliderItems(data); }
      }).subscribe();

    channelsRef.current = [tickerCh, blastCh, sliderCh];
    return () => { channelsRef.current.forEach((ch) => supabase.removeChannel(ch)); };
  }, [setTickerMessages, setBlastNotifications, setSliderItems]);

  const settings = featureSettings?.show_datetime !== undefined
    ? { ...DEFAULT_SETTINGS, ...featureSettings }
    : activeSettings;

  const prof = profile || activeProfile;
  const zone = prof.zone_code || currentZone || 'WLY01';

  if (loading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #0B1437 0%, #1B2D6B 50%, #1A3A8A 100%)',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <CrescentIcon size={56} color="rgba(147,197,253,0.8)" animated />
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', letterSpacing: '0.1em' }}>
            Memuatkan InfoTV...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      background: 'linear-gradient(135deg, #0B1437 0%, #1B2D6B 40%, #1A3A8A 100%)',
      paddingTop: isDemoMode ? 32 : 0,
      boxSizing: 'border-box',
    }}>
      {blastToast && <BlastToast notification={blastToast} onDismiss={() => setBlastToast(null)} />}

      {/* ── MAIN 3-COLUMN CONTENT ── */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: '26fr 46fr 28fr',
        gap: 10,
        padding: '10px 12px 6px',
        minHeight: 0,
        overflow: 'hidden',
      }}>
        {/* LEFT: Masjid branding */}
        <MasjidBrandingPanel prof={prof} />

        {/* CENTER: Slider */}
        <div style={{ minHeight: 0, overflow: 'hidden', borderRadius: 16 }}>
          <MediaSlider items={sliderItems} settings={settings} />
        </div>

        {/* RIGHT: Info column */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          gap: 8, minHeight: 0, overflow: 'hidden',
        }}>
          {settings.show_datetime && <DateTimeWidget />}
          {settings.show_countdown && (
            <CountdownWidget nextSolatTime={nextSolat} nextSolatName={nextSolatName} />
          )}
          {settings.show_hadith && (
            <HadithWidget
              hadithItems={hadithItems}
              rotationMinutes={settings.hadith_rotation_minutes}
            />
          )}
          {settings.show_audio_player && (
            <AudioPlayer audioItems={audioItems} featureSettings={settings} />
          )}
        </div>
      </div>

      {/* ── PRAYER TIMES HORIZONTAL BAR ── */}
      <PrayerTimesBar zone={zone} />

      {/* ── INFO TICKER ── */}
      {settings.show_ticker && (
        <InfoTicker
          messages={tickerMessages.map((t) => t.message)}
          speed={settings.ticker_speed}
        />
      )}

      {/* Viewport switcher */}
      <ViewportSwitcher currentView={viewportMode} onViewChange={setViewportMode} />
    </div>
  );
}
