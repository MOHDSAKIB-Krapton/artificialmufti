import OptionList, { OptionListProps } from "@/components/common/optionList";
import OptionSelector, { Option } from "@/components/common/optionSelector";
import { useTheme } from "@/hooks/useTheme";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Button, ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function Settings() {
  const {
    theme,
    themeKey: selectedTheme,
    setThemeKey: setSelectedTheme,
  } = useTheme();
  const [incognito, setIncognito] = useState(false);
  const [twoFactor, setTwoFactor] = useState(false);

  const themeOptions: Option[] = [
    {
      name: "System",
      icon: "settings-outline",
      value: "system",
      type: "feather",
    },
    { name: "Light", icon: "sunny-sharp", value: "light" },
    { name: "Dark", icon: "moon-sharp", value: "dark" },
    {
      name: "Fancy",
      icon: "heart-outline",
      value: "fancy",
      type: "feather",
    },
  ];

  const GeneralSection: OptionListProps = {
    header: "GENERAL",
    options: [
      {
        type: "display",
        label: "Language",
        value: "English (US)",
        onPress: () => console.log("Language pressed"),
      },
      {
        type: "display",
        label: "Data Usage",
        value: "See network usage",
        onPress: () => console.log("Data Usage pressed"),
      },
    ],
  };

  const AdditionalFeatures: OptionListProps = {
    header: "ADDITIONAL FEATURES",
    options: [
      {
        type: "display",
        label: "Qibla Direction",
        value: "See Qibla direction",
        icon: "compass-outline",
        onPress: () => router.push("/(protected)/(pages)/kaaba"),
      },
      {
        type: "navigation",
        label: "Prayer Times",
        value: "See Prayer Times",
        icon: "time-outline",
        onPress: () => router.push("/(protected)/(pages)/prayer-times"),
      },
      {
        type: "info",
        label: "Prayer Times",
        value: "See Prayer Times",
        icon: "time-outline",
        // onPress: () => router.push("/(protected)/(pages)/prayer-times"),
      },
    ],
  };

  const AccountSection: OptionListProps = {
    header: "ACCOUNT",
    options: [
      {
        type: "display",
        label: "Profile",
        value: "Manage your profile details",
        onPress: () => console.log("Profile pressed"),
      },
      {
        type: "display",
        label: "Change Password",
        value: "Update your login credentials",
        onPress: () => console.log("Change Password pressed"),
      },
      {
        type: "display",
        label: "Upgrade to SuperGrok",
        value: "Unlock advanced features",
        onPress: () => console.log("Upgrade pressed"),
        // customIcon: <Feather name="zap" size={20} color="#FFD700" />,
      },
    ],
  };

  const PrivacySection: OptionListProps = {
    header: "PRIVACY",
    options: [
      {
        type: "switch",
        label: "Incognito Mode",
        value: incognito,
        onToggle: setIncognito,
      },
    ],
  };

  const SecuritySection: OptionListProps = {
    header: "SECURITY",
    options: [
      {
        type: "switch",
        label: "Two-Factor Authentication",
        value: twoFactor,
        onToggle: setTwoFactor,
        icon: "shield-checkmark",
      },
      {
        type: "display",
        label: "Manage Devices",
        value: "See logged-in sessions",
        onPress: () => console.log("Manage Devices pressed"),
      },
      {
        type: "display",
        label: "Face ID / Touch ID",
        value: "Unlock with biometrics",
        onPress: () => console.log("Biometrics pressed"),
      },
    ],
  };

  const HelpSupportSection: OptionListProps = {
    header: "HELP & SUPPORT",
    options: [
      {
        type: "display",
        label: "Contact Support",
        value: "Get help with your account",
        onPress: () => console.log("Contact Support pressed"),
      },
      {
        type: "display",
        label: "FAQs",
        value: "Find answers to common questions",
        onPress: () => console.log("FAQs pressed"),
      },
      {
        type: "display",
        label: "Legal",
        value: "Terms of Service, Privacy Policy",
        onPress: () => console.log("Legal pressed"),
      },
    ],
  };

  const DangerZone: OptionListProps = {
    header: "DANGER ZONE",
    options: [
      {
        type: "display",
        label: "Logout",
        value: "Logout session from this device",
        onPress: () => console.log("Logout pressed"),
      },
      {
        type: "display",
        label: "Delete Account",
        value: "This action cannot be undone",
        onPress: () => console.log("Delete Account pressed"),
      },
    ],
  };

  const [bottomVisible, setBottomVisible] = useState(false);
  const [centerVisible, setCenterVisible] = useState(false);

  return (
    <ScrollView
      className="flex-1 bg-[#0d0d0d] px-5 py-6"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View className="items-center mb-8">
        <View className="w-24 h-24 rounded-full border-2 border-[#3a3a3c] overflow-hidden"></View>
        <Text
          className=" font-pixel text-xl mt-4"
          style={{ color: theme.text }}
        >
          Mohd. Sakib
        </Text>
        <Text
          className=" text-sm font-space"
          style={{ color: theme.textSecondary }}
        >
          danishkhan9886283@gmail.com
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => console.log("Upgrade pressed")}
        className="flex-row items-center justify-between p-4 rounded-xl mb-6"
        style={{ backgroundColor: theme.card }}
      >
        <View className="flex-row items-center">
          <Feather name="zap" size={24} color="#FFD700" />
          <View className="ml-4">
            <Text
              className="font-space-bold text-lg"
              style={{ color: theme.text }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Upgrade to Super ArtificialMufti
            </Text>
            <Text
              className=" text-sm font-space"
              style={{ color: theme.textSecondary }}
            >
              Unlock advanced features
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={24} color="gray" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/(protected)/(pages)/donation")}
        className="flex-row items-center justify-between p-4 rounded-xl mb-6"
        style={{ backgroundColor: theme.card }}
      >
        <View className="flex-row items-center">
          <Feather name="zap" size={24} color="#FFD700" />
          <View className="ml-4">
            <Text
              className="font-space-bold text-lg"
              style={{ color: theme.text }}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              Donate / Support Us
            </Text>
            <Text
              className=" text-sm font-space"
              style={{ color: theme.textSecondary }}
            >
              Your contributions help us improve the app
            </Text>
          </View>
        </View>
        <Feather name="chevron-right" size={24} color="gray" />
      </TouchableOpacity>

      <OptionSelector
        options={themeOptions}
        selectedValue={selectedTheme}
        onSelect={setSelectedTheme}
        title="Appearance"
      />

      <OptionList {...AdditionalFeatures} />
      <OptionList {...AccountSection} />
      <OptionList {...GeneralSection} />
      <OptionList {...PrivacySection} />
      <OptionList {...SecuritySection} />
      <OptionList {...HelpSupportSection} />

      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          gap: 10,
        }}
      >
        <Button
          title="Open Bottom Modal"
          onPress={() => setBottomVisible(true)}
        />
        <Button
          title="Open Center Modal"
          onPress={() => setCenterVisible(true)}
        />

        {/* Bottom Sheet Example */}
        {/* <Modal
          visible={bottomVisible}
          onClose={() => setBottomVisible(false)}
          isBottom={true}
          // title="Bottom Modal"
          // description="This modal slides up from the bottom and can be dragged down to close."
          // breakpoints={[0.3, 0.6, 0.9]} // optional
        >
          <View>
            <Text style={{ marginBottom: 10 }}>
              👉 Scrollable content goes here
            </Text>
            <Text>Item 1</Text>
            <Text>Item 2</Text>
            <Text>Item 3</Text>
            <Text>Item 4</Text>
            <Text>Item 5</Text>
            <Text>Item 6</Text>
            <Text>Item 7</Text>
          </View>
        </Modal> */}

        {/* Center Modal Example */}
        {/* <Modal
          visible={centerVisible}
          onClose={() => setCenterVisible(false)}
          // mode="center"
          // title="Center Modal"
          // description="This modal fades in the middle with scale animation."
        >
          <View>
            <Text style={{ marginBottom: 10 }}>
              👋 Hello from the center modal
            </Text>
            <Button title="Close Me" onPress={() => setCenterVisible(false)} />
          </View>
        </Modal> */}
      </View>

      {/* Danger Zone */}
      <OptionList {...DangerZone} />
    </ScrollView>
  );
}
