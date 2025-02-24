import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { PillProvider } from "../../contexts/PillContext";
import { StatusBar } from "react-native";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { THEME } from '@/components/Theme'



function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} {...props} />;
}

export default function TabLayout() {
  return (
    <PillProvider> 
      <StatusBar barStyle="dark-content" backgroundColor="#000" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            marginBottom: 0, // Ajuste conforme necessário
            backgroundColor: "white", // Ajuste a cor conforme o design
          },
          tabBarActiveTintColor: THEME.primary, // Add this line to change active tab title color
          tabBarInactiveTintColor: 'gray', // Add this line to change inactive tab title color

        }}
      >
      <Tabs.Screen
        name="index"
        options={{
          tabBarStyle: { display: 'none' }, // Oculta as abas
          href: null,
        }}
      />
        <Tabs.Screen
        name="reviewPage"
        options={{
          tabBarStyle: { display: 'none' }, // Oculta as abas
          href: null,
        }}
      />
        <Tabs.Screen
          name="home"
          options={{
            title: "Pills",
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="modal"
          options={{
            title: "Add Pill",
            tabBarIcon: ({ color }) => <TabBarIcon name="plus" color={color} />,
          }}
        />
        <Tabs.Screen
        name="Paywall"
        options={{
          title: "Premium User",
          tabBarIcon: ({ color }) => <MaterialIcons name="attach-money" size={24} color={color} />,
          //tabBarStyle: { display: 'none' }, // Oculta as abas
          //href: null,
        }}
      />
      <Tabs.Screen
        name="PaywallOnBoard"
        options={{
          title: "Premium User",
          tabBarIcon: ({ color }) => <MaterialIcons name="attach-money" size={24} color={color} />,
          tabBarStyle: { display: 'none' }, // Oculta as abas
          href: null,
        }}
      />
        <Tabs.Screen
          name="about"
          options={{
            title: "About",
            tabBarIcon: ({ color }) => <TabBarIcon name="info" color={color} />,
          }}
        />
      </Tabs>
    </PillProvider>
  );
}
