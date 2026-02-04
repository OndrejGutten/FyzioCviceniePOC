import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { StretchRecord, useRecords } from '@/app/context/records';

const formatLocal = (timestamp: string) => {
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return timestamp;
  }
  return date.toLocaleString();
};

const formatSummary = (record: { aches: 'Back' | 'Leg' | 'Arm'; minutes: number; change: 'Improved!' | 'Got worse!' | 'No change!' }) => {
  const acheMap = { Back: 'B', Leg: 'L', Arm: 'A' } as const;
  const changeMap = { 'Improved!': '+', 'Got worse!': '-', 'No change!': '0' } as const;
  return `${acheMap[record.aches]}/${record.minutes}/${changeMap[record.change]}`;
};

export default function RecordDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getRecordById } = useRecords();
  const [remoteRecord, setRemoteRecord] = useState<StretchRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const localRecord = id ? getRecordById(id) : undefined;
  const record = useMemo(() => localRecord ?? remoteRecord ?? undefined, [localRecord, remoteRecord]);

  useEffect(() => {
    const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL ?? '';
    if (!id || localRecord || !apiBaseUrl) {
      return;
    }

    let isMounted = true;
    const fetchRecord = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${apiBaseUrl}/records/${id}`);
        if (!response.ok) {
          throw new Error('Failed to load record');
        }
        const payload: StretchRecord = await response.json();
        if (isMounted) {
          setRemoteRecord(payload);
        }
      } catch {
        if (isMounted) {
          setRemoteRecord(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchRecord();

    return () => {
      isMounted = false;
    };
  }, [id, localRecord]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedText type="title">Record Details</ThemedText>

      {!record ? (
        <ThemedText style={styles.emptyText}>
          {isLoading ? 'Loading record...' : 'Record not found.'}
        </ThemedText>
      ) : (
        <ThemedView style={styles.card}>
          <ThemedText type="defaultSemiBold" style={styles.recordText}>
            Timestamp
          </ThemedText>
          <ThemedText style={styles.recordText}>{formatLocal(record.timestamp)}</ThemedText>

          <ThemedText type="defaultSemiBold" style={[styles.labelSpacing, styles.recordText]}>
            Summary
          </ThemedText>
          <ThemedText style={styles.recordText}>{formatSummary(record)}</ThemedText>

          <ThemedText type="defaultSemiBold" style={[styles.labelSpacing, styles.recordText]}>
            Submitted by
          </ThemedText>
          <ThemedText style={styles.recordText}>{record.userId}</ThemedText>

          <ThemedText type="defaultSemiBold" style={[styles.labelSpacing, styles.recordText]}>
            Q1: What aches you?
          </ThemedText>
          <ThemedText style={styles.recordText}>{record.aches}</ThemedText>

          <ThemedText type="defaultSemiBold" style={[styles.labelSpacing, styles.recordText]}>
            Q2: How long have you stretched?
          </ThemedText>
          <ThemedText style={styles.recordText}>{record.minutes} minutes</ThemedText>

          <ThemedText type="defaultSemiBold" style={[styles.labelSpacing, styles.recordText]}>
            Q3: Have you observed a change?
          </ThemedText>
          <ThemedText style={styles.recordText}>{record.change}</ThemedText>
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d6d6d6',
    gap: 6,
  },
  labelSpacing: {
    marginTop: 12,
  },
  recordText: {
    color: '#000000',
  },
  emptyText: {
    marginTop: 20,
  },
});
