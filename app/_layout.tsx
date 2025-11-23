import { ThemeProvider } from "@/context/theme";
import AuthBootstrap from "@/providers/AuthBootstrap";
import { UpdateProvider } from "@/providers/updateProvider";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import "react-native-reanimated";
import "../global.css";

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    SpaceMonoItalic: require("../assets/fonts/SpaceMono-Italic.ttf"),
    SpaceMonoBold: require("../assets/fonts/SpaceMono-Bold.ttf"),
    SpaceMonoBoldItalic: require("../assets/fonts/SpaceMono-BoldItalic.ttf"),
    PixelatedElegance: require("../assets/fonts/PixelatedElegance-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  // 👇 Add this line once in your app root (outside of component render)
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true, // show notification even in foreground
      shouldPlaySound: true, // play sound
      shouldSetBadge: true, // don’t update app icon badge
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BottomSheetModalProvider>
        <ThemeProvider>
          <KeyboardProvider>
            <AuthBootstrap>
              <UpdateProvider>
                <Stack
                  initialRouteName="index"
                  screenOptions={{
                    animation: "fade",
                    contentStyle: { backgroundColor: "#000" },
                  }}
                >
                  <Stack.Screen name="index" options={{ headerShown: false }} />
                  <Stack.Screen
                    name="onboarding/index"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen
                    name="(protected)"
                    options={{ headerShown: false }}
                  />
                  <Stack.Screen name="(auth)" options={{ headerShown: false }} />
                  <Stack.Screen name="+not-found" />
                </Stack>
              </UpdateProvider>
            </AuthBootstrap>
          </KeyboardProvider>
          <StatusBar style="auto" />
        </ThemeProvider>
      </BottomSheetModalProvider>
    </GestureHandlerRootView>
  );
}
