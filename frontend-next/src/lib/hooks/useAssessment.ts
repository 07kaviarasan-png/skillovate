import { useState, useEffect, useCallback } from 'react';
import { assessmentsApi } from '../api';

export const useAssessment = (id: string) => {
  const [assessment, setAssessment] = useState<any>(null);
  const [attempt, setAttempt] = useState<any>(null);
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  const startAssessment = useCallback(async () => {
    try {
      setLoading(true);
      const [aRes, attRes] = await Promise.all([
        assessmentsApi.get(id),
        assessmentsApi.start(id)
      ]);
      setAssessment(aRes.data);
      setAttempt(attRes.data);
      setTimeLeft(aRes.data.duration_minutes * 60);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const submitAssessment = async () => {
    if (!attempt) return;
    try {
      const res = await assessmentsApi.submit(attempt.id, responses);
      return res.data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { assessment, attempt, responses, setResponses, loading, timeLeft, startAssessment, submitAssessment };
};
