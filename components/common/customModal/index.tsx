import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type ModalVariant = "center" | "bottom";

type Props = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: ModalVariant;
  addPadding?: boolean;
  heading?: string;
  description?: string;
  showClose?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  containerStyle?: string;
};

const FADE_DURATION = 200;
const SLIDE_DURATION = 250;

const CustomModal = ({
  visible,
  onClose,
  children,
  variant = "center",
  addPadding = true,
  heading,
  description,
  showClose = true,
  showBack = false,
  onBack,
  containerStyle = "",
}: Props) => {
  const isBottom = variant === "bottom";

  const [render, setRender] = useState(visible);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const panelTranslate = useRef(new Animated.Value(isBottom ? 300 : 0)).current;
  const panelOpacity = useRef(new Animated.Value(0)).current;

  // Animate in/out
  useEffect(() => {
    if (visible) {
      setRender(true);

      // Backdrop fade-in
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();

      // Panel animation
      if (isBottom) {
        Animated.timing(panelTranslate, {
          toValue: 0,
          duration: SLIDE_DURATION,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(panelOpacity, {
          toValue: 1,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }).start();
      }
    } else {
      // Animate out
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: FADE_DURATION,
        useNativeDriver: true,
      }).start();

      if (isBottom) {
        Animated.timing(panelTranslate, {
          toValue: 300,
          duration: SLIDE_DURATION,
          useNativeDriver: true,
        }).start();
      } else {
        Animated.timing(panelOpacity, {
          toValue: 0,
          duration: FADE_DURATION,
          useNativeDriver: true,
        }).start();
      }

      // Delay unmount until animation ends
      setTimeout(() => setRender(false), SLIDE_DURATION);
    }
  }, [visible]);

  if (!render) return null;

  return (
    <Modal
      visible
      transparent
      statusBarTranslucent
      animationType="none" // we handle animation manually
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Backdrop */}
        <TouchableWithoutFeedback onPress={onClose}>
          <Animated.View
            style={{
              flex: 1,
              backgroundColor: "#00000088",
              opacity: backdropOpacity,
              justifyContent: isBottom ? "flex-end" : "center",
              alignItems: "center",
            }}
          />
        </TouchableWithoutFeedback>

        {/* Panel */}
        <Animated.View
          style={[
            {
              position: "absolute",
              left: 16,
              right: 16,
              backgroundColor: "white",
              borderRadius: 24,
              padding: addPadding ? 20 : 0,
              maxHeight: "85%",
              borderWidth: 1,
              borderColor: "#e5e7eb",
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 10,
            },
            isBottom
              ? { bottom: 16, transform: [{ translateY: panelTranslate }] }
              : {
                  top: "50%",
                  transform: [{ translateY: -200 }],
                  opacity: panelOpacity,
                },
          ]}
          className={`${containerStyle}`}
        >
          {/* Header */}
          {(heading || showClose || showBack) && (
            <View className="w-full flex-row justify-between items-center mb-3">
              {showBack && (
                <TouchableOpacity onPress={onBack}>
                  <Ionicons name="arrow-back" size={22} color="black" />
                </TouchableOpacity>
              )}

              {heading && (
                <View className="flex-1 px-2">
                  <Text className="text-lg font-semibold" numberOfLines={1}>
                    {heading}
                  </Text>
                  {description && (
                    <Text className="text-xs text-gray-500 mt-0.5">
                      {description}
                    </Text>
                  )}
                </View>
              )}

              {showClose && (
                <TouchableOpacity onPress={onClose}>
                  <Ionicons name="close" size={22} color="black" />
                </TouchableOpacity>
              )}
            </View>
          )}

          <View className="flex-1">{children}</View>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export default CustomModal;
