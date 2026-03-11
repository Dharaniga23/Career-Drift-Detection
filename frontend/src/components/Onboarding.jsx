import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Target, ChevronRight, User, Mail, Lock, CheckCircle2, Github, Twitter, Chrome } from 'lucide-react';
import illustration from '../assets/career_navigation_illustration.png';


export default function Onboarding() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        const endpoint = isLogin ? 'login' : 'register';
        const payload = isLogin
            ? { email, password }
            : { name, email, password, target_career: "" };

        if (!email || !password || (!isLogin && !name)) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            if (response.ok) {
                if (isLogin) {
                    localStorage.setItem('studentId', data.id);
                    localStorage.setItem('studentName', data.name);
                    localStorage.setItem('targetCareer', data.target_career);
                    navigate('/dashboard');
                } else {
                    alert('Registration successful! Please login to continue.');
                    setIsLogin(true);
                    setPassword('');
                }
            } else {
                alert(data.detail || 'Error during authentication');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to connect to backend');
        }
    };

    return (
        <div className="w-screen h-[100dvh] bg-slate-950 flex items-center justify-center font-sans selection:bg-blue-500/30 overflow-hidden relative fixed top-0 left-0">
            {/* Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-slate-950 to-violet-900/20"></div>
                <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[130px] rounded-full"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-violet-600/10 blur-[120px] rounded-full"></div>

                {/* Integrated Illustration Background */}
                <div className="absolute inset-0 z-0 opacity-50 pointer-events-none">
                    <img
                        src={illustration}
                        alt=""
                        className="w-full h-full object-cover transition-transform duration-1000 ease-out grayscale-[0.2] contrast-[1.1]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent"></div>
                </div>
            </div>

            {/* Content Container */}
            <div className="relative z-10 w-full h-full flex flex-col items-start justify-between px-6 lg:px-20 py-12">

                {/* Header/Logo */}
                <div className="flex items-center gap-2 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="p-2 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 shadow-lg shadow-blue-500/20">
                        <Target className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold font-display tracking-tight text-white">CareerCompass<span className="text-blue-500">AI</span></span>
                </div>

                <div className="w-full flex items-center justify-start flex-1 animate-in fade-in slide-in-from-left-8 duration-1000 overflow-hidden">
                    {/* Left-Aligned Merged Login Box */}
                    <div className="flex items-center justify-start w-full lg:w-1/2 h-full max-h-[80vh]">
                        <div className="glass p-6 sm:p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl border border-white/10 relative overflow-hidden group flex flex-col h-full">
                            {/* Decorative flare inside the box */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-500/10 blur-[60px] rounded-full group-hover:bg-blue-500/20 transition-all duration-700"></div>

                            <div className="relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar pt-4">
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold text-white mb-2 tracking-tight font-display">
                                        {isLogin ? 'Welcome back' : 'Create Account'}
                                    </h2>
                                    <p className="text-slate-400 font-medium">
                                        {isLogin ? 'Please enter your details.' : 'Step into your new professional future.'}
                                    </p>
                                </div>


                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {!isLogin && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                                <input
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                                                    placeholder="Alex Johnson"
                                                    required={!isLogin}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                                                placeholder="name@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center ml-1">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                                            {isLogin && <button type="button" className="text-[10px] font-bold text-blue-500 uppercase tracking-widest hover:text-blue-400">Forgot?</button>}
                                        </div>
                                        <div className="relative group">
                                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                            <input
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                                                placeholder="••••••••"
                                                required
                                            />
                                        </div>
                                    </div>



                                    <div className="flex items-center ml-1 py-1">
                                        <input
                                            id="remember-me"
                                            type="checkbox"
                                            checked={rememberMe}
                                            onChange={(e) => setRememberMe(e.target.checked)}
                                            className="w-4 h-4 rounded border-white/10 bg-white/5 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                                        />
                                        <label htmlFor="remember-me" className="ml-2 text-xs font-semibold text-slate-500">Keep me logged in</label>
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-4 active:scale-[0.98]"
                                    >
                                        {isLogin ? 'Sign In' : 'Get Started'} <ChevronRight className="w-5 h-5" />
                                    </button>

                                    <p className="text-center text-slate-500 text-sm mt-6 font-medium">
                                        {isLogin ? "New here? " : "Already joined? "}
                                        <button
                                            type="button"
                                            onClick={() => setIsLogin(!isLogin)}
                                            className="text-blue-500 hover:text-blue-400 font-bold hover:underline underline-offset-4 decoration-blue-500/50"
                                        >
                                            {isLogin ? 'Create Account' : 'Log in here'}
                                        </button>
                                    </p>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

                <footer className="w-full text-center animate-in fade-in duration-1000">
                    <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.2em]">© {new Date().getFullYear()} CareerCompass AI • Powered by Intelligence</p>
                </footer>
            </div>
        </div>
    );
}

