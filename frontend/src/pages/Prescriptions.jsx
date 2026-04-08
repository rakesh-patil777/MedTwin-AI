import { useState, useEffect, useRef } from 'react';
import { Clock, Plus, Trash2, Pill, CheckCircle2, BellRing, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Prescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medName, setMedName] = useState('');
  const [selectedTimings, setSelectedTimings] = useState([]);
  const [customTime, setCustomTime] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Real-time memory ref to avoid spamming the backend network when checking alarms
  const prescriptionsRef = useRef(prescriptions);
  useEffect(() => {
    prescriptionsRef.current = prescriptions;
  }, [prescriptions]);

  const defaultTimings = [
    { label: 'Morning (09:00)', value: '09:00' },
    { label: 'Afternoon (14:00)', value: '14:00' },
    { label: 'Night (21:00)', value: '21:00' }
  ];

  const sessionId = localStorage.getItem('medtwin_session');

  useEffect(() => {
    if (!sessionId) {
      window.location.href = '/login';
      return;
    }
    fetchPrescriptions();
    requestNotificationPermission();

    // Sub-Second Precision Reminder Agent (Now completely safe to run every 1000ms)
    const agentInterval = setInterval(() => {
      checkReminders();
      setCurrentTime(new Date());
    }, 1000);

    return () => { clearInterval(agentInterval); };
  }, []);

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const res = await fetch(`http://localhost:5000/prescriptions?sessionId=${sessionId}`);
      const data = await res.json();
      if (data.success) {
        setPrescriptions(data.prescriptions);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // The actual scheduling logic strictly firing alerts at exact times.
  const checkReminders = () => {
    const now = new Date();
    const currentHHMM = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    const dateKey = now.toDateString();
    
    // Instantly check memory local state (0 millisecond delay, 0 network fetch!)
    const list = prescriptionsRef.current;
    list.forEach(med => {
      if (med.timings.includes(currentHHMM)) {
        const cacheKey = `reminded_${med.id}_${dateKey}_${currentHHMM}`;
        if (!localStorage.getItem(cacheKey)) {
          localStorage.setItem(cacheKey, 'true');
          fireNotification(med.medicineName, currentHHMM);
        }
      }
    });
  };

  const fireNotification = (medName, time) => {
    const title = `⏰ Time for your Medicine!`;
    const body = `Please take ${medName} now (Scheduled for ${time}).`;

    // 1. Browser Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: body, icon: '/vite.svg' });
    } else {
      // Fallback
      alert(`${title}\n${body}`);
    }

    // 2. Bonus: Read the reminder aloud using Medical voice assistant!
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(body);
      utterance.rate = 1.05;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleTimingToggle = (timeValue) => {
    if (selectedTimings.includes(timeValue)) {
      setSelectedTimings(selectedTimings.filter(t => t !== timeValue));
    } else {
      setSelectedTimings([...selectedTimings, timeValue]);
    }
  };

  const handleAddCustomTime = () => {
    if (customTime && !selectedTimings.includes(customTime)) {
      setSelectedTimings([...selectedTimings, customTime]);
      setCustomTime('');
    }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!medName || selectedTimings.length === 0) return;

    try {
      const res = await fetch('http://localhost:5000/add-prescription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, medicineName: medName, timings: selectedTimings })
      });
      const data = await res.json();
      if (data.success) {
        setMedName('');
        setSelectedTimings([]);
        fetchPrescriptions();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/prescriptions/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId })
      });
      fetchPrescriptions();
    } catch (e) {
      console.error(e);
    }
  };

  const handleGroupDelete = async (ids) => {
    try {
      await Promise.all(ids.map(id =>
        fetch(`http://localhost:5000/prescriptions/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId })
        })
      ));
      fetchPrescriptions(); // Refetch perfectly once after all deletions process
    } catch (e) {
      console.error(e);
    }
  };

  // Compute what's up next down to the exact second
  const upcomingMeds = [];
  const currentTotalSeconds = currentTime.getHours() * 3600 + currentTime.getMinutes() * 60 + currentTime.getSeconds();

  prescriptions.forEach(med => {
    med.timings.forEach(t => {
      const [h, m] = t.split(':').map(Number);
      const totalSeconds = h * 3600 + m * 60;
      
      let diffSec = totalSeconds - currentTotalSeconds;
      // Wrap-around logic: If the time already passed today, it's coming TOMORROW (+24 hrs in seconds)
      if (diffSec <= 0) {
        diffSec += 86400; 
      }
      
      upcomingMeds.push({ ...med, time: t, diffSec: diffSec });
    });
  });
  
  upcomingMeds.sort((a, b) => a.diffSec - b.diffSec);

  const formatCountdown = (totalSec) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`;
    return `${mins}m ${secs}s`;
  };

  // Group all medications that share the exact same next time block
  const nextUpItems = upcomingMeds.length > 0 ? upcomingMeds.filter(med => med.diffSec === upcomingMeds[0].diffSec) : [];
  
  // Enforce strict uniqueness (ignoring accidental spaces and capitalizations)
  const distinctMeds = [];
  const seenNames = new Set();
  nextUpItems.forEach(m => {
    const rawName = m.medicineName.trim();
    const key = rawName.toLowerCase();
    if (!seenNames.has(key)) {
      seenNames.add(key);
      distinctMeds.push(rawName);
    }
  });
  const nextUpNames = distinctMeds.join(' + ');

  // Group Prescriptions visually so user doesn't see duplicates in the bottom History cards
  const groupedPrescriptions = Object.values(
    prescriptions.reduce((acc, med) => {
      const rawName = med.medicineName.trim();
      const key = rawName.toLowerCase();
      if (!acc[key]) {
        acc[key] = {
           name: rawName,
           ids: [med.id], // track all underlying IDs incase they press Trash
           timings: new Set([...med.timings]) // use Set to seamlessly aggregate unique timings
        };
      } else {
        acc[key].ids.push(med.id);
        med.timings.forEach(t => acc[key].timings.add(t));
      }
      return acc;
    }, {})
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-28 px-4 pb-12 font-sans selection:bg-teal-200">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-8"
      >
        
        {/* LEFT: Add Prescription */}
        <div className="lg:col-span-5 space-y-6">
          <motion.div 
            whileHover={{ y: -2 }}
            className="bg-white/90 backdrop-blur-2xl p-8 rounded-[2rem] shadow-xl shadow-teal-900/5 border border-white"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="p-4 bg-gradient-to-br from-teal-50 to-teal-100/50 text-teal-600 rounded-2xl shadow-inner border border-white">
                <Activity size={26} strokeWidth={2.5} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">New Medication</h2>
                <p className="text-sm font-medium text-slate-400 mt-0.5">Configure schedule & smart reminders</p>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-7">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2.5 ml-1">Medication Name</label>
                <input 
                  type="text" 
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg"
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl px-5 py-4 text-slate-700 font-medium placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 transition-all duration-300"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-3 ml-1">Daily Frequency Details</label>
                <div className="grid grid-cols-1 gap-3 mb-5">
                  {defaultTimings.map((t, idx) => (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      key={idx}
                      type="button"
                      onClick={() => handleTimingToggle(t.value)}
                      className={`flex items-center justify-between px-5 py-4 rounded-2xl border-2 transition-all duration-300 ${selectedTimings.includes(t.value) ? 'bg-teal-50/50 border-teal-400 text-teal-700 font-bold shadow-sm' : 'bg-white border-transparent shadow-sm text-slate-500 font-medium hover:bg-slate-50 hover:border-slate-200'}`}
                    >
                      <span className="flex items-center gap-3"><Clock size={18} strokeWidth={2} /> {t.label}</span>
                      {selectedTimings.includes(t.value) && (
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                          <CheckCircle2 size={20} className="text-teal-500"/>
                        </motion.div>
                      )}
                    </motion.button>
                  ))}
                </div>
                
                <div className="flex gap-3">
                  <input 
                    type="time" 
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="flex-1 bg-white border border-slate-200 shadow-sm rounded-2xl px-4 py-3 text-sm font-medium text-slate-700 focus:ring-4 focus:ring-teal-500/10 focus:border-teal-400 outline-none transition-all"
                  />
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={handleAddCustomTime}
                    className="bg-slate-800 text-white px-6 py-3 rounded-2xl text-sm font-bold hover:bg-slate-900 shadow-lg shadow-slate-800/20 transition-all"
                  >
                    Add Custom
                  </motion.button>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.01, translateY: -2 }}
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={!medName || selectedTimings.length === 0}
                className="w-full bg-gradient-to-r from-teal-400 to-emerald-400 hover:from-teal-500 hover:to-emerald-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl shadow-teal-500/20 disabled:opacity-40 disabled:hover:translate-y-0 transition-all duration-300 mt-2"
              >
                <Plus size={20} strokeWidth={2.5} /> Save Smart Schedule
              </motion.button>
            </form>
          </motion.div>
        </div>

        {/* RIGHT: Schedule & History */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* Active Status Ribbon */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-900 p-6 rounded-[2rem] flex items-center justify-between text-white shadow-2xl shadow-slate-900/10 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            <div className="flex items-center gap-5 relative z-10">
              <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
                <BellRing size={26} className="text-teal-300 animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-xl tracking-tight">Agent Active</h3>
                <p className="text-sm font-medium text-slate-300 mt-0.5">Desktop & Voice routing enabled securely.</p>
              </div>
            </div>
          </motion.div>

          <div className="bg-white/90 backdrop-blur-2xl p-8 rounded-[2rem] shadow-xl shadow-teal-900/5 border border-white flex-1">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                Overview
              </h2>
              <div className="px-5 py-2 bg-slate-50 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl tracking-wider shadow-inner">
                 {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
            
            <AnimatePresence mode="popLayout">
              {nextUpItems.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="mb-8 relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-50/50 border border-blue-100 p-6 rounded-[2rem] flex items-center justify-between shadow-lg shadow-blue-900/5"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                       <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                       <p className="text-xs font-black text-blue-600 uppercase tracking-widest">Priority Up Next</p>
                    </div>
                    <p className="text-3xl tracking-tight text-slate-900 font-black mb-1">{nextUpNames}</p>
                    <p className="font-bold text-blue-600">at {nextUpItems[0].time} <span className="opacity-60 ml-2 font-medium">({formatCountdown(nextUpItems[0].diffSec)} left)</span></p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm text-blue-500 relative z-10 border border-blue-50">
                    <Pill size={36} strokeWidth={2} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4 relative">
              <AnimatePresence>
                {groupedPrescriptions.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="text-center py-16"
                  >
                     <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                       <Pill size={40} className="text-slate-300" strokeWidth={1.5} />
                     </div>
                     <p className="text-slate-400 font-medium text-lg">Your itinerary is currently clear.</p>
                  </motion.div>
                ) : (
                  groupedPrescriptions.map((group, i) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ delay: i * 0.05 }}
                      key={group.ids[0]} 
                      whileHover={{ scale: 1.01, backgroundColor: '#f8fafc' }}
                      className="group flex items-center justify-between p-5 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all duration-300"
                    >
                      <div>
                        <h4 className="font-black text-slate-800 text-lg mb-3 tracking-tight">{group.name}</h4>
                        <div className="flex flex-wrap gap-2">
                          {Array.from(group.timings).sort().map(time => (
                            <span key={time} className="bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-400"></span> {time}
                            </span>
                          ))}
                        </div>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleGroupDelete(group.ids)}
                        className="p-3 text-slate-300 hover:bg-rose-50 hover:text-rose-500 rounded-xl transition-colors duration-300"
                      >
                        <Trash2 size={20} strokeWidth={2} />
                      </motion.button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Prescriptions;
