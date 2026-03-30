import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ── CSS keyframes injected once ──
const STYLES = `
  @keyframes titleReveal {
    0%   { opacity: 0; filter: blur(12px); transform: translateY(60px) scale(0.95); }
    100% { opacity: 1; filter: blur(0px);  transform: translateY(0px) scale(1); }
  }
  @keyframes subReveal {
    0%   { opacity: 0; filter: blur(8px);  transform: translateY(30px); }
    100% { opacity: 1; filter: blur(0px);  transform: translateY(0px); }
  }
  @keyframes btnReveal {
    0%   { opacity: 0; transform: translateY(20px); }
    100% { opacity: 1; transform: translateY(0px); }
  }
  @keyframes scrollArrow {
    0%, 100% { transform: translateX(-50%) translateY(0);   opacity: 0.3; }
    50%       { transform: translateX(-50%) translateY(8px); opacity: 0.7; }
  }
  .reveal { opacity: 0; transform: translateY(36px); transition: opacity 0.75s cubic-bezier(.22,1,.36,1), transform 0.75s cubic-bezier(.22,1,.36,1); }
  .reveal.visible { opacity: 1; transform: translateY(0); }
  
  .hero-orb {
    width: 600px;
    height: 300px;
    border: 2px solid #8b5cf6;
    box-sizing: border-box;
    border-radius: 50%;
    display: grid;
    animation: l2 6s infinite linear;
    filter: blur(10px);
    opacity: 0.4;
    box-shadow: 0 0 45px rgba(139, 92, 246, 0.25);
  }
  .hero-orb:before,
  .hero-orb:after {
    content: "";
    grid-area: 1/1;
    border: inherit;
    border-radius: 50%;
    animation: inherit;
    animation-duration: 10s;
  }
  .hero-orb:after {
    --s:-1;
    animation-duration: 5s;
  }
  @keyframes l2 {
     100% {transform:rotate(calc(var(--s,1)*1turn))}
  }
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-4px); }
    75% { transform: translateX(4px); }
  }
  .animate-shake { animation: shake 0.2s ease-in-out 0s 2; }
`;

