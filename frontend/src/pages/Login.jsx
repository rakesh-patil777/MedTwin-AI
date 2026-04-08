import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Phone as PhoneIcon, KeyRound, ArrowRight, Loader2 } from 'lucide-react';

const Login = () => {
  const [authMode, setAuthMode] = useState('email'); // 'email' or 'otp'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem('medtwin_session', data.sessionId);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setIsOtpSent(true);
      alert(data.message); // Instructs user to check terminal
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:5000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem('medtwin_session', data.sessionId);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-white/60 backdrop-blur-xl border border-[#d0bfae] rounded-3xl shadow-xl relative z-10 w-full animate-fade-in">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-[#2f2a26] mb-2 tracking-tight">Access Portal</h1>
        <p className="text-[#a89b8d] font-medium text-sm">Secure clinical intelligence login</p>
      </div>

      <div className="flex p-1 bg-[#faf0e6] border border-[#d0bfae] rounded-xl mb-6">
        <button
          className={`flex-1 py-2 font-bold text-sm rounded-lg transition-colors ${authMode === 'email' ? 'bg-[#77DD77] text-white shadow-sm' : 'text-[#a89b8d] hover:text-[#2f2a26]'}`}
          onClick={() => { setAuthMode('email'); setError(null); }}
        >
          Email & Pass
        </button>
        <button
          className={`flex-1 py-2 font-bold text-sm rounded-lg transition-colors ${authMode === 'otp' ? 'bg-[#77DD77] text-white shadow-sm' : 'text-[#a89b8d] hover:text-[#2f2a26]'}`}
          onClick={() => { setAuthMode('otp'); setError(null); }}
        >
          Phone OTP
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-semibold border border-red-200">
          {error}
        </div>
      )}

      {authMode === 'email' ? (
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#a89b8d] uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-[#a89b8d]" size={18} />
              <input
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                className="w-full bg-white border border-[#d0bfae] pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77DD77] text-[#2f2a26]"
                placeholder="doctor@clinic.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#a89b8d] uppercase tracking-wider mb-2">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-[#a89b8d]" size={18} />
              <input
                type="password" required
                value={password} onChange={e => setPassword(e.target.value)}
                className="w-full bg-white border border-[#d0bfae] pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77DD77] text-[#2f2a26]"
                placeholder="••••••••"
              />
            </div>
            <p className="text-xs text-[#a89b8d] mt-2 font-medium">Auto-registers if new user.</p>
          </div>
          <button type="submit" disabled={loading} className="w-full mt-6 bg-[#2f2a26] hover:bg-[#403933] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <>Sign In <ArrowRight size={18} /></>}
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          {!isOtpSent ? (
            <form onSubmit={handleSendOtp}>
              <label className="block text-xs font-bold text-[#a89b8d] uppercase tracking-wider mb-2">Phone Number</label>
              <div className="relative">
                <PhoneIcon className="absolute left-3 top-3 text-[#a89b8d]" size={18} />
                <input
                  type="tel" required
                  value={phone} onChange={e => setPhone(e.target.value)}
                  className="w-full bg-white border border-[#d0bfae] pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77DD77] text-[#2f2a26]"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full mt-6 bg-[#2f2a26] hover:bg-[#403933] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Send Secure OTP <ArrowRight size={18} /></>}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <label className="block text-xs font-bold text-[#a89b8d] uppercase tracking-wider mb-2">Enter 6-Digit Code</label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 text-[#a89b8d]" size={18} />
                <input
                  type="text" required maxLength="6"
                  value={otp} onChange={e => setOtp(e.target.value)}
                  className="w-full bg-white border border-[#d0bfae] pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#77DD77] text-[#2f2a26] tracking-[0.5em] font-bold"
                  placeholder="000000"
                />
              </div>
              <button type="submit" disabled={loading} className="w-full mt-6 bg-[#77DD77] hover:bg-[#68d168] text-white font-bold py-3.5 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <>Verify & Enter <ArrowRight size={18} /></>}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default Login;
