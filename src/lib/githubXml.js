/**
 * githubXml.js — Read & write config.xml via GitHub Contents API
 *
 * PAT is stored in localStorage under 'mtvGhPat'.
 * Repo/branch are auto-detected from the live URL or env vars.
 */

const REPO_OWNER = 'ixezranger';
const REPO_NAME  = 'khalifah-territory-masjidtv-infoscreen';
const BRANCH     = 'main';
const FILE_PATH  = 'public/config.xml';
const API_BASE   = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

/* ── PAT storage ─────────────────────────────────────────────── */
export const getPat  = ()       => localStorage.getItem('mtvGhPat') || '';
export const setPat  = (token)  => localStorage.setItem('mtvGhPat', token.trim());
export const clearPat= ()       => localStorage.removeItem('mtvGhPat');
export const hasPat  = ()       => !!getPat();

/* ── Safe UTF-8 base64 helpers ──────────────────────────────── */
function b64DecodeUtf8(b64) {
  const clean = b64.replace(/\s/g, '');
  const binary = atob(clean);
  const bytes = Uint8Array.from(binary, c => c.charCodeAt(0));
  return new TextDecoder('utf-8').decode(bytes);
}

function b64EncodeUtf8(str) {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  bytes.forEach(b => { binary += String.fromCharCode(b); });
  return btoa(binary);
}

