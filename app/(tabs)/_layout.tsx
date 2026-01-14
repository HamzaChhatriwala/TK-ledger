import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
      }}
    >
      <Tabs.Screen name="customers" />
      <Tabs.Screen name="invoices" />
      <Tabs.Screen name="payments" />
      <Tabs.Screen name="ledger" />
    </Tabs>
  );
}




