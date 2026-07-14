import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type TabItem = {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  iconActive: keyof typeof Ionicons.glyphMap;
};

const studentTabs: TabItem[] = [
  { key: 'home',           label: 'Accueil',  icon: 'home-outline',          iconActive: 'home' },
  { key: 'absences',       label: 'Absences', icon: 'list-outline',           iconActive: 'list' },
  { key: 'justifications', label: 'Justif.',  icon: 'document-text-outline',  iconActive: 'document-text' },
  { key: 'profile',        label: 'Profil',   icon: 'person-outline',         iconActive: 'person' },
];

const teacherTabs: TabItem[] = [
  { key: 'home',     label: 'Accueil',  icon: 'home-outline',       iconActive: 'home' },
  { key: 'stats',    label: 'Stats',    icon: 'stats-chart-outline', iconActive: 'stats-chart' },
  { key: 'scan',     label: 'Scan',     icon: 'camera-outline',      iconActive: 'camera' },
  { key: 'absences', label: 'Absences', icon: 'list-outline',        iconActive: 'list' },
  { key: 'profile',  label: 'Profil',   icon: 'person-outline',      iconActive: 'person' },
];

export default function BottomTabBar({
  activeTab,
  onTabPress,
  tabs = 'student',
}: {
  activeTab: string;
  onTabPress: (key: string) => void;
  tabs?: 'student' | 'teacher';
}) {
  const insets = useSafeAreaInsets();
  const items = tabs === 'teacher' ? teacherTabs : studentTabs;

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom || 8 }]}>
      {items.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity key={tab.key} style={styles.tab} onPress={() => onTabPress(tab.key)}>
            <Ionicons
              name={isActive ? tab.iconActive : tab.icon}
              size={24}
              color={isActive ? COLORS.primary : COLORS.subtitle}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F3F5',
    paddingTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 10,
  },
  tab:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  label:      { fontSize: 10, marginTop: 4, color: COLORS.subtitle },
  labelActive:{ color: COLORS.primary, fontWeight: '600' },
});
