import { useState, useEffect } from 'react';

function parseTime(hhmm) {
  if (!hhmm) return new Date();
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export default function useCountdown(nextSolatTime, nextSolatName, prevSolatTime) {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [progressPct, setProgressPct] = useState(0);

  useEffect(() => {
    if (!nextSolatTime) return;

    function tick() {
      const now = new Date();
      let nextTime = parseTime(nextSolatTime);

      // Overnight wrap: if next prayer already passed today, it's tomorrow
      if (nextTime <= now) nextTime.setDate(nextTime.getDate() + 1);

      const remain = Math.max(0, Math.floor((nextTime - now) / 1000));
      setTotalSeconds(remain);

      // Progress bar: elapsed fraction of [prevSolat → nextSolat]
      if (prevSolatTime) {
        let prevTime = parseTime(prevSolatTime);
        // If prev is after next (crossed midnight), push prev back a day
        if (prevTime >= nextTime) prevTime.setDate(prevTime.getDate() - 1);
        const total = Math.max(1, nextTime - prevTime);
        const elapsed = Math.max(0, now - prevTime);
        setProgressPct(Math.min(100, Math.max(0, (elapsed / total) * 100)));
      } else {
        setProgressPct(0);
      }
    }

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [nextSolatTime, prevSolatTime]);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const isImminent = totalSeconds > 0 && totalSeconds <= 15 * 60;

  return { hours, minutes, seconds, isImminent, progressPct, totalSeconds };
}
