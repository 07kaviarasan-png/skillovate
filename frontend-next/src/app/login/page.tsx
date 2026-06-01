'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { BrainCircuit, ArrowRight, User, Mail, Lock, ShieldCheck } from 'lucide-react';

export default function StudentLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || isAuthenticated) {
    return <div className="min-h-screen bg-[#FCFDFF]" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    try {
      await login(formData);
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FCFDFF] z-[100] overflow-y-auto">
      {/* Left Sidebar */}
      <div className="hidden lg:flex w-[400px] xl:w-[450px] bg-lp-accent flex-col p-12 text-white relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] right-[-10%] w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-60 h-60 bg-lp-accent-dark/30 rounded-full blur-2xl"></div>
        
        <div className="relative z-10 flex-1">
          <Link href="/" className="inline-block mb-16">
            <span className="text-3xl font-black tracking-tighter">SKILLOVATE</span>
          </Link>

          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest border border-white/20">
              <BrainCircuit size={12} /> AI-Powered Aptitude Training
            </div>
            
            <h1 className="text-5xl font-black leading-[1.1]">
              Train smarter.<br />Score higher.
            </h1>
            
            <p className="text-white/70 text-lg leading-relaxed max-w-sm">
              Adaptive AI that learns your weak spots, builds your profile, and connects you to real opportunities — all in one platform.
            </p>

            <div className="grid grid-cols-2 gap-y-10 gap-x-6 pt-10">
              <StatItem value="2.4L+" label="Students trained" />
              <StatItem value="91.4%" label="AI accuracy" />
              <StatItem value="30+" label="Job role paths" />
              <StatItem value="450+" label="Colleges enrolled" />
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-10 flex items-center gap-4">
          <div className="flex -space-x-2">
            {['AR', 'PK', 'VR', 'SM'].map((initial, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-lp-accent bg-white/20 flex items-center justify-center text-[10px] font-bold">
                {initial}
              </div>
            ))}
          </div>
          <span className="text-xs font-bold text-white/60">Joined this week from 38 colleges</span>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F4F7FF] relative">
        {/* Large Faint Watermark Logo */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <span className="text-[20vw] font-black tracking-tighter">SKILLOVATE</span>
        </div>

        <div className="w-full max-w-[480px] relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-lp-text mb-3">Learner Login</h2>
            <p className="text-lp-muted font-medium">Sign in to your Skillovate account</p>
          </div>

          <div className="bg-white p-10 rounded-[32px] shadow-xl shadow-lp-accent/5 border border-lp-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 flex items-center gap-2">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-black text-lp-muted uppercase tracking-[0.15em] ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-lp-muted" size={18} />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-lp-surface border-2 border-transparent focus:border-lp-accent rounded-2xl outline-none transition-all font-medium text-lp-text"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-[11px] font-black text-lp-muted uppercase tracking-[0.15em]">Password</label>
                  <Link href="#" className="text-[11px] font-bold text-lp-accent hover:underline">Forgot Password?</Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-lp-muted" size={18} />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-lp-surface border-2 border-transparent focus:border-lp-accent rounded-2xl outline-none transition-all font-medium text-lp-text"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn-primary w-full py-5 text-base flex items-center justify-center gap-2 rounded-2xl shadow-lg shadow-lp-accent/30 mt-4"
              >
                Sign In <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-lp-border text-center">
              <p className="text-sm text-lp-muted font-medium">
                Don't have an account? <Link href="/register" className="text-lp-accent font-black hover:underline">Create one for free</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ value, label }: { value: string, label: string }) {
  return (
    <div>
      <div className="text-3xl font-black mb-1">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-widest text-white/50">{label}</div>
    </div>
  );
}
