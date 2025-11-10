
import React, { useState, useEffect, useContext } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Compass, Menu, X } from 'lucide-react';
import { initializeGemini } from './services/geminiService';
import { Button, Modal, Input } from './components/UIComponents';
import { Project } from './types';
import { INITIAL_PROJECTS } from './constants';

// Pages
import LandingPage from './pages/LandingPage';
import PlannerPage from './pages/PlannerPage';

// Context for global state (Key)
export interface AppContextType {
  isApiKeySet: boolean;
  setApiKey: (key: string) => void;
  projects: Project[];
  addProject: (project: Project) => void;
}

export const AppContext = React.createContext<AppContextType>({
  isApiKeySet: false,
  setApiKey: () => {},
  projects: [],
  addProject: () => {},
});

export const useAppContext = () => useContext(AppContext);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { isApiKeySet } = useAppContext();

  const navLinks = [
    { name: 'Plan Trip', path: '/planner', icon: Compass },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-brand-deep/10 bg-[#FDFCF5]/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-brand-deep text-brand-light p-2 rounded-lg group-hover:scale-105 transition-transform">
                <Compass className="h-6 w-6" />
              </div>
              <span className="font-display font-bold text-2xl text-brand-deep tracking-tight">TripGenie</span>
            </Link>
          </div>
          
          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`text-sm font-medium transition-colors hover:text-brand-olive ${
                  location.pathname === link.path ? 'text-brand-deep font-bold' : 'text-brand-deep/70'
                }`}
              >
                {link.name}
              </Link>
            ))}
            {!isApiKeySet && (
              <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-md font-bold animate-pulse">
                Setup API Key
              </span>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-brand-deep">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-brand-light/20 p-4 border-t border-brand-deep/10">
           {navLinks.map(link => (
              <Link 
                key={link.path} 
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block py-3 text-brand-deep font-medium"
              >
                {link.name}
              </Link>
            ))}
        </div>
      )}
    </nav>
  );
};

const App = () => {
  const [apiKeySet, setApiKeySet] = useState(false);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);

  useEffect(() => {
    const key = localStorage.getItem('tripgenie_api_key');
    if (key) {
      initializeGemini(key);
      setApiKeySet(true);
    } else {
      setShowKeyModal(true);
    }
  }, []);

  const handleSaveKey = () => {
    if (tempKey.trim()) {
      localStorage.setItem('tripgenie_api_key', tempKey);
      initializeGemini(tempKey);
      setApiKeySet(true);
      setShowKeyModal(false);
    }
  };

  const addProject = (project: Project) => {
    setProjects([...projects, project]);
  };

  return (
    <AppContext.Provider value={{ 
      isApiKeySet: apiKeySet, 
      setApiKey: handleSaveKey,
      projects,
      addProject
    }}>
      <HashRouter>
        <div className="min-h-screen flex flex-col bg-[#FDFCF5]">
          <Navbar />
          <main className="flex-1 relative">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>

          <Modal isOpen={showKeyModal} onClose={() => apiKeySet && setShowKeyModal(false)} title="Unlock TripGenie">
            <div className="space-y-4">
              <p className="text-brand-deep/70 leading-relaxed">
                To generate bespoke itineraries, TripGenie requires access to Google's Gemini API. 
                The key is stored securely in your browser's local storage.
              </p>
              <div className="space-y-2">
                <label className="text-sm font-bold text-brand-deep">Gemini API Key</label>
                <Input 
                  type="password"
                  value={tempKey} 
                  onChange={(e: any) => setTempKey(e.target.value)} 
                  placeholder="AIzaSy..." 
                />
              </div>
              <div className="flex justify-end">
                <Button onClick={handleSaveKey} disabled={!tempKey}>
                  Start Planning
                </Button>
              </div>
              <div className="text-center pt-4">
                 <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-xs text-brand-olive hover:underline">
                   Get a free API key from Google
                 </a>
              </div>
            </div>
          </Modal>
        </div>
      </HashRouter>
    </AppContext.Provider>
  );
};

export default App;
