'use client';

import { usePlacements } from '@/lib/hooks/usePlacements';
import { useEffect, useState } from 'react';
import { placementsApi } from '@/lib/api';
import { Plus, Users, Edit3, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

export default function RecruiterJobsPage() {
  const { jobs, loading, fetchJobs } = usePlacements();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  if (loading) return <div className="p-8 text-center">Loading your job postings...</div>;

  return (
    <div className="container py-8">
      <div className="flex justify-between items-end mb-10">
        <div>
          <h1 className="text-3xl font-black mb-2">My Job Postings</h1>
          <p className="text-lp-muted">Manage your active opportunities and view applicants.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} /> Post New Job
        </button>
      </div>

      <div className="card overflow-hidden !p-0">
        <table className="w-full text-left">
          <thead className="bg-lp-surface border-b border-lp-border">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-lp-muted">Job Title</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-lp-muted">Location</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-lp-muted">Type</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-lp-muted">Status</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-lp-muted">Applicants</th>
              <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-lp-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-lp-border">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-lp-surface/50 transition-colors">
                <td className="px-6 py-4">
                  <p className="font-bold text-sm">{job.title}</p>
                  <p className="text-xs text-lp-muted">{new Date(job.created_at).toLocaleDateString()}</p>
                </td>
                <td className="px-6 py-4 text-sm">{job.location || 'Remote'}</td>
                <td className="px-6 py-4"><span className="badge bg-lp-accent-light text-lp-accent text-[10px]">{job.job_type}</span></td>
                <td className="px-6 py-4">
                  {job.is_active ? (
                    <span className="flex items-center gap-1 text-green-600 text-xs font-bold"><CheckCircle size={14} /> Active</span>
                  ) : (
                    <span className="flex items-center gap-1 text-lp-muted text-xs font-bold"><XCircle size={14} /> Closed</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Link href={`/recruiter/applicants/${job.id}`} className="text-lp-accent font-bold text-sm flex items-center gap-2">
                    <Users size={16} /> View All
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-3">
                    <button className="p-2 hover:bg-lp-accent-light text-lp-muted hover:text-lp-accent rounded-lg transition-colors"><Edit3 size={18} /></button>
                    <button className="p-2 hover:bg-red-100 text-lp-muted hover:text-red-600 rounded-lg transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
