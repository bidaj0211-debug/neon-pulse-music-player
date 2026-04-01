import { ColorTheme, THEMES } from '../types';

interface IconProps {
  theme: ColorTheme;
  size?: number;
  className?: string;
}

export function PlayIcon({ theme, size = 24, className = '' }: IconProps) {
  const themeColors = THEMES[theme];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M8 5V19L19 12L8 5Z"
        fill={themeColors.primary}
        stroke={themeColors.primary}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PauseIcon({ theme, size = 24, className = '' }: IconProps) {
  const themeColors = THEMES[theme];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <rect x="6" y="5" width="4" height="14" fill={themeColors.primary} />
      <rect x="14" y="5" width="4" height="14" fill={themeColors.primary} />
    </svg>
  );
}

export function NextIcon({ theme, size = 24, className = '' }: IconProps) {
  const themeColors = THEMES[theme];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M6 5V19L13 12L6 5Z"
        fill={themeColors.primary}
        stroke={themeColors.primary}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line
        x1="17"
        y1="5"
        x2="17"
        y2="19"
        stroke={themeColors.primary}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PreviousIcon({ theme, size = 24, className = '' }: IconProps) {
  const themeColors = THEMES[theme];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M18 5V19L11 12L18 5Z"
        fill={themeColors.primary}
        stroke={themeColors.primary}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <line
        x1="7"
        y1="5"
        x2="7"
        y2="19"
        stroke={themeColors.primary}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function VolumeIcon({ theme, volume, size = 24, className = '' }: IconProps & { volume: number }) {
  const themeColors = THEMES[theme];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M15 8.5C15 8.5 16.5 9.5 16.5 12C16.5 14.5 15 15.5 15 15.5"
        stroke={themeColors.primary}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M18 6C18 6 20.5 8.5 20.5 12C20.5 15.5 18 18 18 18"
        stroke={themeColors.primary}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 9H3.5C2.94772 9 2.5 9.44772 2.5 10V14C2.5 14.5523 2.94772 15 3.5 15H5.5L9.5 18.5V5.5L5.5 9Z"
        fill={volume > 0 ? themeColors.primary : 'rgba(255,255,255,0.3)'}
        stroke={themeColors.primary}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function MusicIcon({ theme, size = 24, className = '' }: IconProps) {
  const themeColors = THEMES[theme];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M9 18V6L21 3V15"
        stroke={themeColors.primary}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle
        cx="6"
        cy="18"
        r="3"
        fill={themeColors.primary}
        stroke={themeColors.primary}
        strokeWidth="1.5"
      />
      <circle
        cx="18"
        cy="15"
        r="3"
        fill={themeColors.primary}
        stroke={themeColors.primary}
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function WaveformIcon({ theme, size = 24, className = '' }: IconProps) {
  const themeColors = THEMES[theme];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M3 12H3.01M7.5 12H7.51M12 12H12.01M16.5 12H16.51M21 12H21.01"
        stroke={themeColors.primary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 6V18M7.5 9V15M12 8V16M16.5 10V14M21 4V20"
        stroke={themeColors.primary}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronUpIcon({ theme, size = 24, className = '' }: IconProps) {
  const themeColors = THEMES[theme];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M18 15L12 9L6 15"
        stroke={themeColors.primary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ChevronDownIcon({ theme, size = 24, className = '' }: IconProps) {
  const themeColors = THEMES[theme];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M6 9L12 15L18 9"
        stroke={themeColors.primary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function QueueListIcon({ theme, size = 24, className = '' }: IconProps) {
  const themeColors = THEMES[theme];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <path
        d="M4 6H20M4 12H20M4 18H12"
        stroke={themeColors.primary}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}