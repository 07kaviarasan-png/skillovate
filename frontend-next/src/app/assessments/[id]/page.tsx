'use client';

import { useParams, useRouter } from 'next/navigation';
import { useAssessment } from '@/lib/hooks/useAssessment';
import { useState, useEffect } from 'react';
import { Clock, ChevronLeft, ChevronRight, Send } from 'lucide-react';

export default function TakeAssessmentPage() {
  const { id } = useParams();
  const router = useRouter();
  const { assessment, loading, timeLeft, startAssessment, responses, setResponses, submitAssessment } = useAssessment(id as string);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    startAssessment();
  }, [startAssessment]);

  if (loading || !assessment) return <div className="p-8 text-center">Preparing your test...</div>;

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOptionSelect = (option: string) => {
    setResponses({ ...responses, [currentQuestion.id]: option });
  };

  const handleSubmit = async () => {
    if (confirm('Are you sure you want to submit?')) {
      const result = await submitAssessment();
      router.push(`/assessments/result/${result.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-lp-surface py-12">
      <div className="container max-w-4xl">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">{assessment.title}</h1>
            <p className="text-lp-muted">Question {currentQuestionIndex + 1} of {assessment.questions.length}</p>
          </div>
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold ${timeLeft < 300 ? 'bg-red-100 text-red-600' : 'bg-lp-accent-light text-lp-accent'}`}>
            <Clock size={20} />
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="card mb-8">
          <div className="mb-8">
            <span className="badge bg-lp-accent-light text-lp-accent mb-4">{currentQuestion.category.toUpperCase()}</span>
            <h2 className="text-xl font-medium leading-relaxed">{currentQuestion.question_text}</h2>
          </div>

          <div className="space-y-4">
            {currentQuestion.options.map((option: string) => (
              <button
                key={option}
                onClick={() => handleOptionSelect(option)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  responses[currentQuestion.id] === option
                    ? 'border-lp-accent bg-lp-accent-light'
                    : 'border-transparent bg-lp-surface hover:border-lp-border'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
            className="btn-primary bg-white !text-lp-accent border-lp-accent border flex items-center gap-2 disabled:opacity-50"
          >
            <ChevronLeft size={18} /> Previous
          </button>

          {currentQuestionIndex < assessment.questions.length - 1 ? (
            <button
              onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
              className="btn-primary flex items-center gap-2"
            >
              Next <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="btn-primary bg-green-600 flex items-center gap-2 shadow-green-200"
            >
              Submit Test <Send size={18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
