import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/UI/Button';
import { Card } from '../components/UI/Card';
import { motion } from 'framer-motion';
import { SparklesIcon, ShieldCheckIcon, ChartBarIcon, MapIcon } from '@heroicons/react/24/outline';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { title: 'User Signals Parsing', desc: 'Process customer tickets and survey docs with Gemini NLP.', icon: SparklesIcon },
    { title: 'Horizon Roadmaps', desc: 'Generate multi-phase strategies aligned with strategic goals.', icon: MapIcon },
    { title: 'Aura PM Copilot', desc: 'Query strategy trends and enhance tasks with acceptance cards.', icon: ChartBarIcon }
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col lg:flex-row relative overflow-hidden bg-grid-glow">
      {/* Background Decorative Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[130px] pointer-events-none" />

      {/* Left: Premium Product Presentation */}
      <div className="lg:w-7/12 flex flex-col justify-between p-8 sm:p-16 lg:p-24 z-10">
        <div>
          <span className="text-sm font-extrabold tracking-widest text-indigo-400 uppercase">
            Introducing StratifyAI
          </span>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mt-4 tracking-tight leading-none">
            AI-Driven Customer-Obsessed <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-violet-400 bg-clip-text text-transparent text-glow-indigo">
              Roadmap Studio
            </span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base mt-6 max-w-lg leading-relaxed">
            Ingest customer signals from raw support tickets, identify product objectives, and automatically generate Delivery Horizons using Gemini AI agent loops.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 my-12 lg:my-0">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.15 }}
              className="bg-white/5 border border-white/5 p-5 rounded-2xl flex flex-col justify-between"
            >
              <div className="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-100">{f.title}</h3>
                <p className="text-3xs text-slate-500 mt-1 leading-snug">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer info */}
        <div className="text-3xs text-slate-500 font-semibold flex items-center space-x-1.5">
          <ShieldCheckIcon className="h-4 w-4 text-emerald-500" />
          <span>Tenant Workspace Authentication Encrypted (AES-256)</span>
        </div>
      </div>

      {/* Right: Glassmorphic Auth Form */}
      <div className="lg:w-5/12 flex items-center justify-center p-6 sm:p-12 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 sm:p-10" hoverGlow={false}>
            <div className="text-center mb-8">
              <h2 className="text-2xl font-extrabold text-white tracking-tight">Access Workspace</h2>
              <p className="text-xs text-slate-400 mt-1.5">
                Sign in to resume strategic PM planning
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs px-4 py-2.5 rounded-xl mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="you@company.com"
                />
              </div>

              <div>
                <label className="block text-3xs font-extrabold text-slate-400 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 bg-slate-950/60 border border-white/5 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all"
                  placeholder="••••••••"
                />
              </div>

              <Button type="submit" loading={loading} className="w-full mt-6 py-2.5">
                Log In
              </Button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500 font-semibold">
              Don't have an account?{' '}
              <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-extrabold transition-colors">
                Register here
              </Link>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
