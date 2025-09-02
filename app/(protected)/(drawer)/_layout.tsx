import CustomDrawerContent from "@/components/pagePartials/drawer/drawerContent";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Drawer } from "expo-router/drawer";
import React from "react";
import { TouchableOpacity } from "react-native";

const DrawerLayout = () => {
  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: "black" },
        drawerStyle: { width: "75%" },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          headerTitle: "",
          swipeEnabled: true,
          swipeEdgeWidth: 500,
          drawerType: "slide",
          headerRight: () => (
            <TouchableOpacity
              onPress={() => console.log("Header right pressed")}
            >
              <MaterialCommunityIcons
                name="incognito"
                size={24}
                color="white"
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
