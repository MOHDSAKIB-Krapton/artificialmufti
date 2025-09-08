import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";

type OptionType =
  | {
      type: "switch";
      label: string;
      value: boolean;
      onToggle: (val: boolean) => void;
      icon?: keyof typeof Ionicons.glyphMap;
    }
  | {
      type: "navigation";
      label: string;
      value?: string;
      onPress: () => void;
      icon?: keyof typeof Ionicons.glyphMap;
    }
  | {
      type: "info";
      label: string;
      value: string;
      icon?: keyof typeof Ionicons.glyphMap;
    }
  | {
      type: "display";
      label: string;
      value: string;
      onPress: () => void;
      icon?: keyof typeof Ionicons.glyphMap;
    };

export interface OptionListProps {
  header: string;
  options: OptionType[];
}

// --------------------
// Reusable Row
// --------------------
interface OptionRowProps {
  label: string;
  value?: string | boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  isLast: boolean;
  RightComponent?: React.ReactNode;
  onPress?: () => void;
}

const OptionRow: React.FC<OptionRowProps> = ({
  label,
  value,
  icon,
  isLast,
  RightComponent,
  onPress,
}) => {
  const { theme } = useTheme();

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      onPress={onPress}
      className="flex-row items-center flex-1"
      activeOpacity={0.7}
      style={{
        borderBottomColor: !isLast ? theme.background : undefined,
        borderBottomWidth: !isLast ? 1 : undefined,
      }}
    >
      {icon && (
        <View className="p-3">
          <Ionicons name={icon} size={28} color={theme.primary} />
        </View>
      )}

      <View className="flex-col flex-1 px-4 py-2">
        <Text
          className="text-base font-space-bold"
          numberOfLines={1}
          ellipsizeMode="tail"
          style={{ color: theme.text }}
        >
          {label}
        </Text>
        {typeof value === "string" && (
          <Text
            className="font-space"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ color: theme.textSecondary }}
          >
            {value}
          </Text>
        )}
      </View>

      {RightComponent}
    </Container>
  );
};

// --------------------
// Main List
// --------------------
const OptionList: React.FC<OptionListProps> = ({ header, options }) => {
  const { theme } = useTheme();

  return (
    <View className="mb-6">
      <Text
        className=" text-sm font-space-bold mb-3 ml-2"
        style={{ color: theme.text }}
      >
        {header}
      </Text>

      <View
        className=" rounded-2xl overflow-hidden"
        style={{ backgroundColor: theme.card }}
      >
        {options.map((opt, idx) => {
          const isLast = idx === options.length - 1;

          switch (opt.type) {
            case "switch":
              return (
                <OptionRow
                  key={idx}
                  label={opt.label}
                  value={opt.value}
                  icon={opt.icon}
                  isLast={isLast}
                  onPress={() => opt.onToggle(!opt.value)}
                  RightComponent={
                    <View style={{ transform: [{ scale: 1 }] }} className="p-4">
                      <Switch
                        value={opt.value}
                        onValueChange={opt.onToggle}
                        thumbColor={opt.value ? theme.primary : "#888"}
                        trackColor={{ true: theme.background, false: "#444" }}
                      />
                    </View>
                  }
                />
              );

            case "navigation":
              return (
                <OptionRow
                  key={idx}
                  label={opt.label}
                  value={opt.value}
                  icon={opt.icon}
                  isLast={isLast}
                  onPress={opt.onPress}
                  RightComponent={
                    <View className="px-4 py-4">
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color={theme.primary}
                      />
                    </View>
                  }
                />
              );

            case "info":
              return (
                <OptionRow
                  key={idx}
                  label={opt.label}
                  value={opt.value}
                  icon={opt.icon}
                  isLast={isLast}
                />
              );

            case "display":
              return (
                <OptionRow
                  key={idx}
                  label={opt.label}
                  value={opt.value}
                  icon={opt.icon}
                  isLast={isLast}
                  onPress={opt.onPress}
                />
              );

            default:
              return null;
          }
        })}
      </View>
    </View>
  );
};

export default OptionList;
