import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { PillProvider } from '../../contexts/PillContext';
import Colors from '@/constants/Colors';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} {...props} />;
}

export default function TabLayout() {
  return (
    <PillProvider>
<Tabs
  screenOptions={{
    tabBarActiveTintColor: Colors['light'].tint,
    headerShown: false,
    tabBarStyle: {
      marginBottom: -20, // Ajuste conforme necessário
      borderRadius: 10, // Opcional: arredondar a borda
      backgroundColor: 'white', // Ajuste a cor conforme o design
    },
  }}
>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Pills',
            headerShown: false,
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="modal"
  
          options={{
            title: 'Add Pill',
            tabBarIcon: ({ color }) => <TabBarIcon name="plus" color={color} />,
            
          }}
          
        />
          <Tabs.Screen
          name="about"
  
          options={{
            title: 'About',
            tabBarIcon: ({ color }) => <TabBarIcon name="info" color={color} />,
            
          }}
          
        />
      </Tabs>
    </PillProvider>
  );
}