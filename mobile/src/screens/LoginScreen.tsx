import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Colors } from '../theme/colors';
import { setApiBaseUrl, api } from '../services/api';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigateToRegister }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('demo@ridesafe.ai');
  const [password, setPassword] = useState('Demo@1234');
  const [loading, setLoading] = useState(false);
  const [apiUrl, setApiUrl] = useState(api.defaults.baseURL || '');
  const [showServerConfig, setShowServerConfig] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Required Fields', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    const res = await login(email.trim(), password);
    setLoading(false);
    if (!res.success) {
      Alert.alert('Login Failed', res.message || 'Check your credentials or backend connection.');
    }
  };

  const handleApplyServerUrl = async () => {
    if (apiUrl.trim()) {
      await setApiBaseUrl(apiUrl.trim());
      Alert.alert('Server Updated', `API endpoint set to: ${apiUrl.trim()}`);
      setShowServerConfig(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Brand Logo & Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>🛡️</Text>
          </View>
          <Text style={styles.brandTitle}>RideSafe AI</Text>
          <Text style={styles.brandSubtitle}>
            Smart & Safety-First Cab Booking + Project Management
          </Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Sign In</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="user@example.com"
              placeholderTextColor={Colors.textDim}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textDim}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Sign In Button */}
          <TouchableOpacity
            style={[styles.primaryButton, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#0B132B" />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In to RideSafe</Text>
            )}
          </TouchableOpacity>

          {/* Quick Demo Button */}
          <TouchableOpacity
            style={styles.demoButton}
            onPress={() => {
              setEmail('demo@ridesafe.ai');
              setPassword('Demo@1234');
              handleLogin();
            }}
          >
            <Text style={styles.demoButtonText}>⚡ Instant One-Tap Demo Sign In</Text>
          </TouchableOpacity>

          {/* Switch to Register */}
          <View style={styles.footerRow}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={onNavigateToRegister}>
              <Text style={styles.linkText}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Server Config Accordion for debugging & physical device testing */}
        <TouchableOpacity
          style={styles.serverConfigToggle}
          onPress={() => setShowServerConfig(!showServerConfig)}
        >
          <Text style={styles.serverConfigToggleText}>
            ⚙️ Server Connection Settings ({api.defaults.baseURL})
          </Text>
        </TouchableOpacity>

        {showServerConfig && (
          <View style={styles.serverConfigBox}>
            <Text style={styles.serverConfigLabel}>Backend API Base URL:</Text>
            <TextInput
              style={styles.serverInput}
              value={apiUrl}
              onChangeText={setApiUrl}
              placeholder="http://10.0.2.2:5000/api"
              placeholderTextColor={Colors.textDim}
              autoCapitalize="none"
            />
            <View style={styles.quickUrlRow}>
              <TouchableOpacity
                style={styles.quickUrlBadge}
                onPress={() => setApiUrl('http://10.0.2.2:5000/api')}
              >
                <Text style={styles.quickUrlText}>Android Emulator (10.0.2.2)</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.quickUrlBadge}
                onPress={() => setApiUrl('http://localhost:5000/api')}
              >
                <Text style={styles.quickUrlText}>Localhost:5000</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.saveServerBtn} onPress={handleApplyServerUrl}>
              <Text style={styles.saveServerBtnText}>Apply API URL</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  scrollContent: {
    padding: 24,
    paddingTop: 48,
    justifyContent: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: Colors.card,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoIcon: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 13,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.bg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    color: Colors.text,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  primaryButtonText: {
    color: '#0B132B',
    fontSize: 16,
    fontWeight: '700',
  },
  demoButton: {
    backgroundColor: 'rgba(6, 214, 160, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(6, 214, 160, 0.3)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  demoButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  footerText: {
    color: Colors.textMuted,
    fontSize: 14,
  },
  linkText: {
    color: Colors.cyan,
    fontSize: 14,
    fontWeight: '600',
  },
  serverConfigToggle: {
    marginTop: 24,
    alignItems: 'center',
  },
  serverConfigToggleText: {
    color: Colors.textDim,
    fontSize: 12,
  },
  serverConfigBox: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  serverConfigLabel: {
    color: Colors.textMuted,
    fontSize: 12,
    marginBottom: 6,
  },
  serverInput: {
    backgroundColor: Colors.bg,
    color: Colors.text,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickUrlRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  quickUrlBadge: {
    backgroundColor: Colors.cardHover,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  quickUrlText: {
    color: Colors.cyan,
    fontSize: 11,
  },
  saveServerBtn: {
    backgroundColor: Colors.blue,
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveServerBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
