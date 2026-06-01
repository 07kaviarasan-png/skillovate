'use client';

import { usePlacements } from '@/lib/hooks/usePlacements';
import { useEffect } from 'react';
import { CheckCircle2, Clock, XCircle, Info } from 'lucide-react';

const STATUS_COLORS: any = {
  'Applied': 'bg-blue-100 text-blue-700',
  'Shortlisted': 'bg-yellow-100 text-yellow-700',
  'Interview Scheduled': 'bg-purple-100 text-purple-700',
  'Selected': 'bg-green-100 text-green-700',
  'Offer Released': 'bg-green-600 text-white',
  'Rejected': 'bg-red-100 text-red-700'
};

export default function ApplicationsPage() {
  const { applications, loading, fetchMyApplications } = usePlacements();

  useEffect(() => {
    fetchMyApplications();
  }, [fetchMyApplications]);

  if (loading) return <div className="p-8 text-center">Loading applications...</div>;

  return (
    <div className="container py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black mb-2">My Applications</h1>
        <p className="text-lp-muted">Track the progress of your job applications.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {applications.map((app) => (
          <div key={app.id} className="card">
            <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
              <div>
                <h3 className="text-xl font-bold mb-1">{app.job.title}</h3>
                <p className="text-lp-accent font-bold mb-2">{app.job.recruiter.company_name}</p>
                <p className="text-xs text-lp-muted">Applied on {new Date(app.applied_at).toLocaleDateString()}</p>
              </div>
              <div className="flex items-start">
                <span className={`badge py-2 px-6 text-sm ${STATUS_COLORS[app.status] || 'bg-lp-surface'}`}>
                  {app.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Progress Flow */}
            <div className="relative pt-8 pb-4 px-4 overflow-x-auto">
              <div className="flex justify-between min-w-[600px]">
                <StatusStep label="Applied" active={true} completed={['Shortlisted', 'Interview Scheduled', 'Selected', 'Offer Released'].includes(app.status)} />
                <StatusStep label="Shortlisted" active={['Shortlisted', 'Interview Scheduled', 'Selected', 'Offer Released'].includes(app.status)} />
                <StatusStep label="Interview" active={['Interview Scheduled', 'Selected', 'Offer Released'].includes(app.status)} />
                <StatusStep label="Selected" active={['Selected', 'Offer Released'].includes(app.status)} />
                <StatusStep label="Offer" active={app.status === 'Offer Released'} isLast={true} />
              </div>
            </div>

            {app.recruiter_notes && (
              <div className="mt-8 p-4 bg-lp-accent-faint rounded-xl border-l-4 border-lp-accent flex gap-3">
                <Info className="text-lp-accent shrink-0" size={20} />
                <div>
                  <p className="text-xs font-bold text-lp-accent uppercase mb-1">Message from Recruiter</p>
                  <p className="text-sm italic text-lp-muted">{app.recruiter_notes}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {applications.length === 0 && (
          <div className="text-center py-20 card bg-lp-surface border-dashed">
            <Clock size={48} className="mx-auto text-lp-muted mb-4 opacity-20" />
            <p className="text-lp-muted font-bold">You haven't applied to any jobs yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatusStep({ label, active, completed, isLast }: any) {
  return (
    <div className={`flex flex-col items-center gap-3 relative ${!isLast ? 'flex-1' : ''}`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${
        completed ? 'bg-green-500 text-white' : active ? 'bg-lp-accent text-white' : 'bg-lp-surface border border-lp-border'
      }`}>
        {completed ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-current" />}
      </div>
      <span className={`text-xs font-bold ${active ? 'text-lp-text' : 'text-lp-muted'}`}>{label}</span>
      
      {!isLast && (
        <div className={`absolute h-0.5 top-4 left-[50%] right-[-50%] ${
          completed ? 'bg-green-500' : 'bg-lp-border'
        }`} />
      )}
    </div>
  );
}
