'use client';

import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { dashboardApi } from '@/lib/api';
import { 
  Users, 
  Briefcase, 
  Award, 
  TrendingUp, 
  Clock, 
  BookOpen, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats().then(res => {
      setStats(res.data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading || !user) return <div className="p-8 text-center">Loading your dashboard...</div>;

  return (
    <div className="container py-8">
      <header className="mb-10">
        <h1 className="text-3xl font-black mb-2">Welcome back, {user.username}!</h1>
        <p className="text-lp-muted">Here is what's happening with your account today.</p>
      </header>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {user.role === 'student' && stats && (
          <>
            <StatCard icon={<TrendingUp />} title="Avg. Assessment" value={`${stats.average_assessment_score.toFixed(1)}%`} color="bg-blue-500" />
            <StatCard icon={<Award />} title="Avg. Interview" value={`${stats.average_interview_score.toFixed(1)}%`} color="bg-purple-500" />
            <StatCard icon={<Briefcase />} title="Applications" value={stats.total_applications} color="bg-green-500" />
            <StatCard icon={<CheckCircle2 />} title="Achievements" value="4" color="bg-yellow-500" />
          </>
        )}
        
        {user.role === 'college_admin' && stats && (
          <>
            <StatCard icon={<Users />} title="Total Students" value={stats.student_count} color="bg-blue-500" />
            <StatCard icon={<Briefcase />} title="Placement Rate" value={`${stats.placement_rate.toFixed(1)}%`} color="bg-green-500" />
            <StatCard icon={<BookOpen />} title="Active Batches" value={stats.batch_count} color="bg-purple-500" />
            <StatCard icon={<TrendingUp />} title="Faculty Count" value={stats.faculty_count} color="bg-orange-500" />
          </>
        )}

        {user.role === 'recruiter' && stats && (
          <>
            <StatCard icon={<Briefcase />} title="Open Jobs" value={stats.open_jobs} color="bg-blue-500" />
            <StatCard icon={<Users />} title="Total Applicants" value={stats.total_applicants} color="bg-purple-500" />
            <StatCard icon={<CheckCircle2 />} title="Shortlisted" value={stats.shortlisted_count} color="bg-green-500" />
            <StatCard icon={<Clock />} title="Upcoming Interviews" value="12" color="bg-yellow-500" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Recent Activity</h3>
              <button className="text-lp-accent text-sm font-bold flex items-center">View All <ChevronRight size={16} /></button>
            </div>
            
            <div className="space-y-4">
              {stats?.recent_activity?.length > 0 ? stats.recent_activity.map((act: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-lp-surface rounded-2xl">
                  <div className="p-2 bg-white rounded-xl shadow-sm"><BookOpen size={20} className="text-lp-accent" /></div>
                  <div className="flex-1">
                    <p className="font-bold text-sm">Completed Assessment</p>
                    <p className="text-xs text-lp-muted">{new Date(act.completed_at || act.started_at).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lp-accent">{act.percentage.toFixed(1)}%</p>
                  </div>
                </div>
              )) : (
                <p className="text-center py-8 text-lp-muted">No recent activity found.</p>
              )}
            </div>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <QuickAction icon={<BookOpen />} label="Assessments" href="/assessments" />
              <QuickAction icon={<Users />} label="Interviews" href="/interviews" />
              <QuickAction icon={<Briefcase />} label="Jobs" href="/placements/jobs" />
              <QuickAction icon={<TrendingUp />} label="Leaderboard" href="#" />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <div className="card bg-lp-accent text-white border-none shadow-lp-accent/20 shadow-xl">
            <h3 className="text-xl font-bold mb-2">Profile Completeness</h3>
            <p className="text-sm opacity-80 mb-6">Complete your profile to get better job recommendations.</p>
            <div className="w-full h-3 bg-white/20 rounded-full mb-2">
              <div className="h-full bg-white rounded-full" style={{ width: '75%' }} />
            </div>
            <p className="text-right text-xs font-bold">75%</p>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-4">Recommended for You</h3>
            <div className="space-y-4">
              <div className="p-3 border border-lp-border rounded-xl hover:border-lp-accent cursor-pointer transition-colors">
                <p className="font-bold text-sm">Full Stack Developer</p>
                <p className="text-xs text-lp-muted">Google India • Hyderabad</p>
              </div>
              <div className="p-3 border border-lp-border rounded-xl hover:border-lp-accent cursor-pointer transition-colors">
                <p className="font-bold text-sm">Data Science Intern</p>
                <p className="text-xs text-lp-muted">Microsoft • Bangalore</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, color }: any) {
  return (
    <div className="card flex items-center gap-6 p-6">
      <div className={`p-4 rounded-2xl text-white shadow-lg shadow-${color.split('-')[1]}-200 ${color}`}>
        {React.cloneElement(icon as React.ReactElement, { size: 28 })}
      </div>
      <div>
        <p className="text-xs font-bold text-lp-muted uppercase tracking-wider mb-1">{title}</p>
        <p className="text-2xl font-black">{value}</p>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, href }: any) {
  return (
    <Link href={href} className="flex flex-col items-center gap-3 p-4 bg-lp-surface rounded-2xl hover:bg-lp-accent hover:text-white transition-all group">
      <div className="text-lp-accent group-hover:text-white">{icon}</div>
      <span className="text-xs font-bold">{label}</span>
    </Link>
  );
}

import React from 'react';
