'use client';

import { useParams, useRouter } from 'next/navigation';
import { useInterview } from '@/lib/hooks/useInterview';
import { MessageSquare, ShieldCheck, Play, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function InterviewCategoryPage() {
  const { category } = useParams();
  const router = useRouter();
  const { startInterview, loading } = useInterview();

  const handleStart = async () => {
    try {
      const data = await startInterview(category as string);
      router.push(`/interviews/session/${data.session.id}`);
    } catch (err) {
      alert('Failed to start interview. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-lp-surface py-12">
      <div className="container max-w-3xl">
        <Link href="/interviews" className="flex items-center gap-2 text-lp-muted hover:text-lp-accent mb-8 transition-colors">
          <ArrowLeft size={18} /> Back to Categories
        </Link>

        <div className="card text-center py-12">
          <div className="flex justify-center mb-8">
            <div className="p-6 bg-lp-accent-light text-lp-accent rounded-3xl">
              <MessageSquare size={48} />
            </div>
          </div>
          
          <h1 className="text-4xl font-black mb-4 capitalize">{category} Mock Interview</h1>
          <p className="text-lp-muted text-lg mb-10 max-w-xl mx-auto">
            This AI-powered interview will evaluate your technical knowledge and communication skills for {category} roles.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 text-left">
            <div className="p-4 bg-lp-surface rounded-2xl border border-lp-border">
              <div className="text-lp-accent mb-2">< ShieldCheck size={20} /></div>
              <p className="text-xs font-bold uppercase text-lp-muted mb-1">Type</p>
              <p className="font-bold">Chat-based</p>
            </div>
            <div className="p-4 bg-lp-surface rounded-2xl border border-lp-border">
              <div className="text-lp-accent mb-2">< ShieldCheck size={20} /></div>
              <p className="text-xs font-bold uppercase text-lp-muted mb-1">Questions</p>
              <p className="font-bold">10-15 Mixed</p>
            </div>
            <div className="p-4 bg-lp-surface rounded-2xl border border-lp-border">
              <div className="text-lp-accent mb-2">< ShieldCheck size={20} /></div>
              <p className="text-xs font-bold uppercase text-lp-muted mb-1">Duration</p>
              <p className="font-bold">~20 Minutes</p>
            </div>
          </div>

          <button 
            onClick={handleStart}
            disabled={loading}
            className="btn-primary py-4 px-12 text-lg flex items-center gap-3 mx-auto"
          >
            {loading ? 'Preparing Session...' : 'Start Interview'} <Play size={20} fill="currentColor" />
          </button>
          
          <p className="text-xs text-lp-muted mt-6">
            By starting, you agree to our practice guidelines.
          </p>
        </div>
      </div>
    </div>
  );
}
