import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Particles, { initParticlesEngine } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';
import LandingPage from './pages/LandingPage';
import ModeSelectionPage from './pages/ModeSelectionPage';
import LoadingScreen from './pages/LoadingScreen';
import ResultsPage from './pages/ResultsPage';

function App() {
  const [init, setInit] = useState(false);

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine);
    }).then(() => {
      setInit(true);
    });
  }, []);

  return (
    <Router>
      <div className="bg-surface text-on-surface font-body animated-bg min-h-screen selection:bg-primary selection:text-on-primary relative">
        {init && (
          <Particles
            id="tsparticles"
            className="absolute inset-0 pointer-events-none z-0 mix-blend-screen"
            options={{
              background: { color: { value: "transparent" } },
              fpsLimit: 60,
              particles: {
                color: { value: ["#adc6ff", "#ffb5a0", "#cfbdff"] },
                links: { color: "#adc6ff", distance: 150, enable: true, opacity: 0.2, width: 1 },
                move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: true, speed: 0.8, straight: false },
                number: { density: { enable: true, width: 800 }, value: 40 },
                opacity: { value: 0.3 },
                shape: { type: "circle" },
                size: { value: { min: 1, max: 3 } },
              },
              detectRetina: true,
            }}
          />
        )}
        <div className="relative z-10 w-full min-h-screen flex flex-col">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/mode" element={<ModeSelectionPage />} />
            <Route path="/loading" element={<LoadingScreen />} />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
