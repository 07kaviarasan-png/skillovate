'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { ArrowRight, BrainCircuit, Target, Briefcase } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  if (loading || isAuthenticated) {
    return <div className="min-h-screen bg-[#FCFDFF]" />;
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="hero relative overflow-hidden bg-[#FCFDFF] pt-20 pb-32">
        {/* Atmospheric Backgrounds */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-[10%] w-[50%] h-[50%] bg-[radial-gradient(circle_at_center,rgba(27,111,230,0.12)_0%,transparent_60%)]"></div>
          <div className="absolute bottom-0 left-[5%] w-[40%] h-[40%] bg-[radial-gradient(circle_at_center,rgba(27,111,230,0.08)_0%,transparent_50%)]"></div>
          {/* Grid Pattern */}
          <div className="absolute inset-0" style={{ 
            backgroundImage: `linear-gradient(rgba(27, 111, 230, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(27, 111, 230, 0.05) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}></div>
        </div>

        <div className="w-full px-10 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-[7fr_3fr] gap-10 items-start">
            <div className="hero-content lg:ml-10 mt-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-lp-accent-light text-lp-accent rounded-full text-xs font-bold mb-4 border border-lp-accent/10">
                <Target size={14} />
                <span>AI-Powered Placement Prep</span>
              </div>
              
              <h1 className="text-[72px] font-black leading-[1.1] mb-6 text-lp-text">
                Train <span className="bg-gradient-to-b from-[#4299E1] to-lp-accent bg-clip-text text-transparent [text-shadow:0_10px_30px_rgba(27,111,230,0.2)]">Smarter</span>.<br />
                Score <span className="bg-gradient-to-b from-[#4299E1] to-lp-accent bg-clip-text text-transparent [text-shadow:0_10px_30px_rgba(27,111,230,0.2)]">Higher</span>.<br />
                Get <span className="bg-gradient-to-b from-[#4299E1] to-lp-accent bg-clip-text text-transparent [text-shadow:0_10px_30_rgba(27,111,230,0.2)]">Hired</span>.
              </h1>
              
              <p className="text-lg text-lp-muted mb-10 max-w-xl leading-relaxed">
                The most advanced platform for AI-powered aptitude training, career pathing, and campus-to-corporate success.
              </p>
              
              <div className="flex flex-wrap items-center gap-5">
                <Link href="/register" className="btn-primary !px-8 !py-4 text-base shadow-[0_8px_24px_rgba(27,111,230,0.35)]">
                  Sign up free
                </Link>
                <Link href="/login" className="bg-black text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 hover:bg-[#222] transition-all hover:-translate-y-1 hover:shadow-xl">
                  Login <ArrowRight size={20} />
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block h-[600px] -mr-20 animate-in fade-in slide-in-from-right-10 duration-1000">
              <div className="w-full h-full bg-black rounded-l-[40px] shadow-[-20px_0_60px_rgba(30,35,80,0.1)] overflow-hidden">
                <video 
                  autoPlay 
                  loop 
                  muted 
                  playsInline 
                  className="w-full h-full object-cover"
                >
                  <source src="/hero_video.mp4" type="video/mp4" />
                </video>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-lp-surface">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-4xl font-black mb-4">Powerful Features</h2>
            <p className="text-lp-muted">Everything you need to master your career journey.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<BrainCircuit className="text-lp-accent" size={32} />}
              title="Adaptive Learning"
              description="Our AI engine identifies your weak spots and curates personalized question banks."
            />
            <FeatureCard 
              icon={<Target className="text-lp-accent" size={32} />}
              title="AI Mock Interviews"
              description="Practice with our hyper-realistic AI interviewer. Get instant feedback on your performance."
            />
            <FeatureCard 
              icon={<Briefcase className="text-lp-accent" size={32} />}
              title="Direct Placements"
              description="Top companies hire directly from Skillovate based on your verified skill scores."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-20 items-center">
            <div>
              <h2 className="text-5xl font-black mb-8">About Skillovate</h2>
              <div className="space-y-6 text-lp-muted text-lg leading-relaxed">
                <p>Skillovate is an <strong>AI-first Career Intelligence Platform</strong> designed to bridge the gap between academic learning and corporate expectations.</p>
                <p>We leverage advanced machine learning models to analyze thousands of data points from successful hires at top MNCs, creating a precision training path for every student.</p>
                <p>Our mission is to democratize high-end placement training and provide every student with an equal opportunity to land their dream job.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-5">
              <AboutCard title="AI Career Pathing" desc="Find the perfect role based on your strengths." />
              <AboutCard title="Verified Skill Badges" desc="Showcase your expertise to recruiters." />
              <AboutCard title="Industry Integration" desc="Curriculum aligned with global standards." />
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-lp-border bg-[#FCFDFF]">
        <div className="container mx-auto px-6 text-center">
          <p className="text-lp-muted text-sm">© 2026 Skillovate AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-10 rounded-3xl border border-lp-border shadow-sm hover:border-lp-accent transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-lp-accent/10 group cursor-pointer">
      <div className="w-16 h-16 rounded-2xl bg-lp-accent-light flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-4">{title}</h3>
      <p className="text-lp-muted text-sm leading-relaxed">{description}</p>
    </div>
  );
}

function AboutCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-lp-border flex items-center gap-5 hover:border-lp-accent hover:translate-x-[-12px] hover:scale-[1.02] transition-all cursor-pointer shadow-sm">
      <div className="w-12 h-12 rounded-xl bg-lp-accent-light flex-shrink-0" />
      <div>
        <h4 className="font-bold text-lp-text">{title}</h4>
        <p className="text-sm text-lp-muted">{desc}</p>
      </div>
    </div>
  );
}
