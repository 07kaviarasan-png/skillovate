import { useState, useCallback } from 'react';
import { collegesApi, batchesApi } from '../api/colleges';

export const useColleges = () => {
  const [colleges, setColleges] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchColleges = useCallback(async (params?: any) => {
    try {
      setLoading(true);
      const data = await collegesApi.list(params);
      setColleges(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createCollege = async (data: any) => {
    try {
      setLoading(true);
      const res = await collegesApi.create(data);
      return res;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { colleges, total, loading, error, fetchColleges, createCollege };
};

export const useBatches = () => {
  const [batches, setBatches] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBatches = useCallback(async (params?: any) => {
    try {
      setLoading(true);
      const data = await batchesApi.list(params);
      setBatches(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addStudentToBatch = async (batchId: number, studentId: number) => {
    try {
      setLoading(true);
      await batchesApi.addStudent(batchId, studentId);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { batches, total, loading, error, fetchBatches, addStudentToBatch };
};
