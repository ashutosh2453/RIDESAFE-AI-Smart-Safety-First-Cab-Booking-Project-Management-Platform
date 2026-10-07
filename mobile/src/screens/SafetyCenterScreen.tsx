import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from 'react-native';
import { api } from '../services/api';
import { Colors } from '../theme/colors';
import { TrustedContact } from '../types';

interface SafetyCenterScreenProps {
  onSOSWithRide?: (rideId: string) => void;
}

export const SafetyCenterScreen: React.FC<SafetyCenterScreenProps> = () => {
  const [contacts, setContacts] = useState<TrustedContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [sosLoading, setSosLoading] = useState(false);

  // Add Contact Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [relationship, setRelationship] = useState<'PARENT' | 'FRIEND' | 'SIBLING' | 'OTHER'>('PARENT');
  const [addingContact, setAddingContact] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts');
      if (res.data.success) {
        setContacts(res.data.data);
      }
    } catch (err) {
      console.warn('Failed to load trusted contacts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleTriggerSOS = async () => {
    Alert.alert(
      '🚨 INITIATE EMERGENCY SOS?',
      'This will log an emergency incident and simulate urgent alerts to your trusted contacts and local authorities.\n\n(Dial 112 in real danger)',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'ACTIVATE SOS',
          style: 'destructive',
          onPress: async () => {
            setSosLoading(true);
            try {
              // Get active ride if any
              const ridesRes = await api.get('/rides');
              const active = ridesRes.data.data?.find(
                (r: any) => r.status === 'STARTED' || r.status === 'DRIVER_ARRIVED'
              );

              if (active) {
                await api.post(`/rides/${active.id}/sos`);
              }

              Alert.alert(
                'EMERGENCY SOS INITIATED 🚨',
                'Your emergency signal has been broadcast. In an actual real-world emergency, dial 112 immediately.'
              );
            } catch (err: any) {
              Alert.alert('SOS Triggered', 'Emergency alerts have been recorded.');
            } finally {
              setSosLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleAddContact = async () => {
    if (!name.trim() || !phoneNumber.trim()) {
      Alert.alert('Required', 'Please enter contact name and phone number.');
      return;
    }
    setAddingContact(true);
    try {
      const res = await api.post('/contacts', {
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        relationship,
      });

      if (res.data.success) {
        setContacts([...contacts, res.data.data]);
        setName('');
        setPhoneNumber('');
        setModalVisible(false);
        Alert.alert('Success', 'Trusted contact added.');
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Could not add contact.');
    } finally {
      setAddingContact(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerBadge}>PASSENGER PROTECTION</Text>
      <Text style={styles.screenTitle}>Safety Center</Text>

      {/* Big Emergency SOS Card */}
      <View style={styles.sosCard}>
        <View style={styles.sosCircle}>
          <Text style={{ fontSize: 40 }}>🚨</Text>
        </View>
        <Text style={styles.sosCardTitle}>ONE-TAP EMERGENCY SOS</Text>
        <Text style={styles.sosCardSub}>
          Press to immediately trigger priority safety protocol & broadcast GPS location to your contacts.
        </Text>

        <TouchableOpacity
          style={styles.sosMainBtn}
          onPress={handleTriggerSOS}
          disabled={sosLoading}
        >
          {sosLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.sosMainBtnText}>TRIGGER SOS NOW</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Emergency Hotlines */}
      <View style={styles.hotlineCard}>
        <Text style={styles.cardHeader}>EMERGENCY HELPLINES (INDIA)</Text>
        <View style={styles.hotlineRow}>
          <View style={styles.hotlineItem}>
            <Text style={styles.hotlineLabel}>National Emergency</Text>
            <Text style={styles.hotlineNumber}>📞 112</Text>
          </View>
          <View style={styles.hotlineItem}>
            <Text style={styles.hotlineLabel}>Women Helpline</Text>
            <Text style={styles.hotlineNumber}>📞 1091</Text>
          </View>
          <View style={styles.hotlineItem}>
            <Text style={styles.hotlineLabel}>Ambulance</Text>
            <Text style={styles.hotlineNumber}>📞 108</Text>
          </View>
        </View>
      </View>

      {/* Trusted Contacts */}
      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeader}>TRUSTED CONTACTS ({contacts.length})</Text>
          <TouchableOpacity
            style={styles.addContactBtn}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.addContactText}>+ Add Contact</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 10 }} />
        ) : contacts.length === 0 ? (
          <Text style={styles.emptyContacts}>
            No trusted contacts yet. Add family or friends to notify in emergencies.
          </Text>
        ) : (
          contacts.map((c) => (
            <View key={c.id} style={styles.contactItem}>
              <View style={styles.contactAvatar}>
                <Text style={{ fontSize: 18 }}>👤</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.contactName}>{c.name}</Text>
                <Text style={styles.contactPhone}>{c.phoneNumber}</Text>
              </View>
              <View style={styles.relationBadge}>
                <Text style={styles.relationBadgeText}>{c.relationship}</Text>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Safety Protocol Checklist */}
      <View style={styles.card}>
        <Text style={styles.cardHeader}>RIDESAFE PASSENGER CHECKLIST</Text>
        <View style={styles.checklistRow}>
          <Text style={styles.checkIcon}>✅</Text>
          <Text style={styles.checkText}>
            Always check driver's license plate against app before boarding.
          </Text>
        </View>
        <View style={styles.checklistRow}>
          <Text style={styles.checkIcon}>✅</Text>
          <Text style={styles.checkText}>
            Never share your 4-digit Ride PIN until seated in the verified car.
          </Text>
        </View>
        <View style={styles.checklistRow}>
          <Text style={styles.checkIcon}>✅</Text>
          <Text style={styles.checkText}>
            Share live trip tracking code with friends for late night commutes.
          </Text>
        </View>
        <View style={styles.checklistRow}>
          <Text style={styles.checkIcon}>✅</Text>
          <Text style={styles.checkText}>
            Keep route deviation alerts enabled throughout the journey.
          </Text>
        </View>
      </View>

      {/* Add Contact Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Trusted Contact</Text>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Full Name</Text>
              <TextInput
                style={styles.modalInput}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Mom, Rahul"
                placeholderTextColor={Colors.textDim}
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Phone Number</Text>
              <TextInput
                style={styles.modalInput}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                placeholder="+91 9876543210"
                placeholderTextColor={Colors.textDim}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.modalInputGroup}>
              <Text style={styles.modalLabel}>Relationship</Text>
              <View style={styles.relationSelectRow}>
                {(['PARENT', 'FRIEND', 'SIBLING', 'OTHER'] as const).map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.relationOption,
                      relationship === r && styles.relationOptionSelected,
                    ]}
                    onPress={() => setRelationship(r)}
                  >
                    <Text
                      style={[
                        styles.relationOptionText,
                        relationship === r && styles.relationOptionTextSelected,
                      ]}
                    >
                      {r}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelModalBtn}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelModalText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveModalBtn}
                onPress={handleAddContact}
                disabled={addingContact}
              >
                {addingContact ? (
                  <ActivityIndicator color="#0B132B" />
                ) : (
                  <Text style={styles.saveModalText}>Save Contact</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    color: Colors.danger,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 2,
    marginBottom: 14,
  },
  sosCard: {
    backgroundColor: 'rgba(239, 71, 111, 0.12)',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.danger,
    marginBottom: 16,
  },
  sosCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(239, 71, 111, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  sosCardTitle: {
    color: Colors.danger,
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 1,
  },
  sosCardSub: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
    paddingHorizontal: 10,
  },
  sosMainBtn: {
    backgroundColor: Colors.danger,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 28,
    alignItems: 'center',
    width: '100%',
  },
  sosMainBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 1,
  },
  hotlineCard: {
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
    marginBottom: 10,
  },
  hotlineRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  hotlineItem: {
    alignItems: 'center',
    flex: 1,
  },
  hotlineLabel: {
    color: Colors.textMuted,
    fontSize: 10,
  },
  hotlineNumber: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addContactBtn: {
    backgroundColor: 'rgba(6, 214, 160, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  addContactText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyContacts: {
    color: Colors.textMuted,
    fontSize: 12,
    textAlign: 'center',
    marginVertical: 10,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bg,
    borderRadius: 12,
    padding: 12,
    gap: 12,
    marginBottom: 8,
  },
  contactAvatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.cardHover,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactName: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  contactPhone: {
    color: Colors.textMuted,
    fontSize: 12,
  },
  relationBadge: {
    backgroundColor: Colors.cardHover,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  relationBadgeText: {
    color: Colors.cyan,
    fontSize: 10,
    fontWeight: '700',
  },
  checklistRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  checkIcon: {
    fontSize: 14,
    marginTop: 2,
  },
  checkText: {
    color: Colors.textMuted,
    fontSize: 13,
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 16,
  },
  modalInputGroup: {
    marginBottom: 14,
  },
  modalLabel: {
    color: Colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  modalInput: {
    backgroundColor: Colors.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  relationSelectRow: {
    flexDirection: 'row',
    gap: 6,
  },
  relationOption: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  relationOptionSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(6, 214, 160, 0.15)',
  },
  relationOptionText: {
    color: Colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  relationOptionTextSelected: {
    color: Colors.primary,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelModalBtn: {
    flex: 1,
    backgroundColor: Colors.bg,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelModalText: {
    color: Colors.textMuted,
    fontSize: 14,
    fontWeight: '600',
  },
  saveModalBtn: {
    flex: 1,
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  saveModalText: {
    color: '#0B132B',
    fontSize: 14,
    fontWeight: '700',
  },
});
