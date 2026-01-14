import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../lib/theme/ThemeContext';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const { theme } = useTheme();

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return { backgroundColor: theme.primary };
      case 'secondary':
        return { backgroundColor: theme.secondary };
      case 'outline':
        return { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.primary };
      case 'danger':
        return { backgroundColor: theme.error };
      default:
        return { backgroundColor: theme.primary };
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
      case 'danger':
        return theme.text === '#FFFFFF' ? '#FFFFFF' : '#FFFFFF';
      case 'secondary':
        return theme.text;
      case 'outline':
        return theme.primary;
      default:
        return '#FFFFFF';
    }
  };

  const buttonStyle = [
    styles.button,
    getButtonStyle(),
    (disabled || loading) && styles.disabled,
    style,
  ];

  const buttonTextStyle = [styles.text, { color: getTextColor() }, textStyle];

  return (
    <TouchableOpacity
      style={buttonStyle}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} />
      ) : (
        <Text style={buttonTextStyle}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#F0F0F0',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  danger: {
    backgroundColor: '#FF3B30',
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: '#000000',
  },
  outlineText: {
    color: '#007AFF',
  },
  dangerText: {
    color: '#FFFFFF',
  },
});

