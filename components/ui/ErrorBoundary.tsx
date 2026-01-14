import React, { Component, ErrorInfo, ReactNode } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Button } from './Button';
import { ThemeProvider, useTheme } from '../../lib/theme/ThemeContext';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryInner extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay error={this.state.error} onRetry={() => this.setState({ hasError: false, error: undefined })} />;
    }

    return this.props.children;
  }
}

const ErrorDisplay: React.FC<{ error?: Error; onRetry: () => void }> = ({ error, onRetry }) => {
  const { theme } = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Something went wrong</Text>
      <Text style={[styles.message, { color: theme.textSecondary }]}>
        {error?.message || 'An unexpected error occurred'}
      </Text>
      <Button
        title="Try Again"
        onPress={onRetry}
        style={styles.button}
      />
    </View>
  );
};

export class ErrorBoundary extends Component<Props> {
  render() {
    return (
      <ThemeProvider>
        <ErrorBoundaryInner {...this.props} />
      </ThemeProvider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    minWidth: 120,
  },
});

