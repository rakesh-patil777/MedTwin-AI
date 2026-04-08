import { Link, useLocation } from 'react-router-dom';
import { Activity, LayoutDashboard, MessageSquare } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-lg z-50 border-b border-medGreen-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-medGreen-600 font-bold text-xl tracking-tight">
          <Activity size={24} className="animate-pulse" />
          MedTwin AI
        </Link>
        <div className="flex gap-8">
          <Link to="/dashboard" className={`font-medium transition-colors flex items-center gap-2 ${location.pathname === '/dashboard' ? 'text-medGreen-600' : 'text-slate-500 hover:text-medGreen-500'}`}>
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link to="/chat" className={`font-medium transition-colors flex items-center gap-2 ${location.pathname === '/chat' ? 'text-medGreen-600' : 'text-slate-500 hover:text-medGreen-500'}`}>
            <MessageSquare size={18} /> Chat
          </Link>
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
