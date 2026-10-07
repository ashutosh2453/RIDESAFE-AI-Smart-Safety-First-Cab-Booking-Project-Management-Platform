# RideSafe AI — Android Mobile App Guide (Expo & React Native)

The RideSafe AI mobile app is located in `/mobile`. It is built with **React Native** and **Expo SDK 51/52** with full TypeScript typing.

---

## 1. Directory Structure

```
mobile/
├── App.tsx                     # Application entry point & theme provider
├── package.json                # Dependencies and run scripts
├── app.json                    # Expo configuration (icons, splash, orientation)
├── tsconfig.json               # TypeScript compiler configuration
└── src/
    ├── navigation/             # Navigation stacks & tabs
    │   └── AppNavigator.tsx    # Auth & Main Tab / Stack router
    ├── screens/                # Native screen components
    │   ├── LoginScreen.tsx     # Authentication with custom backend URL picker
    │   ├── RegisterScreen.tsx  # Passenger registration
    │   ├── DashboardScreen.tsx # Safety score, quick actions, active rides
    │   ├── BookRideScreen.tsx  # Pickup, destination, vehicle selector, SmartMatch
    │   ├── ActiveRideScreen.tsx# Live ride status, 4-digit PIN, vehicle verification
    │   ├── SafetyScreen.tsx    # One-tap SOS, 112 hotline, emergency checklist
    │   ├── ContactsScreen.tsx  # Manage trusted contacts
    │   ├── ProjectsScreen.tsx  # Trip projects & itinerary tracking
    │   ├── TasksScreen.tsx     # Checklist items with priority toggling
    │   └── AiAssistantScreen.tsx# RideSafe AI interactive chat
    ├── services/
    │   └── api.ts              # Mobile Axios client with AsyncStorage token injection
    └── context/
        └── AuthContext.tsx     # Mobile authentication state provider
```

---

## 2. Running on Android Emulator / Physical Device

### 2.1 Starting Expo
```bash
cd mobile
npm install --legacy-peer-deps
npm start
```

### 2.2 Android Emulator Networking
When running an Android Emulator (via Android Studio), `localhost` refers to the emulator's virtual device itself, not your development host machine.

- **Emulator Host Loopback**: `http://10.0.2.2:5000/api` (pre-configured in the app)
- **Physical Device via Wi-Fi**: Enter your host machine's LAN IP (e.g. `http://192.168.1.50:5000/api`) directly in the API URL input field on the Login screen.
- **Expo Web Preview**: `http://localhost:5000/api`

---

## 3. Key Mobile Features

1. **API URL Customizer**: Easily test against local, staging, or production backends without modifying code.
2. **Offline-Safe Token Storage**: Uses `@react-native-async-storage/async-storage` for reliable session persistence.
3. **Emergency SOS Fast Dial**: Directly launches device native phone dialer for 112 and trusted contacts.
4. **Interactive PIN Display**: High-contrast, large-font card showing the passenger's 4-digit PIN for quick presentation to the driver.
