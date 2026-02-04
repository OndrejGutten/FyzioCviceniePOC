import React from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

export type Role = 'user' | 'admin';

type RoleControlsProps = {
  role: Role;
  userId: string;
  onRoleChange: (role: Role) => void;
  onUserIdChange: (userId: string) => void;
};

export function RoleControls({ role, userId, onRoleChange, onUserIdChange }: RoleControlsProps) {
  return (
    <View style={styles.container}>
      <View style={styles.roleRow}>
        <Pressable
          onPress={() => onRoleChange('user')}
          style={[styles.roleButton, role === 'user' && styles.roleButtonSelected]}>
          <ThemedText style={role === 'user' && styles.roleButtonSelectedText}>User</ThemedText>
        </Pressable>
        <Pressable
          onPress={() => onRoleChange('admin')}
          style={[styles.roleButton, role === 'admin' && styles.roleButtonSelected]}>
          <ThemedText style={role === 'admin' && styles.roleButtonSelectedText}>Admin</ThemedText>
        </Pressable>
      </View>

      <View style={styles.userIdRow}>
        <ThemedText type="default">User ID</ThemedText>
        <TextInput
          value={userId}
          onChangeText={onUserIdChange}
          autoCapitalize="none"
          autoCorrect={false}
          placeholder="user-1"
          style={styles.input}
        />
      </View>
      <ThemedText style={styles.helperText}>
        Admin mode shows all users&apos; records. User mode scopes records to User ID.
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 10,
    marginBottom: 8,
  },
  roleRow: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#bdbdbd',
  },
  roleButtonSelected: {
    backgroundColor: '#111827',
    borderColor: '#111827',
  },
  roleButtonSelectedText: {
    color: '#ffffff',
  },
  userIdRow: {
    gap: 6,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#bdbdbd',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    backgroundColor: '#ffffff',
  },
  helperText: {
    color: '#6b7280',
    fontSize: 12,
  },
});
