/**
 * useXmlConfig — loads /config.xml and parses it into the app store.
 *
 * Priority rule (highest → lowest):
 *   1. config.xml  (always wins if a value is non-empty)
 *   2. Supabase DB profile  (future use)
 *   3. Hard-coded defaults in useStore
 *
 * The hook is called once in App.jsx on mount.
 */

const BASE = import.meta.env.BASE_URL || '/';

function text(doc, tag) {
  const el = doc.querySelector(tag);
  return el ? el.textContent.trim() : '';
}

function all(doc, selector) {
  return Array.from(doc.querySelectorAll(selector));
}

export async function loadXmlConfig() {
  try {
    const url = BASE.replace(/\/$/, '') + '/config.xml?_=' + Date.now();
    const res = await fetch(url);
    if (!res.ok) return null;

    const raw = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(raw, 'application/xml');

    if (doc.querySelector('parsererror')) {
      console.error('[MasjidTV] config.xml parse error');
      return null;
    }

    /* ── Profile ─────────────────────────────────── */
    const profile = {
      masjid_name:        text(doc, 'profile masjid_name')        || null,
      masjid_description: text(doc, 'profile masjid_description') || null,
      zone_code:          text(doc, 'profile zone_code')          || null,
      background_image_url: text(doc, 'appearance background_image_url') || null,
      bg_overlay_opacity:   Number(text(doc, 'appearance bg_overlay_opacity')) || 40,
      icon_url:             text(doc, 'appearance icon_url') || null,
    };

    /* ── Slider ──────────────────────────────────── */
    const sliderItems = all(doc, 'slider item')
      .map((el, i) => {
        const url = el.querySelector('url')?.textContent.trim() || '';
        if (!url) return null;
        const type = el.getAttribute('type') || 'image';
        return {
          id:         'xml-slide-' + i,
          title:      el.querySelector('title')?.textContent.trim() || '',
          media_url:  url,
          media_type: type,
          duration:   Number(el.getAttribute('duration')) || 8,
          sort_order: i,
        };
      })
      .filter(Boolean);

    /* ── Ticker ──────────────────────────────────── */
    const tickerMessages = all(doc, 'ticker message')
      .map((el, i) => ({
        id:      'xml-ticker-' + i,
        message: el.textContent.trim(),
        is_active: true,
        sort_order: i,
      }))
      .filter(m => m.message);

    /* ── Hadith ──────────────────────────────────── */
    const hadithItems = all(doc, 'hadith item')
      .map((el, i) => ({
        id:          'xml-hadith-' + i,
        arabic:      el.querySelector('arabic')?.textContent.trim()      || '',
        translation: el.querySelector('translation')?.textContent.trim() || '',
        source:      el.querySelector('source')?.textContent.trim()      || '',
        sort_order:  i,
      }))
      .filter(h => h.translation);

    /* ── Feature settings ────────────────────────── */
    const bool = (tag) => text(doc, `features ${tag}`) !== 'false';
    const num  = (tag, def) => Number(text(doc, `features ${tag}`)) || def;

    const featureSettings = {
      show_countdown:          bool('show_countdown'),
      show_ticker:             bool('show_ticker'),
      show_hadith:             bool('show_hadith'),
      show_datetime:           bool('show_datetime'),
      show_slider:             bool('show_slider'),
      show_audio_player:       bool('show_audio_player'),
      ticker_speed:            num('ticker_speed', 50),
      hadith_rotation_minutes: num('hadith_rotation_minutes', 5),
      slider_limit:            num('slider_limit', 10),
      audio_autoplay:          bool('audio_autoplay'),
      audio_volume:            num('audio_volume', 60),
    };

    return { profile, sliderItems, tickerMessages, hadithItems, featureSettings };

  } catch (err) {
    console.warn('[MasjidTV] Could not load config.xml:', err);
    return null;
  }
}
