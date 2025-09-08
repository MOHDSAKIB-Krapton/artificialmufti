import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  GestureResponderEvent,
  Modal,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type OptionItem = {
  label: string;
  onPress: () => void;
  textColor?: string;
  icon?: keyof typeof Ionicons.glyphMap;
};

type OptionModalProps = {
  triggerElement: React.ReactNode; // Element to trigger the menu (like a chat row)
  options: OptionItem[];
  onPress: () => void;
  triggerStyle?: object; // optional style for trigger
};

const OptionModal = ({
  triggerElement,
  options,
  onPress,
  triggerStyle,
}: OptionModalProps) => {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [menuVisible, setMenuVisible] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });

  const handleLongPress = (event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;
    const { width, height } = Dimensions.get("window");

    const menuWidth = 200;
    const menuHeight = options.length * 50; // approximate height per option

    let left = pageX;
    let top = pageY;

    if (left + menuWidth > width) left = width - menuWidth - 10;
    if (top + menuHeight > height) top = height - menuHeight - 10;

    setMenuPosition({ top, left });
    setMenuVisible(true);
  };

  const closeMenu = () => setMenuVisible(false);

  return (
    <>
      <TouchableOpacity
        style={triggerStyle}
        onPress={onPress}
        onLongPress={handleLongPress}
      >
        {triggerElement}
      </TouchableOpacity>

      <Modal
        transparent
        visible={menuVisible}
        animationType="fade"
        statusBarTranslucent
        navigationBarTranslucent
        onRequestClose={closeMenu}
      >
        {/* Background overlay */}
        {/* <TouchableWithoutFeedback onPress={closeMenu}>
          <View className="flex-1 bg-black/40" />
        </TouchableWithoutFeedback> */}
        <TouchableWithoutFeedback onPress={closeMenu}>
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.4)",
              marginTop: -insets.top, // Apply negative margin
              marginBottom: -insets.bottom, // Apply negative margin
            }}
          />
        </TouchableWithoutFeedback>

        <View
          className="absolute rounded-xl shadow-lg overflow-hidden"
          style={{
            top: menuPosition.top - 30,
            left: menuPosition.left + 30,
            width: 200,
            backgroundColor: theme.background,
          }}
        >
          {options.map((opt, idx) => {
            const isLast = idx === options.length - 1;
            return (
              <TouchableOpacity
                key={idx}
                className={`flex-row items-center gap-2 p-3`}
                onPress={() => {
                  closeMenu();
                  opt.onPress();
                }}
                style={{
                  borderBottomWidth: !isLast ? 1 : 0,
                  borderBottomColor: !isLast ? theme.card : undefined,
                }}
              >
                {opt.icon && (
                  <Ionicons
                    name={opt.icon}
                    size={12}
                    color={opt.textColor || theme.text}
                  />
                )}
                <Text
                  className="text-base font-space"
                  style={{ color: opt.textColor || theme.text }}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Modal>
    </>
  );
};

export default OptionModal;
