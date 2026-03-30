import { useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import StarsBackground from '../components/StarsBackground';

export default function ResultsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { role, mode, roastLevel, analysis, error } = location.state || { mode: 'Both' };
  const roastCardRef = useRef<HTMLDivElement>(null);

  const profData = analysis?.professional || {};
  const roastData = analysis?.roast || {};

  const showProfessional = mode === 'Professional' || mode === 'Both';
  const showRoast = mode === 'Roast' || mode === 'Both';
  const isBothMode = mode === 'Both';

  const [activeTab, setActiveTab] = useState<'professional' | 'roast'>(
    showProfessional ? 'professional' : 'roast'
  );
  const [fixedResume, setFixedResume] = useState<null | {
    rewrittenSummary: string;
    rewrittenBullets: string[];
    removedBuzzwords: string[];
    addedImpact: string;
  }>(null);
  const [fixLoading, setFixLoading] = useState(false);
  const [showFixModal, setShowFixModal] = useState(false);

  const handleFixResume = async () => {
    setFixLoading(true);
    setShowFixModal(true);
    try {
      if (profData.fixedResumeBullets?.length) {
        setFixedResume({
          rewrittenSummary: profData.overallImpression || '',
          rewrittenBullets: profData.fixedResumeBullets,
          removedBuzzwords: [],
          addedImpact: 'Metrics and impact added to transform vague duties into results-driven statements.'
        });
      } else {
        const res = await fetch('http://localhost:3001/api/fix-resume', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeText: profData.overallImpression, targetRole: role })
        });
        const data = await res.json();
        setFixedResume(data);
      }
    } catch {
      setFixedResume({
        rewrittenSummary: 'Could not rewrite at this time.',
        rewrittenBullets: profData.fixedResumeBullets || [],
        removedBuzzwords: [],
        addedImpact: ''
      });
    } finally {
      setFixLoading(false);
    }
  };


  const personalityEmoji: Record<string, string> = {
    'Buzzword Ninja': '🥷',
    'Overconfident Generalist': '🦚',
    'Underrated Builder': '🏗️',
    'Corporate Climber': '📈',
    'The Eternal Intern': '☕',
    'The Stack Overflow Hero': '🦸',
    'LinkedIn Philosopher': '🧘',
  };

  const substancePct = roastData.substanceDensity ?? (100 - (roastData.buzzwordDensity ?? 0));
  const buzzPct = roastData.buzzwordDensity ?? 0;

  // Error/Empty State handling
  if (error || !analysis) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
        <StarsBackground showMeteors={true} />
        <div className="z-10 max-w-md">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/50">
            <span className="material-symbols-outlined text-red-500 text-4xl">warning</span>
          </div>
          <h2 className="text-3xl font-headline font-bold mb-4">Analysis Failed</h2>
          <p className="text-white/60 mb-8 font-body">
            {error || "We couldn't generate your analysis. This usually happens if the resume couldn't be parsed or the AI was too intimidated by your profile."}
          </p>
          <button 
            onClick={() => navigate('/')}
            className="px-8 py-3 bg-white text-black rounded-full font-bold hover:scale-105 transition-all active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print { .no-print { display: none !important; } body { background: #000000 !important; } }
      `}</style>

      <div className="min-h-screen flex flex-col bg-black text-on-surface font-body relative overflow-x-hidden">
        <StarsBackground showMeteors={false} />
        
        {/* Navbar */}
        <nav className="no-print flex justify-between items-center px-6 h-20 border-b border-white/5 bg-black/40 backdrop-blur-xl sticky top-0 z-50">
          <div onClick={() => navigate('/')} className="flex items-center gap-3 cursor-pointer group">
            <img src="/logo.png" alt="Logo" className="w-10 h-10 object-contain rounded-lg shadow-[0_0_15px_rgba(139,92,246,0.3)] group-hover:scale-110 transition-transform" />
            <div className="text-xl font-black tracking-tighter text-on-surface font-headline transition-colors group-hover:text-primary">
              HireMeOrRoastMe
            </div>
          </div>
          <button onClick={() => navigate('/')} className="px-5 py-2 rounded-full border border-white/10 text-sm font-label hover:bg-white/5 transition-all text-white/70">
            New Analysis
          </button>
        </nav>

        {/* Error */}
        {error && (
          <div className="m-6 bg-error-container text-on-error-container p-4 rounded-xl text-center">
            <p className="font-bold">Analysis Failed</p>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {!error && (
          <div className="flex-1 flex flex-col max-w-4xl w-full mx-auto px-6 py-6 gap-6">

            {/* Tab Bar — only shown in Both mode */}
            {isBothMode && (
              <div className="no-print flex rounded-2xl bg-surface-container-high/60 p-1.5 gap-1.5 border border-white/5">
                <button
                  onClick={() => setActiveTab('professional')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-headline font-bold text-sm transition-all duration-300 ${
                    activeTab === 'professional'
                      ? 'bg-primary text-on-primary shadow-[0_0_20px_rgba(173,198,255,0.3)]'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">work</span>
                  Professional Verdict
                </button>
                <button
                  onClick={() => setActiveTab('roast')}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-headline font-bold text-sm transition-all duration-300 ${
                    activeTab === 'roast'
                      ? 'bg-tertiary text-[#131313] shadow-[0_0_20px_rgba(255,181,160,0.3)]'
                      : 'text-on-surface-variant hover:text-on-surface hover:bg-white/5'
                  }`}
                >
                  <span className="material-symbols-outlined text-lg">local_fire_department</span>
                  Savage Roast
                  {roastLevel && <span className="ml-1 px-2 py-0.5 rounded-full bg-black/20 text-xs uppercase">{roastLevel}</span>}
                </button>
              </div>
            )}

            {/* ── PROFESSIONAL TAB ── */}
            {showProfessional && (!isBothMode || activeTab === 'professional') && (
              <div className="flex flex-col gap-5">
                {!isBothMode && (
                  <div className="flex items-center gap-3 text-primary">
                    <span className="material-symbols-outlined text-3xl">work</span>
                    <h2 className="text-3xl font-headline font-bold">Professional Verdict</h2>
                  </div>
                )}

                {/* Scores */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-panel p-5 rounded-xl border border-primary/20 bg-primary/5 text-center">
                    <p className="font-label text-xs uppercase text-primary mb-1">Hireability Score</p>
                    <div className="text-5xl font-headline font-extrabold text-on-surface">{profData.hireabilityScore ?? '--'}<span className="text-xl text-outline">/100</span></div>
                  </div>
                  <div className="glass-panel p-5 rounded-xl border border-white/5 text-center">
                    <p className="font-label text-xs uppercase text-outline mb-1">Resume Score</p>
                    <div className="text-5xl font-headline font-extrabold text-on-surface">{profData.resumeScore ?? '--'}<span className="text-xl text-outline">/100</span></div>
                  </div>
                </div>

                {/* Reality vs Perception */}
                {(profData.selfPerception || profData.recruiterPerception) && (
                  <div className="glass-panel rounded-xl border border-white/5 overflow-hidden">
                    <div className="px-6 pt-5 pb-3 border-b border-white/5">
                      <h3 className="font-headline font-semibold text-base flex items-center gap-2">
                        <span className="material-symbols-outlined text-xl text-primary">compare</span>
                        Reality vs Perception
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">
                      <div className="p-5 space-y-2">
                        <p className="font-label text-xs uppercase tracking-widest text-primary/70">What You Think You're Saying</p>
                        <p className="text-sm text-on-surface-variant leading-relaxed">{profData.selfPerception || '—'}</p>
                      </div>
                      <div className="p-5 space-y-2">
                        <p className="font-label text-xs uppercase tracking-widest text-tertiary/70">What Recruiters Actually See</p>
                        <p className="text-sm text-on-surface-variant leading-relaxed">{profData.recruiterPerception || '—'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Overall Impression */}
                <div className="glass-panel p-6 rounded-xl border border-white/5">
                  <h3 className="font-headline font-semibold text-lg mb-3">Overall Impression</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed">{profData.overallImpression || '—'}</p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-3">
                    <h3 className="font-headline font-semibold text-sm uppercase tracking-wide text-[#7FC37E]">Strengths</h3>
                    <ul className="space-y-2 text-sm text-on-surface-variant list-disc pl-4 marker:text-[#7FC37E]">
                      {(profData.strengths || []).map((s: string, i: number) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                  <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-3">
                    <h3 className="font-headline font-semibold text-sm uppercase tracking-wide text-[#FFB4AB]">Weaknesses</h3>
                    <ul className="space-y-2 text-sm text-on-surface-variant list-disc pl-4 marker:text-[#FFB4AB]">
                      {(profData.weaknesses || []).map((w: string, i: number) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                </div>

                {/* Skill Gap Engine */}
                {(profData.missingSkills?.length || profData.careerDistance) && (
                  <div className="glass-panel p-6 rounded-xl border border-white/5 space-y-4">
                    <h3 className="font-headline font-semibold text-base flex items-center gap-2">
                      <span className="material-symbols-outlined text-xl text-secondary">psychology_alt</span>
                      Skill Gap Engine
                    </h3>
                    {profData.careerDistance && (
                      <div className="space-y-2">
                        <p className="font-label text-xs uppercase tracking-widest text-outline">Career Distance</p>
                        <div className="w-full bg-surface-container-highest rounded-full h-2">
                          <div className="bg-gradient-to-r from-secondary to-primary h-2 rounded-full w-[60%]"></div>
                        </div>
                        <p className="text-xs text-on-surface-variant font-label">{profData.careerDistance}</p>
                      </div>
                    )}
                    {profData.missingSkills?.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-label text-xs uppercase tracking-widest text-outline">Missing Skills</p>
                        <div className="flex flex-wrap gap-2">
                          {profData.missingSkills.map((skill: string, i: number) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-error/10 border border-error/30 text-error text-xs font-label">+ {skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {profData.suggestedSkills?.length > 0 && (
                      <div className="space-y-2">
                        <p className="font-label text-xs uppercase tracking-widest text-outline">Suggested Add-ons</p>
                        <div className="flex flex-wrap gap-2">
                          {profData.suggestedSkills.map((skill: string, i: number) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-label">{skill}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col gap-4">
                  <button onClick={handleFixResume} className="no-print py-4 bg-gradient-to-r from-primary to-secondary text-on-primary font-headline font-bold text-sm rounded-xl flex items-center justify-center gap-2 hover:brightness-110 hover:scale-[1.01] active:scale-95 transition-all shadow-[0_0_30px_rgba(173,198,255,0.2)]">
                    <span className="material-symbols-outlined">auto_fix_high</span>
                    Fix My Resume with AI
                  </button>
                </div>
              </div>
            )}

            {/* ── ROAST TAB ── */}
            {showRoast && (!isBothMode || activeTab === 'roast') && (
              <div className="flex flex-col gap-5" ref={roastCardRef}>
                {!isBothMode && (
                  <div className="flex items-center gap-3 text-tertiary">
                    <span className="material-symbols-outlined text-3xl">local_fire_department</span>
                    <h2 className="text-3xl font-headline font-bold">Savage Roast</h2>
                    {roastLevel && <span className="ml-auto px-3 py-1 rounded-full bg-tertiary/20 text-tertiary text-xs font-label uppercase">{roastLevel} Heat</span>}
                  </div>
                )}

                {/* Opening Punchline */}
                <div className="glass-panel p-6 rounded-xl border border-tertiary/20 bg-tertiary/5 relative overflow-hidden">
                  <span className="material-symbols-outlined absolute -right-6 -top-6 text-[120px] text-tertiary/10 rotate-12">format_quote</span>
                  <p className="font-headline text-2xl font-bold leading-tight relative text-on-surface">
                    "{roastData.openingPunchline || `Ah, another 'Synergy-Driven Innovator' who thinks changing a button color makes them a Senior ${role || 'Engineer'}.`}"
                  </p>
                </div>

                {/* Personality Type */}
                {roastData.personalityType && (
                  <div className="glass-panel p-6 rounded-xl border border-secondary/20 bg-secondary/5 flex items-center gap-5">
                    <div className="text-5xl">{personalityEmoji[roastData.personalityType] || '🎭'}</div>
                    <div className="flex-1 space-y-1">
                      <p className="font-label text-xs uppercase tracking-widest text-secondary/70">Your Personality Type</p>
                      <p className="font-headline text-2xl font-black text-on-surface">{roastData.personalityType}</p>
                      {roastData.personalityDescription && (
                        <p className="text-sm text-on-surface-variant">{roastData.personalityDescription}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Buzzword Density */}
                <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-3">
                  <h4 className="font-headline text-sm font-semibold text-tertiary uppercase tracking-widest flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">analytics</span>
                    Buzzword Density Meter
                  </h4>
                  <div className="flex rounded-full overflow-hidden h-5 w-full">
                    <div className="bg-tertiary transition-all duration-700 flex items-center justify-center" style={{ width: `${buzzPct}%` }}>
                      {buzzPct > 15 && <span className="text-[9px] font-label font-bold text-[#131313] px-1">FLUFF</span>}
                    </div>
                    <div className="bg-[#7FC37E] transition-all duration-700 flex items-center justify-center" style={{ width: `${substancePct}%` }}>
                      {substancePct > 15 && <span className="text-[9px] font-label font-bold text-[#131313] px-1">SUBSTANCE</span>}
                    </div>
                  </div>
                  <div className="flex justify-between text-xs font-label">
                    <span className="text-tertiary">{buzzPct}% Fluff</span>
                    <span className="text-[#7FC37E]">{substancePct}% Substance</span>
                  </div>
                </div>

                {/* Vibe Score */}
                <div className="glass-panel p-5 rounded-xl border border-white/5 text-center">
                  <h4 className="font-headline text-sm font-semibold text-tertiary uppercase tracking-widest mb-2">Vibe Score</h4>
                  <div className="text-5xl font-headline font-black text-on-surface">{roastData.vibeScore ?? '--'}<span className="text-xl font-normal text-outline">/100</span></div>
                </div>

                {/* Reality Check & Skills Roast */}
                <div className="space-y-4">
                  <div className="glass-panel p-5 rounded-lg border-l-4 border-l-tertiary bg-surface-container-high/50">
                    <p className="text-sm text-on-surface"><span className="font-bold text-tertiary">Reality Check: </span>{roastData.realityCheck || '—'}</p>
                  </div>
                  <div className="glass-panel p-5 rounded-lg border-l-4 border-l-error bg-surface-container-high/50">
                    <p className="text-sm text-on-surface"><span className="font-bold text-error">Skills Roast: </span>{roastData.skillsRoast || '—'}</p>
                  </div>
                </div>


              </div>
            )}
          </div>
        )}
      </div>

      {/* Fix My Resume Modal */}
      {showFixModal && (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowFixModal(false)}>
          <div className="glass-panel border border-primary/20 rounded-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto p-8 space-y-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h2 className="font-headline text-2xl font-bold text-on-surface flex items-center gap-3">
                <span className="material-symbols-outlined text-primary">auto_fix_high</span>
                AI-Fixed Resume
              </h2>
              <button onClick={() => setShowFixModal(false)} className="text-outline hover:text-on-surface transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {fixLoading ? (
              <div className="flex flex-col items-center gap-4 py-12">
                <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
                <p className="text-on-surface-variant font-label">Rewriting your resume with AI...</p>
              </div>
            ) : fixedResume ? (
              <>
                {fixedResume.rewrittenSummary && (
                  <div className="space-y-2">
                    <p className="font-label text-xs uppercase tracking-widest text-primary">Rewritten Summary</p>
                    <div className="glass-panel p-4 rounded-lg border border-primary/10 text-sm text-on-surface leading-relaxed">{fixedResume.rewrittenSummary}</div>
                  </div>
                )}
                {fixedResume.rewrittenBullets?.length > 0 && (
                  <div className="space-y-3">
                    <p className="font-label text-xs uppercase tracking-widest text-primary">Rewritten Bullet Points</p>
                    <ul className="space-y-3">
                      {fixedResume.rewrittenBullets.map((bullet, i) => (
                        <li key={i} className="glass-panel p-4 rounded-lg border-l-4 border-l-primary bg-primary/5 text-sm text-on-surface flex gap-3">
                          <span className="material-symbols-outlined text-primary text-base mt-0.5 shrink-0">check_circle</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {fixedResume.removedBuzzwords?.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-label text-xs uppercase tracking-widest text-error">Buzzwords Removed</p>
                    <div className="flex flex-wrap gap-2">
                      {fixedResume.removedBuzzwords.map((bw, i) => (
                        <span key={i} className="px-3 py-1 rounded-full bg-error/10 border border-error/20 text-error text-xs font-label line-through">{bw}</span>
                      ))}
                    </div>
                  </div>
                )}
                {fixedResume.addedImpact && (
                  <div className="glass-panel p-4 rounded-lg border border-white/5 text-sm text-on-surface-variant">
                    <span className="font-bold text-[#7FC37E]">Impact Added: </span>{fixedResume.addedImpact}
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
