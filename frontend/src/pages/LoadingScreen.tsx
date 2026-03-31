import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import StarsBackground from '../components/StarsBackground';

const messages = [
  "Analyzing your career decisions...",
  "Consulting imaginary recruiters...",
  "Preparing roast...",
  "Running numbers on your hireability...",
  "Checking buzzword density...",
  "Finalizing verdict..."
];

const STYLES = `
.loader {
  width: 50px;
  aspect-ratio: 1.154;
  display: grid;
  color: #a78bfa;
  background:
    linear-gradient(to bottom left ,#0000 calc(50% - 1px),currentColor 0 calc(50% + 1px),#0000 0) right/50% 100%,
    linear-gradient(to bottom right,#0000 calc(50% - 1px),currentColor 0 calc(50% + 1px),#0000 0) left /50% 100%,
    linear-gradient(currentColor 0 0) bottom/100% 2px;
  background-repeat: no-repeat;
  transform-origin: 50% 66%;
  animation: l5 4s infinite linear;
}
.loader::before,
.loader::after {
  content: "";
  grid-area: 1/1;
  background: inherit;
  transform-origin: inherit;
  animation: inherit;
}
.loader::after {
  animation-duration: 2s;
}
@keyframes l5{
  100% {transform:rotate(1turn)}
}
`;

export default function LoadingScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const { role, linkedinUrl, profileText, resumeFile, mode, roastLevel } = location.state || {};

  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex(prev => (prev + 1) % messages.length);
    }, 2000);

    const fetchData = async () => {
      try {
        const formData = new FormData();
        formData.append('mode', mode || 'Professional');
        formData.append('roastLevel', roastLevel || 'Medium');
        formData.append('targetRole', role || '');
        if (linkedinUrl) formData.append('linkedinUrl', linkedinUrl);
        if (profileText) formData.append('profileText', profileText);
        if (resumeFile) formData.append('resume', resumeFile);

        const baseUrl = import.meta.env.VITE_API_URL || '';
        const [response] = await Promise.all([
          fetch(`${baseUrl}/api/analyze`, { method: 'POST', body: formData }),
          new Promise(r => setTimeout(r, 2000)) // Reduced minimum wait time
        ]);
        
        let data;
        const contentType = response.headers.get("content-type");
        
        if (response.ok) {
          if (contentType && contentType.includes("application/json")) {
            data = await response.json();
          } else {
            throw new Error("Server succeeded but didn't return JSON.");
          }
        } else {
          // Handle error cases
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Server error (${response.status})`);
          } else {
            const errorText = await response.text();
            throw new Error(errorText || `Server returned error ${response.status}`);
          }
        }

        navigate('/results', { state: { role, mode, roastLevel, analysis: data } });
      } catch (err) {
        console.error(err);
        navigate('/results', { state: { role, mode, roastLevel, error: err instanceof Error ? err.message : String(err) } });
      }
    };

    fetchData();
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black text-white">
      <style>{STYLES}</style>
      <StarsBackground showMeteors={true} />
      
      <div className="z-10 text-center flex flex-col items-center max-w-md px-6">
        <div className="loader mb-12"></div>
        <h2 
          key={messageIndex}
          className="font-headline text-lg md:text-xl font-medium tracking-wide text-white/80 animate-in fade-in slide-in-from-bottom-2 duration-700"
        >
          {messages[messageIndex]}
        </h2>
        
        <div className="mt-8 flex gap-1">
          {[0, 1, 2].map(i => (
            <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}></div>
          ))}
        </div>
      </div>
    </div>
  );
}
