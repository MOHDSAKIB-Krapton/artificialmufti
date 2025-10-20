import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { View } from "react-native";

const ConversationSkeleton = () => {
  const { theme } = useTheme();

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
      }}
    >
      <View style={{ marginLeft: 0, flex: 1 }}>
        <View
          style={{
            width: "100%",
            height: 12,
            backgroundColor: theme.card,
            marginBottom: 6,
            borderRadius: 4,
          }}
        />
        <View
          style={{
            width: "100%",
            height: 16,
            backgroundColor: theme.card,
            borderRadius: 4,
          }}
        />
      </View>
    </View>
  );
};

export default ConversationSkeleton;
