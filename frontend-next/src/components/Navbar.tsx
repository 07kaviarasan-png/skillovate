'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { LogOut, Bell } from 'lucide-react';
import Image from 'next/image';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-[#FCFDFF]/80 backdrop-blur-md border-b border-lp-border min-h-20 flex items-center">
      <div className="w-full px-10 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link href="/" className="logo">
            <img 
              src="/logo.png" 
              alt="Skillovate AI Logo" 
              className="h-[90px] w-auto mix-multiply contrast-[1.1] brightness-[1.1] block"
            />
          </Link>
          
          {isAuthenticated && (
            <div className="hidden md:flex items-center gap-3 text-sm font-bold">
              <NavLink href="/dashboard">Dashboard</NavLink>
              {user.role === 'student' && (
                <>
                  <NavLink href="/assessments">Assessments</NavLink>
                  <NavLink href="/interviews">Interviews</NavLink>
                  <NavLink href="/placements/jobs">Jobs</NavLink>
                </>
              )}
              {user.role === 'recruiter' && (
                <>
                  <NavLink href="/recruiter/jobs">My Postings</NavLink>
                </>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <div className="hidden md:flex items-center gap-3 text-sm font-bold">
              <NavLink href="/#features">Features</NavLink>
              <NavLink href="/#about">About</NavLink>
              <NavLink href="/hr">HR/Recruitment</NavLink>
              <NavLink href="/institutional">Institutional Login</NavLink>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <button className="p-2 text-lp-muted hover:text-lp-accent transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              
              <div className="h-8 w-[1px] bg-lp-border mx-2"></div>
              
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-black text-lp-text leading-none mb-1">{user.username}</p>
                  <p className="text-[10px] font-bold text-lp-accent uppercase tracking-widest leading-none">{user.role}</p>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 bg-lp-surface text-lp-muted hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link href="/login" className="nav-link !bg-transparent !text-lp-muted hover:!text-lp-accent">Sign In</Link>
              <Link href="/register" className="btn-primary !px-6 !py-2.5">Sign up free</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="text-white bg-black px-[18px] py-2 rounded-full text-[13px] font-semibold transition-all hover:bg-[#222] hover:-translate-y-[1px] hover:shadow-lg"
    >
      {children}
    </Link>
  );
}
