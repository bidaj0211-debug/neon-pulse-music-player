import { useEffect, useRef } from 'react';
import { VisualizerMode, ColorTheme, THEMES } from '../types';

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  analyserNode: AnalyserNode | null;
  mode: VisualizerMode;
  theme: ColorTheme;
  sensitivity: number;
  isPlaying: boolean;
}

export default function VisualizerCanvas({
  canvasRef,
  analyserNode,
  mode,
  theme,
  sensitivity,
  isPlaying,
}: Props) {
  const animationRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const smoothDataRef = useRef<Uint8Array | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const bufferLength = analyserNode ? analyserNode.frequencyBinCount : 1024;
    const dataArray = new Uint8Array(bufferLength);
    smoothDataRef.current = new Uint8Array(bufferLength);

    const draw = (time: number) => {
      timeRef.current = time;

      const w = window.innerWidth;
      const h = window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;
      const themeColors = THEMES[theme];

      // Clear with trail effect
      ctx.fillStyle = 'rgba(5, 5, 16, 0.15)';
      ctx.fillRect(0, 0, w, h);

      if (analyserNode && isPlaying) {
        analyserNode.getByteFrequencyData(dataArray);
      } else {
        // Idle animation
        for (let i = 0; i < bufferLength; i++) {
          dataArray[i] = Math.sin((i / bufferLength) * Math.PI * 4 + time * 0.001) * 20 + 30;
        }
      }

      // Smooth the data
      if (smoothDataRef.current) {
        for (let i = 0; i < bufferLength; i++) {
          smoothDataRef.current[i] = smoothDataRef.current[i] * 0.7 + dataArray[i] * 0.3;
        }
      }

      const smoothData = smoothDataRef.current || dataArray;
      const avgEnergy = smoothData.reduce((a, b) => a + b, 0) / bufferLength;
      const bassEnergy = smoothData.slice(0, 10).reduce((a, b) => a + b, 0) / 10;

      // Dynamic radius based on bass
      const baseRadius = Math.min(w, h) * 0.18;
      const dynamicRadius = baseRadius + bassEnergy * sensitivity * 0.5;

      // Draw based on mode
      switch (mode) {
        case 'circular':
          drawCircular(ctx, cx, cy, dynamicRadius, smoothData, themeColors, sensitivity, time, avgEnergy);
          break;
        case 'waveform':
          drawWaveform(ctx, cx, cy, dynamicRadius, smoothData, themeColors, sensitivity, time, analyserNode);
          break;
        case 'bars':
          drawCircularBars(ctx, cx, cy, dynamicRadius, smoothData, themeColors, sensitivity, time);
          break;
        case 'spiral':
          drawSpiral(ctx, cx, cy, dynamicRadius, smoothData, themeColors, sensitivity, time, avgEnergy);
          break;
      }

      // Draw center orb
      drawCenterOrb(ctx, cx, cy, dynamicRadius, themeColors, avgEnergy, time, isPlaying);

      // Draw outer rings
      drawOuterRings(ctx, cx, cy, dynamicRadius, themeColors, time, avgEnergy, smoothData);

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [analyserNode, mode, theme, sensitivity, isPlaying, canvasRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
}

function drawCircular(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  data: Uint8Array,
  colors: { primary: string; secondary: string; accent: string; gradient: string[] },
  sensitivity: number,
  time: number,
  avgEnergy: number
) {
  const points = 180;
  const step = Math.floor(data.length / points);

  // Main circular visualizer
  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
    const dataIndex = (i % points) * step;
    const value = data[dataIndex] / 255;
    const r = radius + value * 120 * sensitivity;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      const prevAngle = ((i - 1) / points) * Math.PI * 2 - Math.PI / 2;
      const prevDataIndex = ((i - 1) % points) * step;
      const prevValue = data[prevDataIndex] / 255;
      const prevR = radius + prevValue * 120 * sensitivity;
      const prevX = cx + Math.cos(prevAngle) * prevR;
      const prevY = cy + Math.sin(prevAngle) * prevR;
      const cpx = (prevX + x) / 2 + Math.cos(angle) * 10;
      const cpy = (prevY + y) / 2 + Math.sin(angle) * 10;
      ctx.quadraticCurveTo(prevX, prevY, cpx, cpy);
    }
  }
  ctx.closePath();

  // Fill with gradient
  const gradient = ctx.createRadialGradient(cx, cy, radius * 0.5, cx, cy, radius + 150);
  gradient.addColorStop(0, colors.primary + '10');
  gradient.addColorStop(0.5, colors.primary + '25');
  gradient.addColorStop(1, colors.secondary + '05');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Stroke
  ctx.strokeStyle = colors.primary;
  ctx.lineWidth = 2;
  ctx.shadowColor = colors.primary;
  ctx.shadowBlur = 20 + avgEnergy * 0.3;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Inner ring
  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
    const dataIndex = (i % points) * step;
    const value = data[dataIndex] / 255;
    const r = radius - 20 - value * 40 * sensitivity;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;

    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.strokeStyle = colors.accent + '60';
  ctx.lineWidth = 1;
  ctx.shadowColor = colors.accent;
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Frequency bars around circle
  const barCount = 90;
  const barStep = Math.floor(data.length / barCount);
  for (let i = 0; i < barCount; i++) {
    const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
    const value = data[i * barStep] / 255;
    const barHeight = value * 80 * sensitivity;

    const innerR = radius + 140 * sensitivity;
    const outerR = innerR + barHeight;

    const x1 = cx + Math.cos(angle) * innerR;
    const y1 = cy + Math.sin(angle) * innerR;
    const x2 = cx + Math.cos(angle) * outerR;
    const y2 = cy + Math.sin(angle) * outerR;

    const alpha = 0.3 + value * 0.7;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = colors.primary + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // Rotating arc segments
  for (let ring = 0; ring < 3; ring++) {
    const ringRadius = radius + 200 + ring * 40;
    const segments = 8 + ring * 4;
    const rotation = time * 0.0003 * (ring % 2 === 0 ? 1 : -1);

    for (let i = 0; i < segments; i++) {
      const startAngle = (i / segments) * Math.PI * 2 + rotation;
      const endAngle = startAngle + (Math.PI * 2 / segments) * 0.6;

      ctx.beginPath();
      ctx.arc(cx, cy, ringRadius, startAngle, endAngle);
      ctx.strokeStyle = colors.secondary + '15';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }
}

function drawWaveform(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  data: Uint8Array,
  colors: { primary: string; secondary: string; accent: string; gradient: string[] },
  sensitivity: number,
  _time: number,
  analyserNode: AnalyserNode | null
) {
  // Get time domain data for waveform
  if (analyserNode) {
    const timeData = new Uint8Array(analyserNode.fftSize);
    analyserNode.getByteTimeDomainData(timeData);

    // Circular waveform
    ctx.beginPath();
    const points = timeData.length;
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
      const value = (timeData[i % points] - 128) / 128;
      const r = radius + value * 100 * sensitivity;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Mirror waveform
    ctx.beginPath();
    for (let i = 0; i <= points; i++) {
      const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
      const value = (timeData[i % points] - 128) / 128;
      const r = radius - value * 60 * sensitivity;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = colors.accent + '80';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Frequency bars around circle (same as circular mode)
  const barCount = 120;
  const barStep = Math.floor(data.length / barCount);
  for (let i = 0; i < barCount; i++) {
    const angle = (i / barCount) * Math.PI * 2 - Math.PI / 2;
    const value = data[i * barStep] / 255;
    const barHeight = value * 60 * sensitivity;

    const innerR = radius + 120 * sensitivity;
    const outerR = innerR + barHeight;

    const x1 = cx + Math.cos(angle) * innerR;
    const y1 = cy + Math.sin(angle) * innerR;
    const x2 = cx + Math.cos(angle) * outerR;
    const y2 = cy + Math.sin(angle) * outerR;

    const alpha = 0.2 + value * 0.6;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.strokeStyle = colors.secondary + Math.floor(alpha * 255).toString(16).padStart(2, '0');
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }
}

function drawCircularBars(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  data: Uint8Array,
  colors: { primary: string; secondary: string; accent: string; gradient: string[] },
  sensitivity: number,
  _time: number
) {
  const barCount = 128;
  const barStep = Math.floor(data.length / barCount);
  const angleStep = (Math.PI * 2) / barCount;

  for (let i = 0; i < barCount; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const value = data[i * barStep] / 255;
    const barHeight = value * 150 * sensitivity;

    // Inner bars
    const innerStart = radius - 10;
    const innerEnd = radius - 10 - barHeight * 0.5;

    const x1i = cx + Math.cos(angle) * innerStart;
    const y1i = cy + Math.sin(angle) * innerStart;
    const x2i = cx + Math.cos(angle) * innerEnd;
    const y2i = cy + Math.sin(angle) * innerEnd;

    const gradient = ctx.createLinearGradient(x1i, y1i, x2i, y2i);
    gradient.addColorStop(0, colors.primary + '40');
    gradient.addColorStop(1, colors.accent + Math.floor(value * 200).toString(16).padStart(2, '0'));

    ctx.beginPath();
    ctx.moveTo(x1i, y1i);
    ctx.lineTo(x2i, y2i);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = Math.max(1, (Math.PI * 2 * radius) / barCount * 0.6);
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = value * 15;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Outer bars
    const outerStart = radius + 15;
    const outerEnd = radius + 15 + barHeight;

    const x1o = cx + Math.cos(angle) * outerStart;
    const y1o = cy + Math.sin(angle) * outerStart;
    const x2o = cx + Math.cos(angle) * outerEnd;
    const y2o = cy + Math.sin(angle) * outerEnd;

    const gradient2 = ctx.createLinearGradient(x1o, y1o, x2o, y2o);
    gradient2.addColorStop(0, colors.secondary + '60');
    gradient2.addColorStop(1, colors.primary + Math.floor(value * 255).toString(16).padStart(2, '0'));

    ctx.beginPath();
    ctx.moveTo(x1o, y1o);
    ctx.lineTo(x2o, y2o);
    ctx.strokeStyle = gradient2;
    ctx.lineWidth = Math.max(1, (Math.PI * 2 * radius) / barCount * 0.6);
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = value * 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Base circle
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = colors.primary + '30';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawSpiral(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  data: Uint8Array,
  colors: { primary: string; secondary: string; accent: string; gradient: string[] },
  sensitivity: number,
  time: number,
  avgEnergy: number
) {
  const points = 500;
  const spiralTurns = 3;

  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const angle = t * Math.PI * 2 * spiralTurns + time * 0.0005;
    const dataIndex = Math.floor(t * data.length);
    const value = data[dataIndex] / 255;
    const r = radius * 0.3 + t * radius * 1.5 + value * 50 * sensitivity;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  const gradient = ctx.createLinearGradient(cx - radius * 2, cy, cx + radius * 2, cy);
  gradient.addColorStop(0, colors.primary);
  gradient.addColorStop(0.5, colors.accent);
  gradient.addColorStop(1, colors.secondary);

  ctx.strokeStyle = gradient;
  ctx.lineWidth = 2;
  ctx.shadowColor = colors.primary;
  ctx.shadowBlur = 15 + avgEnergy * 0.2;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Second spiral (mirror)
  ctx.beginPath();
  for (let i = 0; i <= points; i++) {
    const t = i / points;
    const angle = -t * Math.PI * 2 * spiralTurns - time * 0.0005;
    const dataIndex = Math.floor(t * data.length);
    const value = data[dataIndex] / 255;
    const r = radius * 0.3 + t * radius * 1.5 + value * 40 * sensitivity;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;

    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }

  ctx.strokeStyle = colors.secondary + '80';
  ctx.lineWidth = 1;
  ctx.shadowColor = colors.secondary;
  ctx.shadowBlur = 10;
  ctx.stroke();
  ctx.shadowBlur = 0;
}

function drawCenterOrb(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  colors: { primary: string; secondary: string; accent: string },
  avgEnergy: number,
  time: number,
  isPlaying: boolean
) {
  const orbRadius = radius * 0.4 + avgEnergy * 0.3;

  // Outer glow
  const glowGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius * 2);
  glowGradient.addColorStop(0, colors.primary + '30');
  glowGradient.addColorStop(0.5, colors.primary + '10');
  glowGradient.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, orbRadius * 2, 0, Math.PI * 2);
  ctx.fill();

  // Core orb
  const coreGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius);
  coreGradient.addColorStop(0, colors.primary + '80');
  coreGradient.addColorStop(0.7, colors.secondary + '40');
  coreGradient.addColorStop(1, colors.primary + '10');
  ctx.fillStyle = coreGradient;
  ctx.beginPath();
  ctx.arc(cx, cy, orbRadius, 0, Math.PI * 2);
  ctx.fill();

  // Rotating ring inside orb
  ctx.beginPath();
  ctx.arc(cx, cy, orbRadius * 0.7, time * 0.002, time * 0.002 + Math.PI * 1.5);
  ctx.strokeStyle = colors.accent + '60';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Pulse ring on beat
  if (isPlaying && avgEnergy > 80) {
    const pulseRadius = orbRadius + (avgEnergy - 80) * 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
    ctx.strokeStyle = colors.primary + '40';
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function drawOuterRings(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  colors: { primary: string; secondary: string },
  time: number,
  avgEnergy: number,
  data: Uint8Array
) {
  // Rotating dashed rings
  const rings = [
    { r: radius + 250, speed: 0.0002, dash: [4, 8] },
    { r: radius + 280, speed: -0.0003, dash: [2, 12] },
    { r: radius + 310, speed: 0.00015, dash: [8, 4] },
  ];

  rings.forEach((ring) => {
    const rotation = time * ring.speed;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rotation);

    ctx.beginPath();
    ctx.arc(0, 0, ring.r, 0, Math.PI * 2);
    ctx.strokeStyle = colors.primary + '10';
    ctx.lineWidth = 1;
    ctx.setLineDash(ring.dash);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.restore();
  });

  // Energy-reactive outer ring
  const outerRadius = radius + 200 + avgEnergy * 0.5;
  ctx.beginPath();
  ctx.arc(cx, cy, outerRadius, 0, Math.PI * 2);
  ctx.strokeStyle = colors.secondary + '15';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Small dots on outer ring
  const dotCount = 36;
  for (let i = 0; i < dotCount; i++) {
    const angle = (i / dotCount) * Math.PI * 2 + time * 0.0003;
    const dataIndex = Math.floor((i / dotCount) * data.length);
    const value = data[dataIndex] / 255;

    const x = cx + Math.cos(angle) * outerRadius;
    const y = cy + Math.sin(angle) * outerRadius;

    ctx.beginPath();
    ctx.arc(x, y, 1 + value * 2, 0, Math.PI * 2);
    ctx.fillStyle = colors.primary + Math.floor(value * 200).toString(16).padStart(2, '0');
    ctx.fill();
  }
}
