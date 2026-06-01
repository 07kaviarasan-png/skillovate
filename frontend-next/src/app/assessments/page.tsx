'use client';

import { useEffect, useState } from 'react';
import { assessmentsApi } from '@/lib/api';
import Link from 'next/link';
import { BookOpen, Clock, Trophy, ChevronRight } from 'lucide-react';

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    assessmentsApi.list({ limit: 10 }).then(res => {
      setAssessments(res.data.items);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading assessments...</div>;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">Assessments</h1>
          <p className="text-lp-muted">Evaluate your skills with adaptive aptitude tests.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((assessment) => (
          <div key={assessment.id} className="card hover:border-lp-accent transition-colors">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-lp-accent-light text-lp-accent rounded-xl">
                <BookOpen size={24} />
              </div>
              <span className={`badge ${
                assessment.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                assessment.difficulty === 'medium' ? 'bg-blue-100 text-blue-700' :
                'bg-red-100 text-red-700'
              }`}>
                {assessment.difficulty.toUpperCase()}
              </span>
            </div>
            
            <h3 className="text-xl font-bold mb-2">{assessment.title}</h3>
            <p className="text-sm text-lp-muted mb-6 line-clamp-2">{assessment.description}</p>
            
            <div className="flex items-center gap-4 text-sm text-lp-muted mb-6">
              <div className="flex items-center gap-1">
                <Clock size={16} />
                {assessment.duration_minutes}m
              </div>
              <div className="flex items-center gap-1">
                <Trophy size={16} />
                Pass: {assessment.passing_score}%
              </div>
            </div>
            
            <Link 
              href={`/assessments/${assessment.id}`}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Take Test <ChevronRight size={18} />
            </Link>
          </div>
        ))}

        {assessments.length === 0 && (
          <div className="col-span-full py-12 text-center card bg-lp-surface border-dashed">
            <p className="text-lp-muted">No assessments available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
}
