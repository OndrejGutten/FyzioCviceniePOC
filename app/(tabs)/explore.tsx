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
          <View>
            <ThemedText type="defaultSemiBold">{formatLocal(item.timestamp)}</ThemedText>
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
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
  },
});
