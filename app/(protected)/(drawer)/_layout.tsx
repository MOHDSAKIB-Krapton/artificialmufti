import CustomDrawerContent from "@/components/pagePartials/drawer/drawerContent";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { Pressable } from "react-native";

const DrawerLayout = () => {
  const { theme } = useTheme();

  return (
    <>
      <Drawer
        drawerContent={(props) => <CustomDrawerContent {...props} />}
        detachInactiveScreens={false}
        screenOptions={{
          headerStyle: { backgroundColor: theme.background },
          headerTransparent: true,
          drawerStyle: { width: "75%" },
          drawerContentContainerStyle: {
            backgroundColor: "#000",
            flex: 1,
          },
          lazy: true,
        }}
      >
        <Drawer.Screen
          name="index"
          options={{
            headerTitle: "",
            swipeEnabled: true,
            headerShadowVisible: false,
            headerShown: true,
            headerStyle: { backgroundColor: "transparent" },
            headerTintColor: theme.text,
            swipeEdgeWidth: 500,
            drawerType: "front",
            headerRight: () => (
              <Pressable
                onPress={() =>
                  router.push("/(protected)/(pages)/additional-features")
                }
                style={{
                  backgroundColor: theme.accent,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 999,
                  marginRight: 16,
                }}
              >
                <Ionicons
                  name="sparkles-outline"
                  size={22}
                  color={theme.card}
                />
              </Pressable>
            ),
            headerLeftContainerStyle: {
              backgroundColor: theme.card,
              position: "absolute",
              left: 16,
              top: 10,
              borderRadius: 999,
            },
          }}
        />
      </Drawer>
    </>
  );
};

export default DrawerLayout;
