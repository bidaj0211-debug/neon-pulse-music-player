import { useState, useRef, useCallback, useEffect } from 'react';

export interface Track {
  id: string;
  name: string;
  file: File;
  duration?: number;
}

export function useAudioAnalyzer() {
  const [analyserNode, setAnalyserNode] = useState<AnalyserNode | null>(null);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [playlist, setPlaylist] = useState<Track[]>([]);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | MediaStreamAudioSourceNode | OscillatorNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const demoOscillatorsRef = useRef<OscillatorNode[]>([]);

  const cleanup = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.disconnect();
      } catch (e) {
        // ignore
      }
      sourceRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.src = '';
      audioElementRef.current = null;
    }
    demoOscillatorsRef.current.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) {
        // ignore
      }
    });
    demoOscillatorsRef.current = [];
  }, []);

  const stopAudio = useCallback(() => {
    cleanup();
    setAnalyserNode(null);
    setAudioContext(null);
    setIsReady(false);
  }, [cleanup]);

  const initAudioContext = useCallback(() => {
    if (!audioContext) {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.82;
      setAudioContext(ctx);
      setAnalyserNode(analyser);
      setIsReady(true);
      return { ctx, analyser };
    }
    return { ctx: audioContext, analyser: analyserNode! };
  }, [audioContext, analyserNode]);

  const loadFile = useCallback(
    (file: File) => {
      cleanup();
      const { ctx, analyser } = initAudioContext();

      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.src = URL.createObjectURL(file);
      audio.loop = false;

      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      sourceRef.current = source;
      audioElementRef.current = audio;

      audio.play().catch(console.error);
    },
    [cleanup, initAudioContext]
  );

  const loadPlaylist = useCallback(
    (files: File[]) => {
      const tracks: Track[] = files.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        name: file.name.replace(/\.[^/.]+$/, ''),
        file,
      }));
      setPlaylist(tracks);
      setCurrentTrackIndex(0);
      
      if (tracks.length > 0) {
        cleanup();
        const { ctx, analyser } = initAudioContext();

        const audio = new Audio();
        audio.crossOrigin = 'anonymous';
        audio.src = URL.createObjectURL(tracks[0].file);
        audio.loop = false;

        const source = ctx.createMediaElementSource(audio);
        source.connect(analyser);
        analyser.connect(ctx.destination);

        sourceRef.current = source;
        audioElementRef.current = audio;

        audio.play().catch(console.error);
      }
    },
    [cleanup, initAudioContext]
  );

  const playTrack = useCallback(
    (index: number) => {
      if (playlist.length === 0) return;
      
      const track = playlist[index];
      if (!track) return;

      cleanup();
      const { ctx, analyser } = initAudioContext();

      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.src = URL.createObjectURL(track.file);
      audio.loop = false;

      const source = ctx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(ctx.destination);

      sourceRef.current = source;
      audioElementRef.current = audio;
      setCurrentTrackIndex(index);

      audio.play().catch(console.error);
    },
    [playlist, cleanup, initAudioContext]
  );

  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    const nextIndex = (currentTrackIndex + 1) % playlist.length;
    playTrack(nextIndex);
  }, [playlist.length, currentTrackIndex, playTrack]);

  const playPrevious = useCallback(() => {
    if (playlist.length === 0) return;
    const prevIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
    playTrack(prevIndex);
  }, [playlist.length, currentTrackIndex, playTrack]);

  const togglePlayPause = useCallback(() => {
    if (!audioElementRef.current) return;
    
    if (audioElementRef.current.paused) {
      audioElementRef.current.play().catch(console.error);
    } else {
      audioElementRef.current.pause();
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.volume = Math.max(0, Math.min(1, volume));
    }
  }, []);

  const seek = useCallback((time: number) => {
    if (audioElementRef.current) {
      audioElementRef.current.currentTime = time;
    }
  }, []);

  const getAudioElement = useCallback(() => {
    return audioElementRef.current;
  }, []);

  const loadMicrophone = useCallback(async () => {
    cleanup();
    const { ctx, analyser } = initAudioContext();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      // Don't connect to destination to avoid feedback

      sourceRef.current = source;
      streamRef.current = stream;
    } catch (err) {
      console.error('Microphone access denied:', err);
    }
  }, [cleanup, initAudioContext]);

  const startDemo = useCallback(() => {
    cleanup();
    const { ctx, analyser } = initAudioContext();

    // Create a demo synth wave using oscillators
    const frequencies = [110, 165, 220, 330, 440, 550, 660, 880];
    const oscillators: OscillatorNode[] = [];

    frequencies.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      // Add some movement
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.1 + i * 0.05, ctx.currentTime);
      lfoGain.gain.setValueAtTime(freq * 0.1, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);
      lfo.start();

      gain.gain.setValueAtTime(0.08 / (i + 1), ctx.currentTime);
      osc.connect(gain);
      gain.connect(analyser);

      osc.start();
      oscillators.push(osc, lfo);
    });

    // Connect analyser to destination so we can hear it
    analyser.connect(ctx.destination);

    sourceRef.current = oscillators[0]; // just need reference to prevent GC
    demoOscillatorsRef.current = oscillators;
  }, [cleanup, initAudioContext]);

  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    analyserNode,
    audioContext,
    isReady,
    loadFile,
    loadPlaylist,
    playTrack,
    playNext,
    playPrevious,
    togglePlayPause,
    setVolume,
    seek,
    getAudioElement,
    loadMicrophone,
    startDemo,
    stopAudio,
    playlist,
    currentTrackIndex,
  };
}
