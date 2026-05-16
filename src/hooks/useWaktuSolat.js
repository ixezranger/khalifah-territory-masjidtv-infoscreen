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
    KTN03: 'Gua Musang',
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

export const ZONE_LABELS = Object.values(ZONES).reduce((acc, group) => {
  return { ...acc, ...group };
}, {});

const PRAYER_KEYS = ['imsak', 'subuh', 'syuruk', 'zohor', 'asar', 'maghrib', 'isyak'];
const PRAYER_NAMES = {
  imsak: 'Imsak',
  subuh: 'Subuh',
  syuruk: 'Syuruk',
  zohor: 'Zohor',
  asar: 'Asar',
  maghrib: 'Maghrib',
  isyak: 'Isyak',
};
const SKIP_FOR_NEXT = ['syuruk'];

const FALLBACK_TIMES = {
  imsak: '05:40',
  subuh: '05:50',
  syuruk: '07:05',
  zohor: '13:15',
  asar: '16:30',
  maghrib: '19:25',
  isyak: '20:35',
};

const BASE_URL = 'https://www.e-solat.gov.my/index.php?r=esolatApi/takwimsolat&period=today&zone=';

const PROXY_OPTIONS = [
  (zone) => `https://api.allorigins.win/get?url=${encodeURIComponent(BASE_URL + zone)}`,
  (zone) => `https://corsproxy.io/?${encodeURIComponent(BASE_URL + zone)}`,
  (zone) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(BASE_URL + zone)}`,
];

async function fetchSolatWithFallback(zone) {
  for (let i = 0; i < PROXY_OPTIONS.length; i++) {
    try {
      const url = PROXY_OPTIONS[i](zone);
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) continue;

      const raw = await response.json();

      // allorigins wraps response in { contents: "..." }
      let data;
      if (raw.contents) {
        data = JSON.parse(raw.contents);
      } else {
        data = raw;
      }

      if (data?.prayerTime?.[0]) {
        return { prayerTime: data.prayerTime[0], usingFallback: false };
      }
    } catch (err) {
      console.warn(`Waktu solat proxy ${i + 1} failed:`, err.message);
    }
  }

  console.warn('All waktu solat proxies failed, using demo times');
  return { prayerTime: FALLBACK_TIMES, usingFallback: true };
}

function getCacheKey(zone) {
  const today = new Date().toISOString().slice(0, 10);
  return `solat_${zone}_${today}`;
}

function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function getCurrentHHMM() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function findNextSolat(times) {
  const nowMinutes = timeToMinutes(getCurrentHHMM());
  for (const key of PRAYER_KEYS) {
    if (SKIP_FOR_NEXT.includes(key)) continue;
    if (!times[key]) continue;
    if (timeToMinutes(times[key]) > nowMinutes) {
      return { nextSolat: times[key], nextSolatName: PRAYER_NAMES[key] };
    }
  }
  return { nextSolat: times.imsak, nextSolatName: PRAYER_NAMES.imsak };
}

export default function useWaktuSolat(initialZone = 'WLY01') {
  const [zone, setZone] = useState(initialZone);
  const [times, setTimes] = useState(null);
  const [nextSolat, setNextSolat] = useState(null);
  const [nextSolatName, setNextSolatName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingFallback, setUsingFallback] = useState(false);

  const updateNextSolat = useCallback((prayerTimes) => {
    const { nextSolat: ns, nextSolatName: nsn } = findNextSolat(prayerTimes);
    setNextSolat(ns);
    setNextSolatName(nsn);
  }, []);

  const fetchTimes = useCallback(async (zoneCode, forceRefresh = false) => {
    const cacheKey = getCacheKey(zoneCode);

    // Serve from cache immediately
    if (!forceRefresh) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          setTimes(parsed);
          updateNextSolat(parsed);
          setLoading(false);
        }
      } catch {
        // ignore cache errors
      }
    }

    try {
      const { prayerTime, usingFallback: isFallback } = await fetchSolatWithFallback(zoneCode);

      const parsed = {};
      PRAYER_KEYS.forEach((k) => {
        if (prayerTime[k]) parsed[k] = String(prayerTime[k]).slice(0, 5);
      });

      if (!isFallback) {
        localStorage.setItem(cacheKey, JSON.stringify(parsed));
      }

      setTimes(parsed);
      updateNextSolat(parsed);
      setUsingFallback(isFallback);
      setError(isFallback ? 'Menggunakan waktu anggaran' : null);
    } catch (err) {
      setError(err.message);
      setUsingFallback(true);
      // Last-resort: load stale cache
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          setTimes(parsed);
          updateNextSolat(parsed);
        } else {
          setTimes(FALLBACK_TIMES);
          updateNextSolat(FALLBACK_TIMES);
        }
      } catch {
        setTimes(FALLBACK_TIMES);
        updateNextSolat(FALLBACK_TIMES);
      }
    } finally {
      setLoading(false);
    }
  }, [updateNextSolat]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setLoading(true);
    fetchTimes(zone);
  }, [zone, fetchTimes]);

  // Midnight refresh and per-minute nextSolat update
  useEffect(() => {
    let lastDate = new Date().toISOString().slice(0, 10);
    const interval = setInterval(() => {
      const today = new Date().toISOString().slice(0, 10);
      if (today !== lastDate) {
        lastDate = today;
        fetchTimes(zone, true);
      }
      if (times) updateNextSolat(times);
    }, 60_000);

    return () => clearInterval(interval);
  }, [zone, times, fetchTimes, updateNextSolat]);

  return {
    times,
    nextSolat,
    nextSolatName,
    loading,
    error,
    usingFallback,
    zone,
    setZone,
    ZONES,
    ZONE_LABELS,
  };
}
