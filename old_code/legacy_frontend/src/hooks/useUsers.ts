import { useState, useCallback } from 'react';
import { usersApi } from '../api/users';

export const useUsers = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async (params?: any) => {
    try {
      setLoading(true);
      const data = await usersApi.list(params);
      setUsers(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchUsers = useCallback(async (query: string, params?: any) => {
    try {
      setLoading(true);
      const data = await usersApi.search(query, params);
      setUsers(data.items);
      setTotal(data.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createUser = async (userData: any) => {
    try {
      setLoading(true);
      const data = await usersApi.create(userData);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: number, userData: any) => {
    try {
      setLoading(true);
      const data = await usersApi.update(id, userData);
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    try {
      setLoading(true);
      await usersApi.delete(id);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { users, total, loading, error, fetchUsers, searchUsers, createUser, updateUser, deleteUser };
};
