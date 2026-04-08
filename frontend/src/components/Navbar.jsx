import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, MessageSquare, LogOut, Pill } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const sessionId = localStorage.getItem('medtwin_session');

  const handleLogout = () => {
    localStorage.removeItem('medtwin_session');
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 w-full bg-[#faf0e6]/70 backdrop-blur-lg z-50 border-b border-medGreen-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-medGreen-600 font-bold text-xl tracking-tight">
          <Activity size={24} className="animate-pulse" />
          MedTwin AI
        </Link>
        <div className="flex gap-8 items-center">
          {sessionId ? (
            <>
              <Link to="/dashboard" className={`font-medium transition-colors flex items-center gap-2 ${location.pathname === '/dashboard' ? 'text-medGreen-600' : 'text-slate-500 hover:text-medGreen-500'}`}>
                <LayoutDashboard size={18} /> Dashboard
              </Link>
              <Link to="/prescriptions" className={`font-medium transition-colors flex items-center gap-2 ${location.pathname === '/prescriptions' ? 'text-medGreen-600' : 'text-slate-500 hover:text-medGreen-500'}`}>
                <Pill size={18} /> Prescriptions
              </Link>
              <Link to="/chat" className={`font-medium transition-colors flex items-center gap-2 ${location.pathname === '/chat' ? 'text-medGreen-600' : 'text-slate-500 hover:text-medGreen-500'}`}>
                <MessageSquare size={18} /> Chat
              </Link>
              <button 
                onClick={handleLogout} 
                className="ml-4 flex items-center gap-2 bg-[#2f2a26] text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md hover:bg-[#403933] transition-colors active:scale-95"
              >
                Logout <LogOut size={16} />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </nav>
  );
};
export default Navbar;
