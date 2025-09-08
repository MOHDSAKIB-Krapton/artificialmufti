// import { Ionicons } from "@expo/vector-icons";
// import React, { useMemo } from "react";
// import { Dimensions, Text, View } from "react-native";
// import {
//   Gesture,
//   GestureDetector,
//   ScrollView,
// } from "react-native-gesture-handler";
// import ReactNativeModal from "react-native-modal";
// import Animated, {
//   Extrapolate,
//   interpolate,
//   runOnJS,
//   useAnimatedStyle,
//   useSharedValue,
//   withSpring,
// } from "react-native-reanimated";
// import { useSafeAreaInsets } from "react-native-safe-area-context";
// import { CustomModalProps } from "./types";

// const { height: SCREEN_HEIGHT } = Dimensions.get("window");

// const SPRING = { damping: 18, stiffness: 180, mass: 0.35 };
// // const OPEN_FADE_DURATION = 220;
// // const CLOSE_FADE_DURATION = 180;

// const clamp = (v: number, min: number, max: number) =>
//   Math.min(Math.max(v, min), max);

// const Modal = ({
//   heading,
//   description,
//   descriptionNumberOfLines = 2,
//   descriptionIcon,
//   descriptionIconColor = "#3b82f6",
//   visible,
//   onClose,
//   children,
//   isBottom = false,
//   showCloseButton = true,
//   containerStyle = "",
//   addPadding = true,
//   showBackButton = false,
//   onBack,

//   // new props
//   breakpoints = [0.5, 0.9],
//   initialBreakpointIndex = 0,
//   enableBackdropDismiss = true,
//   enableSwipeDownToClose = true,
//   backdropOpacity = 0.5,
// }: CustomModalProps) => {
//   /**
//    * Bottom-sheet shared values (used only when isBottom = true)
//    */
//   const translateY = useSharedValue(SCREEN_HEIGHT);
//   const startY = useSharedValue(0);
//   const openOpacity = useSharedValue(0);

//   const insets = useSafeAreaInsets();

//   // normalize + prepare snap points (progress 0..1 => translateY)
//   const snapPointsY = useMemo(() => {
//     const uniq = Array.from(new Set(breakpoints))
//       .map((b) => clamp(b, 0, 1))
//       .sort((a, b) => a - b);
//     const list = uniq.length ? uniq : [0.5, 0.9];
//     return list.map((p) => SCREEN_HEIGHT * (1 - p));
//   }, [breakpoints]);

//   const MIN_Y = useMemo(
//     () => (snapPointsY.length ? Math.min(...snapPointsY) : SCREEN_HEIGHT * 0.1),
//     [snapPointsY]
//   );
//   const MAX_Y = SCREEN_HEIGHT;

//   // animated styles (bottom)
//   const sheetStyle = useAnimatedStyle(() => ({
//     transform: [{ translateY: translateY.value }],
//   }));

//   // we still fade-in content scale a touch for polish
//   const sheetContentStyle = useAnimatedStyle(() => ({
//     opacity: openOpacity.value,
//     transform: [
//       {
//         scale: interpolate(
//           openOpacity.value,
//           [0, 1],
//           [0.98, 1],
//           Extrapolate.CLAMP
//         ),
//       },
//     ],
//   }));

//   // gesture for bottom-sheet
//   const panGesture = useMemo(() => {
//     if (!isBottom) return Gesture.Pan(); // inert
//     return Gesture.Pan()
//       .onBegin(() => {
//         startY.value = translateY.value;
//       })
//       .onUpdate((e) => {
//         const next = startY.value + e.translationY;
//         translateY.value = clamp(next, MIN_Y, MAX_Y);
//       })
//       .onEnd((e) => {
//         const v = e.velocityY;
//         const currentY = translateY.value;

//         // quick swipe down closes
//         if (v > 1200) {
//           translateY.value = withSpring(MAX_Y, SPRING, () => {
//             runOnJS(onClose)();
//           });
//           return;
//         }
//         // snap to nearest (including closed)
//         const candidates = [...snapPointsY, MAX_Y];
//         let nearest = candidates[0];
//         let nd = Math.abs(currentY - nearest);
//         for (let i = 1; i < candidates.length; i++) {
//           const d = Math.abs(currentY - candidates[i]);
//           if (d < nd) {
//             nearest = candidates[i];
//             nd = d;
//           }
//         }
//         if (nearest === MAX_Y) {
//           translateY.value = withSpring(MAX_Y, SPRING, () => {
//             runOnJS(onClose)();
//           });
//         } else {
//           translateY.value = withSpring(nearest, SPRING);
//         }
//       });
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [isBottom, MIN_Y, MAX_Y, snapPointsY.join("|")]);

//   /**
//    * react-native-modal config
//    * - For bottom sheet: we use fade only (content animates via Reanimated)
//    * - For center: we use nice slide/zoom via RNM + our tiny scale polish
//    */
//   const modalCommon = {
//     isVisible: visible,
//     onBackdropPress: enableBackdropDismiss ? onClose : undefined,
//     onBackButtonPress: onClose,
//     backdropOpacity,
//     useNativeDriver: true,
//     useNativeDriverForBackdrop: true,
//     hideModalContentWhileAnimating: true,
//     propagateSwipe: true as const, // lets inner ScrollView handle gestures
//     statusBarTranslucent: true,
//   };

