import OptionList, { OptionListProps } from "@/components/common/optionList";
import { useState } from "react";
import { ScrollView } from "react-native";

export default function Settings() {
  const [darkMode, setDarkMode] = useState(false);
  const [incognito, setIncognito] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

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
      {
        type: "switch",
        label: "Show Online Status",
        value: !incognito,
        onToggle: () => setIncognito(!incognito),
      },
    ],
  };

  const NotificationSection: OptionListProps = {
    header: "NOTIFICATIONS",
    options: [
      {
        type: "switch",
        label: "Push Notifications",
        value: notifications,
        onToggle: setNotifications,
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
      },
      {
        type: "display",
        label: "Manage Devices",
        value: "See logged-in sessions",
        onPress: () => console.log("Manage Devices pressed"),
      },
    ],
  };

  const AppearanceSection: OptionListProps = {
    header: "APPEARANCE",
    options: [
      {
        type: "switch",
        label: "Dark Mode",
        value: darkMode,
        onToggle: setDarkMode,
      },
    ],
  };

  const DangerZone: OptionListProps = {
    header: "DANGER ZONE",
    options: [
      {
        type: "display",
        label: "Delete Account",
        value: "This action cannot be undone",
        onPress: () => console.log("Delete Account pressed"),
      },
    ],
  };

  return (
    <ScrollView
      className="flex-1 bg-[#0d0d0d] px-5 py-6"
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <OptionList {...AccountSection} />
      <OptionList {...PrivacySection} />
      <OptionList {...NotificationSection} />
      <OptionList {...SecuritySection} />
      <OptionList {...AppearanceSection} />
      <OptionList {...DangerZone} />
    </ScrollView>
  );
}
