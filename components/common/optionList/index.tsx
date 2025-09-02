import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Switch, Text, TouchableOpacity, View } from "react-native";

type OptionType =
  | {
      type: "switch";
      label: string;
      value: boolean;
      onToggle: (val: boolean) => void;
    }
  | { type: "navigation"; label: string; onPress: () => void }
  | { type: "info"; label: string; value: string }
  | { type: "display"; label: string; value: string; onPress: () => void };

export interface OptionListProps {
  header: string;
  options: OptionType[];
}

const OptionList: React.FC<OptionListProps> = ({ header, options }) => {
  return (
    <View className="mb-6">
      <Text className="text-gray-400 text-sm mb-2 px-4">{header}</Text>
      <View className="bg-[#1a1a1a] rounded-2xl overflow-hidden">
        {options.map((opt, idx) => {
          const isLast = idx === options.length - 1;

          if (opt.type === "switch") {
            return (
              <TouchableOpacity
                key={idx}
                onPress={() => opt.onToggle(!opt.value)}
                activeOpacity={0.7}
                className={`flex-row justify-between items-center px-4 py-4 ${
                  !isLast ? "border-b border-[#0d0d0d]" : ""
                }`}
              >
                <Text className="text-white text-base">{opt.label}</Text>

                <Switch
                  value={opt.value}
                  onValueChange={opt.onToggle}
                  thumbColor={opt.value ? "#22c55e" : "#888"}
                  trackColor={{ true: "#bbf7d0", false: "#444" }}
                />
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
                <Text className="text-white text-base">{opt.label}</Text>
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
                <Text className="text-white text-base">{opt.label}</Text>
                <Text className="text-gray-400">{opt.value}</Text>
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
                <Text className="text-white text-base">{opt.label}</Text>
                <Text className="text-gray-400 text-xs">{opt.value}</Text>
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
