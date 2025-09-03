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

const OptionList: React.FC<OptionListProps> = ({ header, options }) => {
  const { theme } = useTheme();
  return (
    <View className="mb-6">
      <Text
        className=" text-sm font-semibold mb-3 ml-2"
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

          if (opt.type === "switch") {
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => opt.onToggle(!opt.value)}
                className={`flex-row justify-between items-center px-4 py-4 `}
                style={{
                  borderBottomColor: !isLast ? theme.background : undefined,
                  borderBottomWidth: !isLast ? 1 : undefined,
                }}
              >
                <View className="flex-row items-center">
                  {opt.icon && (
                    <Ionicons
                      name={opt.icon}
                      size={20}
                      color={theme.primary}
                      className="mr-4"
                    />
                  )}
                  <Text className="text-base" style={{ color: theme.text }}>
                    {opt.label}
                  </Text>
                </View>

                <View style={{ transform: [{ scale: 0.8 }] }}>
                  <Switch
                    value={opt.value}
                    onValueChange={opt.onToggle}
                    thumbColor={opt.value ? theme.primary : "#888"}
                    trackColor={{ true: theme.background, false: "#444" }}
                  />
                </View>
              </TouchableOpacity>
            );
          }

          if (opt.type === "navigation") {
            return (
              <TouchableOpacity
                key={idx}
                className={`flex-row justify-between items-center px-4 py-4 `}
                onPress={opt.onPress}
                style={{
                  borderBottomColor: !isLast ? theme.background : undefined,
                  borderBottomWidth: !isLast ? 1 : undefined,
                }}
              >
                {" "}
                <View className="flex-row items-center">
                  {opt.icon && (
                    <Ionicons
                      name={opt.icon}
                      size={20}
                      color={theme.primary}
                      className="mr-4"
                    />
                  )}
                  <Text className="text-base" style={{ color: theme.text }}>
                    {opt.label}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={theme.primary}
                />
              </TouchableOpacity>
            );
          }

          if (opt.type === "info") {
            return (
              <View
                key={idx}
                className={`flex-row justify-between items-center px-4 py-4`}
                style={{
                  borderBottomColor: !isLast ? theme.background : undefined,
                  borderBottomWidth: !isLast ? 1 : undefined,
                }}
              >
                <View className="flex-row items-center">
                  {opt.icon && (
                    <Ionicons
                      name={opt.icon}
                      size={20}
                      color={theme.primary}
                      className="mr-4"
                    />
                  )}
                  <View className="flex-col">
                    <Text className="text-base" style={{ color: theme.text }}>
                      {opt.label}
                    </Text>
                    <Text className="" style={{ color: theme.textSecondary }}>
                      {opt.value}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }

          if (opt.type === "display") {
            return (
              <TouchableOpacity
                key={idx}
                // make this item-center and see the magic...!!!! implement it atleast for version i love this.
                className={`flex-col justify-between items-start px-4 py-4 `}
                style={{
                  borderBottomColor: !isLast ? theme.background : undefined,
                  borderBottomWidth: !isLast ? 1 : undefined,
                }}
                onPress={opt.onPress}
              >
                <View className="flex-row items-center">
                  {opt.icon && (
                    <Ionicons
                      name={opt.icon}
                      size={20}
                      color={theme.primary}
                      className="mr-4"
                    />
                  )}
                  <View className="flex-col">
                    <Text className="text-base" style={{ color: theme.text }}>
                      {opt.label}
                    </Text>
                    <Text className="" style={{ color: theme.textSecondary }}>
                      {opt.value}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }

          return null;
        })}
      </View>
    </View>
  );
};

export default OptionList;
