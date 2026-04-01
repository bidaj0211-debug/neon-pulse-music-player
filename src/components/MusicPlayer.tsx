import { useState } from 'react';
import { THEMES, ColorTheme } from '../types';
import { PlayIcon, PauseIcon, NextIcon, PreviousIcon, VolumeIcon, MusicIcon, ChevronUpIcon, ChevronDownIcon, QueueListIcon } from './icons';
import { Track } from '../hooks/useAudioAnalyzer';

interface Props {
  theme: ColorTheme;
  isPlaying: boolean;
  trackName: string;
  bpm: number;
  onPlayPause: () => void;
  onNext: () => void;
  onPrevious: () => void;
  onVolumeChange: (volume: number) => void;
  onSeek: (time: number) => void;
  currentTime: number;
  duration: number;
  volume: number;
  hasAudio: boolean;
  playlist?: Track[];
  currentTrackIndex?: number;
  onTrackSelect?: (index: number) => void;
}

export default function MusicPlayer({
  theme,
  isPlaying,
  trackName,
  bpm,
  onPlayPause,
  onNext,
  onPrevious,
  onVolumeChange,
  onSeek,
  currentTime,
  duration,
  volume,
  hasAudio,
  playlist = [],
  currentTrackIndex = 0,
  onTrackSelect,
}: Props) {
  const [isMinimized, setIsMinimized] = useState(false);
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState(false);

  const themeColors = THEMES[theme];

  const formatTime = (seconds: number) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    onNext();
  };

  const handlePrevious = () => {
    onPrevious();
  };

  const handleTrackSelect = (index: number) => {
    onTrackSelect?.(index);
    setIsPlaylistOpen(false);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className="absolute left-0 right-0 bottom-0 z-40 px-3 pb-3 sm:left-6 sm:right-auto sm:bottom-6 sm:px-0 sm:pb-0"
      style={{ maxWidth: '100vw' }}
    >
      {/* Player container */}
      <div
        className="rounded-2xl backdrop-blur-xl overflow-hidden"
        style={{
          background: 'rgba(10, 10, 30, 0.9)',
          border: `1px solid ${themeColors.primary}30`,
          boxShadow: `0 0 60px ${themeColors.primary}15, 0 20px 40px rgba(0,0,0,0.5), inset 0 0 30px rgba(0,0,0,0.3)`,
          width: isMinimized ? 'min(320px, 100%)' : 'min(440px, 100%)',
        }}
      >
        {/* Header with minimize/maximize button */}
        <div 
          className="flex items-center justify-between p-4 border-b border-white/5 cursor-pointer"
          onClick={() => setIsMinimized(!isMinimized)}
          style={{
            background: `linear-gradient(180deg, ${themeColors.primary}08 0%, transparent 100%)`,
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-3 h-3 rounded-full animate-pulse"
              style={{
                backgroundColor: isPlaying ? themeColors.primary : '#444',
                boxShadow: isPlaying ? `0 0 12px ${themeColors.primary}, 0 0 24px ${themeColors.primary}50` : 'none',
              }}
            />
            <h3 className="text-white/90 text-sm font-mono tracking-widest uppercase font-bold">
              Now Playing
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {/* Playlist toggle */}
            {playlist.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPlaylistOpen(!isPlaylistOpen);
                }}
                className="text-white/40 hover:text-white/80 transition-colors p-1"
                title="Playlist"
              >
                <QueueListIcon theme={theme} size={18} />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMinimized(!isMinimized);
              }}
              className="text-white/40 hover:text-white/80 transition-colors p-1"
              title={isMinimized ? 'Expand' : 'Minimize'}
            >
              {isMinimized ? (
                <ChevronUpIcon theme={theme} size={18} />
              ) : (
                <ChevronDownIcon theme={theme} size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Minimized View */}
        {isMinimized && (
          <div className="p-4">
            <div className="flex items-center gap-4">
              {/* Album art */}
              <div
                className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden"
                style={{
                  background: `linear-gradient(135deg, ${themeColors.primary}30, ${themeColors.secondary}30)`,
                  border: `1px solid ${themeColors.primary}40`,
                }}
              >
                <MusicIcon theme={theme} size={28} />
                {isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center gap-0.5">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-0.5 rounded-full animate-pulse"
                        style={{
                          height: '60%',
                          backgroundColor: themeColors.primary,
                          animationDelay: `${i * 0.1}s`,
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Track info */}
              <div className="flex-1 min-w-0">
                <div className="text-white/90 text-base font-semibold truncate">
                  {trackName}
                </div>
                <div className="text-white/50 text-sm truncate mt-0.5">
                  {playlist[currentTrackIndex]?.name || 'Unknown Artist'}
                </div>
              </div>

              {/* Mini controls */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevious}
                  className="text-white/50 hover:text-white/90 transition-colors p-2 hover:scale-110"
                  disabled={!hasAudio}
                >
                  <PreviousIcon theme={theme} size={20} />
                </button>

                <button
                  onClick={onPlayPause}
                  className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-30"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                    boxShadow: `0 0 20px ${themeColors.primary}60`,
                  }}
                  disabled={!hasAudio}
                >
                  {isPlaying ? (
                    <PauseIcon theme={theme} size={20} />
                  ) : (
                    <PlayIcon theme={theme} size={20} />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="text-white/50 hover:text-white/90 transition-colors p-2 hover:scale-110"
                  disabled={!hasAudio}
                >
                  <NextIcon theme={theme} size={20} />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3">
              <div
                className="h-1 rounded-full bg-white/10 overflow-hidden cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  onSeek(percent * duration);
                }}
              >
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`,
                    boxShadow: `0 0 8px ${themeColors.primary}`,
                  }}
                />
              </div>
              <div className="flex justify-between text-white/40 text-xs font-mono mt-1">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Expanded View */}
        {!isMinimized && (
          <>
            {/* Mini visualizer preview */}
            <div className="h-16 border-b border-white/5 relative overflow-hidden" style={{
              background: `linear-gradient(180deg, ${themeColors.primary}05 0%, transparent 100%)`,
            }}>
              <div className="absolute inset-0 flex items-center justify-center gap-0.5 px-4">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full"
                    style={{
                      height: isPlaying ? `${20 + Math.sin(Date.now() / 150 + i * 0.2) * 30 + (isPlaying ? Math.random() * 20 : 0)}%` : '15%',
                      backgroundColor: themeColors.primary,
                      opacity: 0.4 + (i % 3) * 0.2,
                      animation: isPlaying ? `wave ${0.3 + (i % 4) * 0.1}s infinite alternate` : 'none',
                      transition: 'height 0.1s ease-out',
                    }}
                  />
                ))}
              </div>
              {/* Overlay gradient */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(90deg, rgba(10,10,30,0.95) 0%, transparent 15%, transparent 85%, rgba(10,10,30,0.95) 100%)`,
                }}
              />
            </div>

            {/* Track info */}
            <div className="p-5 border-b border-white/5">
              <div className="flex items-start gap-4">
                {/* Album art */}
                <div
                  className="w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden group"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.primary}30, ${themeColors.secondary}30)`,
                    border: `1px solid ${themeColors.primary}40`,
                    boxShadow: `0 0 30px ${themeColors.primary}20`,
                  }}
                >
                  <MusicIcon theme={theme} size={36} />
                  {/* Animated waveform */}
                  <div className="absolute inset-0 flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="w-0.5 rounded-full"
                        style={{
                          height: isPlaying ? `${30 + Math.sin(Date.now() / 200 + i) * 25}%` : '25%',
                          backgroundColor: themeColors.primary,
                          opacity: 0.7,
                          animation: isPlaying ? `wave ${0.4 + i * 0.08}s infinite alternate` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-white/30 text-[10px] font-mono tracking-[0.3em] uppercase">
                      NOW PLAYING
                    </div>
                    {bpm > 0 && isPlaying && (
                      <div 
                        className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px]"
                        style={{
                          background: `${themeColors.primary}25`,
                          border: `1px solid ${themeColors.primary}40`,
                        }}
                      >
                        <span className="text-white/50 font-mono">BPM</span>
                        <span className="text-white font-mono font-bold">{bpm}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-white text-xl font-bold truncate mb-1 drop-shadow-lg">
                    {trackName}
                    {isPlaying && (
                      <span className="inline-block ml-2 text-xs align-middle">
                        <span className="animate-ping inline-block w-1.5 h-1.5 rounded-full bg-green-400 opacity-75"></span>
                      </span>
                    )}
                  </div>
                  
                  <div className="text-white/50 text-sm flex items-center gap-2">
                    <span className="font-medium">{playlist[currentTrackIndex]?.name || 'Local File'}</span>
                    {playlist.length > 1 && (
                      <>
                        <span className="text-white/20">•</span>
                        <span className="text-white/40 text-xs">Track {currentTrackIndex + 1} of {playlist.length}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="px-5 py-4">
              <div
                className="h-2.5 rounded-full bg-white/5 overflow-hidden cursor-pointer relative group"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const percent = (e.clientX - rect.left) / rect.width;
                  onSeek(percent * duration);
                }}
              >
                {/* Background glow */}
                <div
                  className="absolute inset-0 rounded-full opacity-20 group-hover:opacity-30 transition-opacity"
                  style={{
                    background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`,
                  }}
                />
                
                {/* Progress fill */}
                <div
                  className="h-full rounded-full relative transition-all duration-300"
                  style={{
                    width: `${progress}%`,
                    background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`,
                    boxShadow: `0 0 16px ${themeColors.primary}80`,
                  }}
                >
                  {/* Progress knob */}
                  <div
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      boxShadow: `0 0 12px ${themeColors.primary}, 0 2px 8px rgba(0,0,0,0.3)`,
                    }}
                  />
                </div>
              </div>
              
              <div className="flex justify-between text-white/40 text-xs font-mono mt-2">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="px-5 py-4 border-t border-white/5" style={{
              background: `linear-gradient(180deg, transparent 0%, ${themeColors.primary}05 100%)`,
            }}>
              <div className="flex items-center justify-center gap-5 sm:gap-6">
                <button
                  onClick={handlePrevious}
                  className="text-white/50 hover:text-white/90 transition-all p-2 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={!hasAudio}
                >
                  <PreviousIcon theme={theme} size={24} />
                </button>

                <button
                  onClick={onPlayPause}
                  className="w-16 h-16 sm:w-14 sm:h-14 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transform hover:rotate-6"
                  style={{
                    background: `linear-gradient(135deg, ${themeColors.primary}, ${themeColors.secondary})`,
                    boxShadow: `0 0 30px ${themeColors.primary}70, 0 4px 20px rgba(0,0,0,0.3)`,
                  }}
                  disabled={!hasAudio}
                >
                  {isPlaying ? (
                    <PauseIcon theme={theme} size={28} />
                  ) : (
                    <PlayIcon theme={theme} size={28} />
                  )}
                </button>

                <button
                  onClick={handleNext}
                  className="text-white/50 hover:text-white/90 transition-all p-2 hover:scale-110 disabled:opacity-30 disabled:cursor-not-allowed"
                  disabled={!hasAudio}
                >
                  <NextIcon theme={theme} size={24} />
                </button>

                {/* Volume control */}
                <div className="relative ml-4">
                  <button
                    onClick={() => setIsVolumeOpen(!isVolumeOpen)}
                    className="text-white/50 hover:text-white/90 transition-colors p-2"
                  >
                    <VolumeIcon theme={theme} volume={volume} size={22} />
                  </button>
                  
                  {isVolumeOpen && (
                    <div
                      className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 p-4 rounded-xl backdrop-blur-xl"
                      style={{
                        background: 'rgba(10, 10, 30, 0.95)',
                        border: `1px solid ${themeColors.primary}40`,
                        boxShadow: `0 0 30px ${themeColors.primary}20`,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <VolumeIcon theme={theme} volume={volume} size={24} />
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={volume}
                          onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                          className="w-28 h-2 rounded-full appearance-none cursor-pointer"
                          style={{
                            background: `linear-gradient(90deg, ${themeColors.primary}, ${themeColors.secondary})`,
                          }}
                        />
                        <div className="text-white/60 text-xs font-mono">
                          {Math.round(volume * 100)}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Playlist dropdown */}
        {isPlaylistOpen && playlist.length > 0 && (
          <div 
            className="absolute left-0 right-0 bottom-full mb-2 mx-2 rounded-xl overflow-hidden backdrop-blur-xl max-h-64"
            style={{
              background: 'rgba(10, 10, 30, 0.98)',
              border: `1px solid ${themeColors.primary}40`,
              boxShadow: `0 0 40px ${themeColors.primary}20`,
            }}
          >
            <div className="p-3 border-b border-white/5">
              <div className="text-white/60 text-xs font-mono tracking-widest uppercase">
                Playlist ({playlist.length} tracks)
              </div>
            </div>
            <div className="max-h-48 overflow-y-auto">
              {playlist.map((track, index) => (
                <div
                  key={track.id}
                  onClick={() => handleTrackSelect(index)}
                  className={`flex items-center justify-between p-3 cursor-pointer transition-all duration-200 hover:bg-white/5 ${
                    index === currentTrackIndex ? 'bg-white/10' : ''
                  }`}
                  style={{
                    borderBottom: index < playlist.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded flex items-center justify-center"
                      style={{
                        background: index === currentTrackIndex ? `${themeColors.primary}30` : 'rgba(255,255,255,0.05)',
                      }}
                    >
                      {index === currentTrackIndex && isPlaying ? (
                        <div className="flex gap-0.5 items-end">
                          <div className="w-0.5 rounded-full animate-pulse" style={{ height: '60%', backgroundColor: themeColors.primary, animationDelay: '0s' }} />
                          <div className="w-0.5 rounded-full animate-pulse" style={{ height: '80%', backgroundColor: themeColors.primary, animationDelay: '0.15s' }} />
                          <div className="w-0.5 rounded-full animate-pulse" style={{ height: '50%', backgroundColor: themeColors.primary, animationDelay: '0.3s' }} />
                        </div>
                      ) : (
                        <div className="text-white/30 text-xs">{index + 1}</div>
                      )}
                    </div>
                    <div>
                      <div className={`text-sm ${index === currentTrackIndex ? 'text-white font-medium' : 'text-white/70'}`}>
                        {track.name}
                      </div>
                    </div>
                  </div>
                  {index === currentTrackIndex && (
                    <div className="w-2 h-2 rounded-full animate-pulse" style={{
                      backgroundColor: themeColors.primary,
                      boxShadow: `0 0 8px ${themeColors.primary}`,
                    }} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Status bar */}
        <div className="px-4 py-2 border-t border-white/5" style={{
          background: 'rgba(0,0,0,0.2)',
        }}>
          <div className="flex items-center justify-between">
            <div className="text-white/30 text-[10px] font-mono flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${hasAudio ? 'bg-green-400 animate-pulse' : 'bg-white/20'}`} />
              {hasAudio ? 'AUDIO ACTIVE' : 'NO AUDIO'}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-white/20 text-[10px] font-mono">QUALITY</div>
              <div className="flex gap-0.5">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-1 h-3 rounded-full"
                    style={{
                      backgroundColor: themeColors.primary,
                      opacity: isPlaying ? 0.2 + (i * 0.25) : 0.1,
                      animation: isPlaying ? `pulse ${0.4 + i * 0.1}s infinite alternate` : 'none',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% { opacity: 0.2; }
          100% { opacity: 1; }
        }
        @keyframes wave {
          0% { height: 20%; }
          100% { height: 100%; }
        }
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 0 8px ${themeColors.primary};
        }
        input[type="range"]::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 8px ${themeColors.primary};
        }
      `}</style>
    </div>
  );
}
