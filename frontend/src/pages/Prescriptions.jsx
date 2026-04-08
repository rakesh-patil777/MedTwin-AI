import { useState, useEffect, useRef } from 'react';
import { Clock, Plus, Trash2, Pill, CheckCircle2, BellRing } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_URL;

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
      const res = await fetch(`${API_BASE}/prescriptions?sessionId=${sessionId}`);
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
      const res = await fetch(`${API_BASE}/add-prescription`, {
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
      await fetch(`${API_BASE}/prescriptions/${id}`, {
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
        fetch(`${API_BASE}/prescriptions/${id}`, {
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
    <div className="min-h-screen bg-[#faf0e6] pt-28 px-4 pb-12">
      <div className="max-w-5xl mx-auto grid lg:grid-cols-12 gap-8">

        {/* LEFT: Add Prescription */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-[#d0bfae]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-red-100 text-red-500 rounded-xl">
                <Pill size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#2f2a26]">New Prescription</h2>
                <p className="text-sm text-[#a89b8d]">Configure schedule & reminders</p>
              </div>
            </div>

            <form onSubmit={handleAdd} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-[#403933] mb-2">Medicine Name</label>
                <input
                  type="text"
                  value={medName}
                  onChange={(e) => setMedName(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg"
                  className="w-full bg-[#faf0e6] border border-[#d0bfae] rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#77DD77]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#403933] mb-3">Schedule Timings</label>
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {defaultTimings.map((t, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTimingToggle(t.value)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border transition-all ${selectedTimings.includes(t.value) ? 'bg-[#77DD77]/10 border-[#77DD77] text-emerald-700 font-bold' : 'bg-white border-[#d0bfae] text-[#a89b8d] hover:bg-slate-50'}`}
                    >
                      <span className="flex items-center gap-2"><Clock size={16} /> {t.label}</span>
                      {selectedTimings.includes(t.value) && <CheckCircle2 size={18} className="text-[#77DD77]" />}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <input
                    type="time"
                    value={customTime}
                    onChange={(e) => setCustomTime(e.target.value)}
                    className="flex-1 bg-white border border-[#d0bfae] rounded-xl px-4 py-2 text-sm text-[#403933]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTime}
                    className="bg-[#2f2a26] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#403933]"
                  >
                    Add Custom
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={!medName || selectedTimings.length === 0}
                className="w-full bg-[#77DD77] hover:bg-[#68d168] text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                <Plus size={18} /> Save Prescription Schedule
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Schedule & History */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Active Status Ribbon */}
          <div className="bg-[#77DD77] p-5 rounded-2xl flex items-center justify-between text-white shadow-md shadow-[#77DD77]/20">
            <div className="flex items-center gap-3">
              <BellRing size={24} className="animate-wiggle" />
              <div>
                <h3 className="font-extrabold text-lg">Reminder Agent Active</h3>
                <p className="text-sm text-white/90">Browser notifications enabled. Leave MedTwin open in a tab.</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-[#d0bfae] flex-1">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-[#2f2a26] flex items-center gap-2">
                <Clock size={20} className="text-[#a89b8d]" /> Today's Routine
              </h2>
              <div className="px-4 py-1.5 bg-[#77DD77]/20 border border-[#77DD77]/30 text-emerald-800 font-extrabold text-sm rounded-xl tracking-wider shadow-sm">
                {currentTime.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>

            {nextUpItems.length > 0 && (
              <div className="mb-6 bg-blue-50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Up Next</p>
                  <p className="text-blue-900 font-extrabold">{nextUpNames} at {nextUpItems[0].time} <span className="text-sm font-medium text-blue-600">({formatCountdown(nextUpItems[0].diffSec)} from now)</span></p>
                </div>
                <Pill size={32} className="text-blue-300" />
              </div>
            )}

            <div className="space-y-4">
              {groupedPrescriptions.length === 0 ? (
                <div className="text-center py-10 text-[#a89b8d]">
                  <Pill size={48} className="mx-auto mb-4 opacity-20" />
                  <p>No active prescriptions running.</p>
                </div>
              ) : (
                groupedPrescriptions.map((group) => (
                  <div key={group.ids[0]} className="group flex items-start justify-between p-4 bg-[#faf0e6] rounded-2xl border border-[#d0bfae]/50 hover:border-[#77DD77] transition-colors">
                    <div>
                      <h4 className="font-bold text-[#2f2a26] text-lg mb-2">{group.name}</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(group.timings).sort().map(time => (
                          <span key={time} className="bg-white border border-[#d0bfae] text-[#403933] text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-1.5">
                            <Clock size={12} className="text-[#77DD77]" /> {time}
                          </span>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => handleGroupDelete(group.ids)}
                      className="p-2 text-[#a89b8d] hover:bg-red-100 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Prescriptions;
