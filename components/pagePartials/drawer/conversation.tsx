import OptionModal, { OptionItem } from "@/components/common/optionModal";
import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { Text, View } from "react-native";

type ChatItemProps = {
  name: string;
  onOpen: () => void;
  onRename: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

const Conversation = ({
  name,
  onOpen,
  onRename,
  onArchive,
  onDelete,
}: ChatItemProps) => {
  const { theme } = useTheme();

  const options: OptionItem[] = [
    { label: "Rename", onPress: onRename, icon: "pencil-outline" },
    { label: "Archive", onPress: onArchive, icon: "archive-outline" },
    {
      label: "Delete",
      onPress: onDelete,
      textColor: "red",
      icon: "trash-outline",
    },
  ];

  return (
    <OptionModal
      triggerElement={
        <View className="py-4">
          <Text
            className="text-base font-space w-[80%] "
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ color: theme.text }}
          >
            {name}
          </Text>
        </View>
      }
      options={options}
      onPress={onOpen}
    />
  );
};

export default Conversation;
