import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useRecords } from '@/app/context/records';
import { RoleControls } from '@/components/role-controls';

const ACHES_OPTIONS = ['Back', 'Leg', 'Arm'] as const;
const CHANGE_OPTIONS = ['Improved!', 'Got worse!', 'No change!'] as const;

export default function HomeScreen() {
  const { addRecord, role, setRole, userId, setUserId, records, purgeRecords, isPurging } = useRecords();
  const [aches, setAches] = useState<(typeof ACHES_OPTIONS)[number] | null>(null);
  const [minutes, setMinutes] = useState('');
  const [change, setChange] = useState<(typeof CHANGE_OPTIONS)[number] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [purgeUserId, setPurgeUserId] = useState<string>('');

  const minutesValue = useMemo(() => {
    const parsed = Number(minutes);
    return Number.isFinite(parsed) ? parsed : NaN;
  }, [minutes]);

  const availableUserIds = useMemo(() => {
    const ids = Array.from(new Set(records.map((record) => record.userId))).sort();
    return ids;
  }, [records]);

  const handleSave = async () => {
    if (role === 'admin') {
      setError('Admin mode is read-only. Switch to User to save.');
      return;
    }
    if (!aches || !change) {
      setError('Please answer all questions.');
      return;
    }
    if (!Number.isFinite(minutesValue) || minutesValue <= 0) {
      setError('Enter a valid number of minutes.');
      return;
    }
    setError(null);
    setIsSaving(true);
    try {
      await addRecord({ aches, minutes: minutesValue, change });
      setAches(null);
      setMinutes('');
      setChange(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePurge = async () => {
    if (role !== 'admin') {
      return;
    }
    setError(null);
    const targetUserId = purgeUserId.trim();
    try {
      await purgeRecords(targetUserId.length > 0 ? targetUserId : undefined);
      setPurgeUserId('');
    } catch {
      setError('Failed to purge records.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Stretch Check-In</ThemedText>
        <ThemedText type="subtitle">Answer the questions and tap Save.</ThemedText>
      </ThemedView>

      <RoleControls
        role={role}
        userId={userId}
        onRoleChange={setRole}
        onUserIdChange={setUserId}
      />

      {role === 'admin' ? (
        <ThemedView style={styles.card}>
          <ThemedText type="subtitle">Admin tools</ThemedText>
          <ThemedText type="default">
            Pick a user with existing records to purge. Leave blank to purge all records.
          </ThemedText>
          <View style={styles.pillRow}>
            {availableUserIds.length === 0 ? (
              <ThemedText style={styles.helperText}>No users with records yet.</ThemedText>
            ) : (
              availableUserIds.map((id) => {
                const isSelected = purgeUserId === id;
                return (
                  <Pressable
                    key={id}
                    onPress={() => setPurgeUserId(id)}
                    style={[styles.choiceButton, isSelected && styles.choiceButtonSelected]}>
                    <ThemedText style={isSelected && styles.choiceTextSelected}>{id}</ThemedText>
                  </Pressable>
                );
              })
            )}
          </View>
          <TextInput
            value={purgeUserId}
            onChangeText={setPurgeUserId}
            placeholder="Optional userId"
            style={styles.input}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <Pressable
            onPress={handlePurge}
            disabled={isPurging}
            style={[styles.purgeButton, isPurging && styles.saveButtonDisabled]}>
            <ThemedText type="defaultSemiBold" style={styles.saveButtonText}>
              {isPurging ? 'Purging...' : 'Purge records'}
            </ThemedText>
          </Pressable>
        </ThemedView>
      ) : (
        <>
          <ThemedView style={styles.card}>
            <ThemedText type="subtitle">Q1: What aches you?</ThemedText>
            <View style={styles.choiceRow}>
              {ACHES_OPTIONS.map((option) => {
                const isSelected = aches === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setAches(option)}
                    style={[styles.choiceButton, isSelected && styles.choiceButtonSelected]}>
                    <ThemedText style={isSelected && styles.choiceTextSelected}>{option}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </ThemedView>

          <ThemedView style={styles.card}>
            <ThemedText type="subtitle">Q2: How long have you stretched?</ThemedText>
            <ThemedText type="default">Answer: a number in minutes</ThemedText>
            <TextInput
              value={minutes}
              onChangeText={setMinutes}
              keyboardType="number-pad"
              placeholder="Minutes"
              style={styles.input}
            />
          </ThemedView>

          <ThemedView style={styles.card}>
            <ThemedText type="subtitle">Q3: Have you observed a change?</ThemedText>
            <View style={styles.choiceRow}>
              {CHANGE_OPTIONS.map((option) => {
                const isSelected = change === option;
                return (
                  <Pressable
                    key={option}
                    onPress={() => setChange(option)}
                    style={[styles.choiceButton, isSelected && styles.choiceButtonSelected]}>
                    <ThemedText style={isSelected && styles.choiceTextSelected}>{option}</ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </ThemedView>
        </>
      )}

      {error ? <ThemedText style={styles.errorText}>{error}</ThemedText> : null}

      {role === 'admin' ? (
        <ThemedText style={styles.adminNote}>Admin tools are enabled while in admin mode.</ThemedText>
      ) : (
        <Pressable
          onPress={handleSave}
          disabled={isSaving}
          style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}>
          <ThemedText type="defaultSemiBold" style={styles.saveButtonText}>
            {isSaving ? 'Saving...' : 'Save'}
          </ThemedText>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d6d6d6',
    gap: 10,
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choiceButton: {
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#bdbdbd',
  },
  choiceButtonSelected: {
    backgroundColor: '#1f7ae0',
    borderColor: '#1f7ae0',
  },
  choiceTextSelected: {
    color: '#ffffff',
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#bdbdbd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  errorText: {
    color: '#c62828',
  },
  saveButton: {
    backgroundColor: '#111827',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  purgeButton: {
    backgroundColor: '#b91c1c',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#ffffff',
  },
  adminNote: {
    color: '#6b7280',
    textAlign: 'center',
  },
  helperText: {
    color: '#6b7280',
  },
});
