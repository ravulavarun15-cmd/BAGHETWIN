import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Cpu,
  Eye,
  EyeOff,
  Flame,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
  User,
  Zap
} from 'lucide-react';
import * as api from '../../services/api';

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('admin@sih26120.local');
  const [password, setPassword] = useState('admin123');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'admin' | 'user'>('admin');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated background telemetry particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const numNodes = Math.min(50, Math.floor((width * height) / 24000));
    const nodes = Array.from({ length: numNodes }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.4 ? 'rgba(245, 158, 11, ' : 'rgba(249, 115, 22, '
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw connection lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.18;
            ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.fillStyle = `${node.color} 0.6)`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handleRoleSelect = (r: 'admin' | 'user') => {
    setRole(r);
    if (r === 'admin') {
      setEmail('admin@sih26120.local');
      setPassword('admin123');
    } else {
      setEmail('user@sih26120.local');
      setPassword('user123');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (mode === 'signup') {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return;
      }
    }

    setBusy(true);
    try {
      if (mode === 'signup') {
        await api.signup(name, email, password);
        setSuccessMsg('Account created successfully! Please sign in with your credentials.');
        setMode('login');
        setPassword('');
        setConfirmPassword('');
      } else {
        const response = await api.login(email, password);
        localStorage.setItem('token', response.data.access_token);
        onLogin(response.data.user);
      }
    } catch (err: any) {
      const detail = err?.response?.data?.detail;
      const status = err?.response?.status;
      if (mode === 'login') {
        if (status === 404) setError('Account not found. Please create an account first.');
        else if (status === 401) setError('Invalid username or password. Please verify credentials.');
        else setError(detail || 'Authentication failed. Please verify the backend is running.');
      } else {
        setError(detail || 'Registration failed. An account with this email may already exist.');
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#06111f] grid-bg flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      {/* Interactive Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none opacity-60 z-0"
      />

      {/* Atmospheric Glow Orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-orange-500/15 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-amber-600/5 blur-[140px] pointer-events-none" />

      {/* Main Container Card */}
      <div className="w-full max-w-5xl glass-panel rounded-3xl overflow-hidden relative z-10 border border-amber-500/25 shadow-2xl shadow-black/70 grid md:grid-cols-12 animate-fade-in-up">
        
        {/* Left Branding / Field Overview Panel (5 cols) */}
        <div className="md:col-span-5 p-8 md:p-10 bg-gradient-to-br from-[#1a1207]/95 via-[#130f09]/85 to-[#0b0e13]/95 border-b md:border-b-0 md:border-r border-amber-900/30 flex flex-col justify-between relative overflow-hidden">
          
          <div className="relative z-10">
            {/* Header Brand */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/25 flex items-center justify-center">
                <Flame size={24} className="text-slate-950" />
              </div>
              <div>
                <div className="text-xl font-black tracking-wider text-white">
                  BAGHE<span className="gradient-text">TWIN</span>
                </div>
                <div className="text-[10px] uppercase font-bold tracking-[0.2em] text-amber-400">
                  Heavy Oil Digital Twin
                </div>
              </div>
            </div>

            {/* Industrial Headline */}
            <div className="mt-10 md:mt-14">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-semibold mb-4">
                <span className="w-2 h-2 rounded-full bg-amber-400 pulse-amber" />
                Heavy Oil Operations Platform
              </span>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight">
                Well-to-Surface <br />
                <span className="gradient-text">Intelligence.</span>
              </h1>
              <p className="mt-4 text-sm text-slate-300 leading-relaxed font-normal">
                Next-generation digital twin platform for <b>Baghewala Field</b>, Rajasthan. 
                Integrating Cyclic Steam Stimulation (CSS) and Sucker Rod Pump (SRP) optimization with real-time physics and ML forecasting.
              </p>
            </div>

            {/* Key Field Specs */}
            <div className="mt-8 space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-slate-300">
                <span className="text-slate-400">Target Field:</span>
                <span className="font-semibold text-white">Baghewala (Rajasthan Basin)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-slate-300">
                <span className="text-slate-400">Crude Character:</span>
                <span className="font-semibold text-white">Heavy Oil (~17° API, high viscosity)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 text-slate-300">
                <span className="text-slate-400">Monitored Fleet:</span>
                <span className="font-semibold text-amber-300">35 Wells (28 Operational)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Authentication Form Panel (7 cols) */}
        <div className="md:col-span-7 p-8 md:p-12 bg-[#0a0f16]/95 flex flex-col justify-center relative">
          
          <div className="max-w-md w-full mx-auto">
            {/* Top Switcher: Sign In vs Sign Up */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-black text-white">
                  {mode === 'login' ? 'Operations Access' : 'Create Account'}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {mode === 'login'
                    ? 'Authenticate to access live telemetry and optimization'
                    : 'Register an authorized digital twin operator profile'}
                </p>
              </div>

              {/* Mode Toggle Pills */}
              <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-700/60">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'login'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError('');
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    mode === 'signup'
                      ? 'bg-gradient-to-r from-amber-400 to-orange-400 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Quick Demo Role Selectors (Login Mode Only) */}
            {mode === 'login' && (
              <div className="mb-6">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                  Quick Access Profile
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('admin')}
                    className={`p-2.5 rounded-xl border text-left transition-all btn-tactile flex items-center justify-between ${
                      role === 'admin'
                        ? 'bg-amber-500/15 border-amber-400/50 text-amber-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">Field Supervisor</div>
                      <div className="text-[10px] opacity-75">admin@sih26120.local</div>
                    </div>
                    {role === 'admin' && <CheckCircle2 size={16} className="text-amber-400" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('user')}
                    className={`p-2.5 rounded-xl border text-left transition-all btn-tactile flex items-center justify-between ${
                      role === 'user'
                        ? 'bg-amber-500/15 border-amber-400/50 text-amber-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-xs">Field Operator</div>
                      <div className="text-[10px] opacity-75">user@sih26120.local</div>
                    </div>
                    {role === 'user' && <CheckCircle2 size={16} className="text-amber-400" />}
                  </button>
                </div>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Operator Full Name
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      required
                      type="text"
                      placeholder="e.g., Rajesh Sharma"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Corporate Email / Username
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    required
                    type="email"
                    placeholder="operator@baghetwin.local"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                  <input
                    required
                    minLength={6}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <KeyRound size={16} className="absolute left-3.5 top-3.5 text-slate-500" />
                    <input
                      required
                      minLength={6}
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950/70 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                    />
                  </div>
                </div>
              )}

              {/* Status & Error Alerts */}
              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
                  <AlertCircle size={16} className="shrink-0 text-rose-400" />
                  <span>{error}</span>
                </div>
              )}

              {successMsg && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={busy}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-amber-500/25 btn-tactile flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {busy ? (
                  <>
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Authenticating Operator...</span>
                  </>
                ) : mode === 'login' ? (
                  <>
                    <span>Sign In to BAGHETWIN Console</span>
                    <Zap size={16} />
                  </>
                ) : (
                  <>
                    <span>Create Operations Account</span>
                    <ShieldCheck size={16} />
                  </>
                )}
              </button>
            </form>

            <p className="text-[11px] text-center text-slate-500 mt-6">
              Industrial Digital Twin Framework · Secure TLS Authorization · Baghewala Sector
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