//   return (
//     <ReactNativeModal
//       {...modalCommon}
//       animationIn={isBottom ? "fadeIn" : "zoomIn"}
//       animationOut={isBottom ? "fadeOut" : "zoomOut"}
//       swipeDirection={
//         isBottom ? undefined : enableSwipeDownToClose ? "down" : undefined
//       }
//       onSwipeComplete={
//         !isBottom && enableSwipeDownToClose ? onClose : undefined
//       }
//       style={{
//         margin: 0,
//         justifyContent: isBottom ? "flex-end" : "center",
//         alignItems: isBottom ? "stretch" : "center",
//       }}
//     >
//       {/* BOTTOM SHEET MODE */}
//       {isBottom ? (
//         <GestureDetector gesture={panGesture}>
//           <View
//             className={`bg-[#f4fafd] rounded-3xl w-[90%] mx-auto max-h-[92%]`}
//             style={{ marginBottom: insets.bottom }}
//           >
//             {/* Drag handle */}
//             <View className="w-full items-center pt-2">
//               <View className="w-12 h-1.5 rounded-full bg-gray-300" />
//             </View>

//             <Animated.View
//               // style={sheetContentStyle}
//               className={`${addPadding ? "px-5 pb-5 pt-3" : "p-0"}`}
//             >
//               {/* Header row (back / title / close) */}
//               {(showCloseButton ||
//                 showBackButton ||
//                 heading ||
//                 description) && (
//                 <View
//                   className={`flex-row items-start w-full pb-4 ${
//                     !showBackButton && !heading && !description
//                       ? "justify-end"
//                       : "justify-between"
//                   }`}
//                 >
//                   {showBackButton ? (
//                     <View className="self-start">
//                       <Ionicons
//                         name="arrow-back"
//                         size={24}
//                         color="black"
//                         onPress={onBack}
//                       />
//                     </View>
//                   ) : (
//                     <View className="self-start flex-1 pt-1">
//                       {heading ? (
//                         <Text
//                           className="heading"
//                           numberOfLines={1}
//                           ellipsizeMode="tail"
//                         >
//                           {heading}
//                         </Text>
//                       ) : null}
//                       {description ? (
//                         <View className="flex-row items-center gap-x-1">
//                           {descriptionIcon ? (
//                             <Ionicons
//                               name={descriptionIcon}
//                               color={descriptionIconColor}
//                               size={16}
//                             />
//                           ) : null}
//                           <Text
//                             className="description"
//                             numberOfLines={descriptionNumberOfLines}
//                             ellipsizeMode="tail"
//                           >
//                             {description}
//                           </Text>
//                         </View>
//                       ) : null}
//                     </View>
//                   )}

//                   {showCloseButton ? (
//                     <View className="rounded-full bg-[#f4fafd] p-2">
//                       <Ionicons
//                         name="close"
//                         size={24}
//                         color="black"
//                         onPress={onClose}
//                       />
//                     </View>
//                   ) : null}
//                 </View>
//               )}

//               {/* Scrollable content */}
//               <ScrollView
//                 contentContainerStyle={{ paddingBottom: 28 }}
//                 showsVerticalScrollIndicator={false}
//                 nestedScrollEnabled
//                 keyboardShouldPersistTaps="handled"
//                 className={`w-full flex-shrink ${containerStyle}`}
//               >
//                 {children}
//               </ScrollView>
//             </Animated.View>
//           </View>
//         </GestureDetector>
//       ) : (
//         // CENTERED DIALOG
//         <View className="w-[90%] rounded-3xl bg-white max-h-[90%] overflow-hidden">
//           <View className={`${addPadding ? "p-5" : "p-0"} ${containerStyle}`}>
//             {(showCloseButton || showBackButton || heading || description) && (
//               <View
//                 className={`flex-row items-start w-full pb-4 ${
//                   !showBackButton && !heading && !description
//                     ? "justify-end"
//                     : "justify-between"
//                 }`}
//               >
//                 {showBackButton ? (
//                   <View className="self-start">
//                     <Ionicons
//                       name="arrow-back"
//                       size={24}
//                       color="black"
//                       onPress={onBack}
//                     />
//                   </View>
//                 ) : (
//                   <View className="self-start flex-1 pt-1">
//                     {heading ? (
//                       <Text
//                         className="heading"
//                         numberOfLines={1}
//                         ellipsizeMode="tail"
//                       >
//                         {heading}
//                       </Text>
//                     ) : null}
//                     {description ? (
//                       <View className="flex-row items-center gap-x-1">
//                         {descriptionIcon ? (
//                           <Ionicons
//                             name={descriptionIcon}
//                             color={descriptionIconColor}
//                             size={16}
//                           />
//                         ) : null}
//                         <Text
//                           className="description"
//                           numberOfLines={descriptionNumberOfLines}
//                           ellipsizeMode="tail"
//                         >
//                           {description}
//                         </Text>
//                       </View>
//                     ) : null}
//                   </View>
//                 )}

//                 {showCloseButton ? (
//                   <View className="rounded-full bg-[#f4fafd] p-2">
//                     <Ionicons
//                       name="close"
//                       size={24}
//                       color="black"
//                       onPress={onClose}
//                     />
//                   </View>
//                 ) : null}
//               </View>
//             )}

//             <View className="w-full">{children}</View>
//           </View>
//         </View>
//       )}
//     </ReactNativeModal>
//   );
// };

// export default Modal;
