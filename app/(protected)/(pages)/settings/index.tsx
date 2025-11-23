import FancyButton from "@/components/common/button";
import CustomModal from "@/components/common/customModal";
import OptionList, { OptionListProps } from "@/components/common/optionList";
import OptionSelector, { Option } from "@/components/common/optionSelector";
import { useTheme } from "@/hooks/useTheme";
import { AccountService } from "@/services/account/account.service";
import { useAuthStore } from "@/store/auth.store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";

export default function Settings() {
  const {
    theme,
    themeKey: selectedTheme,
    setThemeKey: setSelectedTheme,
  } = useTheme();

  const signOut = useAuthStore((s) => s.signOut);
  const user = useAuthStore((s) => s.user);

  const [incognito, setIncognito] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

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
      // {
      //   type: "display",
      //   label: "Data Usage",
      //   value: "See network usage",
      //   onPress: () => console.log("Data Usage pressed"),
      // },
    ],
  };

  const AccountSection: OptionListProps = {
    header: "ACCOUNT",
    options: [
      {
        type: "navigation",
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

  const HelpSupportSection: OptionListProps = {
    header: "HELP & SUPPORT",
    options: [
      {
        type: "display",
        label: "Contact Support",
        value: "Get help with your account",
        onPress: () => router.push("/(protected)/(pages)/support"),
      },
      {
        type: "display",
        label: "FAQs",
        value: "Find answers to common questions",
        onPress: () => router.push("/(protected)/(pages)/faq"),
      },
      // {
      //   type: "display",
      //   label: "Legal",
      //   value: "Terms of Service, Privacy Policy",
      //   onPress: () => console.log("Legal pressed"),
      // },
    ],
  };

  const DangerZone: OptionListProps = {
    header: "DANGER ZONE",
    options: [
      {
        type: "display",
        label: "Logout",
        value: "Logout session from this device",
        onPress: () => setLogoutModal(true),
      },
      {
        type: "display",
        label: "Delete Account",
        value: "This action cannot be undone",
        onPress: () => setDeleteModal(true)
        ,
      },
    ],
  };

  const DonateSection: OptionListProps = {
    options: [
      {
        type: "navigation",
        label: "Donate / Support Us",
        icon: "cash-outline",
        value: "Your contributions help us improve",
        onPress: () => router.push("/(protected)/(pages)/donation"),
      },
    ],
  };


  const handleDeleteAccount = async () => {
    try {
      await AccountService.deleteAccount();
      signOut();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ScrollView
      className="flex-1 px-5 py-6"
      style={{ backgroundColor: theme.background }}
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View className="items-center mb-8">
        {/* Avatar */}
        {user?.user_metadata.avatar_url ? (
          <Image
            source={{ uri: user?.user_metadata.avatar_url }}
            className="w-24 h-24 rounded-full"
          />
        ) : (
          <View
            className="w-24 h-24 rounded-full  items-center justify-center"
            style={{ backgroundColor: theme.card }}
          >
            <Ionicons name="person" size={56} color={theme.text} />
          </View>
        )}
        <Text
          className=" font-pixel text-xl mt-4"
          style={{ color: theme.text }}
        >
          {user?.user_metadata.full_name}
        </Text>
        <Text
          className=" text-sm font-space"
          style={{ color: theme.textSecondary }}
        >
          {user?.email}
        </Text>
      </View>

      {/* <TouchableOpacity
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
              Upgrade to Super AI Mufti
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
      </TouchableOpacity> */}

      <OptionList {...DonateSection} />

      <OptionSelector
        options={themeOptions}
        selectedValue={selectedTheme}
        onSelect={setSelectedTheme}
        title="Appearance"
      />

      {/* <OptionList {...AdditionalFeatures} /> */}
      {/* <OptionList {...AccountSection} /> */}
      <OptionList {...GeneralSection} />
      {/* <OptionList {...PrivacySection} /> */}
      <OptionList {...HelpSupportSection} />

      {/* Danger Zone */}
      <OptionList {...DangerZone} />


      {/* ======================= MODALS =================== */}

      {/* LOGOUT MODAL */}
      <CustomModal
        visible={logoutModal}
        onClose={() => setLogoutModal(false)}
        heading="Logout"
        description="Are you sure you want to logout?"
        variant="center"
      >
        <View>
          <FancyButton
            text="Logout"
            type="secondary"
            loading={logoutLoading}
            onPress={() => {
              setLogoutLoading(true);
              signOut();
            }}
          />
        </View>
      </CustomModal>

      {/* DELETE ACCOUNT MODAL */}
      <CustomModal
        visible={deleteModal}
        onClose={() => setDeleteModal(false)}
        heading="Delete Account"
        description="This action is permanent. Your data cannot be recovered."
        variant="bottom"
      >
        <View className="gap-5">
          <View className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <Text className="text-red-600 font-semibold text-base mb-1">
              This will permanently delete your account.
            </Text>

            <Text className="text-red-500/90 text-sm leading-5">
              All your conversations, history and personal settings will be erased
              forever. This action cannot be undone.
            </Text>
          </View>

          {/* Consequences */}
          <View className="gap-2">
            <Text className="font-semibold text-[15px]">You will lose permanently:</Text>

            <View className="gap-1.5 pl-1">
              <Text className="text-muted-foreground text-sm">• All conversations & chat history</Text>
              <Text className="text-muted-foreground text-sm">• AI preferences & personalization</Text>
              <Text className="text-muted-foreground text-sm">• Saved data linked to your account</Text>
              <Text className="text-muted-foreground text-sm">• Access to premium/early features</Text>
            </View>
          </View>

          <View className="rounded-lg p-3 bg-red-600/15 border border-red-600/20">
            <Text className="text-red-700 font-medium text-[13px] leading-5">
              This action is immediate. Once deleted, your account cannot be restored, even by our team.
            </Text>
          </View>

          <FancyButton
            text="Delete Account Permanently"
            type="secondary"
            buttonContainerStyles={{ backgroundColor: "#b22727ff" }}
            loading={deleteLoading}
            onPress={() => {
              setDeleteLoading(true);
              handleDeleteAccount();
            }}
          />
        </View>
      </CustomModal>

    </ScrollView>
  );
}
