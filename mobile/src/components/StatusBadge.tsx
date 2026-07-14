import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SIZES, FONTS } from '../constants/theme';
import { AbsenceStatus } from '../data/mockData';

export default function StatusBadge({ status }: { status: AbsenceStatus }) {
  const getBadgeColor = () => {
    switch (status) {
      case 'JUSTIFIÉE': return COLORS.status.justified;
      case 'NON JUSTIFIÉE': return COLORS.status.unjustified;
      case 'EN ATTENTE': return COLORS.status.pending;
      default: return COLORS.subtitle;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: getBadgeColor() }]}>
      <Text style={styles.text}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SIZES.small,
    paddingVertical: 4,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  text: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: FONTS.bold,
  }
});
