import { Ionicons } from "@expo/vector-icons";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Image, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Conversation from "./conversation";

const MOCK_CONVERSATIONS = [
  // ... (Your mock data)
  { id: "1", name: "Jane Smith" },
  { id: "2", name: "Mohd Sakib" },
  { id: "3", name: "React Native Project" },
  { id: "4", name: "Expo Setup Help" },
  { id: "5", name: "Zustand vs Redux" },
  { id: "6", name: "Tailwind Styling" },
  { id: "7", name: "Firebase Auth" },
  { id: "8", name: "Next.js Migration" },
  { id: "9", name: "UI Polish Ideas" },
  { id: "10", name: "Chatbot Flow" },
  { id: "11", name: "Payment Gateway" },
  { id: "12", name: "Dark Mode Toggle" },
  { id: "13", name: "React Context Demo" },
  { id: "14", name: "Expo EAS Build" },
  { id: "15", name: "Redux Toolkit Setup" },
  { id: "16", name: "Animation Testing" },
  { id: "17", name: "Bug Report #12" },
  { id: "18", name: "Profile Page UI" },
  { id: "19", name: "Settings Refactor" },
  { id: "20", name: "Realtime Chat" },
  { id: "21", name: "Friends List Feature" },
  { id: "22", name: "Notifications" },
  { id: "23", name: "Push Tokens" },
  { id: "24", name: "Image Upload" },
  { id: "25", name: "Optimizing Lists" },
  { id: "26", name: "Database Rules" },
  { id: "27", name: "Auth Persistence" },
  { id: "28", name: "Testing Suite" },
  { id: "29", name: "Deployment Guide" },
  { id: "30", name: "Final Demo Prep" },
];

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
      {/* Fixed Header with SafeAreaInsets */}
      <View
        style={{
          paddingTop: insets.top + 16, // Use insets for dynamic safe area padding
          paddingHorizontal: 16,
          backgroundColor: "black",
        }}
      >
        <Pressable
          className="bg-[#2e2e2e] p-3 rounded-lg items-center"
          onPress={() => {
            console.log("New chat pressed!");
          }}
        >
          <Text className="text-white text-base font-bold">New Chat +</Text>
        </Pressable>
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
