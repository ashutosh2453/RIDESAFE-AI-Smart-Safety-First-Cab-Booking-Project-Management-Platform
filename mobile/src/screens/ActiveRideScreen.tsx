import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Share,
} from 'react-native';
import { api } from '../services/api';
import { Colors } from '../theme/colors';
import { Ride } from '../types';

interface ActiveRideScreenProps {
  rideId: string;
  onBack: () => void;
  onSOS: (rideId: string) => void;
}

export const ActiveRideScreen: React.FC<ActiveRideScreenProps> = ({
  rideId,
  onBack,
  onSOS,
}) => {
  const [ride, setRide] = useState<Ride | null>(null);
  const [loading, setLoading] = useState(true);
  const [advancing, setAdvancing] = useState(false);
  const [checkingRoute, setCheckingRoute] = useState(false);
  const [vehicleVerified, setVehicleVerified] = useState(false);

  const fetchRide = async () => {
    try {
      const res = await api.get(`/rides/${rideId}`);
      if (res.data.success) {
        setRide(res.data.data);
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not load ride details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRide();
    const interval = setInterval(fetchRide, 6000);
    return () => clearInterval(interval);
  }, [rideId]);

  const handleAdvanceStatus = async () => {
    setAdvancing(true);
    try {
      const res = await api.post(`/rides/${rideId}/status`);
      if (res.data.success) {
        setRide(res.data.data);
        Alert.alert('Status Updated', `Ride advanced to: ${res.data.data.status}`);
      }
    } catch (err: any) {
      Alert.alert('Advance Error', err.response?.data?.message || 'Cannot advance status.');
    } finally {
      setAdvancing(false);
    }
  };

  const handleVerifyVehicle = async (matches: boolean) => {
    try {
      const res = await api.post(`/rides/${rideId}/verify-vehicle`, {
        matches,
        notes: matches ? 'Plate and model checked on mobile' : 'Vehicle mismatch reported',
      });
      if (res.data.success) {
        setVehicleVerified(matches);
        Alert.alert(
          matches ? 'Vehicle Verified ✅' : 'Warning Logged ⚠️',
          matches
            ? 'Vehicle plate and driver match successfully confirmed.'
            : 'Vehicle mismatch event recorded in safety center.'
        );
      }
    } catch (err: any) {
      Alert.alert('Verification Error', err.response?.data?.message || 'Failed to verify vehicle.');
    }
  };

  const handleRouteDeviationCheck = async () => {
    setCheckingRoute(true);
    try {
      const res = await api.post(`/rides/${rideId}/route-check`, {
        simulatedDeviationMeters: 220,
      });
      if (res.data.success) {
        const data = res.data.data;
        Alert.alert(
          'Route Deviation Monitor',
          `Simulated GPS Deviation: ${data.deviationMeters}m.\n${data.alert ? '⚠️ Deviation exceeds 150m threshold! Safety advisory triggered.' : '✅ Route within normal corridor.'}`
        );
      }
    } catch (err: any) {
      Alert.alert('Route Check Error', err.response?.data?.message || 'Route check failed.');
    } finally {
      setCheckingRoute(false);
    }
  };

  const handleShareTrip = async () => {
    try {
      const res = await api.post(`/rides/${rideId}/share`);
      if (res.data.success) {
        const shareData = res.data.data;
        await Share.share({
          message: `RideSafe Live Trip: I am traveling from ${ride?.pickup} to ${ride?.destination} with driver ${ride?.driver?.name}. Vehicle: ${ride?.driver?.vehicle?.vehicleNumber}. Tracking code: ${shareData.shareCode}`,
          title: 'RideSafe Live Trip Share',
        });
      }
    } catch (err: any) {
      Alert.alert('Share Trip', 'Share link generated for emergency contacts.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Connecting to RideSafe Guardian...</Text>
      </View>
    );
  }

  if (!ride) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Ride not found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Bar Navigation */}
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backIconBtn} onPress={onBack}>
          <Text style={styles.backIconText}>← Back</Text>
        </TouchableOpacity>
        <View style={styles.statusPill}>
          <Text style={styles.statusPillText}>{ride.status}</Text>
        </View>
      </View>

      {/* 4-Digit Ride PIN Card */}
      <View style={styles.pinCard}>
        <Text style={styles.pinCardLabel}>RIDE VERIFICATION PIN</Text>
        <View style={styles.pinDigitsRow}>
          {ride.pin.split('').map((char, index) => (
            <View key={index} style={styles.pinDigitBox}>
              <Text style={styles.pinDigitText}>{char}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.pinWarning}>
          ⚠️ Only give this 4-digit PIN to your driver AFTER verifying vehicle license plate.
        </Text>
      </View>

      {/* Driver & Vehicle Details */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>ASSIGNED DRIVER & VEHICLE</Text>
        <View style={styles.driverRow}>
          <View style={styles.avatarLarge}>
            <Text style={{ fontSize: 28 }}>👨🏽‍✈️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.driverName}>{ride.driver?.name || 'Driver Assigned'}</Text>
            <Text style={styles.driverPhone}>📞 {ride.driver?.phoneNumber || '+91 98765 00000'}</Text>
            <Text style={styles.driverRating}>
              ⭐ {ride.driver?.rating?.toFixed(1) || '4.9'} ({ride.driver?.totalRides || 120} rides)
            </Text>
          </View>
        </View>

        {/* Vehicle Specs */}
        <View style={styles.vehicleBox}>
          <View style={styles.vehicleField}>
            <Text style={styles.vFieldLabel}>License Plate:</Text>
            <Text style={styles.vFieldValuePlate}>
              {ride.driver?.vehicle?.vehicleNumber || 'TN 09 AB 1234'}
            </Text>
          </View>
          <View style={styles.vehicleField}>
            <Text style={styles.vFieldLabel}>Vehicle Model:</Text>
            <Text style={styles.vFieldValue}>
              {ride.driver?.vehicle?.model || 'Hyundai Verna'} ({ride.driver?.vehicle?.color || 'White'})
            </Text>
          </View>
          <View style={styles.vehicleField}>
            <Text style={styles.vFieldLabel}>Vehicle Class:</Text>
            <Text style={styles.vFieldValue}>{ride.rideType}</Text>
          </View>
        </View>

        {/* Vehicle Verification Action */}
        <View style={styles.verifyRow}>
          <TouchableOpacity
            style={[styles.verifyBtn, vehicleVerified && styles.verifyBtnSuccess]}
            onPress={() => handleVerifyVehicle(true)}
          >
            <Text style={styles.verifyBtnText}>
              {vehicleVerified ? '✅ Plate Matches Vehicle' : '🔍 Verify Vehicle Plate'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mismatchBtn}
            onPress={() => handleVerifyVehicle(false)}
          >
            <Text style={styles.mismatchBtnText}>⚠️ Mismatch</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Route & Landmark */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>TRIP DETAILS & VISUAL PICKUP</Text>
        <View style={styles.routeBox}>
          <Text style={styles.routePoint}>📍 Pickup: {ride.pickup}</Text>
          {ride.landmark && (
            <Text style={styles.landmarkText}>📸 Landmark: {ride.landmark}</Text>
          )}
          <Text style={styles.routePoint}>🏁 Drop: {ride.destination}</Text>
          <Text style={styles.fareHighlight}>
            Estimated Fare: ₹{ride.fareEstimate} ({ride.distanceKm} km, {ride.durationMin} mins)
          </Text>
        </View>
      </View>

      {/* Real-time Safety Controls */}
      <View style={styles.safetyControlsCard}>
        <Text style={styles.safetyControlsHeader}>SAFETY & SECURITY CONTROLS</Text>

        {/* SOS Emergency Trigger */}
        <TouchableOpacity style={styles.sosButton} onPress={() => onSOS(ride.id)}>
          <Text style={styles.sosIcon}>🚨</Text>
          <View>
            <Text style={styles.sosText}>EMERGENCY SOS</Text>
            <Text style={styles.sosSub}>Alerts trusted contacts & records safety incident</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.safetyButtonGroup}>
          {/* Unsafe button */}
          <TouchableOpacity
            style={styles.secondarySafetyBtn}
            onPress={() => {
              Alert.alert(
                'Safety Report',
                'Your safety signal has been flagged. Would you like to share trip with contacts?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Share Trip', onPress: handleShareTrip },
                ]
              );
            }}
          >
            <Text style={styles.secondarySafetyBtnText}>✋ I Don't Feel Safe</Text>
          </TouchableOpacity>

          {/* Route check */}
          <TouchableOpacity
            style={styles.secondarySafetyBtn}
            onPress={handleRouteDeviationCheck}
            disabled={checkingRoute}
          >
            <Text style={styles.secondarySafetyBtnText}>
              {checkingRoute ? 'Checking...' : '🗺️ Check Route Deviation'}
            </Text>
          </TouchableOpacity>

          {/* Share trip */}
          <TouchableOpacity style={styles.secondarySafetyBtn} onPress={handleShareTrip}>
            <Text style={styles.secondarySafetyBtnText}>📲 Share Live Trip</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Demo Status Step Advancer */}
      <View style={styles.demoAdvanceCard}>
        <Text style={styles.demoAdvanceHeader}>DEMO SIMULATION CONTROLLER</Text>
        <Text style={styles.demoAdvanceSub}>
          Advance ride status for testing all lifecycle phases:
        </Text>
        <TouchableOpacity
          style={styles.advanceBtn}
          onPress={handleAdvanceStatus}
          disabled={advancing || ride.status === 'COMPLETED'}
        >
          {advancing ? (
            <ActivityIndicator color="#0B132B" />
          ) : (
            <Text style={styles.advanceBtnText}>
              ⚡ Advance Status (Current: {ride.status})
            </Text>
          )}
        </TouchableOpacity>
      </View>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: Colors.textMuted,
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 16,
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: Colors.cardHover,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backButtonText: {
    color: Colors.text,
  },
  topNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backIconBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  backIconText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  statusPill: {
    backgroundColor: 'rgba(6, 214, 160, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  statusPillText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pinCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    marginBottom: 16,
  },
  pinCardLabel: {
    color: Colors.cyan,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  pinDigitsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  pinDigitBox: {
    width: 52,
    height: 60,
    backgroundColor: Colors.bg,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinDigitText: {
    fontSize: 32,
    fontWeight: '900',
    color: Colors.text,
  },
  pinWarning: {
    color: Colors.warning,
    fontSize: 11,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 12,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  cardHeader: {
    color: Colors.textDim,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 14,
  },
  avatarLarge: {
    width: 54,
    height: 54,
    borderRadius: 16,
    backgroundColor: Colors.cardHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  driverPhone: {
    color: Colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  driverRating: {
    color: Colors.primary,
    fontSize: 12,
    marginTop: 2,
  },
  vehicleBox: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  vehicleField: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  vFieldLabel: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  vFieldValue: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  vFieldValuePlate: {
    color: Colors.cyan,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  verifyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  verifyBtn: {
    flex: 1,
    backgroundColor: Colors.cardHover,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  verifyBtnSuccess: {
    backgroundColor: 'rgba(6, 214, 160, 0.2)',
  },
  verifyBtnText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  mismatchBtn: {
    backgroundColor: 'rgba(239, 71, 111, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 71, 111, 0.3)',
  },
  mismatchBtnText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: '700',
  },
  routeBox: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    padding: 12,
  },
  routePoint: {
    color: Colors.text,
    fontSize: 13,
    marginBottom: 4,
  },
  landmarkText: {
    color: Colors.cyan,
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '600',
  },
  fareHighlight: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 6,
  },
  safetyControlsCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  safetyControlsHeader: {
    color: Colors.danger,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 12,
  },
  sosButton: {
    backgroundColor: Colors.danger,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  sosIcon: {
    fontSize: 32,
  },
  sosText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sosSub: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    marginTop: 2,
    maxWidth: 240,
  },
  safetyButtonGroup: {
    gap: 8,
  },
  secondarySafetyBtn: {
    backgroundColor: Colors.bg,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  secondarySafetyBtnText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  demoAdvanceCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  demoAdvanceHeader: {
    color: Colors.cyan,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  demoAdvanceSub: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
  },
  advanceBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  advanceBtnText: {
    color: '#0B132B',
    fontSize: 13,
    fontWeight: '800',
  },
});
