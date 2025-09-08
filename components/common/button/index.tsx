import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import {
  ActivityIndicator,
  Animated,
  StyleProp,
  Text,
  TextStyle,
  TouchableOpacity,
  ViewStyle,
} from "react-native";

type Props = {
  text?: string;
  onPress: () => void;
  iconName?: keyof typeof Ionicons.glyphMap; // for Ionicons
  SvgIcon?: React.ReactNode; // for custom SVG
  loading?: boolean;
  accessibilityLabel?: string;
  size?: "sm" | "normal";
  type?: "primary" | "secondary" | "tertiary";
  buttonStyles?: StyleProp<TextStyle>;
  iconStyles?: StyleProp<ViewStyle>;
  iconColor?: string;

  // ANimation
  pulse?: Animated.Value;
};

const FancyButton: React.FC<Props> = ({
  text = "Button",
  onPress,
  iconName,
  SvgIcon,
  loading = false,
  accessibilityLabel,
  size = "normal",
  type = "primary",
  buttonStyles,
  iconStyles,
  iconColor,

  // Animation
  pulse,
}) => {
  const { theme } = useTheme();

  if (type === "primary") {
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
            style={iconStyles}
            accessibilityLabel={accessibilityLabel}
          >
            {loading ? (
              <ActivityIndicator size="small" color={iconColor || "#ffffff"} />
            ) : SvgIcon ? (
              SvgIcon
            ) : iconName ? (
              <Ionicons
                name={iconName}
                size={22}
                color={iconColor || "white"}
              />
            ) : null}
          </TouchableOpacity>
        </BlurView>
      </TouchableOpacity>
    );
  }

  if (type === "secondary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="w-full max-w-md mx-auto flex-row p-3 rounded-xl justify-center items-center gap-x-2"
        disabled={loading}
        style={{ backgroundColor: theme.primary }}
        accessibilityLabel={accessibilityLabel}
      >
        {loading ? (
          <ActivityIndicator size="small" color={iconColor || "#ffffff"} />
        ) : SvgIcon ? (
          SvgIcon
        ) : iconName ? (
          <Ionicons name={iconName} size={20} color={iconColor || "white"} />
        ) : null}

        <Text
          className="text-xl mx-5 font-space-bold tracking-wide"
          style={[{ color: theme.textLight || theme.text }, buttonStyles]}
        >
          {text}
        </Text>
      </TouchableOpacity>
    );
  }

  if (type === "tertiary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        disabled={loading}
        className="bg-black rounded-full items-center justify-center"
        style={[
          {
            padding: size === "sm" ? 8 : 16,
            width: size === "sm" ? 40 : 56,
            height: size === "sm" ? 40 : 56,
          },
          iconStyles,
        ]}
        accessibilityLabel={accessibilityLabel}
      >
        <Animated.View
          style={{
            transform: [
              {
                scale:
                  pulse?.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 1.12],
                  }) ?? 1,
              },
            ],
          }}
        >
          {loading ? (
            <ActivityIndicator size="small" color={iconColor || "#ffffff"} />
          ) : SvgIcon ? (
            SvgIcon
          ) : iconName ? (
            <Ionicons name={iconName} size={22} color={iconColor || "white"} />
          ) : null}
        </Animated.View>
      </TouchableOpacity>
    );
  }
};

export default FancyButton;
