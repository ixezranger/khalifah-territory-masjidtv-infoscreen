import { useState, useEffect, useCallback } from 'react';

export const ZONES = {
  'Wilayah Persekutuan': {
    WLY01: 'Kuala Lumpur & Putrajaya',
    WLY02: 'Labuan',
  },
  'Selangor': {
    SGR01: 'Gombak, Hulu Langat, Sepang, Petaling, Klang, Kuala Selangor',
    SGR02: 'Sabak Bernam',
    SGR03: 'Hulu Selangor',
  },
  'Johor': {
    JHR01: 'Pulau Aur & Pulau Pemanggil',
    JHR02: 'Johor Bahru, Kota Tinggi, Mersing',
    JHR03: 'Kluang, Pontian',
    JHR04: 'Batu Pahat, Muar, Segamat, Gemas Johor',
  },
  'Kedah': {
    KDH01: 'Kota Setar, Kubang Pasu, Pokok Sena',
    KDH02: 'Kuala Muda, Yan, Pendang',
    KDH03: 'Padang Terap, Sik',
    KDH04: 'Baling',
    KDH05: 'Bandar Baharu, Kulim',
    KDH06: 'Langkawi',
    KDH07: 'Puncak Gunung Jerai',
  },
  'Kelantan': {
    KTN01: 'Bachok, Kota Bharu, Machang, Pasir Mas, Pasir Puteh, Tanah Merah, Tumpat, Kuala Krai, Mukim Chiku',
    KTN02: 'Gua Musang (Daerah Galas Dan Bertam), Jeli, Jajahan Kecil Lojing',
  },
  'Melaka': {
    MLK01: 'Seluruh Negeri Melaka',
  },
  'Negeri Sembilan': {
    NGS01: 'Jelebu, Kuala Pilah, Jempol',
    NGS02: 'Port Dickson, Seremban, Tampin, Rembau',
  },
  'Pahang': {
    PHG01: 'Pulau Tioman',
    PHG02: 'Rompin, Pekan, Muadzam Shah',
    PHG03: 'Kuantan, Maran',
    PHG04: 'Temerloh, Bentong, Bera, Jerantut',
    PHG05: 'Raub',
    PHG06: 'Cameron Highlands, Lipis, Gombak Pahang',
  },
  'Perak': {
    PRK01: 'Tapah, Slim River, Tanjung Malim',
    PRK02: 'Kuala Kangsar, Sg Siput, Ipoh, Batu Gajah, Kampar',
    PRK03: 'Lenggong, Pengkalan Hulu, Grik',
    PRK04: 'Temengor, Belum',
    PRK05: 'Teluk Intan, Bagan Datuk, Kg Gajah, Sri Iskandar, Beruas, Seri Manjung, Lumut, Sitiawan',
    PRK06: 'Selama, Taiping, Bagan Serai, Parit Buntar',
    PRK07: 'Pulau Pangkor',
  },
  'Perlis': {
    PLS01: 'Seluruh Negeri Perlis',
  },
  'Pulau Pinang': {
    PNG01: 'Seluruh Negeri Pulau Pinang',
  },
  'Sabah': {
    SBH01: 'Kota Kinabalu, Ranau, Kota Belud, Tuaran, Penampang, Papar, Putatan',
    SBH02: 'Kudat, Kota Marudu, Pitas',
    SBH03: 'Lahad Datu, Kinabatangan, Semporna, Tawau',
    SBH04: 'Sandakan, Tawau Pedalaman',
    SBH05: 'Keningau, Tambunan, Nabawan',
  },
  'Sarawak': {
    SWK01: 'Limbang, Lawas, Sundar, Trusan',
    SWK02: 'Miri, Niah, Bekenu, Sibuti, Marudi',
    SWK03: 'Pandan, Belaga, Suai',
    SWK04: 'Sibu, Mukah, Dalat, Song, Igan, Oya, Balingian, Kanowit, Kapit',
    SWK05: 'Sarikei, Matu, Julau, Rajang, Daro, Bintangor, Belawai',
    SWK06: 'Lubok Antu, Sri Aman, Roban, Debak, Kabong, Lingga, Engkilili, Betong, Spaoh, Pusa, Saratok',
    SWK07: 'Serian, Simunjan, Samarahan, Sebuyau, Meludam',
    SWK08: 'Kuching, Bau, Lundu, Sematan',
    SWK09: 'Zon Khas (Kampung Patarikan)',
    SWK10: 'Selangau',
  },
  'Terengganu': {
    TRG01: 'Kemaman',
    TRG02: 'Dungun, Besut',
    TRG03: 'Kuala Terengganu, Marang, Hulu Terengganu',
    TRG04: 'Setiu',
  },
};

