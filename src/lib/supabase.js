import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Demo mode when Supabase is not configured
export const isDemoMode = !supabaseUrl || supabaseUrl === '';

let supabaseInstance = null;

function getSupabase() {
  if (isDemoMode) return null;
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
}

export const supabase = isDemoMode ? null : getSupabase();

// ── Demo data ──────────────────────────────────────────────────────────────
const DEMO_PROFILE = {
  id: 'demo',
  masjid_name: 'Masjid Demo — MasjidTV',
  masjid_description: 'Sistem InfoTV Islamik oleh Khalifah Territory',
  zone_code: 'WLY01',
  role: 'admin',
  background_image_url: null,
  google_drive_connected: false,
};

const DEMO_TICKER = [
  { id: '1', message: 'Selamat datang ke MasjidTV — Sistem InfoTV Islamik oleh Khalifah Territory' },
  { id: '2', message: 'Jemaah dijemput hadir ke solat Jumaat pada setiap minggu' },
  { id: '3', message: 'Program Tadarus Al-Quran setiap malam Sabtu selepas Isyak' },
];

const DEMO_HADITH = [
  {
    id: '1',
    arabic_text: 'خَيْرُ النَّاسِ أَنْفَعُهُمْ لِلنَّاسِ',
    malay_translation: 'Sebaik-baik manusia adalah yang paling bermanfaat bagi manusia lain.',
    source: 'HR. Ahmad & Al-Hakim',
  },
  {
    id: '2',
    arabic_text: 'طَلَبُ الْعِلْمِ فَرِيضَةٌ عَلَى كُلِّ مُسْلِمٍ',
    malay_translation: 'Menuntut ilmu adalah kewajipan ke atas setiap Muslim.',
    source: 'HR. Ibn Majah',
  },
];

const DEMO_SETTINGS = {
  show_countdown: true, show_ticker: true, show_hadith: true,
  show_datetime: true, show_slider: true, show_audio_player: true,
  slider_limit: 10, ticker_speed: 50, hadith_rotation_minutes: 5,
  audio_autoplay: false, audio_volume: 60, audio_default_category: 'zikir',
  active_playlist_id: null,
};

// ── PROFILES ──────────────────────────────────────────────────────────────
export async function getProfile(userId) {
  if (isDemoMode) return { data: DEMO_PROFILE, error: null };
  const { data, error } = await supabase
    .from('profiles').select('*').eq('id', userId).single();
  return { data, error };
}

export async function updateProfile(userId, updates) {
  if (isDemoMode) return { data: { ...DEMO_PROFILE, ...updates }, error: null };
  const { data, error } = await supabase
    .from('profiles').update(updates).eq('id', userId).select().single();
  return { data, error };
}

export async function getAllProfiles() {
  if (isDemoMode) return { data: [DEMO_PROFILE], error: null };
  const { data, error } = await supabase
    .from('profiles').select('*').order('created_at', { ascending: false });
  return { data, error };
}

// ── SLIDER ITEMS ───────────────────────────────────────────────────────────
export async function getSliderItems(userId) {
  if (isDemoMode) return { data: [], error: null };
  const { data, error } = await supabase
    .from('slider_items').select('*').eq('user_id', userId)
    .eq('is_active', true).order('display_order', { ascending: true });
  return { data, error };
}

export async function upsertSliderItem(item) {
  if (isDemoMode) return { data: item, error: null };
  const { data, error } = await supabase
    .from('slider_items').upsert(item).select().single();
  return { data, error };
}

export async function deleteSliderItem(id) {
  if (isDemoMode) return { error: null };
  const { error } = await supabase.from('slider_items').delete().eq('id', id);
  return { error };
}

// ── AUDIO ITEMS ────────────────────────────────────────────────────────────
export async function getAudioItems(userId, category = null) {
  if (isDemoMode) return { data: [], error: null };
  let query = supabase.from('audio_items').select('*')
    .eq('user_id', userId).eq('is_active', true)
    .order('display_order', { ascending: true });
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  return { data, error };
}

export async function upsertAudioItem(item) {
  if (isDemoMode) return { data: item, error: null };
  const { data, error } = await supabase
    .from('audio_items').upsert(item).select().single();
  return { data, error };
}

