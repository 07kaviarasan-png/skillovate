'use client';

import { useParams, useRouter } from 'next/navigation';
import { useInterview } from '@/lib/hooks/useInterview';
import { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, StopCircle, Award } from 'lucide-react';

export default function InterviewSessionPage() {
  const { id } = useParams();
  const router = useRouter();
  const { session, questions, loading, fetchSession, submitInterview, responses, setResponses } = useInterview();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) fetchSession(id as string);
  }, [id, fetchSession]);

  useEffect(() => {
    if (questions.length > 0 && messages.length === 0) {
      setMessages([{ role: 'bot', text: questions[0].question_text }]);
    }
  }, [questions, messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const handleSend = async () => {
    if (!currentInput.trim()) return;

    const userMessage = currentInput;
    const newMessages = [...messages, { role: 'user', text: userMessage }];
    setMessages(newMessages);
    setCurrentInput('');

    // Save response
    const newResponses = [...responses, { 
      question_id: questions[currentQuestionIndex].id, 
      response: userMessage,
      feedback: "Simulated AI feedback",
      rating: 4
    }];
    setResponses(newResponses);

    // Simulate bot response or finish
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        const nextIndex = currentQuestionIndex + 1;
        setCurrentQuestionIndex(nextIndex);
        setMessages([...newMessages, { role: 'bot', text: questions[nextIndex].question_text }]);
      } else {
        setMessages([...newMessages, { role: 'bot', text: "Thank you for completing the interview! You can now submit your session." }]);
      }
    }, 1000);
  };

  const handleSubmit = async () => {
    const res = await submitInterview(Number(id), 85, "Great interview session with clear technical understanding.");
    router.push(`/interviews/result/${res.id}`);
  };

  if (loading || !session) return <div className="p-8 text-center">Entering session...</div>;

  return (
    <div className="flex flex-col h-screen bg-lp-surface">
      {/* Header */}
      <div className="bg-white border-bottom border-lp-border p-4 flex justify-between items-center px-8">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-lp-accent-light text-lp-accent rounded-lg"><Bot size={24} /></div>
          <div>
            <h2 className="font-bold text-lg">{session.category} Interview</h2>
            <p className="text-xs text-green-600 font-bold uppercase tracking-wider">• Live Session</p>
          </div>
        </div>
        <button onClick={handleSubmit} className="btn-primary bg-red-500 flex items-center gap-2">
          <StopCircle size={18} /> End & Submit
        </button>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`p-3 rounded-xl h-fit ${m.role === 'user' ? 'bg-lp-accent text-white' : 'bg-white text-lp-text shadow-sm border border-lp-border'}`}>
                {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`p-5 rounded-2xl ${m.role === 'user' ? 'bg-lp-accent text-white rounded-tr-none' : 'bg-white shadow-sm border border-lp-border rounded-tl-none'}`}>
                <p className="text-sm md:text-base leading-relaxed">{m.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-white border-t border-lp-border">
        <div className="container max-w-4xl flex gap-4">
          <input 
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type your response here..."
            className="flex-1 p-4 bg-lp-surface rounded-2xl border-2 border-transparent focus:border-lp-accent outline-none transition-all"
          />
          <button 
            onClick={handleSend}
            disabled={!currentInput.trim()}
            className="p-4 bg-lp-accent text-white rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
          >
            <Send size={24} />
          </button>
        </div>
      </div>
    </div>
  );
}