export const ZONE_LABELS = Object.values(ZONES).reduce((acc, group) => ({ ...acc, ...group }), {});

// Malay names used for nextSolatName — must match PRAYER_KEYS in InfoTVScreen
const PRAYER_NAMES = {
  imsak:   'Imsak',
  subuh:   'Subuh',
  syuruk:  'Syuruk',
  zohor:   'Zohor',
  asar:    'Asar',
  maghrib: 'Maghrib',
  isyak:   'Isyak',
};

// Order used for "next prayer" detection (syuruk excluded — it's not a solat)
const NEXT_ORDER = ['subuh', 'syuruk', 'zohor', 'asar', 'maghrib', 'isyak'];

// Zones covered by bundled JAKIM XML timetables (public/solat/*.xml)
const LOCAL_XML_ZONES = new Set(['WLY01','WLY02','SGR01','SGR02','SGR03','KTN01','KTN02']);

const BASE_PATH = import.meta.env.BASE_URL || '/';

/**
 * Load today's prayer times from the local JAKIM XML timetable.
 * Returns times object or null if zone not bundled / date not found.
 */
async function fetchFromLocalXml(zone) {
  if (!LOCAL_XML_ZONES.has(zone)) return null;
  try {
    const url = `${BASE_PATH}solat/${zone}.xml`.replace('//', '/');
    const res = await fetch(url, { cache: 'force-cache' });
    if (!res.ok) return null;
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'application/xml');
    if (doc.querySelector('parsererror')) return null;

    // Find today's entry
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
    const day = doc.querySelector(`day[date="${dateStr}"]`);
    if (!day) return null;

    return {
      imsak:   day.getAttribute('imsak')   || '',
      subuh:   day.getAttribute('subuh')   || '',
      syuruk:  day.getAttribute('syuruk')  || '',
      zohor:   day.getAttribute('zohor')   || '',
      asar:    day.getAttribute('asar')    || '',
      maghrib: day.getAttribute('maghrib') || '',
      isyak:   day.getAttribute('isyak')   || '',
    };
  } catch { return null; }
}

const FALLBACK_TIMES = {
  imsak:   '05:40',
  subuh:   '05:50',
  syuruk:  '07:01',
  zohor:   '13:12',
  asar:    '16:35',
  maghrib: '19:20',
  isyak:   '20:34',
};

const BASE_URL = 'https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=';

