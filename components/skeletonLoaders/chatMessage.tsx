import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { View } from "react-native";

const ChatMessageSkeleton = () => {
  const { theme } = useTheme();

  return (
    <View className="w-full mt-2 mb-4">
      <View
        className="my-2 ml-auto max-w-[80%] rounded-2xl rounded-tr-sm px-4 py-3"
        style={{
          backgroundColor: theme.accent,
        }}
      >
        <View
          className="h-4 w-32 mb-2 rounded-md"
          style={{ backgroundColor: theme.card }}
        />
        <View
          className="h-4 w-24 rounded-md"
          style={{ backgroundColor: theme.card }}
        />
      </View>
      <View
        className="my-2 mr-auto w-[80%] rounded-2xl rounded-tr-sm px-4 py-3"
        style={{
          backgroundColor: theme.accent,
        }}
      >
        <View
          className="h-4 w-full mb-2 rounded-md"
          style={{ backgroundColor: theme.card }}
        />
        <View
          className="h-4 w-full rounded-md mb-2"
          style={{ backgroundColor: theme.card }}
        />
        <View
          className="h-4 w-full mb-2 rounded-md"
          style={{ backgroundColor: theme.card }}
        />
        <View
          className="h-4 w-full rounded-md"
          style={{ backgroundColor: theme.card }}
        />
      </View>
    </View>
  );
};

export default ChatMessageSkeleton;
