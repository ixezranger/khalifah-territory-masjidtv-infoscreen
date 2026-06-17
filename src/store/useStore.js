import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // Auth
      user: null,
      session: null,
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),

      // Profile
      profile: null,
      setProfile: (profile) => set({ profile }),

      // Feature settings
      featureSettings: {
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
      },
      setFeatureSettings: (featureSettings) => set({ featureSettings }),

      // Content
      sliderItems: [],
      setSliderItems: (sliderItems) => set({ sliderItems }),

      audioItems: [],
      setAudioItems: (audioItems) => set({ audioItems }),

      playlists: [],
      setPlaylists: (playlists) => set({ playlists }),

      tickerMessages: [],
      setTickerMessages: (tickerMessages) => set({ tickerMessages }),

      hadithItems: [],
      setHadithItems: (hadithItems) => set({ hadithItems }),

      blastNotifications: [],
      setBlastNotifications: (blastNotifications) => set({ blastNotifications }),

      // Zone (persisted)
      currentZone: 'WLY01',
      hasManualZone: false,
      setZone: (currentZone, manual = false) => set(state => ({
        currentZone,
        hasManualZone: manual ? true : state.hasManualZone,
      })),

      // UI state
      viewportMode: 'tv',
      setViewportMode: (viewportMode) => set({ viewportMode }),

      adminCurrentPage: 'dashboard',
      setAdminCurrentPage: (adminCurrentPage) => set({ adminCurrentPage }),
    }),
    {
      name: 'masjidtv-store',
      partialize: (state) => ({
        currentZone: state.currentZone,
        hasManualZone: state.hasManualZone,
        viewportMode: state.viewportMode,
      }),
    }
  )
);

export default useStore;
