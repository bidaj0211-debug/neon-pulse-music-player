import { useRef, useState } from 'react';
import { VisualizerMode, ColorTheme, THEMES } from '../types';

interface Props {
  mode: VisualizerMode;
  setMode: (mode: VisualizerMode) => void;
  theme: ColorTheme;
  setTheme: (theme: ColorTheme) => void;
  sensitivity: number;
  setSensitivity: (s: number) => void;
  showParticles: boolean;
  setShowParticles: (v: boolean) => void;
  showInfo: boolean;
  setShowInfo: (v: boolean) => void;
  onFileUpload: (files: File[]) => void;
  onMicToggle: () => void;
  onDemoToggle: () => void;
  isPlaying: boolean;
  isReady: boolean;
}

const MODES: { id: VisualizerMode; label: string; icon: string }[] = [
  { id: 'circular', label: 'Circular', icon: '◎' },
  { id: 'waveform', label: 'Waveform', icon: '〰' },
  { id: 'bars', label: 'Bars', icon: '▮' },
  { id: 'spiral', label: 'Spiral', icon: '🌀' },
];

export default function ControlPanel({
  mode,
  setMode,
  theme,
  setTheme,
  sensitivity,
  setSensitivity,
  showParticles,
  setShowParticles,
  showInfo,
  setShowInfo,
  onFileUpload,
  onMicToggle,
  onDemoToggle,
  isPlaying,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(true);

  const themeColors = THEMES[theme];

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:absolute sm:bottom-6 sm:right-6 z-50 w-12 h-12 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 touch-manipulation"
        style={{
          background: `${themeColors.primary}15`,
          border: `1px solid ${themeColors.primary}30`,
          color: themeColors.primary,
        }}
      >
        {isOpen ? '✕' : '⚙'}
      </button>

      {/* Panel */}
      <div
        className={`fixed bottom-20 left-0 right-0 px-3 sm:absolute sm:bottom-20 sm:left-auto sm:right-6 sm:px-0 z-40 transition-all duration-500 ease-out ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div
          className="w-full sm:w-72 rounded-2xl p-5 backdrop-blur-xl"
          style={{
            background: 'rgba(10, 10, 30, 0.85)',
            border: `1px solid ${themeColors.primary}20`,
            boxShadow: `0 0 40px ${themeColors.primary}10, inset 0 0 20px rgba(0,0,0,0.3)`,
          }}
        >
          {/* Title */}
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: themeColors.primary, boxShadow: `0 0 8px ${themeColors.primary}` }}
            />
            <h3 className="text-white/80 text-xs font-mono tracking-widest uppercase">
              Controls
            </h3>
          </div>

          {/* Audio Source */}
          <div className="mb-4">
            <label className="text-white/40 text-[10px] font-mono tracking-widest uppercase block mb-2">
              Audio Source
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-3 px-3 rounded-lg text-xs font-mono transition-all duration-200 hover:scale-[1.02] active:scale-95 touch-manipulation"
                style={{
                  background: `${themeColors.primary}15`,
                  border: `1px solid ${themeColors.primary}30`,
                  color: themeColors.primary,
                }}
              >
                📁 File
              </button>
              <button
                onClick={onMicToggle}
                className="flex-1 py-3 px-3 rounded-lg text-xs font-mono transition-all duration-200 hover:scale-[1.02] active:scale-95 touch-manipulation"
                style={{
                  background: isPlaying ? `${themeColors.primary}25` : `${themeColors.primary}10`,
                  border: `1px solid ${themeColors.primary}${isPlaying ? '50' : '30'}`,
                  color: isPlaying ? themeColors.primary : 'rgba(255,255,255,0.5)',
                }}
              >
                🎤 Mic
              </button>
              <button
                onClick={onDemoToggle}
                className="flex-1 py-3 px-3 rounded-lg text-xs font-mono transition-all duration-200 hover:scale-[1.02] active:scale-95 touch-manipulation"
                style={{
                  background: `${themeColors.secondary}15`,
                  border: `1px solid ${themeColors.secondary}30`,
                  color: themeColors.secondary,
                }}
              >
                🎵 Demo
              </button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="audio/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                if (files.length > 0) onFileUpload(files);
              }}
            />
          </div>

          {/* Mode selector */}
          <div className="mb-4">
            <label className="text-white/40 text-[10px] font-mono tracking-widest uppercase block mb-2">
              Visualizer Mode
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {MODES.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  className="py-2 rounded-lg text-center transition-all duration-200 hover:scale-[1.05] active:scale-95 touch-manipulation"
                  style={{
                    background: mode === m.id ? `${themeColors.primary}25` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${mode === m.id ? `${themeColors.primary}50` : 'rgba(255,255,255,0.08)'}`,
                    color: mode === m.id ? themeColors.primary : 'rgba(255,255,255,0.4)',
                  }}
                >
                  <div className="text-lg">{m.icon}</div>
                  <div className="text-[8px] font-mono mt-0.5">{m.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme selector */}
          <div className="mb-4">
            <label className="text-white/40 text-[10px] font-mono tracking-widest uppercase block mb-2">
              Color Theme
            </label>
            <div className="flex gap-2">
              {(Object.keys(THEMES) as ColorTheme[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className="w-8 h-8 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 touch-manipulation"
                  style={{
                    background: `linear-gradient(135deg, ${THEMES[t].primary}, ${THEMES[t].secondary})`,
                    border: theme === t ? '2px solid white' : '2px solid transparent',
                    boxShadow: theme === t ? `0 0 12px ${THEMES[t].primary}` : 'none',
                  }}
                  title={t}
                />
              ))}
            </div>
          </div>

          {/* Sensitivity slider */}
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <label className="text-white/40 text-[10px] font-mono tracking-widest uppercase">
                Sensitivity
              </label>
              <span className="text-white/60 text-[10px] font-mono">{sensitivity.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={sensitivity}
              onChange={(e) => setSensitivity(parseFloat(e.target.value))}
              className="w-full h-1 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, ${themeColors.primary} 0%, ${themeColors.primary} ${((sensitivity - 0.5) / 2.5) * 100}%, rgba(255,255,255,0.1) ${((sensitivity - 0.5) / 2.5) * 100}%, rgba(255,255,255,0.1) 100%)`,
              }}
            />
          </div>

          {/* Toggles */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowParticles(!showParticles)}
              className="flex-1 py-2 rounded-lg text-xs font-mono transition-all duration-200"
              style={{
                background: showParticles ? `${themeColors.primary}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${showParticles ? `${themeColors.primary}40` : 'rgba(255,255,255,0.08)'}`,
                color: showParticles ? themeColors.primary : 'rgba(255,255,255,0.3)',
              }}
            >
              ✨ Particles
            </button>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="flex-1 py-2 rounded-lg text-xs font-mono transition-all duration-200"
              style={{
                background: showInfo ? `${themeColors.primary}20` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${showInfo ? `${themeColors.primary}40` : 'rgba(255,255,255,0.08)'}`,
                color: showInfo ? themeColors.primary : 'rgba(255,255,255,0.3)',
              }}
            >
              ℹ Info
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
