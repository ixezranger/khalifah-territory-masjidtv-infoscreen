import { useState, useEffect } from 'react';

function parseHHMM(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return { h, m };
}

function secondsUntil(hhmm) {
  const now = new Date();
  const { h, m } = parseHHMM(hhmm);

  const target = new Date(now);
  target.setHours(h, m, 0, 0);

  let diff = Math.floor((target - now) / 1000);
  if (diff < 0) diff += 24 * 3600; // overnight: add 24 hours
  return diff;
}

export default function useCountdown(nextSolatTime, nextSolatName) {
  const [totalSeconds, setTotalSeconds] = useState(0);
  const [isPassed, setIsPassed] = useState(false);

  useEffect(() => {
    if (!nextSolatTime) return;

    setTotalSeconds(secondsUntil(nextSolatTime));
    setIsPassed(false);

    const interval = setInterval(() => {
      setTotalSeconds((prev) => {
        if (prev <= 1) {
          setIsPassed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [nextSolatTime]);

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const isImminent = totalSeconds > 0 && totalSeconds <= 15 * 60;

  return {
    hours,
    minutes,
    seconds,
    nextSolatName,
    isImminent,
    isPassed,
    totalSeconds,
  };
}
