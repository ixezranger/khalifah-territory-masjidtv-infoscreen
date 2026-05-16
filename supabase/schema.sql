CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  role TEXT DEFAULT 'user',
  masjid_name TEXT,
  masjid_description TEXT,
  zone_code TEXT DEFAULT 'WLY01',
  background_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  google_drive_connected BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE slider_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  youtube_id TEXT,
  thumbnail_url TEXT,
  duration_seconds INT DEFAULT 8,
  storage_provider TEXT DEFAULT 'r2',
  file_size_bytes BIGINT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audio_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  artist_reciter TEXT,
  category TEXT DEFAULT 'zikir',
  audio_url TEXT NOT NULL,
  thumbnail_url TEXT,
  duration_seconds INT,
  file_size_bytes BIGINT,
  storage_provider TEXT DEFAULT 'r2',
  source_gdrive_id TEXT,
  display_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE audio_playlists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT 'zikir',
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE playlist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  playlist_id UUID REFERENCES audio_playlists(id) ON DELETE CASCADE,
  audio_id UUID REFERENCES audio_items(id) ON DELETE CASCADE,
  display_order INT DEFAULT 0
);

CREATE TABLE ticker_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  display_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hadith_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  arabic_text TEXT,
  malay_translation TEXT NOT NULL,
  source TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE feature_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  show_countdown BOOLEAN DEFAULT true,
  show_ticker BOOLEAN DEFAULT true,
  show_hadith BOOLEAN DEFAULT true,
  show_datetime BOOLEAN DEFAULT true,
  show_slider BOOLEAN DEFAULT true,
  show_audio_player BOOLEAN DEFAULT true,
  slider_limit INT DEFAULT 10,
  ticker_speed INT DEFAULT 50,
  hadith_rotation_minutes INT DEFAULT 5,
  audio_autoplay BOOLEAN DEFAULT true,
  audio_volume INT DEFAULT 60,
  audio_default_category TEXT DEFAULT 'zikir',
  active_playlist_id UUID REFERENCES audio_playlists(id),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE blast_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID REFERENCES profiles(id),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  target TEXT DEFAULT 'all',
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE gdrive_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  gdrive_file_id TEXT NOT NULL,
  gdrive_file_name TEXT,
  import_type TEXT,
  status TEXT DEFAULT 'pending',
  destination_url TEXT,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE slider_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE playlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticker_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE hadith_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE blast_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE gdrive_imports ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Slider items policies
CREATE POLICY "Users manage own slider items" ON slider_items FOR ALL USING (auth.uid() = user_id);

-- Audio items policies
CREATE POLICY "Users manage own audio items" ON audio_items FOR ALL USING (auth.uid() = user_id);

-- Audio playlists policies
CREATE POLICY "Users manage own playlists" ON audio_playlists FOR ALL USING (auth.uid() = user_id);

-- Playlist items policies
CREATE POLICY "Users manage own playlist items" ON playlist_items FOR ALL
  USING (EXISTS (SELECT 1 FROM audio_playlists WHERE id = playlist_id AND user_id = auth.uid()));

-- Ticker messages policies
CREATE POLICY "Users manage own ticker messages" ON ticker_messages FOR ALL USING (auth.uid() = user_id);

-- Hadith items policies
CREATE POLICY "Users manage own hadith" ON hadith_items FOR ALL USING (auth.uid() = user_id);

-- Feature settings policies
CREATE POLICY "Users manage own feature settings" ON feature_settings FOR ALL USING (auth.uid() = user_id);

-- Blast notifications policies
CREATE POLICY "Authenticated users can read active blasts" ON blast_notifications
  FOR SELECT USING (auth.role() = 'authenticated' AND is_active = true);
CREATE POLICY "Admin can manage blasts" ON blast_notifications
  FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- GDrive imports policies
CREATE POLICY "Users manage own gdrive imports" ON gdrive_imports FOR ALL USING (auth.uid() = user_id);
