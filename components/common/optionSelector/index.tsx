import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

export type Option = {
  name: string;
  icon: keyof typeof Ionicons.glyphMap;
  value: string;
  type?: "feather" | "material"; // optional, default to material
};

export type OptionSelectorProps = {
  options: Option[];
  selectedValue: string;
  onSelect: (value: string) => void;
  title?: string; // optional section title
};

const OptionSelector: React.FC<OptionSelectorProps> = ({
  options,
  selectedValue,
  onSelect,
  title,
}) => {
  return (
    <View className="mb-6">
      {title && (
        <Text className="text-gray-400 text-sm font-semibold mb-3 ml-2">
          {title.toUpperCase()}
        </Text>
      )}
      <View className="flex-row justify-around bg-[#1c1c1e] rounded-xl p-2">
        {options.map((option) => {
          const isSelected = selectedValue === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onSelect(option.value)}
              className={`flex-1 items-center py-2 rounded-lg ${
                isSelected ? "bg-[#3a3a3c]" : ""
              }`}
            >
              <Ionicons
                name={option.icon}
                size={24}
                color={isSelected ? "#fff" : "gray"}
              />
              <Text
                className={`mt-1 text-xs font-medium ${
                  isSelected ? "text-white" : "text-gray-400"
                }`}
              >
                {option.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default OptionSelector;
