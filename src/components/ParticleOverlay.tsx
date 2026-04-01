import { useEffect, useRef } from 'react';
import { ColorTheme, THEMES } from '../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  hue: number;
}

interface Props {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  theme: ColorTheme;
  analyserNode: AnalyserNode | null;
  isPlaying: boolean;
}

export default function ParticleOverlay({
  canvasRef,
  theme,
  analyserNode,
  isPlaying,
}: Props) {
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>(0);

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

    const spawnParticle = (w: number, h: number, energy: number) => {
      const cx = w / 2;
      const cy = h / 2;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.5 + energy * 0.02;
      const dist = Math.min(w, h) * 0.15 + Math.random() * 100;

      particlesRef.current.push({
        x: cx + Math.cos(angle) * dist,
        y: cy + Math.sin(angle) * dist,
        vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 0.5,
        vy: Math.sin(angle) * speed + (Math.random() - 0.5) * 0.5,
        life: 0,
        maxLife: 60 + Math.random() * 120,
        size: 1 + Math.random() * 2 + energy * 0.02,
        hue: Math.random() * 60,
      });
    };

    const draw = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const themeColors = THEMES[theme];

      ctx.clearRect(0, 0, w, h);

      let energy = 0;
      if (analyserNode && isPlaying) {
        const data = new Uint8Array(analyserNode.frequencyBinCount);
        analyserNode.getByteFrequencyData(data);
        energy = data.reduce((a, b) => a + b, 0) / data.length;
      }

      // Spawn particles based on energy
      if (isPlaying && energy > 20) {
        const spawnCount = Math.floor(energy / 30);
        for (let i = 0; i < spawnCount; i++) {
          spawnParticle(w, h, energy);
        }
      }

      // Update and draw particles
      particlesRef.current = particlesRef.current.filter((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life++;

        const lifeRatio = p.life / p.maxLife;
        const alpha = Math.sin(lifeRatio * Math.PI) * 0.8;

        if (alpha <= 0) return false;

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - lifeRatio * 0.5), 0, Math.PI * 2);

        const colorIndex = Math.floor(p.hue / 60) % themeColors.gradient.length;
        const color = themeColors.gradient[colorIndex];
        ctx.fillStyle = color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.shadowColor = color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;

        return true;
      });

      // Limit particles
      if (particlesRef.current.length > 500) {
        particlesRef.current = particlesRef.current.slice(-500);
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    animationRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef, theme, analyserNode, isPlaying]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
      style={{ width: '100%', height: '100%' }}
    />
  );
}
