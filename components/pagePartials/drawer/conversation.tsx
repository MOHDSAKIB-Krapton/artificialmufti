import OptionModal, { OptionItem } from "@/components/common/optionModal";
import { useTheme } from "@/hooks/useTheme";
import React, { memo } from "react";
import { Text, View } from "react-native";

type ChatItemProps = {
  id: string;
  name: string;
  activeId: string | undefined;
  onOpen: () => void;
  onRename: () => void;
  onArchive: () => void;
  onDelete: () => void;
};

const Conversation = memo(
  ({
    id,
    name,
    activeId,
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
          <View
            className="py-4"
            style={{
              backgroundColor:
                activeId == undefined
                  ? theme.background
                  : activeId == id
                    ? theme.accentLight
                    : theme.background,
              paddingHorizontal: 16,
            }}
          >
            <Text
              className="text-base w-[80%] "
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
  }
);

export default Conversation;
