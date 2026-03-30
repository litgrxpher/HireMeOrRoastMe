import { useEffect, useRef } from 'react';

interface StarsBackgroundProps {
  showMeteors?: boolean;
}

export default function StarsBackground({ showMeteors = true }: StarsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    type Star = { x: number; y: number; r: number; v: number; a: number };
    type Meteor = { x: number; y: number; vx: number; vy: number; len: number; life: number; maxLife: number };

    // Background Stars
    const stars: Star[] = Array.from({ length: 180 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 0.7 + 0.2,
      v: Math.random() * 0.04 + 0.02,
      a: Math.random()
    }));

    let meteors: Meteor[] = [];
    const spawnMeteor = () => {
      const x = Math.random() * canvas.width;
      const y = Math.random() * (canvas.height * 0.3);
      const vx = 4 + Math.random() * 7;
      const vy = 2 + Math.random() * 4;
      const life = 60 + Math.random() * 40;
      meteors.push({ x, y, vx, vy, len: 40 + Math.random() * 60, life, maxLife: life });
    };

    let raf: number;
    let meteorTimer = 0;

    const tick = () => {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Subtle glow
      const grad = ctx.createRadialGradient(canvas.width/2, canvas.height/2, 0, canvas.width/2, canvas.height/2, canvas.width);
      grad.addColorStop(0, 'rgba(124, 58, 237, 0.04)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Stars logic
      for (const s of stars) {
        s.y += s.v;
        if (s.y > canvas.height) s.y = 0;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${Math.abs(Math.sin(Date.now() * 0.0008 * s.a)) * 0.4 + 0.2})`;
        ctx.fill();
      }

      // Meteors logic (Frequent & Multiple)
      if (showMeteors) {
        meteorTimer++;
        if (meteorTimer > 15) { // Spawn chance every 15 frames instead of 120
          if (Math.random() > 0.8) { // 20% chance to spawn at least one
            const count = Math.floor(Math.random() * 2) + 1; // Sometimes spawn 2 at once
            for (let k = 0; k < count; k++) spawnMeteor();
          }
          meteorTimer = 0;
        }

        for (let i = meteors.length - 1; i >= 0; i--) {
          const m = meteors[i];
          m.x += m.vx; m.y += m.vy; m.life--;
          if (m.life <= 0 || m.x > canvas.width || m.y > canvas.height) {
            meteors.splice(i, 1); continue;
          }
          const alpha = m.life / m.maxLife;
          const mGrad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 15, m.y - m.vy * 15);
          mGrad.addColorStop(0, `rgba(167, 139, 250, ${alpha * 0.85})`);
          mGrad.addColorStop(1, 'rgba(139, 92, 246, 0)');
          ctx.beginPath();
          ctx.strokeStyle = mGrad;
          ctx.lineWidth = 2; // Slightly thicker
          ctx.moveTo(m.x, m.y);
          ctx.lineTo(m.x - m.vx * 15, m.y - m.vy * 15);
          ctx.stroke();
        }
      }

      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(raf);
    };
  }, [showMeteors]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 z-0 pointer-events-none" 
      style={{ background: '#000' }}
    />
  );
}
