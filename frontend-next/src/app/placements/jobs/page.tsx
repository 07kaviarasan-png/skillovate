'use client';

import { usePlacements } from '@/lib/hooks/usePlacements';
import { useEffect } from 'react';
import { Briefcase, MapPin, DollarSign, Calendar, ChevronRight } from 'lucide-react';

export default function JobsPage() {
  const { jobs, loading, fetchJobs, applyForJob } = usePlacements();

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleApply = async (jobId: number) => {
    try {
      await applyForJob(jobId);
      alert('Application submitted successfully!');
    } catch (err) {
      alert('Failed to apply. You may have already applied for this job.');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading jobs...</div>;

  return (
    <div className="container py-8">
      <div className="mb-10">
        <h1 className="text-3xl font-black mb-2">Available Opportunities</h1>
        <p className="text-lp-muted">Explore career opportunities from our partner recruiters.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="card flex flex-col md:flex-row justify-between gap-6 hover:border-lp-accent transition-all">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold">{job.title}</h3>
                <span className="badge bg-lp-accent-light text-lp-accent">{job.job_type}</span>
              </div>
              <p className="text-lp-accent font-bold mb-4">{job.recruiter.company_name}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-lp-muted mb-6">
                <div className="flex items-center gap-2"><MapPin size={16} /> {job.location || 'Remote'}</div>
                <div className="flex items-center gap-2"><DollarSign size={16} /> {job.salary_range || 'Competitive'}</div>
                <div className="flex items-center gap-2"><Calendar size={16} /> Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}</div>
              </div>

              <div className="text-sm text-lp-muted line-clamp-2">
                {job.description}
              </div>
            </div>

            <div className="flex flex-col justify-center gap-3 min-w-[160px]">
              <button 
                onClick={() => handleApply(job.id)}
                className="btn-primary w-full"
              >
                Apply Now
              </button>
              <button className="btn-primary bg-white !text-lp-accent border border-lp-accent w-full">
                View Details
              </button>
            </div>
          </div>
        ))}

        {jobs.length === 0 && (
          <div className="text-center py-20 card bg-lp-surface border-dashed">
            <Briefcase size={48} className="mx-auto text-lp-muted mb-4 opacity-20" />
            <p className="text-lp-muted font-bold">No jobs matching your profile found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
