import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../lib/theme/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { mode, toggleTheme } = useTheme();
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.toggle, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={toggleTheme}
    >
      <Text style={[styles.toggleText, { color: theme.text }]}>
        {mode === 'light' ? '🌙' : '☀️'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  toggle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    marginRight: 8,
  },
  toggleText: {
    fontSize: 20,
  },
});




