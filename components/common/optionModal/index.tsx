import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import {
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

const OptionModal = forwardRef(
  (
    { triggerElement, options, onPress, triggerStyle }: OptionModalProps,
    ref
  ) => {
    const { theme } = useTheme();
    const insets = useSafeAreaInsets();

    const [menuVisible, setMenuVisible] = useState(false);

    const handleLongPress = () => openMenu();
    const closeMenu = () => setMenuVisible(false);
    const openMenu = () => setMenuVisible(true);

    useImperativeHandle(ref, () => ({
      openMenu,
    }));

    return (
      <>
        <TouchableOpacity
          activeOpacity={0.6}
          style={[triggerStyle]}
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
              top: "50%",
              left: "50%",
              transform: [
                { translateX: -100 }, // half of width (200 / 2)
                { translateY: -((options.length * 50) / 2) }, // half of menu height
              ],
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
  }
);

export default OptionModal;
