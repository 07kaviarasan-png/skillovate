'use client';

import { useEffect, useState } from 'react';
import { questionsApi } from '@/lib/api';
import Link from 'next/link';
import { MessageSquare, Star, Play, Search } from 'lucide-react';

export default function InterviewsPage() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    questionsApi.getCategories().then(res => {
      // Filter only relevant categories or add default ones
      const cats = res.data.length > 0 ? res.data : [
        'Frontend', 'Backend', 'Full Stack', 'Python', 'Java', 'React', 'DevOps', 'Data Science', 'HR'
      ];
      setCategories(cats);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading interview categories...</div>;

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2">Mock Interviews</h1>
        <p className="text-lp-muted">Practice with AI-powered mock interviews across various technologies.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category} className="card hover:border-lp-accent transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="p-4 bg-lp-accent-light text-lp-accent rounded-2xl group-hover:bg-lp-accent group-hover:text-white transition-colors">
                <MessageSquare size={28} />
              </div>
              <div className="flex items-center gap-1 text-yellow-500 font-bold">
                <Star size={16} fill="currentColor" />
                4.8
              </div>
            </div>
            
            <h3 className="text-2xl font-bold mb-2">{category}</h3>
            <p className="text-sm text-lp-muted mb-8">Technical & HR questions for {category} roles.</p>
            
            <Link 
              href={`/interviews/${category.toLowerCase()}`}
              className="btn-primary w-full flex items-center justify-center gap-2 py-4"
            >
              Start Interview <Play size={18} fill="currentColor" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
