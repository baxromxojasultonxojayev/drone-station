import { Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import Dashboard from './pages/Dashboard';
import MapView from './pages/MapView';
import MissionPlanner from './pages/MissionPlanner';
import useSimulator from './hooks/useSimulator';

// Placeholder pages
const Settings = () => (
  <div className="h-full flex items-center justify-center text-drone-text-dim italic">
    System Settings
  </div>
);

function App() {
  // Start the telemetry simulator
  useSimulator();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-drone-bg text-drone-text selection:bg-drone-accent/30">
      <div className="flex-1 flex flex-col min-w-0">
        {/* TopBar is removed or integrated into Dashboard for GCS feel, 
            but for now we keep it and just make sure main is full height */}
        <div className="hidden lg:block">
           <TopBar />
        </div>
        
        <main className="flex-1 min-h-0 relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/map" element={<MapView />} />
            <Route path="/mission" element={<MissionPlanner />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>

      {/* Move Sidebar to right or make it optional for the GCS view */}
      <Sidebar />
    </div>
  );
}

export default App;
