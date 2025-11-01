import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, View } from "react-native";

const RefreshFab = ({
  theme,
  onPress,
  onLongPress,
  refreshing,
}: {
  theme: any;
  onPress: () => void;
  onLongPress: () => void;
  refreshing: boolean;
}) => (
  <View className="absolute right-5 bottom-8">
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      className="w-14 h-14 rounded-full items-center justify-center"
      style={{
        backgroundColor: theme.primary,
        shadowColor: "#000",
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 6,
      }}
    >
      {refreshing ? (
        <ActivityIndicator color={theme.card} />
      ) : (
        <Ionicons name="refresh" size={22} color={theme.card} />
      )}
    </Pressable>
    {/* <Text
      className="text-[10px] mt-1 self-center"
      style={{ color: theme.textSecondary }}
    >
      Tap: Recalculate • Hold: Re-locate
    </Text> */}
  </View>
);

export default RefreshFab;
