import { MOCK_CONVERSATIONS } from "@/constants/mock";
import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Conversation from "./conversation";

const CustomDrawerContent = (props: any) => {
  const [chats, setChats] = useState(MOCK_CONVERSATIONS);
  const insets = useSafeAreaInsets();

  const handleRename = (id: string) => {
    console.log(`Rename chat ${id}`);
    // open rename modal + update state
  };

  const handleArchive = (id: string) => {
    console.log(`Archive chat ${id}`);
    // move to archive state
  };

  const handleDelete = (id: string) => {
    console.log(`Delete chat ${id}`);
    setChats((prev) => prev.filter((chat) => chat.id !== id));
  };

  function ProfileRow({
    userName,
    profilePic,
  }: {
    userName: string;
    profilePic?: string;
  }) {
    return (
      <View>
        <Pressable
          className="flex-row items-center py-3"
          onPress={() => router.push("/(protected)/(pages)/settings")}
        >
          {/* Avatar */}
          {profilePic ? (
            <Image
              source={{ uri: profilePic }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <View className="w-10 h-10 rounded-full bg-gray-700 items-center justify-center">
              <Ionicons name="person" size={22} color="white" />
            </View>
          )}

          {/* Name */}
          <Text className="ml-3 text-base font-bold text-white flex-1">
            {userName || "Guest"}
          </Text>

          {/* Trailing Icon */}
          <Ionicons name="chevron-forward" size={20} color="white" />
        </Pressable>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
      >
        <TouchableOpacity
          className="bg-[#2e2e2e] p-3 rounded-lg items-center"
          onPress={() => console.log("New chat pressed!")}
        >
          <Text className="text-white text-base font-bold">New Chat +</Text>
        </TouchableOpacity>
      </View>

      <DrawerContentScrollView
        {...props}
        contentContainerStyle={{ flexGrow: 1 }}
        style={{ paddingHorizontal: 16 }}
      >
        <Text className="text-sm text-gray-500 mb-2 font-bold">Chats</Text>
        <FlatList
          data={chats}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <Conversation
              name={item.name}
              onOpen={() => console.log(`Open chat ${item.id}`)}
              onRename={() => handleRename(item.id)}
              onArchive={() => handleArchive(item.id)}
              onDelete={() => handleDelete(item.id)}
            />
          )}
        />
      </DrawerContentScrollView>

      <View
        style={{
          paddingBottom: insets.bottom + 16, // Use insets for dynamic safe area padding
          paddingHorizontal: 16,
          backgroundColor: "black",
        }}
      >
        <ProfileRow userName="John Doe" />
      </View>
    </View>
  );
};

export default CustomDrawerContent;
