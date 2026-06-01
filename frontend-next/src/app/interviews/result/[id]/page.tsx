'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { interviewsApi } from '@/lib/api';
import { Award, MessageSquare, BarChart2, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function InterviewResultPage() {
  const { id } = useParams();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    interviewsApi.getSession(id as string).then(res => {
      setSession(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading || !session) return <div className="p-8 text-center">Loading session results...</div>;

  const responses = typeof session.responses === 'string' ? JSON.parse(session.responses) : session.responses;

  return (
    <div className="min-h-screen bg-lp-surface py-12">
      <div className="container max-w-4xl">
        <div className="card mb-8 text-center bg-lp-accent text-white">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-white/20 rounded-full border-4 border-white/30 backdrop-blur-md">
              <Award size={64} />
            </div>
          </div>
          <h1 className="text-4xl font-black mb-2">Interview Summary</h1>
          <p className="opacity-80 mb-8">Role Category: {session.category}</p>
          
          <div className="flex justify-center gap-8">
            <div>
              <p className="text-xs font-bold uppercase opacity-60 mb-1">Overall Score</p>
              <p className="text-5xl font-black">{session.overall_score}%</p>
            </div>
          </div>
        </div>

        <div className="card mb-8">
          <div className="flex items-center gap-3 mb-6">
            <MessageSquare className="text-lp-accent" />
            <h3 className="text-xl font-bold">General Feedback</h3>
          </div>
          <p className="text-lg italic text-lp-muted leading-relaxed">
            "{session.feedback}"
          </p>
        </div>

        <div className="space-y-6 mb-8">
          <h3 className="text-xl font-bold flex items-center gap-3">
            <BarChart2 className="text-lp-accent" /> Detailed Breakdown
          </h3>
          {responses.map((resp: any, i: number) => (
            <div key={i} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <span className="badge bg-lp-accent-light text-lp-accent">Question {i + 1}</span>
                <div className="flex gap-1">
                  {[...Array(5)].map((_, star) => (
                    <Award key={star} size={14} className={star < resp.rating ? 'text-yellow-500 fill-current' : 'text-lp-border'} />
                  ))}
                </div>
              </div>
              <p className="font-bold mb-4">{resp.question_text || `Question ID: ${resp.question_id}`}</p>
              <div className="p-4 bg-lp-surface rounded-xl mb-4 text-sm italic border-l-4 border-lp-accent">
                "{resp.response}"
              </div>
              <div className="flex items-start gap-2 text-xs font-medium text-lp-muted bg-lp-accent-faint p-3 rounded-lg">
                <Bot size={14} className="mt-0.5" />
                <span><strong className="text-lp-accent">AI Insight:</strong> {resp.feedback}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <Link href="/interviews" className="btn-primary flex items-center gap-2">
            <ArrowLeft size={18} /> Back to Dashboard
          </Link>
          <Link href={`/interviews/${session.category.toLowerCase()}`} className="btn-primary bg-white !text-lp-accent border border-lp-accent flex items-center gap-2">
            <RefreshCw size={18} /> Retake Practice
          </Link>
        </div>
      </div>
    </div>
  );
}

// Minimal Bot icon for the breakdown
function Bot({ size, className }: { size: number, className?: string }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" />
      <line x1="16" y1="16" x2="16" y2="16" />
    </svg>
  );
}
