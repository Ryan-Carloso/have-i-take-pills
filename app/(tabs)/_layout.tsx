import React from "react";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Tabs } from "expo-router";
import { PillProvider } from "../../contexts/PillContext";
import { StatusBar } from "react-native";


function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>["name"];
  color: string;
}) {
  return <FontAwesome size={28} {...props} />;
}

export default function TabLayout() {
  return (
    <PillProvider>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            marginBottom: -30, // Ajuste conforme necessário
            backgroundColor: "white", // Ajuste a cor conforme o design
          },
        }}
      >
        <Tabs.Screen
          name="index"
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
