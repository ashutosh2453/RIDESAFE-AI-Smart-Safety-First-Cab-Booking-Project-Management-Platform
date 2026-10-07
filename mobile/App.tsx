import React, { useState } from 'react';
import { StyleSheet, View, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { Header } from './src/components/Header';
import { TabBar, TabKey } from './src/components/TabBar';
import { LoginScreen } from './src/screens/LoginScreen';
import { RegisterScreen } from './src/screens/RegisterScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';
import { BookRideScreen } from './src/screens/BookRideScreen';
import { ActiveRideScreen } from './src/screens/ActiveRideScreen';
import { SafetyCenterScreen } from './src/screens/SafetyCenterScreen';
import { ProjectsScreen } from './src/screens/ProjectsScreen';
import { AIAssistantScreen } from './src/screens/AIAssistantScreen';
import { Colors } from './src/theme/colors';

const MainNavigator = () => {
  const { user, isLoading } = useAuth();
  const [authView, setAuthView] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [currentTab, setCurrentTab] = useState<TabKey>('DASHBOARD');
  const [openedRideId, setOpenedRideId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Not logged in -> Show Login or Register
  if (!user) {
    return authView === 'LOGIN' ? (
      <LoginScreen onNavigateToRegister={() => setAuthView('REGISTER')} />
    ) : (
      <RegisterScreen onNavigateToLogin={() => setAuthView('LOGIN')} />
    );
  }

  // If viewing an active ride
  if (openedRideId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Header title="Active Ride Guardian" subtitle="Live Passenger Security Shield" />
        <ActiveRideScreen
          rideId={openedRideId}
          onBack={() => setOpenedRideId(null)}
          onSOS={() => {
            setOpenedRideId(null);
            setCurrentTab('SAFETY');
          }}
        />
      </SafeAreaView>
    );
  }

  // Tab content selection
  let ContentComponent: React.ReactNode = null;
  let headerTitle = 'RideSafe AI';
  let headerSubtitle = 'Smart & Safety-First Cab Platform';

  switch (currentTab) {
    case 'DASHBOARD':
      headerTitle = 'RideSafe AI';
      headerSubtitle = 'Smart & Safety-First Cab Platform';
      ContentComponent = (
        <DashboardScreen
          onNavigateTab={setCurrentTab}
          onOpenRide={(id) => setOpenedRideId(id)}
        />
      );
      break;
    case 'BOOK':
      headerTitle = 'Smart Booking';
      headerSubtitle = 'SmartMatch Dispatch & PIN Protection';
      ContentComponent = (
        <BookRideScreen
          onRideBooked={(id) => setOpenedRideId(id)}
        />
      );
      break;
    case 'SAFETY':
      headerTitle = 'Safety Center';
      headerSubtitle = 'Emergency SOS & Trusted Contacts';
      ContentComponent = <SafetyCenterScreen />;
      break;
    case 'PROJECTS':
      headerTitle = 'Transportation Projects';
      headerSubtitle = 'Trip Itinerary & Task Checklists';
      ContentComponent = <ProjectsScreen />;
      break;
    case 'AI':
      headerTitle = 'AI Travel Assistant';
      headerSubtitle = 'Instant Guidance & Safety Intelligence';
      ContentComponent = <AIAssistantScreen />;
      break;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <Header title={headerTitle} subtitle={headerSubtitle} />
      <View style={styles.contentArea}>{ContentComponent}</View>
      <TabBar currentTab={currentTab} onSelectTab={setCurrentTab} />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={Colors.bg} />
      <AuthProvider>
        <MainNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  contentArea: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
