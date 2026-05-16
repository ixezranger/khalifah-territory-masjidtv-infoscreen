import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- PROFILES ---
export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles').select('*').eq('id', userId).single();
  return { data, error };
}

export async function updateProfile(userId, updates) {
  const { data, error } = await supabase
    .from('profiles').update(updates).eq('id', userId).select().single();
  return { data, error };
}

export async function getAllProfiles() {
  const { data, error } = await supabase
    .from('profiles').select('*').order('created_at', { ascending: false });
  return { data, error };
}

// --- SLIDER ITEMS ---
export async function getSliderItems(userId) {
  const { data, error } = await supabase
    .from('slider_items').select('*').eq('user_id', userId)
    .eq('is_active', true).order('display_order', { ascending: true });
  return { data, error };
}

export async function upsertSliderItem(item) {
  const { data, error } = await supabase
    .from('slider_items').upsert(item).select().single();
  return { data, error };
}

export async function deleteSliderItem(id) {
  const { error } = await supabase.from('slider_items').delete().eq('id', id);
  return { error };
}

// --- AUDIO ITEMS ---
export async function getAudioItems(userId, category = null) {
  let query = supabase.from('audio_items').select('*')
    .eq('user_id', userId).eq('is_active', true)
    .order('display_order', { ascending: true });
  if (category) query = query.eq('category', category);
  const { data, error } = await query;
  return { data, error };
}

export async function upsertAudioItem(item) {
  const { data, error } = await supabase
    .from('audio_items').upsert(item).select().single();
  return { data, error };
}

export async function deleteAudioItem(id) {
  const { error } = await supabase.from('audio_items').delete().eq('id', id);
  return { error };
}

// --- PLAYLISTS ---
export async function getPlaylists(userId) {
  const { data, error } = await supabase
    .from('audio_playlists').select('*, playlist_items(*, audio_items(*))')
    .eq('user_id', userId).order('created_at', { ascending: false });
  return { data, error };
}

export async function upsertPlaylist(playlist) {
  const { data, error } = await supabase
    .from('audio_playlists').upsert(playlist).select().single();
  return { data, error };
}

export async function deletePlaylist(id) {
  const { error } = await supabase.from('audio_playlists').delete().eq('id', id);
  return { error };
}

// --- TICKER MESSAGES ---
export async function getTickerMessages(userId) {
  const { data, error } = await supabase
    .from('ticker_messages').select('*').eq('user_id', userId)
    .eq('is_active', true).order('display_order', { ascending: true });
  return { data, error };
}

export async function upsertTickerMessage(msg) {
  const { data, error } = await supabase
    .from('ticker_messages').upsert(msg).select().single();
  return { data, error };
}

export async function deleteTickerMessage(id) {
  const { error } = await supabase.from('ticker_messages').delete().eq('id', id);
  return { error };
}

// --- HADITH ---
export async function getHadithItems(userId) {
  const { data, error } = await supabase
    .from('hadith_items').select('*').eq('user_id', userId)
    .eq('is_active', true).order('created_at', { ascending: true });
  return { data, error };
}

export async function upsertHadithItem(hadith) {
  const { data, error } = await supabase
    .from('hadith_items').upsert(hadith).select().single();
  return { data, error };
}

export async function deleteHadithItem(id) {
  const { error } = await supabase.from('hadith_items').delete().eq('id', id);
  return { error };
}

// --- FEATURE SETTINGS ---
export async function getFeatureSettings(userId) {
  const { data, error } = await supabase
    .from('feature_settings').select('*').eq('user_id', userId).single();
  return { data, error };
}

export async function updateFeatureSettings(userId, updates) {
  const { data, error } = await supabase
    .from('feature_settings')
    .upsert({ user_id: userId, ...updates, updated_at: new Date().toISOString() })
    .select().single();
  return { data, error };
}

// --- BLAST NOTIFICATIONS ---
export async function getActiveBlastNotifications() {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('blast_notifications').select('*')
    .eq('is_active', true)
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function upsertBlastNotification(blast) {
  const { data, error } = await supabase
    .from('blast_notifications').upsert(blast).select().single();
  return { data, error };
}

// --- GDRIVE IMPORTS ---
export async function logGdriveImport(importData) {
  const { data, error } = await supabase
    .from('gdrive_imports').insert(importData).select().single();
  return { data, error };
}

export async function updateGdriveImportStatus(id, status, destinationUrl = null, errorMessage = null) {
  const { data, error } = await supabase
    .from('gdrive_imports')
    .update({ status, destination_url: destinationUrl, error_message: errorMessage })
    .eq('id', id).select().single();
  return { data, error };
}
