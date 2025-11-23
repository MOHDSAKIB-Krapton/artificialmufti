import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  BackHandler,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
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
  animationDuration?: number;
  closeOnBackdrop?: boolean;
};

const ANIMATION_CONFIG = {
  duration: 300,
  useNativeDriver: true,
};

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

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
  animationDuration = 500,
  closeOnBackdrop = true,
}: Props) => {
  const { theme } = useTheme();
  const isBottom = variant === "bottom";

  // 2. Internal state to control whether the Modal is mounted
  const [isModalMounted, setIsModalMounted] = useState(visible);

  // Keep track of the latest visible prop value
  const visibleRef = useRef(visible);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  // Use stable refs for animation values
  const animationValues = useRef({
    backdrop: new Animated.Value(0),
    translate: new Animated.Value(isBottom ? SCREEN_HEIGHT : 0),
    scale: new Animated.Value(isBottom ? 1 : 0.9),
    opacity: new Animated.Value(isBottom ? 1 : 0),
  }).current;

  // Handle animations
  const animateIn = useCallback(() => {
    const animations = [
      Animated.timing(animationValues.backdrop, {
        toValue: 1,
        ...ANIMATION_CONFIG,
      }),
    ];

    if (isBottom) {
      animations.push(
        Animated.spring(animationValues.translate, {
          toValue: 0,
          damping: 200,
          stiffness: 300,
          mass: 0.8,
          useNativeDriver: true,
        })
      );
    } else {
      animations.push(
        Animated.parallel([
          Animated.timing(animationValues.opacity, {
            toValue: 1,
            ...ANIMATION_CONFIG,
          }),
          Animated.spring(animationValues.scale, {
            toValue: 1,
            damping: 15,
            stiffness: 200,
            useNativeDriver: true,
          }),
        ])
      );
    }

    Animated.parallel(animations).start();
  }, [isBottom, animationDuration, animationValues]);

  const animateOut = useCallback(
    (callback?: () => void) => {
      const animations = [
        Animated.timing(animationValues.backdrop, {
          toValue: 0,
          ...ANIMATION_CONFIG,
        }),
      ];

      if (isBottom) {
        animations.push(
          Animated.timing(animationValues.translate, {
            toValue: SCREEN_HEIGHT,
            ...ANIMATION_CONFIG,
          })
        );
      } else {
        animations.push(
          Animated.parallel([
            Animated.timing(animationValues.opacity, {
              toValue: 0,
              ...ANIMATION_CONFIG,
            }),
            Animated.timing(animationValues.scale, {
              toValue: 0.9,
              ...ANIMATION_CONFIG,
            }),
          ])
        );
      }

      Animated.parallel(animations).start(({ finished }) => {
        if (finished && !visibleRef.current) {
          setIsModalMounted(false);
        }
        if (callback) {
          callback();
        }
      });
    },
    [isBottom, animationDuration, animationValues]
  );

  const handleClose = useCallback(() => {
    animateOut(() => {
      onClose();
    });
  }, [animateOut, onClose]);

  const handleBackdropPress = useCallback(() => {
    if (closeOnBackdrop) {
      handleClose();
    }
  }, [closeOnBackdrop, handleClose]);

  // Handle hardware back button on Android
  useEffect(() => {
    if (visible && Platform.OS === "android") {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        () => {
          handleClose();
          return true;
        }
      );

      return () => backHandler.remove();
    }
  }, [visible, handleClose]);

  //  Handle mounting and closing requests
  useEffect(() => {
    if (visible) {
      // setIsModalMounted(true);
      if (!isModalMounted) {
        setIsModalMounted(true);
      }
    } else {
      animateOut();
    }
  }, [visible, animateOut]);

  // Trigger open animation only after mount is confirmed
  useEffect(() => {
    if (isModalMounted && visible) {
      animateIn();
    }
  }, [isModalMounted, visible, animateIn]);

  if (!isModalMounted) return null;

  return (
    <Modal
      visible={isModalMounted}
      transparent
      statusBarTranslucent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={StyleSheet.absoluteFillObject}>
        {/* Backdrop */}
        <TouchableOpacity
          activeOpacity={1}
          onPress={handleBackdropPress}
          style={StyleSheet.absoluteFillObject}
        >
          <Animated.View
            style={[
              styles.backdrop,
              {
                opacity: animationValues.backdrop,
              },
            ]}
          />
        </TouchableOpacity>

        {/* Content Container */}
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={[
            { flex: 1 },
            isBottom ? styles.bottomContainer : styles.centerContainer,
          ]}
          pointerEvents="box-none"
        >
          {/* Panel */}
          <Animated.View
            style={[
              {
                borderRadius: 24,
                maxHeight: "85%",
                // flex: 1,
                overflow: "hidden",
                ...Platform.select({
                  ios: {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 10,
                  },
                  android: {
                    elevation: 5,
                  },
                }),
                margin: isBottom ? 16 : 0,
                backgroundColor: theme.card,
                padding: addPadding ? 20 : 0,
                ...(isBottom && {
                  paddingBottom: Platform.OS === "ios" ? 34 : 20, // Safe area
                }),
              },
              isBottom
                ? {
                  bottom: 10,
                  transform: [{ translateY: animationValues.translate }],
                }
                : {
                  top: "50%",
                  alignSelf: "center" as const,
                  width: "90%",
                  transform: [
                    { translateY: -SCREEN_HEIGHT * 0.5 },
                    { scale: animationValues.scale },
                  ],
                  opacity: animationValues.opacity,
                },
            ]}
            className={containerStyle}
          >
            {/* Header */}
            {(heading || showClose || showBack) && (
              <View style={styles.header}>
                {showBack && (
                  <TouchableOpacity
                    onPress={onBack}
                    style={styles.headerButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                  </TouchableOpacity>
                )}

                {heading && (
                  <View style={styles.headerText}>
                    <Text
                      style={[styles.heading, { color: theme.text }]}
                      numberOfLines={1}
                    >
                      {heading}
                    </Text>
                    {description && (
                      <Text
                        style={[
                          styles.description,
                          { color: theme.textSecondary },
                        ]}
                      >
                        {description}
                      </Text>
                    )}
                  </View>
                )}

                {showClose && (
                  <TouchableOpacity
                    onPress={handleClose}
                    style={styles.headerButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons name="close" size={24} color={theme.text} />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Content */}
            <View>{children}</View>
          </Animated.View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  centerContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  bottomContainer: {
    justifyContent: "flex-end",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    minHeight: 32,
  },
  headerButton: {
    padding: 4,
  },
  headerText: {
    flex: 1,
    marginHorizontal: 12,
  },
  heading: {
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    fontSize: 13,
    marginTop: 2,
  },
});

export default CustomModal;
