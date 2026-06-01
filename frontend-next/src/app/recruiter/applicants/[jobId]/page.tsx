'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { placementsApi } from '@/lib/api';
import { User, FileText, Calendar, CheckCircle, XCircle, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function JobApplicantsPage() {
  const { jobId } = useParams();
  const [applicants, setApplicants] = useState<any[]>([]);
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      placementsApi.getJob(jobId as string),
      placementsApi.getJobApplicants(jobId as string)
    ]).then(([jRes, aRes]) => {
      setJob(jRes.data);
      setApplicants(aRes.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [jobId]);

  const handleStatusUpdate = async (appId: number, status: string) => {
    try {
      await placementsApi.updateApplication(appId, { status });
      setApplicants(applicants.map(a => a.id === appId ? { ...a, status } : a));
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  if (loading || !job) return <div className="p-8 text-center">Loading applicant data...</div>;

  return (
    <div className="container py-8">
      <Link href="/recruiter/jobs" className="flex items-center gap-2 text-lp-muted hover:text-lp-accent mb-8 transition-colors">
        <ChevronLeft size={18} /> Back to Jobs
      </Link>

      <div className="mb-10">
        <h1 className="text-3xl font-black mb-2">Applicants for {job.title}</h1>
        <p className="text-lp-muted">{applicants.length} candidates applied for this position.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {applicants.map((app) => (
          <div key={app.id} className="card flex flex-col md:flex-row justify-between gap-6">
            <div className="flex gap-6">
              <div className="w-16 h-16 bg-lp-surface rounded-full flex items-center justify-center text-lp-accent">
                <User size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">{app.user.username}</h3>
                <p className="text-sm text-lp-muted mb-4">{app.user.email}</p>
                <div className="flex gap-4">
                  <a href={app.resume_url || '#'} className="text-xs font-bold text-lp-accent flex items-center gap-1 hover:underline">
                    <FileText size={14} /> VIEW RESUME
                  </a>
                  <span className="text-xs font-bold text-lp-muted flex items-center gap-1">
                    <Calendar size={14} /> APPLIED: {new Date(app.applied_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:items-end justify-center gap-4">
              <div className="flex items-center gap-3">
                <p className="text-xs font-bold text-lp-muted uppercase">Status:</p>
                <span className={`badge ${
                  app.status === 'Selected' ? 'bg-green-100 text-green-700' :
                  app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                  'bg-yellow-100 text-yellow-700'
                }`}>
                  {app.status.toUpperCase()}
                </span>
              </div>
              
              <div className="flex gap-2">
                {app.status === 'Applied' && (
                  <>
                    <button 
                      onClick={() => handleStatusUpdate(app.id, 'Shortlisted')}
                      className="btn-primary !py-2 !px-4 text-xs"
                    >
                      Shortlist
                    </button>
                    <button 
                      onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                      className="btn-primary bg-white !text-red-600 border-red-200 border !py-2 !px-4 text-xs"
                    >
                      Reject
                    </button>
                  </>
                )}
                {app.status === 'Shortlisted' && (
                  <button 
                    onClick={() => handleStatusUpdate(app.id, 'Interview Scheduled')}
                    className="btn-primary !py-2 !px-4 text-xs bg-purple-600"
                  >
                    Schedule Interview
                  </button>
                )}
                {app.status === 'Interview Scheduled' && (
                  <button 
                    onClick={() => handleStatusUpdate(app.id, 'Selected')}
                    className="btn-primary !py-2 !px-4 text-xs bg-green-600"
                  >
                    Mark Selected
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {applicants.length === 0 && (
          <div className="text-center py-20 card bg-lp-surface border-dashed">
            <p className="text-lp-muted font-bold">No applications received yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