export async function deleteAudioItem(id) {
  if (isDemoMode) return { error: null };
  const { error } = await supabase.from('audio_items').delete().eq('id', id);
  return { error };
}

// ── PLAYLISTS ──────────────────────────────────────────────────────────────
export async function getPlaylists(userId) {
  if (isDemoMode) return { data: [], error: null };
  const { data, error } = await supabase
    .from('audio_playlists').select('*, playlist_items(*, audio_items(*))')
    .eq('user_id', userId).order('created_at', { ascending: false });
  return { data, error };
}

export async function upsertPlaylist(playlist) {
  if (isDemoMode) return { data: playlist, error: null };
  const { data, error } = await supabase
    .from('audio_playlists').upsert(playlist).select().single();
  return { data, error };
}

export async function deletePlaylist(id) {
  if (isDemoMode) return { error: null };
  const { error } = await supabase.from('audio_playlists').delete().eq('id', id);
  return { error };
}

// ── TICKER MESSAGES ────────────────────────────────────────────────────────
export async function getTickerMessages(userId) {
  if (isDemoMode) return { data: DEMO_TICKER, error: null };
  const { data, error } = await supabase
    .from('ticker_messages').select('*').eq('user_id', userId)
    .eq('is_active', true).order('display_order', { ascending: true });
  return { data, error };
}

export async function upsertTickerMessage(msg) {
  if (isDemoMode) return { data: msg, error: null };
  const { data, error } = await supabase
    .from('ticker_messages').upsert(msg).select().single();
  return { data, error };
}

export async function deleteTickerMessage(id) {
  if (isDemoMode) return { error: null };
  const { error } = await supabase.from('ticker_messages').delete().eq('id', id);
  return { error };
}

// ── HADITH ─────────────────────────────────────────────────────────────────
export async function getHadithItems(userId) {
  if (isDemoMode) return { data: DEMO_HADITH, error: null };
  const { data, error } = await supabase
    .from('hadith_items').select('*').eq('user_id', userId)
    .eq('is_active', true).order('created_at', { ascending: true });
  return { data, error };
}

export async function upsertHadithItem(hadith) {
  if (isDemoMode) return { data: hadith, error: null };
  const { data, error } = await supabase
    .from('hadith_items').upsert(hadith).select().single();
  return { data, error };
}

export async function deleteHadithItem(id) {
  if (isDemoMode) return { error: null };
  const { error } = await supabase.from('hadith_items').delete().eq('id', id);
  return { error };
}

// ── FEATURE SETTINGS ───────────────────────────────────────────────────────
export async function getFeatureSettings(userId) {
  if (isDemoMode) return { data: DEMO_SETTINGS, error: null };
  const { data, error } = await supabase
    .from('feature_settings').select('*').eq('user_id', userId).single();
  return { data, error };
}

export async function updateFeatureSettings(userId, updates) {
  if (isDemoMode) return { data: { ...DEMO_SETTINGS, ...updates }, error: null };
  const { data, error } = await supabase
    .from('feature_settings')
    .upsert({ user_id: userId, ...updates, updated_at: new Date().toISOString() })
    .select().single();
  return { data, error };
}

// ── BLAST NOTIFICATIONS ────────────────────────────────────────────────────
export async function getActiveBlastNotifications() {
  if (isDemoMode) return { data: [], error: null };
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('blast_notifications').select('*')
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function upsertBlastNotification(blast) {
  if (isDemoMode) return { data: blast, error: null };
  const { data, error } = await supabase
    .from('blast_notifications').upsert(blast).select().single();
  return { data, error };
}

// ── GDRIVE IMPORTS ─────────────────────────────────────────────────────────
export async function logGdriveImport(importData) {
  if (isDemoMode) return { data: importData, error: null };
  const { data, error } = await supabase
    .from('gdrive_imports').insert(importData).select().single();
  return { data, error };
}

export async function updateGdriveImportStatus(id, status, destinationUrl = null, errorMessage = null) {
  if (isDemoMode) return { data: { id, status }, error: null };
  const { data, error } = await supabase
    .from('gdrive_imports')
    .update({ status, destination_url: destinationUrl, error_message: errorMessage })
    .eq('id', id).select().single();
  return { data, error };
}
