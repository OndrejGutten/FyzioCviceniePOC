import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { Role } from '@/components/role-controls';

export type StretchRecord = {
  id: string;
  timestamp: string;
  aches: 'Back' | 'Leg' | 'Arm';
  minutes: number;
  change: 'Improved!' | 'Got worse!' | 'No change!';
  userId: string;
};

type RecordsContextValue = {
  records: StretchRecord[];
  addRecord: (record: Omit<StretchRecord, 'id' | 'timestamp' | 'userId'>) => Promise<void>;
  getRecordById: (id: string) => StretchRecord | undefined;
  isLoading: boolean;
  isPurging: boolean;
  purgeRecords: (userId?: string) => Promise<void>;
  role: Role;
  userId: string;
  setRole: (role: Role) => void;
  setUserId: (userId: string) => void;
  refresh: () => Promise<void>;
};

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';

const RecordsContext = createContext<RecordsContextValue | undefined>(undefined);

const sortNewestFirst = (items: StretchRecord[]) =>
  [...items].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<StretchRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurging, setIsPurging] = useState(false);
  const [role, setRole] = useState<Role>('user');
  const [userId, setUserId] = useState('user-1');

  const refresh = useCallback(async () => {
    if (!API_BASE_URL) {
      setRecords([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const query = role === 'admin' ? 'scope=all' : `userId=${encodeURIComponent(userId)}`;
      const response = await fetch(`${API_BASE_URL}/records?${query}`);
      if (!response.ok) {
        throw new Error('Failed to load records');
      }
      const payload: { records: StretchRecord[] } = await response.json();
      setRecords(sortNewestFirst(payload.records ?? []));
    } catch {
      setRecords([]);
    } finally {
      setIsLoading(false);
    }
  }, [role, userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const addRecord = useCallback(
    async (record: Omit<StretchRecord, 'id' | 'timestamp' | 'userId'>) => {
      if (!API_BASE_URL) {
        return;
      }
      const response = await fetch(`${API_BASE_URL}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...record, userId }),
      });
      if (!response.ok) {
        throw new Error('Failed to save record');
      }
      await refresh();
    },
    [refresh, userId],
  );

  const getRecordById = useCallback(
    (id: string) => records.find((record) => record.id === id),
    [records],
  );

  const purgeRecords = useCallback(
    async (targetUserId?: string) => {
      if (!API_BASE_URL) {
        return;
      }
      setIsPurging(true);
      try {
        const query = targetUserId ? `?userId=${encodeURIComponent(targetUserId)}` : '';
        const response = await fetch(`${API_BASE_URL}/records${query}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to purge records');
        }
        await refresh();
      } finally {
        setIsPurging(false);
      }
    },
    [refresh],
  );

  const value = useMemo(
    () => ({
      records,
      addRecord,
      getRecordById,
      isLoading,
      isPurging,
      purgeRecords,
      role,
      userId,
      setRole,
      setUserId,
      refresh,
    }),
    [records, addRecord, getRecordById, isLoading, isPurging, purgeRecords, role, userId, refresh],
  );

  return <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>;
}

export function useRecords() {
  const context = useContext(RecordsContext);
  if (!context) {
    throw new Error('useRecords must be used within a RecordsProvider');
  }
  return context;
}