const PROXIES = [
  (zone) => `https://api.allorigins.win/get?url=${encodeURIComponent(BASE_URL + zone)}`,
  (zone) => `https://corsproxy.io/?${encodeURIComponent(BASE_URL + zone)}`,
  (zone) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(BASE_URL + zone)}`,
];

// Mirror exact key-fallback logic from the original working HTML template
function parsePrayerTimes(raw) {
  let data = raw;
  if (raw?.contents) {
    try { data = JSON.parse(raw.contents); } catch { return null; }
  }
  const p = data?.prayerTime?.[0];
  if (!p) return null;

  const result = {
    imsak:   p.imsak                  || '',
    subuh:   p.fajr    || p.subuh     || '',
    syuruk:  p.syuruk                 || '',
    zohor:   p.dhuhr   || p.zohor     || '',
    asar:    p.asr     || p.asar      || '',
    maghrib: p.maghrib                || '',
    isyak:   p.isha    || p.isyak     || '',
  };

  // Normalise to HH:MM (drop seconds if present)
  Object.keys(result).forEach(k => {
    if (result[k]) result[k] = String(result[k]).slice(0, 5);
  });

  console.log('[MasjidTV] Raw API response:', p);
  console.log('[MasjidTV] Parsed prayer times:', result);
  return result;
}

function parseTime(hhmm) {
  if (!hhmm) return new Date();
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function findNextAndPrev(times) {
  const now = new Date();

  let nextKey = null;
  let prevKey = null;

  for (let i = 0; i < NEXT_ORDER.length; i++) {
    const key = NEXT_ORDER[i];
    if (!times[key]) continue;
    if (parseTime(times[key]) > now) {
      nextKey = key;
      // previous = the prayer before this one, excluding syuruk
      for (let j = i - 1; j >= 0; j--) {
        const pk = NEXT_ORDER[j];
        if (pk !== 'syuruk' && times[pk]) { prevKey = pk; break; }
      }
      break;
    }
    if (key !== 'syuruk') prevKey = key;
  }

  // All prayers have passed → next is subuh (tomorrow)
  if (!nextKey) {
    nextKey = 'subuh';
    prevKey = 'isyak';
  }

  return {
    nextSolat:     times[nextKey] || null,
    nextSolatName: PRAYER_NAMES[nextKey] || '',
    prevSolat:     prevKey ? (times[prevKey] || null) : null,
    prevSolatName: prevKey ? (PRAYER_NAMES[prevKey] || '') : '',
  };
}

function getCacheKey(zone) {
  return `esolat_${zone}_${new Date().toDateString()}`;
}

async function fetchFromNetwork(zone) {
  // 1. Try local JAKIM XML timetable first (instant, no CORS)
  try {
    const local = await fetchFromLocalXml(zone);
    if (local) {
      console.log('[MasjidTV] Loaded from local XML:', zone);
      return { times: local, apiStatus: 'online' };
    }
  } catch (e) {
    console.warn('[MasjidTV] Local XML failed:', e.message);
  }

  // 2. Fall back to live API via CORS proxies
  for (let i = 0; i < PROXIES.length; i++) {
    try {
      const res = await fetch(PROXIES[i](zone), { signal: AbortSignal.timeout(8000) });
      if (!res.ok) continue;
      const raw = await res.json();
      const parsed = parsePrayerTimes(raw);
      if (parsed) return { times: parsed, apiStatus: 'online' };
    } catch (err) {
      console.warn(`[MasjidTV] Proxy ${i + 1} failed:`, err.message);
    }
  }
  return null;
}

export default function useWaktuSolat(initialZone = 'WLY01') {
  const [zone, setZone] = useState(initialZone);
  const [times, setTimes] = useState(null);
  const [nextSolat, setNextSolat] = useState(null);
  const [nextSolatName, setNextSolatName] = useState(null);
  const [prevSolat, setPrevSolat] = useState(null);
  const [prevSolatName, setPrevSolatName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [apiStatus, setApiStatus] = useState('fallback'); // 'online' | 'cached' | 'fallback'

  const applyTimes = useCallback((t) => {
    setTimes(t);
    const { nextSolat: ns, nextSolatName: nsn, prevSolat: ps, prevSolatName: psn } = findNextAndPrev(t);
    setNextSolat(ns);
    setNextSolatName(nsn);
    setPrevSolat(ps);
    setPrevSolatName(psn);
  }, []);

  const loadTimes = useCallback(async (zoneCode) => {
    setLoading(true);

    // 1. Serve cache immediately so UI isn't blank
    const cacheKey = getCacheKey(zoneCode);
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const t = JSON.parse(cached);
        applyTimes(t);
        setApiStatus('cached');
        setLoading(false);
      }
    } catch { /* ignore */ }

    // 2. Fetch fresh from network
    const result = await fetchFromNetwork(zoneCode);

    if (result) {
      localStorage.setItem(getCacheKey(zoneCode), JSON.stringify(result.times));
      applyTimes(result.times);
      setApiStatus('online');
      setError(null);
    } else {
      // Network failed — if no cache was set above, use hardcoded fallback
      if (!times) {
        applyTimes(FALLBACK_TIMES);
      }
      setApiStatus('fallback');
      setError('Waktu anggaran — semak sambungan internet');
      console.warn('[MasjidTV] All proxies failed, using fallback times');
    }

    setLoading(false);
  }, [applyTimes]); // eslint-disable-line react-hooks/exhaustive-deps

  // Initial load and zone changes
  useEffect(() => {
    loadTimes(zone);
  }, [zone]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-compute next/prev every minute; refresh at midnight
  useEffect(() => {
    let lastDate = new Date().toDateString();
    const interval = setInterval(() => {
      if (times) applyTimes(times);
      const today = new Date().toDateString();
      if (today !== lastDate) {
        lastDate = today;
        loadTimes(zone);
      }
    }, 60_000);
    return () => clearInterval(interval);
  }, [zone, times, applyTimes, loadTimes]);

  return {
    times,
    nextSolat,
    nextSolatName,
    prevSolat,
    prevSolatName,
    loading,
    error,
    apiStatus,
    usingFallback: apiStatus === 'fallback',
    zone,
    setZone,
    ZONES,
    ZONE_LABELS,
  };
}
