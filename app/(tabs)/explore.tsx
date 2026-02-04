import React, { useMemo } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecords } from '@/app/context/records';
import { RoleControls } from '@/components/role-controls';

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

export default function RecordsScreen() {
  const { records, isLoading, role, setRole, userId, setUserId, refresh } = useRecords();
  const router = useRouter();

  const data = useMemo(() => records, [records]);

  return (
    <FlatList
      contentContainerStyle={styles.container}
      data={data}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <ThemedView style={styles.header}>
          <ThemedText type="title">Records</ThemedText>
          <ThemedText type="subtitle">Newest first · tap a record to view details</ThemedText>
          <RoleControls
            role={role}
            userId={userId}
            onRoleChange={(nextRole) => {
              setRole(nextRole);
              void refresh();
            }}
            onUserIdChange={(nextUserId) => {
              setUserId(nextUserId);
              if (role === 'user') {
                void refresh();
              }
            }}
          />
        </ThemedView>
      }
      ListEmptyComponent={
        <ThemedText style={styles.emptyText}>
          {isLoading ? 'Loading records...' : 'No records yet. Save a check-in first.'}
        </ThemedText>
      }
      renderItem={({ item }) => (
        <Pressable
          onPress={() => router.push(`/record/${item.id}` as const)}
          style={styles.row}>
          <View style={styles.rowContent}>
            <View style={styles.rowTextBlock}>
              <ThemedText type="defaultSemiBold" style={styles.recordText}>
                {formatLocal(item.timestamp)}
              </ThemedText>
              <ThemedText style={styles.recordText}>{formatSummary(item)}</ThemedText>
            </View>
            {role === 'admin' ? (
              <ThemedText style={styles.recordText}>User: {item.userId}</ThemedText>
            ) : null}
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 12,
  },
  header: {
    gap: 6,
    marginBottom: 8,
  },
  row: {
    padding: 16,
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d6d6d6',
    backgroundColor: '#ffffff',
  },
  rowContent: {
    gap: 8,
  },
  rowTextBlock: {
    gap: 4,
  },
  recordText: {
    color: '#000000',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
  },
});
