import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';

function App() {
  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-medGreen-100 selection:text-medGreen-600">
      <Navbar />
      <main className="pt-24 pb-12 px-6 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
