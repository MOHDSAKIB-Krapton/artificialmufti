import React, { useState } from "react";
import {
  Dimensions,
  GestureResponderEvent,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
// import { Pencil, Archive, Trash2 } from "lucide-react-native";

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
  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleLongPress = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    const { width, height } = Dimensions.get("window");

    // Adjust if close to edges
    let left = pageX;
    let top = pageY;

    const menuWidth = 200;
    const menuHeight = 140;

    if (left + menuWidth > width) left = width - menuWidth - 10;
    if (top + menuHeight > height) top = height - menuHeight - 10;

    setMenuPosition({ top, left });
    setMenuVisible(true);
  };

  const closeMenu = () => setMenuVisible(false);

  return (
    <>
      {/* Chat row */}
      <TouchableOpacity
        className="py-4 rounded-full"
        onPress={onOpen}
        onLongPress={handleLongPress}
      >
        <Text className="text-base text-white">{name}</Text>
      </TouchableOpacity>

      {/* Context menu */}
      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        onRequestClose={closeMenu}
      >
        {/* Background overlay */}
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View className="flex-1 bg-black/40" />
        </TouchableWithoutFeedback>

        {/* Floating menu */}
        <View
          className="absolute bg-neutral-900 rounded-xl p-3 shadow-lg w-48"
          style={{ top: menuPosition.top - 30, left: menuPosition.left + 30 }} // To keep the modal close to finger
        >
          {/* Rename */}
          <Pressable
            className="flex-row items-center gap-2 py-2"
            onPress={() => {
              closeMenu();
              onRename();
            }}
          >
            {/* <Pencil size={18} color="white" /> */}
            <Text className="text-white text-base">Rename</Text>
          </Pressable>

          {/* Archive */}
          <Pressable
            className="flex-row items-center gap-2 py-2"
            onPress={() => {
              closeMenu();
              onArchive();
            }}
          >
            {/* <Archive size={18} color="white" /> */}
            <Text className="text-white text-base">Archive</Text>
          </Pressable>

          {/* Delete */}
          <Pressable
            className="flex-row items-center gap-2 py-2"
            onPress={() => {
              closeMenu();
              onDelete();
            }}
          >
            {/* <Trash2 size={18} color="red" /> */}
            <Text className="text-red-500 text-base">Delete</Text>
          </Pressable>
        </View>
      </Modal>
    </>
  );
};

export default Conversation;
