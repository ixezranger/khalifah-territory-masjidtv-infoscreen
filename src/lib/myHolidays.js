// Malaysian Public Holidays 2025 & 2026
// Source: Malaysia Government Official Gazette

export const MY_PUBLIC_HOLIDAYS = {
  2025: [
    { date: '2025-01-01', name: 'Tahun Baru', type: 'national' },
    { date: '2025-01-29', name: 'Tahun Baru Cina', type: 'national' },
    { date: '2025-01-30', name: 'Tahun Baru Cina (Hari Kedua)', type: 'national' },
    { date: '2025-02-01', name: 'Hari Wilayah Persekutuan', type: 'wp' },
    { date: '2025-03-30', name: 'Hari Nuzul Al-Quran', type: 'national' },
    { date: '2025-03-31', name: 'Awal Ramadan', type: 'national' },
    { date: '2025-04-18', name: 'Good Friday', type: 'sabah_sarawak' },
    { date: '2025-05-01', name: 'Hari Pekerja', type: 'national' },
    { date: '2025-05-12', name: 'Hari Wesak', type: 'national' },
    { date: '2025-05-31', name: 'Hari Hari Raya Aidilfitri', type: 'national' },
    { date: '2025-06-01', name: 'Hari Raya Aidilfitri (Hari Kedua)', type: 'national' },
    { date: '2025-06-02', name: 'Hari Raya Aidilfitri', type: 'national' },
    { date: '2025-06-07', name: 'Hari Keputeraan Yang DiPertuan Agong', type: 'national' },
    { date: '2025-07-07', name: 'Hari Arafah', type: 'national' },
    { date: '2025-07-08', name: 'Hari Raya Aidiladha', type: 'national' },
    { date: '2025-07-29', name: 'Awal Muharram', type: 'national' },
    { date: '2025-08-31', name: 'Hari Kebangsaan', type: 'national' },
    { date: '2025-09-16', name: 'Hari Malaysia', type: 'national' },
    { date: '2025-10-07', name: 'Maulidur Rasul', type: 'national' },
    { date: '2025-10-20', name: 'Deepavali', type: 'national' },
    { date: '2025-12-25', name: 'Hari Krismas', type: 'national' },
  ],
  2026: [
    { date: '2026-01-01', name: 'Tahun Baru', type: 'national' },
    { date: '2026-01-29', name: 'Thaipusam', type: 'national' },
    { date: '2026-02-01', name: 'Hari Wilayah Persekutuan', type: 'wp' },
    { date: '2026-02-17', name: 'Tahun Baru Cina', type: 'national' },
    { date: '2026-02-18', name: 'Tahun Baru Cina (Hari Kedua)', type: 'national' },
    { date: '2026-02-19', name: 'Awal Ramadan', type: 'national' },
    { date: '2026-03-19', name: 'Nuzul Al-Quran', type: 'national' },
    { date: '2026-04-03', name: 'Good Friday', type: 'sabah_sarawak' },
    { date: '2026-04-04', name: 'Hari Raya Aidilfitri', type: 'national' },
    { date: '2026-04-05', name: 'Hari Raya Aidilfitri (Hari Kedua)', type: 'national' },
    { date: '2026-04-06', name: 'Hari Raya Aidilfitri', type: 'national' },
    { date: '2026-05-01', name: 'Hari Pekerja', type: 'national' },
    { date: '2026-05-22', name: 'Hari Keputeraan Yang DiPertuan Agong', type: 'national' },
    { date: '2026-05-31', name: 'Hari Wesak', type: 'national' },
    { date: '2026-06-27', name: 'Hari Raya Aidiladha', type: 'national' },
    { date: '2026-07-17', name: 'Awal Muharram', type: 'national' },
    { date: '2026-08-31', name: 'Hari Kebangsaan', type: 'national' },
    { date: '2026-09-16', name: 'Hari Malaysia', type: 'national' },
    { date: '2026-09-26', name: 'Maulidur Rasul', type: 'national' },
    { date: '2026-11-08', name: 'Deepavali', type: 'national' },
    { date: '2026-12-25', name: 'Hari Krismas', type: 'national' },
  ],
};

export function getHolidaysForMonth(year, month) {
  // month is 0-based
  const holidays = MY_PUBLIC_HOLIDAYS[year] || [];
  return holidays
    .filter(h => {
      const d = new Date(h.date);
      return d.getFullYear() === year && d.getMonth() === month;
    })
    .map(h => ({ ...h, day: new Date(h.date).getDate() }));
}

export function isHoliday(year, month, day) {
  const holidays = MY_PUBLIC_HOLIDAYS[year] || [];
  const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  return holidays.find(h => h.date === dateStr) || null;
}

// Hijri month names (Malay)
const HIJRI_MONTHS_MS = [
  'Muharram', 'Safar', 'Rabiulawal', 'Rabiulakhir',
  'Jamadilawal', 'Jamadilakhir', 'Rejab', 'Syaaban',
  'Ramadan', 'Syawal', 'Zulkaedah', 'Zulhijjah',
];

export function toHijri(gDate) {
  const Y = gDate.getFullYear();
  const M = gDate.getMonth() + 1;
  const D = gDate.getDate();
  const a = Math.floor((14 - M) / 12);
  const y = Y + 4800 - a;
  const m = M + 12 * a - 3;
  const JDN = D + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
  const l = JDN - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const l2 = l - 10631 * n + 354;
  const j = Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
    Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
  const l3 = l2 - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hMonth = Math.floor((24 * l3) / 709);
  const hDay = l3 - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;
  return { day: hDay, month: hMonth, year: hYear, monthName: HIJRI_MONTHS_MS[hMonth - 1] };
}
