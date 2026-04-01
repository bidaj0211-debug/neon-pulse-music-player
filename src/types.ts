export type VisualizerMode = 'circular' | 'waveform' | 'bars' | 'spiral';

export type ColorTheme = 'neon-cyan' | 'neon-pink' | 'neon-purple' | 'neon-green' | 'fire' | 'ice';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  bgGlow: string;
  gradient: string[];
}

export const THEMES: Record<ColorTheme, ThemeColors> = {
  'neon-cyan': {
    primary: '#00f5ff',
    secondary: '#0088ff',
    accent: '#00ffcc',
    bgGlow: '#00f5ff',
    gradient: ['#00f5ff', '#0088ff', '#00ffcc'],
  },
  'neon-pink': {
    primary: '#ff006e',
    secondary: '#ff44aa',
    accent: '#ff88cc',
    bgGlow: '#ff006e',
    gradient: ['#ff006e', '#ff44aa', '#ff88cc'],
  },
  'neon-purple': {
    primary: '#b44aff',
    secondary: '#7700ff',
    accent: '#dd88ff',
    bgGlow: '#b44aff',
    gradient: ['#b44aff', '#7700ff', '#dd88ff'],
  },
  'neon-green': {
    primary: '#00ff88',
    secondary: '#00cc66',
    accent: '#88ffbb',
    bgGlow: '#00ff88',
    gradient: ['#00ff88', '#00cc66', '#88ffbb'],
  },
  fire: {
    primary: '#ff4400',
    secondary: '#ff8800',
    accent: '#ffcc00',
    bgGlow: '#ff4400',
    gradient: ['#ff4400', '#ff8800', '#ffcc00'],
  },
  ice: {
    primary: '#88ccff',
    secondary: '#4488ff',
    accent: '#ccddff',
    bgGlow: '#88ccff',
    gradient: ['#88ccff', '#4488ff', '#ccddff'],
  },
};
