import OptionModal, { OptionItem } from "@/components/common/optionModal";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { memo, useRef } from "react";
import { Text, TouchableOpacity, View } from "react-native";

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
    const modalRef = useRef<{ openMenu: () => void }>(null);

    const options: OptionItem[] = [
      // { label: "Rename", onPress: onRename, icon: "pencil-outline" },
      // { label: "Archive", onPress: onArchive, icon: "archive-outline" },
      {
        label: "Delete",
        onPress: onDelete,
        textColor: "red",
        icon: "trash-outline",
      },
    ];

    const handleOpenOptionModal = () => modalRef.current?.openMenu();

    return (
      <OptionModal
        ref={modalRef}
        triggerElement={
          <View
            className="py-4 flex-row gap-x-2"
            style={{
              backgroundColor:
                activeId == undefined
                  ? theme.background
                  : activeId == id
                    ? theme.accentLight
                    : theme.background,
              paddingRight: 8,
              paddingLeft: 16,
            }}
          >
            <Text
              className="text-base flex-1"
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{ color: theme.text }}
            >
              {name}
            </Text>

            <TouchableOpacity onPress={handleOpenOptionModal}>
              <Ionicons
                name="ellipsis-vertical-sharp"
                size={22}
                color={theme.primary}
              />
            </TouchableOpacity>
          </View>
        }
        options={options}
        onPress={onOpen}
      />
    );
  }
);

export default Conversation;
