import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { api } from '../services/api';
import { Colors } from '../theme/colors';
import { Ride } from '../types';
import { TabKey } from '../components/TabBar';

interface DashboardScreenProps {
  onNavigateTab: (tab: TabKey) => void;
  onOpenRide: (rideId: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigateTab,
  onOpenRide,
}) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [activeRide, setActiveRide] = useState<Ride | null>(null);
  const [recentRides, setRecentRides] = useState<Ride[]>([]);

  const fetchDashboardData = async () => {
    try {
      const [dashRes, ridesRes] = await Promise.all([
        api.get('/dashboard').catch(() => null),
        api.get('/rides').catch(() => null),
      ]);

      if (dashRes?.data?.success) {
        setStats(dashRes.data.data.stats);
      }

      if (ridesRes?.data?.success) {
        const rides: Ride[] = ridesRes.data.data || [];
        setRecentRides(rides.slice(0, 5));
        // Find if there is an ongoing active ride
        const active = rides.find(
          (r) =>
            r.status === 'REQUESTED' ||
            r.status === 'DRIVER_ASSIGNED' ||
            r.status === 'DRIVER_ARRIVED' ||
            r.status === 'STARTED'
        );
        setActiveRide(active || null);
      }
    } catch (err) {
      console.warn('Dashboard fetch error', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
      }
    >
      {/* Active Ride Banner */}
      {activeRide && (
        <TouchableOpacity
          style={styles.activeRideCard}
          onPress={() => onOpenRide(activeRide.id)}
        >
          <View style={styles.activeRideHeader}>
            <View style={styles.liveTag}>
              <View style={styles.pulsingDot} />
              <Text style={styles.liveTagText}>ACTIVE RIDE IN PROGRESS</Text>
            </View>
            <View style={styles.pinPill}>
              <Text style={styles.pinLabel}>PIN:</Text>
              <Text style={styles.pinValue}>{activeRide.pin}</Text>
            </View>
          </View>

          <Text style={styles.activeRideRoute}>
            {activeRide.pickup} ➔ {activeRide.destination}
          </Text>

          <View style={styles.activeRideFooter}>
            <Text style={styles.activeDriverText}>
              🚗 {activeRide.driver?.name || 'Driver Assigned'} • {activeRide.driver?.vehicle?.vehicleNumber || 'Cab'}
            </Text>
            <Text style={styles.viewRideBtn}>Track Ride & Safety ➔</Text>
          </View>
        </TouchableOpacity>
      )}

      {/* Safety Status Banner */}
      <View style={styles.safetyStatusCard}>
        <View style={styles.shieldIconWrapper}>
          <Text style={styles.shieldIcon}>🛡️</Text>
        </View>
        <View style={styles.safetyInfo}>
          <Text style={styles.safetyTitle}>RideSafe Guardian Active</Text>
          <Text style={styles.safetyDesc}>
            PIN Verification, Route Deviation Guard, & Emergency SOS are online.
          </Text>
        </View>
      </View>

      {/* Quick Metrics */}
      <Text style={styles.sectionHeader}>OVERVIEW METRICS</Text>
      <View style={styles.metricsGrid}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Total Rides</Text>
          <Text style={styles.metricValue}>{stats?.totalRides ?? recentRides.length}</Text>
          <Text style={styles.metricSub}>Completed & safely verified</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Safety Score</Text>
          <Text style={[styles.metricValue, { color: Colors.primary }]}>
            {stats?.safetyScore ?? 99}%
          </Text>
          <Text style={styles.metricSub}>Zero safety incidents</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Active Projects</Text>
          <Text style={styles.metricValue}>{stats?.totalProjects ?? 2}</Text>
          <Text style={styles.metricSub}>Trips & itineraries</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Open Tasks</Text>
          <Text style={[styles.metricValue, { color: Colors.cyan }]}>
            {stats?.totalTasks ?? 6}
          </Text>
          <Text style={styles.metricSub}>Checklist items synced</Text>
        </View>
      </View>

      {/* Quick Action Hub */}
      <Text style={styles.sectionHeader}>QUICK ACTIONS</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity
          style={[styles.actionCard, { borderColor: Colors.primary }]}
          onPress={() => onNavigateTab('BOOK')}
        >
          <Text style={styles.actionIcon}>🚕</Text>
          <Text style={styles.actionTitle}>Book Safe Cab</Text>
          <Text style={styles.actionDesc}>SmartMatch driver & instant PIN</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderColor: Colors.danger }]}
          onPress={() => onNavigateTab('SAFETY')}
        >
          <Text style={styles.actionIcon}>🚨</Text>
          <Text style={[styles.actionTitle, { color: Colors.danger }]}>Emergency SOS</Text>
          <Text style={styles.actionDesc}>Safety Center & Contacts</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderColor: Colors.blue }]}
          onPress={() => onNavigateTab('PROJECTS')}
        >
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionTitle}>Projects & Tasks</Text>
          <Text style={styles.actionDesc}>Plan trip itineraries</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { borderColor: Colors.cyan }]}
          onPress={() => onNavigateTab('AI')}
        >
          <Text style={styles.actionIcon}>🤖</Text>
          <Text style={styles.actionTitle}>AI Assistant</Text>
          <Text style={styles.actionDesc}>Travel guidance & safety tips</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Activity */}
      <Text style={styles.sectionHeader}>RECENT RIDES</Text>
      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 20 }} />
      ) : recentRides.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No rides taken yet.</Text>
          <TouchableOpacity
            style={styles.bookFirstBtn}
            onPress={() => onNavigateTab('BOOK')}
          >
            <Text style={styles.bookFirstText}>Book Your First Ride</Text>
          </TouchableOpacity>
        </View>
      ) : (
        recentRides.map((ride) => (
          <TouchableOpacity
            key={ride.id}
            style={styles.recentRideItem}
            onPress={() => onOpenRide(ride.id)}
          >
            <View style={styles.recentRideTop}>
              <Text style={styles.recentRideLocations} numberOfLines={1}>
                {ride.pickup} ➔ {ride.destination}
              </Text>
              <Text style={styles.recentRideFare}>₹{ride.fareEstimate}</Text>
            </View>
            <View style={styles.recentRideBottom}>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>{ride.status}</Text>
              </View>
              <Text style={styles.recentRideDriver}>
                {ride.driver?.name ? `Driver: ${ride.driver.name}` : 'Driver Pending'}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
  },
  activeRideCard: {
    backgroundColor: 'rgba(6, 214, 160, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginBottom: 16,
  },
  activeRideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  liveTagText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pinPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  pinLabel: {
    color: Colors.textMuted,
    fontSize: 11,
  },
  pinValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  activeRideRoute: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 10,
  },
  activeRideFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(6, 214, 160, 0.2)',
    paddingTop: 8,
  },
  activeDriverText: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  viewRideBtn: {
    color: Colors.cyan,
    fontSize: 12,
    fontWeight: '700',
  },
  safetyStatusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
    gap: 12,
  },
  shieldIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(6, 214, 160, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIcon: {
    fontSize: 22,
  },
  safetyInfo: {
    flex: 1,
  },
  safetyTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  safetyDesc: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeader: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    marginTop: 6,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  metricCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    width: '48%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  metricLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  metricValue: {
    color: Colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 4,
  },
  metricSub: {
    color: Colors.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    width: '48%',
    borderWidth: 1,
  },
  actionIcon: {
    fontSize: 26,
    marginBottom: 8,
  },
  actionTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  actionDesc: {
    color: Colors.textMuted,
    fontSize: 10,
    marginTop: 2,
  },
  emptyCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    color: Colors.textMuted,
    fontSize: 14,
    marginBottom: 12,
  },
  bookFirstBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  bookFirstText: {
    color: '#0B132B',
    fontSize: 13,
    fontWeight: '700',
  },
  recentRideItem: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 10,
  },
  recentRideTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentRideLocations: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
  recentRideFare: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  recentRideBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusBadge: {
    backgroundColor: Colors.cardHover,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: Colors.cyan,
    fontSize: 10,
    fontWeight: '700',
  },
  recentRideDriver: {
    color: Colors.textMuted,
    fontSize: 11,
  },
});