/* ── Fetch current file (returns { content, sha }) ──────────── */
export async function fetchXmlFile() {
  const pat = getPat();
  const headers = { Accept: 'application/vnd.github+json' };
  if (pat) headers.Authorization = `Bearer ${pat}`;

  const res = await fetch(`${API_BASE}?ref=${BRANCH}&_=${Date.now()}`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status}: ${await res.text()}`);

  const json = await res.json();
  const content = b64DecodeUtf8(json.content);
  return { content, sha: json.sha };
}

/* ── Commit updated XML ──────────────────────────────────────── */
export async function commitXml(newXmlContent, sha, message = 'chore: update config.xml via MasjidTV CMS') {
  const pat = getPat();
  if (!pat) throw new Error('PAT tidak ditetapkan. Sila tetapkan token GitHub di tetapan.');

  const encoded = b64EncodeUtf8(newXmlContent);
  const res = await fetch(API_BASE, {
    method: 'PUT',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${pat}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      message,
      content: encoded,
      sha,
      branch: BRANCH,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `GitHub API ${res.status}`);
  }
  return res.json();
}

/* ── Escape unsafe XML characters in raw strings ────────────── */
export function escapeXml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&(?![a-zA-Z#][a-zA-Z0-9#]*;)/g, '&amp;')  // & not already an entity
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── Pre-sanitise raw XML string before parsing ─────────────── */
function sanitiseRawXml(xmlStr) {
  // Fix bare & inside element text/attribute values (not already escaped)
  // This regex finds & that are NOT followed by valid entity patterns
  return xmlStr.replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[\da-fA-F]+);)/g, '&amp;');
}

/* ── Parse XML string → DOM ─────────────────────────────────── */
export function parseXml(xmlStr) {
  // Strip BOM if present
  const clean = sanitiseRawXml(xmlStr.replace(/^\uFEFF/, ''));
  const parser = new DOMParser();
  const doc = parser.parseFromString(clean, 'application/xml');
  const err = doc.querySelector('parsererror');
  if (err) {
    const detail = err.textContent?.split('\n')[0] || 'XML parse error';
    throw new Error(`XML parse error: ${detail}`);
  }
  return doc;
}

/* ── Serialise DOM → string ─────────────────────────────────── */
export function serialiseXml(doc) {
  return new XMLSerializer().serializeToString(doc);
}

/* ── Helper: get or create element ──────────────────────────── */
function getOrCreate(doc, parent, tagName) {
  let el = parent.querySelector(tagName);
  if (!el) {
    el = doc.createElement(tagName);
    parent.appendChild(el);
  }
  return el;
}

/* ── Patch helpers (called by each admin module) ────────────── */

export function patchProfile(doc, { masjid_name, masjid_description, zone_code }) {
  const p = getOrCreate(doc, doc.documentElement, 'profile');
  if (masjid_name       !== undefined) getOrCreate(doc, p, 'masjid_name').textContent       = masjid_name;
  if (masjid_description !== undefined) getOrCreate(doc, p, 'masjid_description').textContent = masjid_description;
  if (zone_code         !== undefined) getOrCreate(doc, p, 'zone_code').textContent         = zone_code;
}

export function patchAppearance(doc, { background_image_url, bg_overlay_opacity, icon_url }) {
  const a = getOrCreate(doc, doc.documentElement, 'appearance');
  if (background_image_url !== undefined) getOrCreate(doc, a, 'background_image_url').textContent = background_image_url ?? '';
  if (bg_overlay_opacity   !== undefined) getOrCreate(doc, a, 'bg_overlay_opacity').textContent   = bg_overlay_opacity;
  if (icon_url             !== undefined) getOrCreate(doc, a, 'icon_url').textContent             = icon_url ?? '';
}

export function patchTicker(doc, messages) {
  const t = getOrCreate(doc, doc.documentElement, 'ticker');
  // Remove existing <message> nodes
  [...t.querySelectorAll('message')].forEach(n => n.remove());
  messages.forEach(msg => {
    const el = doc.createElement('message');
    el.textContent = msg;
    t.appendChild(el);
  });
}

export function patchHadith(doc, items) {
  const h = getOrCreate(doc, doc.documentElement, 'hadith');
  [...h.querySelectorAll('item')].forEach(n => n.remove());
  items.forEach(({ arabic, translation, source }) => {
    const item = doc.createElement('item');
    const a = doc.createElement('arabic');      a.textContent = arabic      || '';
    const tr = doc.createElement('translation'); tr.textContent = translation || '';
    const s = doc.createElement('source');       s.textContent = source      || '';
    item.appendChild(a); item.appendChild(tr); item.appendChild(s);
    h.appendChild(item);
  });
}

export function patchSlider(doc, items) {
  const sl = getOrCreate(doc, doc.documentElement, 'slider');
  [...sl.querySelectorAll('item')].forEach(n => n.remove());
  items.forEach(({ type = 'image', duration = 8, title, url, body }) => {
    const item = doc.createElement('item');
    item.setAttribute('type', type);
    item.setAttribute('duration', String(duration));
    const t = doc.createElement('title'); t.textContent = title || '';
    const u = doc.createElement('url');   u.textContent = url   || '';
    item.appendChild(t); item.appendChild(u);
    if (body) {
      const b = doc.createElement('body'); b.textContent = body;
      item.appendChild(b);
    }
    sl.appendChild(item);
  });
}

export function patchFeatures(doc, features) {
  const f = getOrCreate(doc, doc.documentElement, 'features');
  const fields = [
    'show_countdown','show_ticker','show_hadith','show_datetime',
    'show_slider','show_audio_player','ticker_speed','hadith_rotation_minutes',
    'slider_limit','audio_volume','audio_autoplay',
  ];
  fields.forEach(key => {
    if (features[key] !== undefined) {
      getOrCreate(doc, f, key).textContent = features[key];
    }
  });
}

/* ── Master save helper used by all modules ─────────────────── */
export async function saveToXml(patchFn, commitMsg) {
  const { content, sha } = await fetchXmlFile();
  const doc = parseXml(content);
  patchFn(doc);

  // Serialise — strip any xmlns="" artefacts added by XMLSerializer
  let raw = new XMLSerializer().serializeToString(doc);
  raw = raw.replace(/ xmlns=""/g, '');

  // Ensure UTF-8 XML declaration
  const final = raw.startsWith('<?xml')
    ? raw
    : `<?xml version="1.0" encoding="UTF-8"?>\n${raw}`;

  await commitXml(final, sha, commitMsg);
}