export default function LandingPage() {
  const navigate   = useNavigate();
  const [targetRole, setTargetRole] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef    = useRef<HTMLDivElement>(null);
  const heroRef    = useRef<HTMLDivElement>(null);
  const canvasRef  = useRef<HTMLCanvasElement>(null);


  const handleStart = () => {
    setError(null);

    if (!targetRole.trim()) {
      setError('Please enter a target role.');
      return;
    }
    if (!linkedinUrl.trim() && !selectedFile) {
      setError('Please provide a LinkedIn URL or upload a resume.');
      return;
    }

    navigate('/mode', { 
      state: { 
        role: targetRole.trim(), 
        linkedinUrl: linkedinUrl.trim(),
        resumeFile: selectedFile // Note: File objects might not persist well in history state depending on browser, but fine for now.
      } 
    });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };
  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── Particle canvas + Meteors ──
  // ── Particle canvas (No Meteors) ──
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    // Mouse tracking
    const mouse = { x: 0, y: 0, active: false };
    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onMouseLeave = () => { mouse.active = false; };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseleave', onMouseLeave);

    type P = { x: number; y: number; vx: number; vy: number; r: number; a: number };
    const pts: P[] = Array.from({ length: 110 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.22,
      vy: (Math.random() - 0.5) * 0.22,
      r: Math.random() * 1.1 + 0.3,
      a: Math.random() * 0.45 + 0.12,
    }));

    let raf: number;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const mouseRange = 180;

      for (let i = 0; i < pts.length; i++) {
        const pi = pts[i];
        if (mouse.active) {
          const dx = pi.x - mouse.x;
          const dy = pi.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < mouseRange) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(192, 132, 252, ${0.5 * (1 - dist / mouseRange)})`;
            ctx.lineWidth = 1.5;
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();
            pi.a = Math.min(0.9, pi.a + 0.05);
            const force = (mouseRange - dist) / mouseRange;
            pi.x += (dx / dist) * force * 3.5;
            pi.y += (dy / dist) * force * 3.5;
          } else if (pi.a > 0.4) {
            pi.a -= 0.01;
          }
        }

        for (let j = i + 1; j < pts.length; j++) {
          const pj = pts[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 130) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.13 * (1 - d / 130)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(pi.x, pi.y);
            ctx.lineTo(pj.x, pj.y);
            ctx.stroke();
          }
        }
      }

      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 160, 255, ${p.a})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    tick();
    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(raf);
    };
  }, []);

  // ── Scroll-driven: hero parallax + glow follow + reveal ──
  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;
    const vh = window.innerHeight;

    const onScroll = () => {
      const sy = window.scrollY;
      const pct = Math.min(sy / vh, 1); // 0→1 over one viewport

      // 1. Hero content: float up + fade out
      const heroInner = hero.querySelector<HTMLElement>('.hero-inner');
      if (heroInner) {
        heroInner.style.transform = `translateY(${pct * -80}px)`;
        heroInner.style.opacity   = `${1 - pct * 1.6}`;
      }

      // 2. Scroll-cue arrow: fade out fast
      const arrow = hero.querySelector<HTMLElement>('.scroll-cue');
      if (arrow) arrow.style.opacity = `${Math.max(0, 1 - pct * 3)}`;


    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── IntersectionObserver: stagger-reveal form children ──
  useEffect(() => {
    const targets = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.delay ?? '0';
            setTimeout(() => el.classList.add('visible'), Number(delay));
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);

  return (
    <div className="w-full min-h-screen">
      <style>{STYLES}</style>

      {/* ── Fixed particle background layer ── */}
      <div className="fixed inset-0 z-0 overflow-hidden" style={{ background: '#050507' }}>
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
        {/* Bottom right indigo - keeps the depth while scrolling */}
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(ellipse, rgba(99,102,241,0.1) 0%, transparent 70%)' }}
        />
      </div>

      {/* ── Nav ── */}
      <nav className="fixed top-0 w-full z-50 flex items-center px-8 h-16">
        <div className="text-lg font-black tracking-tight text-white font-headline">
          HireMeOrRoastMe
        </div>
      </nav>

      {/* ── HERO ── */}
      <div ref={heroRef} className="relative z-10 h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        
        {/* Whirling Orb Loader Behind Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" style={{ zIndex: -1 }}>
          <div className="hero-orb"></div>
        </div>

        {/* Static Glow Patch - reduced opacity to blend with orb */}
        <div 
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full pointer-events-none"
          style={{ 
            background: 'radial-gradient(ellipse, rgba(124,58,237,0.15) 0%, transparent 70%)',
            zIndex: -2 
          }}
        />

        {/* Wrapper that moves on scroll */}
        <div className="hero-inner flex flex-col items-center" style={{ willChange: 'transform, opacity' }}>
          <h1
            className="font-headline font-black text-white leading-[1.05] tracking-tight mb-6"
            style={{
              fontSize: 'clamp(3rem, 8vw, 6rem)',
              animation: 'titleReveal 1.2s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            See How the World<br />
            <span style={{
              background: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 40%, #67e8f9 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Sees Your Career.
            </span>
          </h1>

          <p
            className="text-white/40 text-lg md:text-xl max-w-xl mb-10 font-body leading-relaxed"
            style={{ animation: 'subReveal 1s 0.2s cubic-bezier(0.16, 1, 0.3, 1) both' }}
          >
            Upload your resume or LinkedIn. Get a professional verdict — or a{' '}
            <span className="text-purple-400">soul-crushing roast.</span>
          </p>

          <button
            onClick={scrollToForm}
            className="px-10 py-4 rounded-full font-headline font-bold text-white text-base transition-all hover:scale-105 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, #7c3aed, #6366f1)',
              boxShadow: '0 0 40px rgba(124,58,237,0.4)',
              animation: 'btnReveal 0.8s 0.4s cubic-bezier(0.16, 1, 0.3, 1) both',
            }}
          >
            Get My Verdict
          </button>
        </div>

        {/* Animated scroll arrow */}
        <div
          className="scroll-cue absolute bottom-8 left-1/2 flex flex-col items-center gap-1 text-white/25 cursor-pointer"
          onClick={scrollToForm}
          style={{ animation: 'scrollArrow 2s ease-in-out infinite, fadeIn 1s 0.8s both' }}
        >
          <span className="font-label text-[10px] tracking-[0.2em] uppercase">Scroll</span>
          <span className="material-symbols-outlined text-lg">keyboard_arrow_down</span>
        </div>
      </div>

      {/* ── FORM SECTION ── */}
      <div ref={formRef} className="relative z-10 min-h-screen flex items-center justify-center px-6 py-28">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse, rgba(124,58,237,0.09) 0%, transparent 70%)' }}
        />

        <div className="relative max-w-lg w-full">

          {/* Heading reveal */}
          <div className="text-center mb-10 reveal" data-delay="0">
            <p className="text-purple-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Step 1 of 2</p>
            <h2 className="font-headline font-black text-white text-3xl md:text-4xl tracking-tight mb-3">
              Drop your profile.<br />We'll deliver the truth.
            </h2>
            <p className="text-white/30 text-sm font-body">No login required. Results in seconds.</p>
          </div>

          {/* Form card reveal */}
          <div
            className="reveal rounded-2xl p-8 space-y-5"
            data-delay="120"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '0 0 0 1px rgba(124,58,237,0.1), 0 40px 80px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Target Role */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold">Target Role</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-purple-400/60 text-lg">work</span>
                <input
                  className="w-full py-3.5 pl-11 pr-4 rounded-xl text-white text-sm font-body outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.08)'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none'; }}
                  placeholder="e.g. Senior Software Engineer…"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                />
              </div>
            </div>

            {/* LinkedIn */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold">LinkedIn URL</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-purple-400/60 text-lg">link</span>
                <input
                  className="w-full py-3.5 pl-11 pr-4 rounded-xl text-white text-sm font-body outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(139,92,246,0.08)'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.boxShadow = 'none'; }}
                  placeholder="https://linkedin.com/in/yourname"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
              <span className="text-[10px] text-white/20 font-semibold tracking-widest uppercase">or</span>
              <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }}></div>
            </div>

            {/* Resume Upload */}
            <div className="space-y-1.5">
              <label className="block text-[10px] uppercase tracking-[0.2em] text-white/30 font-semibold">Upload Resume</label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={onFileChange}
                className="hidden"
                accept=".pdf,.docx"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`rounded-xl p-7 flex flex-col items-center justify-center cursor-pointer group transition-all ${selectedFile ? 'border-primary/40 bg-primary/5' : 'border-white/10 bg-white/2'}`}
                style={{ border: '1.5px dashed' }}
                onMouseEnter={(e) => { if (!selectedFile) { e.currentTarget.style.borderColor = 'rgba(139,92,246,0.4)'; e.currentTarget.style.background = 'rgba(139,92,246,0.04)'; } }}
                onMouseLeave={(e) => { if (!selectedFile) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; } }}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 transition-transform group-hover:scale-110 ${selectedFile ? 'bg-primary/20' : 'bg-white/5'}`}>
                  <span className={`material-symbols-outlined text-xl ${selectedFile ? 'text-primary' : 'text-white/40'}`}>
                    {selectedFile ? 'check_circle' : 'upload_file'}
                  </span>
                </div>
                {selectedFile ? (
                  <>
                    <p className="text-white text-sm font-semibold truncate max-w-full px-4">{selectedFile.name}</p>
                    <p className="text-primary/60 text-[10px] mt-1 font-label uppercase tracking-widest">File Selected</p>
                  </>
                ) : (
                  <>
                    <p className="text-white/50 text-sm font-semibold">PDF or DOCX</p>
                    <p className="text-white/20 text-xs mt-0.5">Click to browse</p>
                  </>
                )}
              </div>
            </div>

            {/* CTA + Error */}
            <div className="space-y-4">
              <button
                onClick={handleStart}
                className="w-full py-4 rounded-xl font-headline font-bold text-white text-base transition-all hover:scale-[1.02] hover:brightness-110 active:scale-95 flex items-center justify-center gap-2"
                style={{
                  background: 'linear-gradient(135deg, #7c3aed 0%, #6366f1 100%)',
                  boxShadow: '0 0 40px rgba(124,58,237,0.35), 0 1px 0 rgba(255,255,255,0.1) inset',
                }}
              >
                Let's Begin
                <span className="material-symbols-outlined text-xl">bolt</span>
              </button>

              {error && (
                <div className="bg-error/10 border border-error/20 p-3 rounded-lg flex items-center gap-2 text-error text-xs font-medium animate-shake">
                  <span className="material-symbols-outlined text-base">error</span>
                  {error}
                </div>
              )}
            </div>

            <p className="text-white/15 text-[10px] text-center tracking-widest uppercase">
              No account required · Your data is never stored
            </p>
          </div>

          {/* Feature row reveal */}
          <div className="reveal flex items-center justify-center gap-8 mt-8" data-delay="240">
            {[
              { icon: 'psychology',           label: 'AI-Driven Analysis' },
              { icon: 'local_fire_department', label: 'Savage Roast Mode'  },
              { icon: 'shield',                label: 'Private & Secure'   },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-1.5 text-white/25">
                <span className="material-symbols-outlined text-base text-purple-400/50">{f.icon}</span>
                <span className="text-xs font-body">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 py-8 text-center" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <p className="text-white/15 text-xs tracking-widest uppercase font-body">
          © 2024 HireMeOrRoastMe · Powered by Gemini AI
        </p>
      </div>
    </div>
  );
}
