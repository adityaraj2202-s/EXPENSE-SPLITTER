import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../api';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Wallet,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Zap,
  Split,
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const demoAccounts = [
    { name: 'Aditya', email: 'aditya@test.com' },
    { name: 'Shrestha', email: 'shri@test.com' },
    { name: 'Siddharth', email: 'sid@test.com' },
    { name: 'Demo Test', email: 'test@test.com' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center relative overflow-hidden bg-mesh-dark">
      {/* Ambient background glow orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40%] right-[20%] w-[350px] h-[350px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          
          {/* ========================================================= */}
          {/* LEFT COLUMN: Visual Hero & Feature Showcase */}
          {/* ========================================================= */}
          <div className="lg:col-span-7 space-y-8 py-4">
            
            {/* Brand Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Smart Expense Splitter • ALTA Track A</span>
            </div>

            {/* Hero Heading */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight text-white">
                Split bills simply. <br />
                <span className="bg-gradient-to-r from-indigo-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                  Settle debts smartly.
                </span>
              </h1>
              <p className="text-base sm:text-lg text-slate-400 max-w-xl leading-relaxed">
                No more confusing spreadsheets or awkward repayment math. Track group trips, roommate bills, and shared dinners with instant debt simplification.
              </p>
            </div>

            {/* Interactive Feature Graphic Card */}
            <div className="p-6 rounded-2xl glass-card-dark border border-slate-800 shadow-2xl space-y-4 max-w-xl animate-float">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20">
                    <Split className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Trip to Goa 🏖️</h3>
                    <p className="text-xs text-slate-400">4 members • 8 total expenses</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
                  Auto-Optimized
                </span>
              </div>

              {/* Debt Simplification Visual Indicator */}
              <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800/90 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-slate-300 font-medium">6 debts collapsed to 2 transactions</span>
                </div>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> 67% fewer transfers
                </span>
              </div>

              {/* Sample Mini Cards */}
              <div className="grid grid-cols-2 gap-2.5 pt-1 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <p className="text-slate-400">Total Group Bill</p>
                  <p className="text-base font-bold text-white mt-0.5">₹12,450.00</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/60">
                  <p className="text-slate-400">Your Share</p>
                  <p className="text-base font-bold text-emerald-400 mt-0.5">+₹1,850.00</p>
                </div>
              </div>
            </div>

            {/* Feature Bullets */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl pt-2">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Exact & Equal Splits</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <Zap className="w-4 h-4" />
                </div>
                <span>Greedy Simplification</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>JWT Secure Auth</span>
              </div>
            </div>

          </div>

          {/* ========================================================= */}
          {/* RIGHT COLUMN: Upgraded Login Card */}
          {/* ========================================================= */}
          <div className="lg:col-span-5 w-full">
            <div className="relative">
              {/* Card Glow Rim */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500 rounded-3xl blur opacity-30 group-hover:opacity-100 transition duration-1000" />
              
              <div className="relative bg-slate-900/90 border border-slate-800 p-7 sm:p-9 rounded-3xl shadow-2xl backdrop-blur-xl space-y-6">
                
                {/* Header */}
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 mb-4">
                    <Wallet className="w-6 h-6" />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h2>
                  <p className="text-sm text-slate-400">Sign in to your account to manage expenses</p>
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-2.5 text-rose-400 text-sm animate-pulse-subtle">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Email Input */}
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Mail className="w-4 h-4" />
                      </div>
                      <input
                        type="email"
                        required
                        placeholder="you@example.com"
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Password Input with Show/Hide Toggle */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        className="w-full pl-10 pr-11 py-2.5 bg-slate-950/60 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Quick-Fill Demo Chips */}
                  <div className="pt-1">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-indigo-400" />
                      Quick fill demo accounts (Pass: password123):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {demoAccounts.map((acc) => (
                        <button
                          key={acc.email}
                          type="button"
                          onClick={() => handleQuickFill(acc.email)}
                          className="px-2.5 py-1 text-xs rounded-lg bg-slate-800/80 hover:bg-indigo-600/30 hover:border-indigo-500/50 border border-slate-700 text-slate-300 transition"
                        >
                          {acc.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Authenticating...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Footer Switch to Sign Up */}
                <div className="pt-4 border-t border-slate-800/80 text-center">
                  <p className="text-sm text-slate-400">
                    Don&apos;t have an account yet?{' '}
                    <Link
                      to="/signup"
                      className="font-medium text-indigo-400 hover:text-indigo-300 transition underline underline-offset-4"
                    >
                      Create Account
                    </Link>
                  </p>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
