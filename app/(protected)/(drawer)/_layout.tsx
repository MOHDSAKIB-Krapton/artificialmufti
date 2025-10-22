import CustomDrawerContent from "@/components/pagePartials/drawer/drawerContent";
import { useTheme } from "@/hooks/useTheme";
import { Drawer } from "expo-router/drawer";
import React from "react";

const DrawerLayout = () => {
  const { theme } = useTheme();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      detachInactiveScreens={true}
      screenOptions={{
        headerStyle: { backgroundColor: theme.background },
        headerTransparent: true,
        drawerStyle: { width: "75%" },
        drawerContentContainerStyle: {
          backgroundColor: "#000",
          flex: 1,
        },
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
          // headerRight: () => (
          //   <TouchableOpacity
          //     onPress={() => console.log("Header right pressed")}
          //     style={{
          //       marginLeft: 16,
          //       backgroundColor: theme.card,
          //       borderRadius: 999,
          //       padding: 8,
          //     }}
          //   >
          //     <MaterialCommunityIcons
          //       name="incognito"
          //       size={24}
          //       color={theme.text}
          //     />
          //   </TouchableOpacity>
          // ),
          // headerRightContainerStyle: {
          //   paddingRight: 16,
          // },
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
  );
};

export default DrawerLayout;
