import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { PillProvider } from '../../contexts/PillContext';
import Colors from '@/constants/Colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <PillProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors['light'].tint,
          headerShown: false,
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Pills',
            tabBarIcon: ({ color }) => <TabBarIcon name="code" color={color} />,
          }}
        />
        <Tabs.Screen
          name="modal"
  
          options={{
            title: 'Add Pill',
            tabBarIcon: ({ color }) => <TabBarIcon name="plus" color={color} />,
            
          }}
          
        />
      </Tabs>
    </PillProvider>
  );
}