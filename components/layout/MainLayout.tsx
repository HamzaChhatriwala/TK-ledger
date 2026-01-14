import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { Header } from './Header';
import { TabBar } from './TabBar';
import { useTheme } from '../../lib/theme/ThemeContext';

interface MainLayoutProps {
  children: React.ReactNode;
  title: string;
  headerRight?: React.ReactNode;
  showBack?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  headerRight,
  showBack,
}) => {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Header title={title} rightAction={headerRight} showBack={showBack} />
      <View style={styles.content}>{children}</View>
      <TabBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  content: {
    flex: 1,
  },
});

