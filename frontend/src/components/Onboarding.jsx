import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ChevronRight, User } from 'lucide-react';

const CAREER_OPTIONS = [
    { id: 'Data Scientist', label: 'Data Scientist', icon: '📊', desc: 'Python, ML, Analytics' },
    { id: 'Frontend Dev', label: 'Frontend Developer', icon: '🎨', desc: 'React, CSS, UI/UX' },
    { id: 'Backend Dev', label: 'Backend Developer', icon: '⚙️', desc: 'API, Database, System Design' },
];

export default function Onboarding() {
    const [name, setName] = useState('');
    const [selectedCareer, setSelectedCareer] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !selectedCareer) return;

        // Save to Backend
        try {
            const response = await fetch('http://127.0.0.1:8000/students/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name,
                    target_career: selectedCareer,
                    current_drift_score: 0
                })
            });

            const data = await response.json();
            if (response.ok) {
                // Save ID to local storage for persistence
                localStorage.setItem('studentId', data.id);
                localStorage.setItem('studentName', data.name);
                localStorage.setItem('targetCareer', data.target_career);
                navigate('/dashboard');
            } else {
                alert('Error creating profile');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to connect to backend');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl p-8 border border-slate-800">
                <div className="text-center mb-8">
                    <div className="inline-block p-3 rounded-full bg-blue-500/10 mb-4">
                        <Target className="w-8 h-8 text-blue-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">set your utility</h1>
                    <p className="text-slate-400">Where do you want to be in 6 months?</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            Your Name
                        </label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="Ex. Alex"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">
                            Select Career Path
                        </label>
                        <div className="space-y-3">
                            {CAREER_OPTIONS.map((option) => (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => setSelectedCareer(option.id)}
                                    className={`w-full flex items-center p-4 rounded-xl border transition-all text-left ${selectedCareer === option.id
                                            ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500'
                                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                        }`}
                                >
                                    <span className="text-2xl mr-4">{option.icon}</span>
                                    <div>
                                        <div className={`font-medium ${selectedCareer === option.id ? 'text-blue-400' : 'text-white'}`}>
                                            {option.label}
                                        </div>
                                        <div className="text-xs text-slate-500">{option.desc}</div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!name || !selectedCareer}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                        Start Tracking <ChevronRight className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
