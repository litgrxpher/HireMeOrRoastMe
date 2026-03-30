import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ModeSelectionPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, linkedinUrl } = location.state || {};
  
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [roastLevel, setRoastLevel] = useState<string>("Medium");

  const handleAnalyze = () => {
    if (!selectedMode) return;
    navigate('/loading', { state: { role, linkedinUrl, mode: selectedMode, roastLevel } });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative">
      <div className="absolute inset-0 pointer-events-none overflow-hidden mesh-glow" />
      
      <div className="max-w-4xl w-full z-10 glass-panel p-10 rounded-2xl border border-white/10 shadow-2xl text-center">
        <h2 className="text-4xl font-headline font-bold mb-4">Choose Your Fate</h2>
        <p className="text-on-surface-variant font-body mb-12">Select how you want to be evaluated.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Professional Review */}
          <div 
            onClick={() => setSelectedMode('Professional')}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-2 ${
              selectedMode === 'Professional' 
                ? 'border-primary bg-primary/10 shadow-[0_0_30px_rgba(173,198,255,0.2)]' 
                : 'border-white/5 bg-surface-container-highest/20 hover:border-primary/50'
            }`}
          >
            <span className="material-symbols-outlined text-4xl text-primary mb-4">work</span>
            <h3 className="text-2xl font-headline font-bold text-primary mb-2">Professional</h3>
            <p className="text-sm text-on-surface-variant">Constructive feedback, skills analysis, and actionable insights to get hired.</p>
          </div>

          {/* Savage Roast */}
          <div 
            onClick={() => setSelectedMode('Roast')}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-2 ${
              selectedMode === 'Roast' 
                ? 'border-tertiary bg-tertiary/10 shadow-[0_0_30px_rgba(255,181,160,0.2)]' 
                : 'border-white/5 bg-surface-container-highest/20 hover:border-tertiary/50'
            }`}
          >
            <span className="material-symbols-outlined text-4xl text-tertiary mb-4">local_fire_department</span>
            <h3 className="text-2xl font-headline font-bold text-tertiary mb-2">Savage Roast</h3>
            <p className="text-sm text-on-surface-variant">We tear your career choices apart. No mercy, purely for entertainment and reality checks.</p>
          </div>

          {/* Both */}
          <div 
            onClick={() => setSelectedMode('Both')}
            className={`p-6 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:-translate-y-2 ${
              selectedMode === 'Both' 
                ? 'border-secondary bg-secondary/10 shadow-[0_0_30px_rgba(207,189,255,0.2)]' 
                : 'border-white/5 bg-surface-container-highest/20 hover:border-secondary/50'
            }`}
          >
            <span className="material-symbols-outlined text-4xl text-secondary mb-4">splitscreen</span>
            <h3 className="text-2xl font-headline font-bold text-secondary mb-2">Split Personality</h3>
            <p className="text-sm text-on-surface-variant">The best (or worst) of both worlds. A split screen of true feedback and utter humiliation.</p>
          </div>
        </div>

        {/* Roast Level (Visible only if Roast or Both is selected) */}
        {(selectedMode === 'Roast' || selectedMode === 'Both') && (
          <div className="mb-12 animate-fade-in text-left max-w-md mx-auto">
            <label className="font-label text-sm uppercase tracking-widest text-outline block mb-4 text-center">Select Roast Intensity</label>
            <div className="flex bg-surface-container-highest/30 rounded-full p-1 border border-white/5">
              {['Light', 'Medium', 'Brutal'].map(level => (
                <button
                  key={level}
                  onClick={() => setRoastLevel(level)}
                  className={`flex-1 py-2 rounded-full font-headline font-semibold text-sm transition-all ${
                    roastLevel === level 
                      ? 'bg-tertiary text-on-tertiary shadow-md' 
                      : 'text-on-surface-variant hover:bg-surface-container-highest/50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        )}

        <button 
          onClick={handleAnalyze}
          disabled={!selectedMode}
          className={`w-full max-w-md mx-auto py-4 rounded-full font-headline font-extrabold text-lg transition-all flex justify-center items-center gap-2 ${
            selectedMode
              ? 'bg-on-surface text-surface hover:scale-105 active:scale-95 cursor-pointer'
              : 'bg-surface-container-highest text-outline cursor-not-allowed'
          }`}
        >
          {selectedMode ? 'Analyze Profile' : 'Select a Mode'}
          {selectedMode && <span className="material-symbols-outlined">arrow_forward</span>}
        </button>
      </div>
    </div>
  );
}
