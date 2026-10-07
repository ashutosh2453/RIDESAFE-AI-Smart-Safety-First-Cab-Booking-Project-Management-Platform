import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { api } from '../services/api';
import { Colors } from '../theme/colors';
import { VehicleType, SmartMatchResult } from '../types';

interface BookRideScreenProps {
  onRideBooked: (rideId: string) => void;
}

export const BookRideScreen: React.FC<BookRideScreenProps> = ({ onRideBooked }) => {
  const [pickup, setPickup] = useState('SRM Main Gate');
  const [destination, setDestination] = useState('Chennai Airport');
  const [landmark, setLandmark] = useState('Gate 2, near blue building');
  const [rideType, setRideType] = useState<VehicleType>('SEDAN');

  const [calculating, setCalculating] = useState(false);
  const [booking, setBooking] = useState(false);
  const [matchResult, setMatchResult] = useState<SmartMatchResult | null>(null);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);

  const presets = [
    { p: 'SRM Main Gate', d: 'Chennai Airport', l: 'Gate 2, near blue building' },
    { p: 'SRM Tech Park', d: 'Tambaram Railway Station', l: 'Near Bus Shelter' },
    { p: 'SRM Campus Arch', d: 'Chennai Central', l: 'Opposite Main Library' },
  ];

  const handleRunSmartMatch = async () => {
    if (!pickup.trim() || !destination.trim()) {
      Alert.alert('Required', 'Please enter pickup and destination.');
      return;
    }
    setCalculating(true);
    try {
      const res = await api.post('/drivers/smartmatch', {
        pickup: pickup.trim(),
        destination: destination.trim(),
        rideType,
      });

      if (res.data.success) {
        setMatchResult(res.data.data);
        setSelectedDriverId(res.data.data.recommendedDriver.driver.id);
      }
    } catch (err: any) {
      Alert.alert('SmartMatch Error', err.response?.data?.message || 'Failed to match drivers.');
    } finally {
      setCalculating(false);
    }
  };

  const handleConfirmRide = async () => {
    setBooking(true);
    try {
      const res = await api.post('/rides', {
        pickup: pickup.trim(),
        destination: destination.trim(),
        landmark: landmark.trim() || undefined,
        rideType,
        driverId: selectedDriverId || undefined,
      });

      if (res.data.success) {
        const ride = res.data.data;
        Alert.alert(
          'Ride Booked Successfully! 🚕',
          `Your 4-Digit Ride PIN is: ${ride.pin}\nDriver: ${ride.driver?.name || 'Assigned'}\nVehicle: ${ride.driver?.vehicle?.vehicleNumber || 'Cab'}`,
          [
            {
              text: 'Go to Active Ride',
              onPress: () => onRideBooked(ride.id),
            },
          ]
        );
      }
    } catch (err: any) {
      Alert.alert('Booking Error', err.response?.data?.message || 'Could not complete booking.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerBadge}>SMART DISPATCH & SAFETY VERIFICATION</Text>
      <Text style={styles.screenTitle}>Book a Safe Cab</Text>

      {/* Preset Fast Route Buttons */}
      <View style={styles.presetRow}>
        {presets.map((item, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.presetBadge}
            onPress={() => {
              setPickup(item.p);
              setDestination(item.d);
              setLandmark(item.l);
            }}
          >
            <Text style={styles.presetText}>⚡ {item.d.split(' ')[0]}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Route Inputs Card */}
      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>📍 Pickup Location</Text>
          <TextInput
            style={styles.input}
            value={pickup}
            onChangeText={setPickup}
            placeholder="Enter pickup point"
            placeholderTextColor={Colors.textDim}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>🏁 Destination</Text>
          <TextInput
            style={styles.input}
            value={destination}
            onChangeText={setDestination}
            placeholder="Enter drop destination"
            placeholderTextColor={Colors.textDim}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>📸 Visual Pickup Landmark (Assistance)</Text>
          <TextInput
            style={styles.input}
            value={landmark}
            onChangeText={setLandmark}
            placeholder="e.g. Near blue ATM / Gate 2 pillar"
            placeholderTextColor={Colors.textDim}
          />
        </View>

        {/* Vehicle Selection */}
        <Text style={styles.label}>SELECT VEHICLE CLASS</Text>
        <View style={styles.vehicleRow}>
          {(['MINI', 'SEDAN', 'SUV'] as VehicleType[]).map((type) => {
            const isSelected = rideType === type;
            return (
              <TouchableOpacity
                key={type}
                style={[styles.vehicleOption, isSelected && styles.vehicleOptionSelected]}
                onPress={() => setRideType(type)}
              >
                <Text style={styles.vehicleIcon}>
                  {type === 'MINI' ? '🚗' : type === 'SEDAN' ? '🚘' : '🚙'}
                </Text>
                <Text style={[styles.vehicleName, isSelected && styles.vehicleTextSelected]}>
                  {type}
                </Text>
                <Text style={styles.vehicleMultiplier}>
                  {type === 'MINI' ? '1.0x' : type === 'SEDAN' ? '1.25x' : '1.6x'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* SmartMatch Button */}
        <TouchableOpacity
          style={styles.smartMatchBtn}
          onPress={handleRunSmartMatch}
          disabled={calculating}
        >
          {calculating ? (
            <ActivityIndicator color="#0B132B" />
          ) : (
            <Text style={styles.smartMatchBtnText}>⚡ Calculate SmartMatch & Fare</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* SmartMatch Result */}
      {matchResult && (
        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultTitle}>SmartMatch Recommendation</Text>
            <View style={styles.scoreBadge}>
              <Text style={styles.scoreText}>
                {matchResult.recommendedDriver.matchScore}% Match
              </Text>
            </View>
          </View>

          {/* Recommended Driver Info */}
          <View style={styles.driverInfoBox}>
            <View style={styles.driverAvatar}>
              <Text style={{ fontSize: 24 }}>👨🏽‍✈️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.driverName}>
                {matchResult.recommendedDriver.driver.name}
              </Text>
              <Text style={styles.driverVehicle}>
                {matchResult.recommendedDriver.driver.vehicle?.model} •{' '}
                {matchResult.recommendedDriver.driver.vehicle?.vehicleNumber}
              </Text>
              <Text style={styles.driverMetrics}>
                ⭐ {matchResult.recommendedDriver.driver.rating.toFixed(1)} • ETA:{' '}
                {matchResult.recommendedDriver.estimatedArrivalMin} mins (
                {matchResult.recommendedDriver.distanceAwayKm} km away)
              </Text>
            </View>
          </View>

          {/* Fare Summary */}
          <View style={styles.fareSummary}>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Estimated Distance:</Text>
              <Text style={styles.fareValue}>{matchResult.distanceKm} km</Text>
            </View>
            <View style={styles.fareRow}>
              <Text style={styles.fareLabel}>Est. Travel Duration:</Text>
              <Text style={styles.fareValue}>{matchResult.durationMin} mins</Text>
            </View>
            <View style={[styles.fareRow, styles.fareRowTotal]}>
              <Text style={styles.fareTotalLabel}>Total Fare Estimate:</Text>
              <Text style={styles.fareTotalValue}>₹{matchResult.estimatedFare}</Text>
            </View>
          </View>

          {/* Book Ride Action */}
          <TouchableOpacity
            style={styles.bookNowBtn}
            onPress={handleConfirmRide}
            disabled={booking}
          >
            {booking ? (
              <ActivityIndicator color="#0B132B" />
            ) : (
              <Text style={styles.bookNowText}>🔒 Confirm & Generate Secure PIN</Text>
            )}
          </TouchableOpacity>
        </View>
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
  headerBadge: {
    color: Colors.cyan,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
    marginBottom: 14,
  },
  presetRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  presetBadge: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  presetText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  vehicleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 4,
  },
  vehicleOption: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  vehicleOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(6, 214, 160, 0.1)',
  },
  vehicleIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  vehicleName: {
    color: Colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  vehicleTextSelected: {
    color: Colors.primary,
  },
  vehicleMultiplier: {
    color: Colors.textDim,
    fontSize: 10,
    marginTop: 2,
  },
  smartMatchBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  smartMatchBtnText: {
    color: '#0B132B',
    fontSize: 15,
    fontWeight: '700',
  },
  resultCard: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  resultTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  scoreBadge: {
    backgroundColor: 'rgba(6, 214, 160, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  scoreText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  driverInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    borderRadius: 14,
    padding: 12,
    gap: 12,
    marginBottom: 14,
  },
  driverAvatar: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.cardHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverName: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  driverVehicle: {
    color: Colors.cyan,
    fontSize: 12,
    marginTop: 2,
  },
  driverMetrics: {
    color: Colors.textMuted,
    fontSize: 11,
    marginTop: 2,
  },
  fareSummary: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  fareRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  fareRowTotal: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 8,
    marginTop: 4,
    marginBottom: 0,
  },
  fareLabel: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  fareValue: {
    color: Colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  fareTotalLabel: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  fareTotalValue: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '800',
  },
  bookNowBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bookNowText: {
    color: '#0B132B',
    fontSize: 15,
    fontWeight: '800',
  },
});
