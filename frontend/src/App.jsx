import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Onboarding from './components/Onboarding';
import NewsSection from './components/NewsSection';
import Roadmaps from './components/Roadmaps';
import { CAREER_DOMAINS } from './constants/careers';
import { Info, AlertCircle, LayoutDashboard, Newspaper, Map, CheckCircle2 } from 'lucide-react';

function CareerSelection({ onSelect }) {
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selectedId) return;
    setLoading(true);
    const studentId = localStorage.getItem('studentId');
    try {
      const response = await fetch(`http://127.0.0.1:8000/students/${studentId}/career`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_career: selectedId })
      });
      if (response.ok) {
        localStorage.setItem('targetCareer', selectedId);
        onSelect(selectedId);
      } else {
        alert("Failed to update career. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background flare */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full"></div>
      
      <div className="relative z-10 w-full max-w-5xl flex flex-col h-full max-h-[90vh]">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Choose Your Career Path</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">Select the journey you want to embark on. Our AI will guide you with roadmaps, insights, and drift analysis tailored to your choice.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pr-2 custom-scrollbar flex-1 pb-10 content-start">
          {CAREER_DOMAINS.map((career) => {
            const Icon = career.icon;
            const isSelected = selectedId === career.id;
            return (
              <button
                key={career.id}
                onClick={() => setSelectedId(career.id)}
                className={`flex flex-col items-start p-6 rounded-[2rem] border transition-all text-left relative group overflow-hidden min-h-[240px] flex-shrink-0 ${
                  isSelected 
                  ? 'bg-blue-600/20 border-blue-500 shadow-lg shadow-blue-500/20' 
                  : 'bg-white/5 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/5 blur-[40px] rounded-full group-hover:bg-blue-500/10 transition-all"></div>
                
                <div className={`p-3 rounded-2xl mb-4 ${isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                  <Icon size={24} />
                </div>
                
                <h3 className={`text-xl font-bold mb-2 ${isSelected ? 'text-white' : 'text-slate-200'}`}>{career.label}</h3>
                <p className="text-slate-400 text-sm mb-4">{career.desc}</p>
                
                <div className="mt-auto flex items-center justify-between w-full">
                  <span className="text-2xl">{career.emoji}</span>
                  {isSelected && <CheckCircle2 className="w-6 h-6 text-blue-500" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <button
            onClick={handleConfirm}
            disabled={!selectedId || loading}
            className={`px-12 py-4 rounded-2xl font-bold text-lg transition-all flex items-center gap-3 ${
              selectedId && !loading
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-xl shadow-blue-600/30'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5'
            }`}
          >
            {loading ? 'Setting Path...' : 'Confirm Selection'}
            {!loading && <Map size={20} />}
          </button>
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const navigate = useNavigate();
  const [target, setTarget] = useState(localStorage.getItem('targetCareer') || "");
  const [name, setName] = useState(localStorage.getItem('studentName') || "Student");

  const [activities, setActivities] = useState([]);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityCategory, setNewActivityCategory] = useState("Other");
  const [driftResult, setDriftResult] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'news', or 'roadmaps'

  useEffect(() => {
    const studentId = localStorage.getItem('studentId');
    if (!studentId) {
      navigate('/');
    } else {
      // Fetch Student Profile
      fetch(`http://127.0.0.1:8000/students/${studentId}`)
        .then(res => res.json())
        .then(data => {
          setName(data.name);
          setTarget(data.target_career);
          localStorage.setItem('studentName', data.name);
          localStorage.setItem('targetCareer', data.target_career);
        })
        .catch(err => console.error("Error fetching student:", err));

      // Fetch existing activities
      fetch(`http://127.0.0.1:8000/students/${studentId}/activities/`)
        .then(res => res.json())
        .then(data => setActivities(data))
        .catch(err => console.error("Error fetching activities:", err));

      // Update last visited
      fetch(`http://127.0.0.1:8000/visit/${studentId}`, { method: 'POST' })
        .catch(err => console.error("Error recording visit:", err));
    }
  }, [navigate]);

  const checkDrift = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/predict_drift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target_career: target,
          recent_activities: activities
        }),
      });
      const data = await response.json();
      setDriftResult(data);
    } catch (error) {
      console.error("Error fetching drift:", error);
      alert("Ensure Backend is running on port 8000!");
    }
  };

  const handleAddActivity = async () => {
    if (!newActivityName.trim()) return;

    const studentId = localStorage.getItem('studentId');
    const newActivity = {
      student_id: studentId,
      name: newActivityName,
      category: newActivityCategory,
      type: "Learning"
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/activities/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newActivity)
      });

      if (response.ok) {
        const savedActivity = await response.json();
        setActivities([...activities, savedActivity]);
        setNewActivityName("");
      } else {
        alert("Failed to save activity");
      }
    } catch (error) {
      console.error("Error saving activity:", error);
    }
  };

  /* Right Column: AI Insights */
  // AI Prediction only triggers manually via the "Analyze Drift Risk" button.

  return (
    <div className="h-screen bg-slate-900 text-white p-8 font-sans overflow-hidden flex flex-col">
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col overflow-hidden">
        <header className="mb-8 border-b border-slate-700 pb-4 flex justify-between items-end shrink-0">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              CareerCompass AI
            </h1>
            <p className="text-slate-400">Welcome, {name}</p>
          </div>

          <div className="flex items-center gap-6">
            <nav className="flex bg-slate-800/50 p-1 rounded-lg border border-slate-700">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <LayoutDashboard size={16} /> Dashboard
              </button>
              <button
                onClick={() => setActiveTab('news')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'news' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Newspaper size={16} /> News Section
              </button>
              <button
                onClick={() => setActiveTab('roadmaps')}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all ${activeTab === 'roadmaps' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Map size={16} /> Roadmaps
              </button>
            </nav>

            <button
              onClick={() => {
                localStorage.clear();
                navigate('/');
              }}
              className="text-sm text-slate-500 hover:text-white"
            >
              Logout
            </button>
          </div>
        </header>

        {!target ? (
          <CareerSelection onSelect={(careerId) => setTarget(careerId)} />
        ) : activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 flex-1 overflow-hidden animate-in fade-in duration-500">
            {/* Left Column: Controls */}
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col h-full overflow-y-auto custom-scrollbar">
              <h2 className="text-xl font-semibold mb-4 text-blue-300 shrink-0">Student Profile</h2>
              <div className="mb-4 shrink-0">
                <label className="block text-sm text-slate-400 mb-1">Target Career</label>
                <div className="text-lg font-bold">{target}</div>
              </div>

              <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700 shrink-0">
                <h3 className="text-sm text-slate-400 mb-3 font-semibold uppercase tracking-wider">Add New Activity</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-500 block mb-1">Activity Name</label>
                    <input
                      type="text"
                      value={newActivityName}
                      onChange={(e) => setNewActivityName(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none placeholder-slate-600"
                      placeholder="e.g. React Hooks Deep Dive"
                    />
                  </div>
                  <button
                    onClick={handleAddActivity}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2 rounded transition-colors flex items-center justify-center gap-2"
                  >
                    + Add Activity
                  </button>
                </div>
              </div>

              <div className="mt-auto shrink-0 pt-4">
                <button
                  onClick={checkDrift}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all"
                >
                  Analyze Drift Risk
                </button>
              </div>
            </div>

            {/* Middle Column: Activity Log */}
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col h-full overflow-hidden">
              <h2 className="text-xl font-semibold mb-4 text-emerald-300 shrink-0">Activity Log</h2>
              <div className="space-y-2 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {activities.length === 0 && <p className="text-slate-500 text-sm">No activities logged.</p>}
                {activities.map((act, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
                    <span className="font-medium">{act.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: AI Insights */}
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col h-full overflow-hidden">
              <h2 className="text-xl font-semibold mb-4 text-purple-300 shrink-0">AI Insights</h2>
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {driftResult && driftResult.on_track_score !== undefined ? (
                  <div className="space-y-6">
                    <div className={`text-center p-6 rounded-lg border-2 shrink-0 ${driftResult.is_drifting ? 'border-amber-500 bg-amber-900/20' : 'border-green-500 bg-green-900/20'}`}>
                      <div className="text-4xl font-bold mb-2">
                        {(driftResult.on_track_score * 100).toFixed(0)}%
                      </div>
                      <div className="uppercase tracking-widest text-sm font-semibold mb-4">
                        On-Track Confidence
                      </div>
                      <div className={`text-2xl font-bold ${driftResult.is_drifting ? 'text-amber-400' : 'text-green-400'}`}>
                        {driftResult.message}
                      </div>
                    </div>

                    {driftResult.suggestions && driftResult.suggestions.length > 0 && (
                      <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                        <h3 className="text-sm font-semibold text-slate-400 mb-3 flex items-center gap-2">
                          <Info size={16} className="text-blue-400" />
                          AI Feedback & Suggestions
                        </h3>
                        <ul className="space-y-3">
                          {driftResult.suggestions.map((sug, i) => (
                            <li key={i} className="text-sm text-slate-300 flex gap-2">
                              <AlertCircle size={14} className="text-amber-500 shrink-0 mt-1" />
                              {sug}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-slate-500 italic text-center">Add matching activities to analyze your progress.</p>
                )}
              </div>
            </div>
          </div>
        ) : activeTab === 'news' ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-4 duration-500">
            <NewsSection />
          </div>
        ) : activeTab === 'roadmaps' ? (
          <div className="flex-1 overflow-y-auto custom-scrollbar animate-in slide-in-from-bottom-4 duration-500">
            <Roadmaps />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
