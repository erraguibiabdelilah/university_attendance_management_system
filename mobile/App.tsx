import React, { useState, useEffect } from 'react';
import { StatusBar, StyleSheet, View, Modal, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import AbsencesScreen from './src/screens/AbsencesScreen';
import JustificationsScreen from './src/screens/JustificationsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ScanScreen from './src/screens/ScanScreen';
import TeacherHomeScreen from './src/screens/teacher/TeacherHomeScreen';
import TeacherScanScreen from './src/screens/teacher/TeacherScanScreen';
import TeacherAbsencesScreen from './src/screens/teacher/TeacherAbsencesScreen';
import TeacherProfileScreen from './src/screens/teacher/TeacherProfileScreen';
import TeacherDashboardScreen from './src/screens/teacher/TeacherDashboardScreen';
import TeacherStatsScreen from './src/screens/teacher/TeacherStatsScreen';
import { SessionConfig } from './src/screens/teacher/TeacherHomeScreen';
import BottomTabBar from './src/components/BottomTabBar';

import { checkAndNotifyAbsences, setupPushNotifications } from './src/services/NotificationService';

const BASE_URL = 'http://10.181.4.71:8080/api/uca';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loadingRole, setLoadingRole] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [teacherId, setTeacherId] = useState<number | undefined>(undefined);
  const [activeTab, setActiveTab] = useState('home');
  const [showScan, setShowScan] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [sessionConfig, setSessionConfig] = useState<SessionConfig | null>(null);

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setLoadingRole(true);
    (async () => {
      try {
        const token = await AsyncStorage.getItem('token');
        const username = await AsyncStorage.getItem('username');
        if (token && username) {
          const res = await fetch(`${BASE_URL}/auth/username/${username}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (res.ok) {
            const user = await res.json();
            setUserRole(user.role ?? null);
            setTeacherId(user.id ?? undefined);
            setTeacherName(`${user.firstName ?? ''} ${user.lastName ?? ''}`.trim());
            await setupPushNotifications(user.id);
          }
        }
        checkAndNotifyAbsences();
      } finally {
        setLoadingRole(false);
      }
    })();
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    setIsAuthenticated(false);
    setUserRole(null);
    setTeacherId(undefined);
    setActiveTab('home');
  };

  const isTeacher = userRole === 'TEACHER' || userRole === 'ADMIN';

  const renderScreen = () => {
    // ── Vue enseignant / admin ──
    if (isTeacher) {
      switch (activeTab) {
        case 'stats':
          return <TeacherStatsScreen teacherId={teacherId} />;
        case 'scan':
          return (
            <TeacherHomeScreen
              teacherName={teacherName || 'Professeur'}
              teacherId={teacherId}
              onScanPress={(config) => { setSessionConfig(config); setShowScan(true); }}
            />
          );
        case 'absences':
          return <TeacherAbsencesScreen teacherId={teacherId} />;
        case 'profile':
          return <TeacherProfileScreen onLogout={handleLogout} />;
        default:
          return <TeacherDashboardScreen teacherName={teacherName || 'Professeur'} teacherId={teacherId} onTabPress={setActiveTab} />;
      }
    }

    // ── Vue étudiant ──
    if (showProfile) return <ProfileScreen onLogout={handleLogout} onBack={() => setShowProfile(false)} />;
    switch (activeTab) {
      case 'home':
        return <HomeScreen onLogout={handleLogout} onProfilePress={() => setShowProfile(true)} />;
      case 'absences':
        return <AbsencesScreen onScanPress={() => setShowScan(true)} onProfilePress={() => setShowProfile(true)} />;
      case 'justifications':
        return <JustificationsScreen onProfilePress={() => setShowProfile(true)} />;
      case 'profile':
        return <ProfileScreen onLogout={handleLogout} onBack={() => setActiveTab('home')} onSettings={() => setActiveTab('settings')} />;
      case 'settings':
        return <SettingsScreen onLogout={handleLogout} onBack={() => setActiveTab('profile')} />;
      default:
        return <HomeScreen onLogout={handleLogout} onProfilePress={() => setShowProfile(true)} />;
    }
  };

  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {!isAuthenticated ? (
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      ) : loadingRole ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#622B14" />
        </View>
      ) : (
        <View style={styles.main}>
          <View style={styles.screenContainer}>
            {renderScreen()}
          </View>
          <BottomTabBar
            activeTab={activeTab}
            onTabPress={setActiveTab}
            tabs={isTeacher ? 'teacher' : 'student'}
          />

          <Modal visible={showScan} animationType="slide">
            {isTeacher && sessionConfig
              ? <TeacherScanScreen session={sessionConfig} onClose={() => setShowScan(false)} />
              : <ScanScreen onClose={() => setShowScan(false)} />
            }
          </Modal>
        </View>
      )}
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f8',
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF8F6',
  },
  main: {
    flex: 1,
  },
  screenContainer: {
    flex: 1,
  },
});
