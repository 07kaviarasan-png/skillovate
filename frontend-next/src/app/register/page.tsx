'use client';

import { useState } from 'react';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';
import Link from 'next/link';
import { BrainCircuit, User, Mail, Lock, Briefcase, GraduationCap, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isAuthenticated, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || isAuthenticated) {
    return <div className="min-h-screen bg-[#FCFDFF]" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      await authApi.register(formData);
      router.replace('/login?registered=true');
    } catch (err) {
      setError('Registration failed. Username or email might already exist.');
    } finally {
      setLoading(false);
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
              <BrainCircuit size={12} /> Join the Ecosystem
            </div>
            
            <h1 className="text-5xl font-black leading-[1.1]">
              Start your<br />journey today.
            </h1>
            
            <p className="text-white/70 text-lg leading-relaxed max-w-sm">
              Create your account to access AI-powered training, verified skill badges, and direct placement opportunities.
            </p>

            <div className="grid grid-cols-2 gap-y-10 gap-x-6 pt-10">
              <StatItem value="2.4L+" label="Students active" />
              <StatItem value="450+" label="Colleges connected" />
              <StatItem value="12k+" label="Monthly tests" />
              <StatItem value="94%" label="Success rate" />
            </div>
          </div>
        </div>
      </div>

      {/* Right Content */}
      <div className="flex-1 flex items-center justify-center p-8 bg-[#F4F7FF] relative overflow-y-auto">
        <div className="w-full max-w-[520px] relative z-10 py-12">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-black text-lp-text mb-3">Create Account</h2>
            <p className="text-lp-muted font-medium">Join Skillovate and unlock your potential</p>
          </div>

          <div className="bg-white p-10 rounded-[32px] shadow-xl shadow-lp-accent/5 border border-lp-border">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 flex items-center gap-2">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    formData.role === 'student' ? 'border-lp-accent bg-lp-accent-light text-lp-accent' : 'border-transparent bg-lp-surface text-lp-muted'
                  }`}
                >
                  <GraduationCap size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Student</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: 'recruiter' })}
                  className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${
                    formData.role === 'recruiter' ? 'border-lp-accent bg-lp-accent-light text-lp-accent' : 'border-transparent bg-lp-surface text-lp-muted'
                  }`}
                >
                  <Briefcase size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Recruiter</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-lp-muted uppercase tracking-[0.15em] ml-1">Username</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-lp-muted" size={18} />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-lp-surface border-2 border-transparent focus:border-lp-accent rounded-2xl outline-none transition-all font-medium text-lp-text"
                    placeholder="johndoe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-lp-muted uppercase tracking-[0.15em] ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-lp-muted" size={18} />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-lp-surface border-2 border-transparent focus:border-lp-accent rounded-2xl outline-none transition-all font-medium text-lp-text"
                    placeholder="name@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-lp-muted uppercase tracking-[0.15em] ml-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-lp-muted" size={18} />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 bg-lp-surface border-2 border-transparent focus:border-lp-accent rounded-2xl outline-none transition-all font-medium text-lp-text"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full py-5 text-base flex items-center justify-center gap-2 rounded-2xl shadow-lg shadow-lp-accent/30 mt-4 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Get Started Now'} <ArrowRight size={18} />
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-lp-border text-center">
              <p className="text-sm text-lp-muted font-medium">
                Already have an account? <Link href="/login" className="text-lp-accent font-black hover:underline">Sign In</Link>
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
