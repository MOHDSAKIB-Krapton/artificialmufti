import ConversationSkeleton from "@/components/skeletonLoaders/conversations";
import { useTheme } from "@/hooks/useTheme";
import { ConversationServices } from "@/services/conversation/conversation.service";
import { Conversation as ConversationType } from "@/services/conversation/types";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Conversation from "./conversation";

const CustomDrawerContent = (props: any) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const user = useAuthStore((s) => s.user);

  const [chats, setChats] = useState<ConversationType[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

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
          className="flex-row items-center py-2.5"
          onPress={() => router.push("/(protected)/(pages)/settings")}
        >
          {/* Avatar */}
          {profilePic ? (
            <Image
              source={{ uri: profilePic }}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <View
              className="w-10 h-10 rounded-full  items-center justify-center"
              style={{ backgroundColor: theme.card }}
            >
              <Ionicons name="person" size={22} color={theme.text} />
            </View>
          )}

          {/* Name */}
          <Text
            className="ml-3 text-base font-space-bold flex-1"
            style={{ color: theme.text }}
          >
            {userName || "Guest"}
          </Text>

          {/* Trailing Icon */}
          <Ionicons name="chevron-forward" size={20} color={theme.text} />
        </Pressable>
      </View>
    );
  }

  const DrawerListHeader = () => {
    return (
      <Text
        className="text-sm mb-2 font-space-bold"
        style={{ color: theme.text }}
      >
        Chats
      </Text>
    );
  };

  useEffect(() => {
    getAllConversations();
  }, []);

  const getAllConversations = async () => {
    try {
      setLoading(true);
      const response = await ConversationServices.getAllConversations();
      setChats(response);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await getAllConversations();
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 16,
          paddingBottom: 16,
        }}
      >
        <TouchableOpacity
          className="p-3 rounded-lg items-center"
          style={{ backgroundColor: theme.accent }}
          onPress={() => console.log("New chat pressed!")}
        >
          <Text
            className="text-base font-space-bold"
            style={{ color: theme.textLight || theme.text }}
          >
            New Chat +
          </Text>
        </TouchableOpacity>
      </View>

      <View style={{ paddingHorizontal: 16 }} className="flex-1">
        <FlatList<ConversationType>
          data={loading ? Array.from({ length: 6 }) : chats}
          keyExtractor={(item, index) =>
            loading ? `skeleton-${index}` : item.id
          }
          renderItem={({ item, index }) =>
            loading ? (
              <ConversationSkeleton />
            ) : (
              <Conversation
                name={item.title}
                onOpen={() => console.log(`Open chat ${item.id}`)}
                onRename={() => handleRename(item.id)}
                onArchive={() => handleArchive(item.id)}
                onDelete={() => handleDelete(item.id)}
              />
            )
          }
          refreshing={refreshing}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh} // your refresh function
              colors={[theme.accent]} // optional: Android indicator color
              tintColor={theme.accent} // optional: iOS indicator color
            />
          }
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          ListHeaderComponent={<DrawerListHeader />}
          ListFooterComponent={<View className="h-6" />}
          initialNumToRender={5} // how many to render initially
          maxToRenderPerBatch={10} // batch render size
          windowSize={5} // number of screens worth to render
        />
      </View>

      <View
        style={{
          paddingBottom: insets.bottom + 16, // Use insets for dynamic safe area padding
          paddingHorizontal: 16,
          backgroundColor: theme.background,
        }}
      >
        <ProfileRow
          userName={user?.user_metadata.full_name}
          profilePic={user?.user_metadata.avatar_url}
        />
      </View>
    </View>
  );
};

export default CustomDrawerContent;
