/**
 * Campaign picker — a row of chips to switch the active live campaign at runtime. This
 * stands in for the upstream service deciding which campaign is live; selecting one swaps
 * the theme, overlay, and feed instantly, with no app binary update.
 */
import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

export interface PickerOption {
  id: string;
  label: string;
}

interface CampaignPickerProps {
  options: PickerOption[];
  activeId: string;
  onSelect: (id: string) => void;
}

export function CampaignPicker({
  options,
  activeId,
  onSelect,
}: CampaignPickerProps): React.JSX.Element {
  const theme = useTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.bar}
    >
      {options.map((option) => {
        const active = option.id === activeId;
        return (
          <Pressable
            key={option.id}
            onPress={() => onSelect(option.id)}
            style={[
              styles.chip,
              {
                backgroundColor: active ? theme.primary : theme.surface,
                borderColor: theme.primary,
              },
            ]}
          >
            <Text style={[styles.chipText, { color: active ? '#FFFFFF' : theme.text }]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  bar: {
    gap: 8,
    paddingVertical: 4,
    paddingRight: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
