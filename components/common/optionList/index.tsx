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
  return (
    <View className="mb-6">
      <Text className="text-gray-400 text-sm font-medium mb-2 px-4">
        {header}
      </Text>
      <View className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
        {options.map((opt, idx) => {
          const isLast = idx === options.length - 1;

          if (opt.type === "switch") {
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => opt.onToggle(!opt.value)}
                className={`flex-row justify-between items-center px-4 py-4 ${
                  !isLast ? "border-b border-[#0d0d0d]" : ""
                }`}
              >
                <View className="flex-row items-center">
                  {opt.icon && (
                    <Ionicons
                      name={opt.icon}
                      size={20}
                      color="#FFD700"
                      className="mr-4"
                    />
                  )}
                  <Text className="text-white text-base">{opt.label}</Text>
                </View>

                <View style={{ transform: [{ scale: 0.8 }] }}>
                  <Switch
                    value={opt.value}
                    onValueChange={opt.onToggle}
                    thumbColor={opt.value ? "#22c55e" : "#888"}
                    trackColor={{ true: "#bbf7d0", false: "#444" }}
                  />
                </View>
              </TouchableOpacity>
            );
          }

          if (opt.type === "navigation") {
            return (
              <TouchableOpacity
                key={idx}
                className={`flex-row justify-between items-center px-4 py-4 ${
                  !isLast ? "border-b border-[#0d0d0d]" : ""
                }`}
                onPress={opt.onPress}
              >
                {" "}
                <View className="flex-row items-center">
                  {opt.icon && (
                    <Ionicons
                      name={opt.icon}
                      size={20}
                      color="#FFD700"
                      className="mr-4"
                    />
                  )}
                  <Text className="text-white text-base">{opt.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#888" />
              </TouchableOpacity>
            );
          }

          if (opt.type === "info") {
            return (
              <View
                key={idx}
                className={`flex-row justify-between items-center px-4 py-4 ${
                  !isLast ? "border-b border-[#0d0d0d]" : ""
                }`}
              >
                <View className="flex-row items-center">
                  {opt.icon && (
                    <Ionicons
                      name={opt.icon}
                      size={20}
                      color="#FFD700"
                      className="mr-4"
                    />
                  )}
                  <View className="flex-col">
                    <Text className="text-white text-base">{opt.label}</Text>
                    <Text className="text-gray-400">{opt.value}</Text>
                  </View>
                </View>
              </View>
            );
          }

          if (opt.type === "display") {
            return (
              <TouchableOpacity
                key={idx}
                className={`flex-col justify-between items-start px-4 py-4 ${
                  // make this item-center and see the magic...!!!! implement it atleast for version i love this.
                  !isLast ? "border-b border-[#0d0d0d]" : ""
                }`}
                onPress={opt.onPress}
              >
                <View className="flex-row items-center">
                  {opt.icon && (
                    <Ionicons
                      name={opt.icon}
                      size={20}
                      color="#FFD700"
                      className="mr-4"
                    />
                  )}
                  <View className="flex-col">
                    <Text className="text-white text-base">{opt.label}</Text>
                    <Text className="text-gray-400">{opt.value}</Text>
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
