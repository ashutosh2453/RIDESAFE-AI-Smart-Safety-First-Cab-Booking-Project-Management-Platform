import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleArea}>
        <View style={styles.logoRow}>
          <Text style={styles.logoIcon}>🛡️</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>

      <View style={styles.userActions}>
        <View style={styles.userBadge}>
          <View style={styles.onlineDot} />
          <Text style={styles.userName} numberOfLines={1}>
            {user?.name?.split(' ')[0] || 'User'}
          </Text>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Exit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: Colors.card,
    paddingTop: 48,
    paddingBottom: 14,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  titleArea: {
    flex: 1,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    fontSize: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 2,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    maxWidth: 100,
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  userName: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  logoutBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: 'rgba(239, 71, 111, 0.15)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(239, 71, 111, 0.3)',
  },
  logoutText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
});
