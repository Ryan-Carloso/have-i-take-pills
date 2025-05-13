import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import AntDesign from '@expo/vector-icons/AntDesign';
import { Tabs } from "expo-router";
import { PillProvider } from "../../contexts/PillContext";
import { StatusBar } from "react-native";
import { THEME } from '@/components/Theme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} {...props} />;
}

const TabLayout = () => {
  return (
    <PillProvider> 
      <StatusBar barStyle="dark-content" backgroundColor="#000" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            marginBottom: 0,
            backgroundColor: "white",
          },
          tabBarActiveTintColor: THEME.primary,
          tabBarInactiveTintColor: 'gray',
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
          name="calendar"
          options={{
            title: "calendar",
            tabBarIcon: ({ color }) => <FontAwesome5 name="calendar-alt" size={28} color={color} />,
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
          tabBarIcon: ({ color }) => <FontAwesome6 name="crown" size={24} color={color} />,
          //tabBarStyle: { display: 'none' }, // Oculta as abas
          //href: null,
        }}
      />
      <Tabs.Screen
        name="PaywallOnBoard"
        options={{
          title: "Premium User",
          tabBarIcon: ({ color }) => <FontAwesome5 name="money-bill" size={24} olor={color} />,
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

export default TabLayout;
