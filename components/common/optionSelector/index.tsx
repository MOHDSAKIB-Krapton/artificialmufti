import { useTheme } from "@/hooks/useTheme";
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
  const { theme } = useTheme();

  return (
    <View className="mb-6">
      {title && (
        <Text
          className=" text-sm font-semibold mb-3 ml-2"
          style={{ color: theme.text }}
        >
          {title.toUpperCase()}
        </Text>
      )}
      <View
        className="flex-row justify-around rounded-xl p-2"
        style={{ backgroundColor: theme.card }}
      >
        {options.map((option) => {
          const isSelected = selectedValue === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onSelect(option.value)}
              className={`flex-1 items-center py-2 rounded-lg`}
              style={{
                backgroundColor: isSelected ? theme.background : undefined,
              }}
            >
              <Ionicons
                name={option.icon}
                size={24}
                style={{ color: isSelected ? theme.text : theme.textSecondary }}
              />
              <Text
                className={`mt-1 text-xs font-medium`}
                style={{ color: isSelected ? theme.text : theme.textSecondary }}
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
