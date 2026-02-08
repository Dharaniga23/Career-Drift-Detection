import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ChevronRight, User, Mail, Lock } from 'lucide-react';

const CAREER_OPTIONS = [
    { id: 'Data Scientist', label: 'Data Scientist', icon: '📊', desc: 'Python, ML, Analytics' },
    { id: 'Frontend Dev', label: 'Frontend Developer', icon: '🎨', desc: 'React, CSS, UI/UX' },
    { id: 'Backend Dev', label: 'Backend Developer', icon: '⚙️', desc: 'API, Database, System Design' },
];

export default function Onboarding() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedCareer, setSelectedCareer] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const endpoint = isLogin ? 'login' : 'register';
        const payload = isLogin
            ? { email, password }
            : { name, email, password, target_career: selectedCareer };

        if (!email || !password || (!isLogin && (!name || !selectedCareer))) return;

        try {
            const response = await fetch(`http://127.0.0.1:8000/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok) {
                localStorage.setItem('studentId', data.id);
                localStorage.setItem('studentName', data.name);
                localStorage.setItem('targetCareer', data.target_career);
                navigate('/dashboard');
            } else {
                alert(data.detail || 'Error during authentication');
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
                    <h1 className="text-2xl font-bold text-white mb-2">
                        {isLogin ? 'Welcome Back' : 'Set Your Utility'}
                    </h1>
                    <p className="text-slate-400">
                        {isLogin ? 'Login to track your progress' : 'Where do you want to be in 6 months?'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">
                                Your Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="Ex. Alex"
                                    required={!isLogin}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="alex@example.com"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {!isLogin && (
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-2">
                                Select Career Path
                            </label>
                            <div className="grid grid-cols-1 gap-2">
                                {CAREER_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        type="button"
                                        onClick={() => setSelectedCareer(option.id)}
                                        className={`flex items-center p-3 rounded-xl border transition-all text-left ${selectedCareer === option.id
                                            ? 'bg-blue-600/10 border-blue-500 ring-1 ring-blue-500'
                                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                            }`}
                                    >
                                        <span className="text-xl mr-3">{option.icon}</span>
                                        <div>
                                            <div className={`text-sm font-medium ${selectedCareer === option.id ? 'text-blue-400' : 'text-white'}`}>
                                                {option.label}
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4"
                    >
                        {isLogin ? 'Login' : 'Start Tracking'} <ChevronRight className="w-5 h-5" />
                    </button>

                    <p className="text-center text-sm text-slate-500 mt-4">
                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-blue-400 hover:text-blue-300 font-semibold"
                        >
                            {isLogin ? 'Sign Up' : 'Login'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}
