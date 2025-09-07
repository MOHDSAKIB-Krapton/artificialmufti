import CustomDrawerContent from "@/components/pagePartials/drawer/drawerContent";
import { useTheme } from "@/hooks/useTheme";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { TouchableOpacity } from "react-native";

const DrawerLayout = () => {
  const { theme } = useTheme();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      detachInactiveScreens={true}
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        drawerStyle: { width: "75%" },
        drawerContentContainerStyle: {
          backgroundColor: "#000",
          flex: 1,
        },
        headerTitle: "TITLE",
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: "",
          swipeEnabled: true,
          headerShadowVisible: false,
          headerTintColor: theme.text,
          swipeEdgeWidth: 500,
          drawerType: "slide",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => console.log("Header right pressed")}
            >
              <MaterialCommunityIcons
                name="incognito"
                size={24}
                color={theme.text}
              />
            </TouchableOpacity>
          ),
          headerRightContainerStyle: {
            paddingRight: 16,
          },
        }}
      />
    </Drawer>
  );
};

export default DrawerLayout;
