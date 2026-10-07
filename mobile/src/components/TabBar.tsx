import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export type TabKey = 'DASHBOARD' | 'BOOK' | 'SAFETY' | 'PROJECTS' | 'AI';

interface TabBarProps {
  currentTab: TabKey;
  onSelectTab: (tab: TabKey) => void;
  activeRideCount?: number;
}

export const TabBar: React.FC<TabBarProps> = ({ currentTab, onSelectTab, activeRideCount = 0 }) => {
  const tabs: Array<{ key: TabKey; label: string; icon: string }> = [
    { key: 'DASHBOARD', label: 'Home', icon: '🏠' },
    { key: 'BOOK', label: 'Book Cab', icon: '🚕' },
    { key: 'SAFETY', label: 'Safety', icon: '🛡️' },
    { key: 'PROJECTS', label: 'Projects', icon: '📋' },
    { key: 'AI', label: 'AI Chat', icon: '🤖' },
  ];

  return (
    <View style={styles.tabBarContainer}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, isActive && styles.activeTabButton]}
            onPress={() => onSelectTab(tab.key)}
          >
            <View style={styles.iconWrapper}>
              <Text style={styles.icon}>{tab.icon}</Text>
              {tab.key === 'SAFETY' && activeRideCount > 0 && (
                <View style={styles.pulseDot} />
              )}
            </View>
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: Colors.card,
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: 8,
    paddingBottom: 20,
    justifyContent: 'space-around',
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  activeTabButton: {
    backgroundColor: 'rgba(6, 214, 160, 0.08)',
  },
  iconWrapper: {
    position: 'relative',
  },
  icon: {
    fontSize: 22,
  },
  pulseDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
  },
  tabLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  activeTabLabel: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
