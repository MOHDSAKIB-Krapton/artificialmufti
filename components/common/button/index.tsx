import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import {
  ActivityIndicator,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
} from "react-native";

type Props = {
  text: string;
  onPress: () => void;
  iconName?: keyof typeof Ionicons.glyphMap; // for Ionicons
  SvgIcon?: React.ReactNode; // for custom SVG
  loading?: boolean;
  accessibilityLabel?: string;
  size?: "sm" | "normal";
  buttonStyles?: StyleProp<TextStyle>;
};

const FancyButton: React.FC<Props> = ({
  text,
  onPress,
  iconName,
  SvgIcon,
  loading,
  accessibilityLabel,
  size = "normal",
  buttonStyles,
}) => {
  const { theme } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className="w-full max-w-md mx-auto"
      disabled={loading}
      accessibilityLabel={accessibilityLabel}
    >
      <BlurView
        intensity={40}
        tint="dark"
        className="flex-row items-center justify-between rounded-full p-1 overflow-hidden"
      >
        {/* Text */}
        <Text
          className="text-xl flex-1 mx-5 font-space-bold tracking-wide"
          style={[{ color: theme.textLight || theme.text }, buttonStyles]}
        >
          {text}
        </Text>

        {/* Icon wrapper */}
        <TouchableOpacity
          onPress={onPress}
          activeOpacity={0.8}
          disabled={loading}
          className="bg-black rounded-full p-4 w-14 h-14"
        >
          {loading ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : SvgIcon ? (
            SvgIcon
          ) : iconName ? (
            <Ionicons name={iconName} size={22} color="white" />
          ) : null}
        </TouchableOpacity>
      </BlurView>
    </TouchableOpacity>
  );
};

export default FancyButton;
