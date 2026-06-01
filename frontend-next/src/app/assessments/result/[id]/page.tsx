'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { assessmentsApi } from '@/lib/api';
import { Trophy, Target, Award, ArrowLeft, BarChart3 } from 'lucide-react';
import Link from 'next/link';

export default function AssessmentResultPage() {
  const { id } = useParams();
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assessmentsApi.getAttempt(id as string).then(res => {
      setResult(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading || !result) return <div className="p-8 text-center">Loading results...</div>;

  const analysis = result.results_analysis;

  return (
    <div className="min-h-screen bg-lp-surface py-12">
      <div className="container max-w-4xl">
        <div className="card mb-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="p-6 bg-lp-accent-light text-lp-accent rounded-full border-4 border-white shadow-xl">
              <Trophy size={48} />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold mb-2">Test Completed!</h1>
          <p className="text-lp-muted mb-8">Here is how you performed in {result.assessment.title}</p>
          
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="p-4 bg-lp-surface rounded-2xl">
              <p className="text-xs text-lp-muted uppercase font-bold mb-1">Score</p>
              <p className="text-2xl font-black">{result.score} / {result.assessment.total_questions}</p>
            </div>
            <div className="p-4 bg-lp-surface rounded-2xl">
              <p className="text-xs text-lp-muted uppercase font-bold mb-1">Percentage</p>
              <p className="text-2xl font-black">{result.percentage.toFixed(1)}%</p>
            </div>
            <div className="p-4 bg-lp-surface rounded-2xl">
              <p className="text-xs text-lp-muted uppercase font-bold mb-1">Status</p>
              <p className={`text-2xl font-black ${result.percentage >= result.assessment.passing_score ? 'text-green-600' : 'text-red-600'}`}>
                {result.percentage >= result.assessment.passing_score ? 'PASSED' : 'FAILED'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <Target className="text-lp-accent" />
              <h3 className="text-lg font-bold">Strengths</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.strengths.length > 0 ? analysis.strengths.map((s: string) => (
                <span key={s} className="badge bg-green-100 text-green-700 py-2 px-4">{s}</span>
              )) : <p className="text-sm text-lp-muted">No specific strengths identified yet.</p>}
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-2 mb-6">
              <Award className="text-red-500" />
              <h3 className="text-lg font-bold">Areas for Improvement</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.weaknesses.length > 0 ? analysis.weaknesses.map((w: string) => (
                <span key={w} className="badge bg-red-100 text-red-700 py-2 px-4">{w}</span>
              )) : <p className="text-sm text-lp-muted">Great job! No major weaknesses found.</p>}
            </div>
          </div>
        </div>

        <div className="card mb-8">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="text-lp-accent" />
            <h3 className="text-lg font-bold">Subject-wise Analysis</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(analysis.categories).map(([cat, stats]: [string, any]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm font-bold mb-1">
                  <span>{cat}</span>
                  <span>{stats.correct} / {stats.total}</span>
                </div>
                <div className="w-full h-2 bg-lp-surface rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-lp-accent transition-all duration-1000" 
                    style={{ width: `${(stats.correct / stats.total) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-center">
          <Link href="/assessments" className="btn-primary flex items-center gap-2">
            <ArrowLeft size={18} /> Back to Assessments
          </Link>
        </div>
      </div>
    </div>
  );
}
