import { useState, useCallback } from 'react';
import { placementsApi } from '../api';

export const usePlacements = () => {
  const [jobs, setJobs] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await placementsApi.listJobs();
      setJobs(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  const fetchMyApplications = useCallback(async () => {
    try {
      setLoading(true);
      const res = await placementsApi.getMyApplications();
      setApplications(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  const applyForJob = async (jobId: number) => {
    try {
      setLoading(true);
      const res = await placementsApi.apply(jobId);
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  return { jobs, applications, loading, fetchJobs, fetchMyApplications, applyForJob };
};
