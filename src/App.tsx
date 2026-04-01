import { useEffect, useRef, useState, useCallback } from 'react';
import { useAudioAnalyzer, Track } from './hooks/useAudioAnalyzer';
import VisualizerCanvas from './components/VisualizerCanvas';
import ControlPanel from './components/ControlPanel';
import ParticleOverlay from './components/ParticleOverlay';
import MusicPlayer from './components/MusicPlayer';
import { VisualizerMode, ColorTheme, THEMES } from './types';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const [mode, setMode] = useState<VisualizerMode>('circular');
  const [theme, setTheme] = useState<ColorTheme>('neon-cyan');
  const [sensitivity, setSensitivity] = useState(1.2);
  const [showParticles, setShowParticles] = useState(true);
  const [showInfo, setShowInfo] = useState(true);
  const [isPlayingState, setIsPlayingState] = useState(false);
  const [trackName, setTrackName] = useState('No audio loaded');
  const [bpm, setBpm] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(180); // 3 minutes default
  const [volume, setVolumeState] = useState(0.8);
  const [hasAudio, setHasAudio] = useState(false);
  const [playlist, setPlaylistState] = useState<Track[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const {
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
  } = useAudioAnalyzer();

  // Sync volume with audio element
  useEffect(() => {
    setVolume(volume);
  }, [volume, setVolume]);

  // Monitor playing state
  useEffect(() => {
    const audio = getAudioElement();
    if (!audio) return;

    const handlePlay = () => setIsPlayingState(true);
    const handlePause = () => setIsPlayingState(false);
    const handleEnded = () => {
      // Auto play next track
      if (playlist.length > 0) {
        playNext();
      }
    };
    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 180);
    };
    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 180);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
    };
  }, [getAudioElement, playlist.length, playNext]);

  const handleFileUpload = useCallback(
    (files: File[]) => {
      if (files.length === 0) return;
      
      if (files.length === 1) {
        loadFile(files[0]);
        setTrackName(files[0].name.replace(/\.[^/.]+$/, ''));
        setPlaylistState([]);
        setCurrentTrackIndex(0);
      } else {
        loadPlaylist(files);
        setTrackName(`Playlist (${files.length} tracks)`);
        setPlaylistState(files.map((f, i) => ({
          id: `${Date.now()}-${i}`,
          name: f.name.replace(/\.[^/.]+$/, ''),
          file: f,
        })));
        setCurrentTrackIndex(0);
      }
      setHasAudio(true);
    },
    [loadFile, loadPlaylist]
  );

  const handleTrackSelect = useCallback(
    (index: number) => {
      playTrack(index);
      setCurrentTrackIndex(index);
      const track = playlist[index];
      if (track) {
        setTrackName(track.name);
      }
      setHasAudio(true);
    },
    [playTrack, playlist]
  );

  const handleMicToggle = useCallback(async () => {
    const audio = getAudioElement();
    if (audio && !audio.paused) {
      stopAudio();
      setTrackName('No audio loaded');
      setHasAudio(false);
    } else {
      await loadMicrophone();
      setTrackName('Microphone Input');
      setHasAudio(true);
    }
  }, [getAudioElement, loadMicrophone, stopAudio]);

  const handleDemoToggle = useCallback(() => {
    const audio = getAudioElement();
    if (audio && !audio.paused) {
      stopAudio();
      setTrackName('No audio loaded');
      setHasAudio(false);
    } else {
      startDemo();
      setTrackName('Demo Mode — Synth Wave');
      setHasAudio(true);
    }
  }, [getAudioElement, startDemo, stopAudio]);

  const handlePlayPause = useCallback(() => {
    togglePlayPause();
  }, [togglePlayPause]);

  const handleNext = useCallback(() => {
    playNext();
    const nextIndex = (currentTrackIndex + 1) % Math.max(playlist.length, 1);
    setCurrentTrackIndex(nextIndex);
    if (playlist.length > 0) {
      setTrackName(playlist[nextIndex]?.name || 'Unknown Track');
    }
  }, [playNext, currentTrackIndex, playlist]);

  const handlePrevious = useCallback(() => {
    playPrevious();
    const prevIndex = (currentTrackIndex - 1 + Math.max(playlist.length, 1)) % Math.max(playlist.length, 1);
    setCurrentTrackIndex(prevIndex);
    if (playlist.length > 0) {
      setTrackName(playlist[prevIndex]?.name || 'Unknown Track');
    }
  }, [playPrevious, currentTrackIndex, playlist]);

  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
    setVolumeState(newVolume);
  }, [setVolume]);

  const handleSeek = useCallback((time: number) => {
    seek(time);
    setCurrentTime(time);
  }, [seek]);

  // BPM detection (simple energy-based)
  useEffect(() => {
    if (!analyserNode || !audioContext) return;
    const dataArray = new Uint8Array(analyserNode.frequencyBinCount);
    let lastBeat = 0;
    let beatCount = 0;
    let lastEnergy = 0;
    const threshold = 1.3;

    const detectBpm = () => {
      analyserNode.getByteFrequencyData(dataArray);
      let energy = 0;
      for (let i = 0; i < dataArray.length; i++) {
        energy += dataArray[i] * dataArray[i];
      }
      energy = Math.sqrt(energy / dataArray.length);

      if (energy > lastEnergy * threshold && energy > 50) {
        const now = Date.now();
        if (now - lastBeat > 200) {
          beatCount++;
          lastBeat = now;
          if (beatCount > 4) {
            const avgBpm = Math.round((beatCount / ((lastBeat - (lastBeat - beatCount * 500)) / 60000)) || 120);
            setBpm(Math.min(avgBpm, 200));
          }
        }
      }
      lastEnergy = energy * 0.7 + lastEnergy * 0.3;
    };

    const interval = setInterval(detectBpm, 50);
    return () => clearInterval(interval);
  }, [analyserNode, audioContext]);

  // Timer for current time - removed since we use audio element timeupdate event

  return (
    <div className="relative w-screen h-screen bg-[#050510] overflow-hidden select-none">
      {/* Background gradient */}
      <div
        className="absolute inset-0 transition-all duration-1000"
        style={{
          background: `radial-gradient(ellipse at 50% 50%, ${THEMES[theme].bgGlow}15 0%, #050510 70%)`,
        }}
      />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(${THEMES[theme].primary}20 1px, transparent 1px),
            linear-gradient(90deg, ${THEMES[theme].primary}20 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Particle overlay */}
      {showParticles && (
        <ParticleOverlay
          canvasRef={particleCanvasRef}
          theme={theme}
          analyserNode={analyserNode}
          isPlaying={isPlayingState}
        />
      )}

      {/* Main visualizer canvas */}
      <VisualizerCanvas
        canvasRef={canvasRef}
        analyserNode={analyserNode}
        mode={mode}
        theme={theme}
        sensitivity={sensitivity}
        isPlaying={isPlayingState}
      />

      {showInfo && (
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 z-20">
          <div className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full animate-pulse flex-shrink-0"
              style={{
                backgroundColor: isPlayingState ? THEMES[theme].primary : '#333',
                boxShadow: isPlayingState ? `0 0 10px ${THEMES[theme].primary}` : 'none',
              }}
            />
            <span className="text-white/60 text-[10px] sm:text-xs font-mono tracking-widest uppercase hidden sm:inline">
              {isPlayingState ? '● AUDIO VISUALIZER ACTIVE' : '○ SYSTEM STANDBY'}
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-6">
            <div className="text-right">
              <div className="text-white/30 text-[9px] sm:text-[10px] font-mono tracking-widest">MODE</div>
              <div className="text-white/80 text-xs sm:text-sm font-mono uppercase">
                {mode}
              </div>
            </div>
            <div className="text-right">
              <div className="text-white/30 text-[9px] sm:text-[10px] font-mono tracking-widest">THEME</div>
              <div className="text-white/80 text-xs sm:text-sm font-mono uppercase">
                {theme.replace('-', ' ')}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Center ring decoration */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div
          className="w-[400px] h-[400px] rounded-full border border-white/[0.02]"
          style={{
            boxShadow: `inset 0 0 80px ${THEMES[theme].primary}05`,
          }}
        />
      </div>

      {/* Music player */}
      <MusicPlayer
        theme={theme}
        isPlaying={isPlayingState}
        trackName={trackName}
        bpm={bpm}
        onPlayPause={handlePlayPause}
        onNext={handleNext}
        onPrevious={handlePrevious}
        onVolumeChange={handleVolumeChange}
        onSeek={handleSeek}
        currentTime={currentTime}
        duration={duration}
        volume={volume}
        hasAudio={hasAudio}
        playlist={playlist}
        currentTrackIndex={currentTrackIndex}
        onTrackSelect={handleTrackSelect}
      />

      {/* Control panel */}
      <ControlPanel
        mode={mode}
        setMode={setMode}
        theme={theme}
        setTheme={setTheme}
        sensitivity={sensitivity}
        setSensitivity={setSensitivity}
        showParticles={showParticles}
        setShowParticles={setShowParticles}
        showInfo={showInfo}
        setShowInfo={setShowInfo}
        onFileUpload={handleFileUpload}
        onMicToggle={handleMicToggle}
        onDemoToggle={handleDemoToggle}
        isPlaying={isPlayingState}
        isReady={isReady}
      />

      {/* Scanline effect */}
      <div
        className="absolute inset-0 pointer-events-none z-30 opacity-[0.015]"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </div>
  );
}
