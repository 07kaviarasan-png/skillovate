import { useState, useCallback } from 'react';
import { interviewsApi } from '../api';

export const useInterview = () => {
  const [session, setSession] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);

  const startInterview = useCallback(async (category: string) => {
    try {
      setLoading(true);
      const res = await interviewsApi.start(category);
      setSession(res.data.session);
      setQuestions(res.data.questions);
      setLoading(false);
      return res.data;
    } catch (err) {
      console.error(err);
      setLoading(false);
      throw err;
    }
  }, []);

  const fetchSession = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const res = await interviewsApi.getSession(id);
      setSession(res.data);
      // For a real app, we'd also fetch questions if not in session data
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  const submitInterview = async (sessionId: number, overallScore: number, feedback: string) => {
    try {
      setLoading(true);
      const res = await interviewsApi.submit(sessionId, {
        responses,
        overall_score: overallScore,
        feedback
      });
      setLoading(false);
      return res.data;
    } catch (err) {
      console.error(err);
      setLoading(false);
      throw err;
    }
  };

  return { session, questions, loading, startInterview, fetchSession, submitInterview, responses, setResponses };
};
