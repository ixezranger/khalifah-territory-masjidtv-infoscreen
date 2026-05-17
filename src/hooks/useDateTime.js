import { useState, useEffect } from 'react';

const MALAY_DAYS = ['Ahad', 'Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu'];
const MALAY_MONTHS = [
  'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
  'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember',
];
const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabiulawal', 'Rabiulakhir',
  'Jamadilawal', 'Jamadilakhir', 'Rejab', 'Syaaban',
  'Ramadan', 'Syawal', 'Zulkaedah', 'Zulhijjah',
];

function toHijri(gDate) {
  const Y = gDate.getFullYear();
  const M = gDate.getMonth() + 1; // 1-based
  const D = gDate.getDate();

  // Gregorian → Julian Day Number
  const a = Math.floor((14 - M) / 12);
  const y = Y + 4800 - a;
  const m = M + 12 * a - 3;
  const JDN = D +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  // JDN → Hijri (Tabular Islamic calendar)
  const l  = JDN - 1948440 + 10632;
  const n  = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j  = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
             Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * l3) / 709);
  const day   = l3 - Math.floor((709 * month) / 24);
  const year  = 30 * n + j - 30;

  return { day, month, year };
}

function buildSnapshot(now) {
  const dayName = MALAY_DAYS[now.getDay()];
  const day = now.getDate();
  const month = MALAY_MONTHS[now.getMonth()];
  const year = now.getFullYear();
  const gregorianDate = `${dayName}, ${day} ${month} ${year}`;

  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const time = `${hh}:${mm}:${ss}`;

  const hijri = toHijri(now);
  const hijriDate = `${hijri.day} ${HIJRI_MONTHS[hijri.month - 1]} ${hijri.year}H`;

  return {
    time,
    gregorianDate,
    hijriDate,
    dayName,
    hours: now.getHours(),
    minutes: now.getMinutes(),
    seconds: now.getSeconds(),
  };
}

export default function useDateTime() {
  const [snapshot, setSnapshot] = useState(() => buildSnapshot(new Date()));

  useEffect(() => {
    const interval = setInterval(() => {
      setSnapshot(buildSnapshot(new Date()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return snapshot;
}
