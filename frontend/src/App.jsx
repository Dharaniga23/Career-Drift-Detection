import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import Onboarding from './components/Onboarding';

function Dashboard() {
  const navigate = useNavigate();
  const [target, setTarget] = useState(localStorage.getItem('targetCareer') || "Data Scientist");
  const [name, setName] = useState(localStorage.getItem('studentName') || "Student");

  const [activities, setActivities] = useState([]);
  const [newActivityName, setNewActivityName] = useState("");
  const [newActivityCategory, setNewActivityCategory] = useState("Frontend Dev");
  const [driftResult, setDriftResult] = useState(null);

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
    <div className="min-h-screen bg-slate-900 text-white p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 border-b border-slate-700 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              CareerCompass AI
            </h1>
            <p className="text-slate-400">Welcome, {name}</p>
          </div>
          <button
            onClick={() => {
              localStorage.clear();
              navigate('/');
            }}
            className="text-sm text-slate-500 hover:text-white"
          >
            Logout
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Controls */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-blue-300">Student Profile</h2>
            <div className="mb-4">
              <label className="block text-sm text-slate-400 mb-1">Target Career</label>
              <div className="text-lg font-bold">{target}</div>
            </div>

            <div className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
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
                <div>
                  <label className="text-xs text-slate-500 block mb-1">Category</label>
                  <select
                    value={newActivityCategory}
                    onChange={(e) => setNewActivityCategory(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="Data Scientist">Data Scientist</option>
                    <option value="Frontend Dev">Frontend Dev</option>
                    <option value="Backend Dev">Backend Dev</option>
                    <option value="Art">Art (Irrelevant)</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <button
                  onClick={handleAddActivity}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold py-2 rounded transition-colors flex items-center justify-center gap-2"
                >
                  + Add Activity
                </button>
              </div>
            </div>

            <button
              onClick={checkDrift}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg shadow-lg transition-all"
            >
              Analyze Drift Risk
            </button>
          </div>

          {/* Middle Column: Activity Log */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
            <h2 className="text-xl font-semibold mb-4 text-emerald-300">Activity Log</h2>
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {activities.length === 0 && <p className="text-slate-500 text-sm">No activities logged.</p>}
              {activities.map((act, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-900 p-3 rounded border border-slate-800">
                  <span className="font-medium">{act.name}</span>
                  <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">{act.category}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: AI Insights */}
          <div className="flex flex-col gap-8">
            <div className="bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700">
              <h2 className="text-xl font-semibold mb-4 text-purple-300">AI Insights</h2>
              {driftResult && driftResult.on_track_score !== undefined ? (
                <div className={`text-center p-6 rounded-lg border-2 ${driftResult.is_drifting ? 'border-amber-500 bg-amber-900/20' : 'border-green-500 bg-green-900/20'}`}>
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
              ) : (
                <p className="text-slate-500 italic text-center">Add matching activities to analyze your progress.</p>
              )}
            </div>
          </div>
        </div>
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
