import { useState, useEffect, useRef, useCallback } from 'react';
import { Howl } from 'howler';

export default function useAudioPlayer(audioItems = [], initialVolume = 0.6, autoplay = false) {
  const [playlist, setPlaylist] = useState(audioItems);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(audioItems[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(initialVolume);

  const howlRef = useRef(null);
  const progressIntervalRef = useRef(null);
  const playlistRef = useRef(playlist);
  const currentIndexRef = useRef(currentIndex);

  playlistRef.current = playlist;
  currentIndexRef.current = currentIndex;

  const stopProgressInterval = useCallback(() => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const startProgressInterval = useCallback(() => {
    stopProgressInterval();
    progressIntervalRef.current = setInterval(() => {
      if (howlRef.current && howlRef.current.playing()) {
        const seek = howlRef.current.seek() || 0;
        const dur = howlRef.current.duration() || 0;
        setCurrentTime(seek);
        setDuration(dur);
        setProgress(dur > 0 ? (seek / dur) * 100 : 0);
      }
    }, 500);
  }, [stopProgressInterval]);

  const unloadCurrent = useCallback(() => {
    stopProgressInterval();
    if (howlRef.current) {
      howlRef.current.unload();
      howlRef.current = null;
    }
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
  }, [stopProgressInterval]);

  const playIndex = useCallback((index, items) => {
    const list = items || playlistRef.current;
    if (!list?.length || index < 0 || index >= list.length) return;

    unloadCurrent();

    const track = list[index];
    setCurrentIndex(index);
    setCurrentTrack(track);
    setIsLoading(true);

    const howl = new Howl({
      src: [track.audio_url],
      html5: true,
      volume: volume,
      onload: () => {
        setIsLoading(false);
        setDuration(howl.duration());
      },
      onplay: () => {
        setIsPlaying(true);
        setIsPaused(false);
        startProgressInterval();
      },
      onpause: () => {
        setIsPlaying(false);
        setIsPaused(true);
        stopProgressInterval();
      },
      onstop: () => {
        setIsPlaying(false);
        setIsPaused(false);
        stopProgressInterval();
      },
      onend: () => {
        stopProgressInterval();
        const nextIdx = currentIndexRef.current + 1;
        const wrapped = nextIdx >= playlistRef.current.length ? 0 : nextIdx;
        playIndex(wrapped);
      },
      onloaderror: () => {
        setIsLoading(false);
      },
    });

    howlRef.current = howl;
    howl.play();
  }, [unloadCurrent, volume, startProgressInterval, stopProgressInterval]);

  // Load first track on mount if autoplay
  useEffect(() => {
    if (autoplay && audioItems.length > 0) {
      setPlaylist(audioItems);
      playIndex(0, audioItems);
    }
    return () => unloadCurrent();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const load = useCallback((items) => {
    unloadCurrent();
    setPlaylist(items);
    setCurrentIndex(0);
    setCurrentTrack(items[0] || null);
    playIndex(0, items);
  }, [unloadCurrent, playIndex]);

  const play = useCallback((index) => {
    playIndex(index ?? currentIndexRef.current);
  }, [playIndex]);

  const pause = useCallback(() => {
    if (howlRef.current && howlRef.current.playing()) {
      howlRef.current.pause();
    }
  }, []);

  const resume = useCallback(() => {
    if (howlRef.current && !howlRef.current.playing()) {
      howlRef.current.play();
    }
  }, []);

  const next = useCallback(() => {
    const nextIdx = currentIndexRef.current + 1;
    playIndex(nextIdx >= playlistRef.current.length ? 0 : nextIdx);
  }, [playIndex]);

  const prev = useCallback(() => {
    const prevIdx = currentIndexRef.current - 1;
    playIndex(prevIdx < 0 ? playlistRef.current.length - 1 : prevIdx);
  }, [playIndex]);

  const setVolume = useCallback((v) => {
    setVolumeState(v);
    if (howlRef.current) howlRef.current.volume(v);
  }, []);

  const seek = useCallback((seconds) => {
    if (howlRef.current) {
      howlRef.current.seek(seconds);
    }
  }, []);

  return {
    currentIndex,
    currentTrack,
    isPlaying,
    isPaused,
    isLoading,
    progress,
    currentTime,
    duration,
    volume,
    load,
    play,
    pause,
    resume,
    next,
    prev,
    setVolume,
    seek,
  };
}
