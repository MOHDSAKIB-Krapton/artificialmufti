// DonationPage.tsx
import FancyButton from "@/components/common/button";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// ======================================================================
// Helper function to handle the payment link flow
// This function needs a backend to create the payment order and link
// ======================================================================

/**
 * Initiates the payment process by opening a hosted payment page.
 * @param {number} amountInPaise - The donation amount in the smallest currency unit.
 */
const initiatePaymentLink = async (amountInPaise: number) => {
  try {
    // --------------------------------------------------------------------
    // BACKEND LOGIC (This should be on your server, not in the app)
    // 1. Send a request to your backend to create a payment link.
    //    Example API call:
    //    const response = await fetch('YOUR_BACKEND_API/create-payment-link', {
    //      method: 'POST',
    //      headers: { 'Content-Type': 'application/json' },
    //      body: JSON.stringify({ amount: amountInPaise }),
    //    });
    //    const data = await response.json();
    //    const paymentLink = data.short_url; // Get the URL from the backend response
    //
    // 2. The backend should use your payment gateway's API to generate a link.
    //    Example Razorpay Node.js/Express:
    //    const Razorpay = require('razorpay');
    //    const instance = new Razorpay({ key_id: 'YOUR_KEY_ID', key_secret: 'YOUR_KEY_SECRET' });
    //    const paymentLink = await instance.paymentLink.create({
    //      amount: amountInPaise,
    //      currency: "INR",
    //      accept_partial: false,
    //      expire_by: Date.now() / 1000 + 3600, // 1 hour expiration
    //      reference_id: `donation_${Date.now()}`,
    //      callback_url: 'YOUR_APP_SUCCESS_URL',
    //      callback_method: 'get',
    //    });
    //    res.json(paymentLink);
    // --------------------------------------------------------------------

    // MOCK PAYMENT LINK FOR DEMONSTRATION
    const paymentLink = `https://rzp.io/l/mockdonationlink?amount=${amountInPaise}`;

    await Linking.openURL(paymentLink);
  } catch (error) {
    console.error("Payment link creation error:", error);
    Alert.alert(
      "Error",
      "Could not generate the donation link. Please try again later.",
      [{ text: "OK" }]
    );
  }
};

const DONATION_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

const DonationPage = () => {
  const { theme } = useTheme();
  const [selectedAmount, setSelectedAmount] = useState<number>(100);

  const handleDonate = () => {
    if (!selectedAmount) {
      Alert.alert("Please select an amount to donate.");
      return;
    }
    const amountInPaise = selectedAmount * 100;
    initiatePaymentLink(amountInPaise);
  };

  const handleOpenPrivacyPolicy = () => {
    const url = "https://artificialmufti.com/terms";
    Linking.openURL(url).catch((err) =>
      console.error("Failed to open URL:", err)
    );
  };

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView className="flex-1 px-6 pt-4">
        {/* Header Section */}
        <View className="items-center mb-8">
          <Ionicons name="heart-circle" size={64} color={theme.primary} />
          <Text
            className="text-2xl font-space-bold mt-2"
            style={{ color: theme.text }}
          >
            Support Our Mission
          </Text>
          <Text
            className="text-center text-sm mt-2 font-space"
            style={{ color: theme.textSecondary }}
          >
            Your support helps us keep the app running smoothly and add new,
            useful features for everyone.
          </Text>
        </View>

        {/* What Your Donation Supports Section */}
        <View className="mb-8">
          <Text
            className="text-base font-space-bold mb-3"
            style={{ color: theme.text }}
          >
            What Your Support Enables:
          </Text>
          <View className="flex-row items-start mb-2">
            <Ionicons name="flask" size={18} color={theme.accent} />
            <Text
              className="flex-1 ml-2 font-space"
              style={{ color: theme.textSecondary }}
            >
              <Text className="font-space-bold" style={{ color: theme.text }}>
                Innovation:
              </Text>{" "}
              Funding for new features like community forums, advanced
              calculations, and more.
            </Text>
          </View>
          <View className="flex-row items-start mb-2">
            <Ionicons name="bug" size={18} color={theme.accent} />
            <Text
              className="flex-1 ml-2 font-space"
              style={{ color: theme.textSecondary }}
            >
              <Text className="font-space-bold" style={{ color: theme.text }}>
                Maintenance:
              </Text>{" "}
              Covering server costs, API fees, and development tools to ensure a
              stable experience.
            </Text>
          </View>
          <View className="flex-row items-start">
            <Ionicons name="person" size={18} color={theme.accent} />
            <Text
              className="flex-1 ml-2 font-space"
              style={{ color: theme.textSecondary }}
            >
              <Text className="font-space-bold" style={{ color: theme.text }}>
                Support:
              </Text>{" "}
              Ensuring we can provide quick and helpful support to our users.
            </Text>
          </View>
        </View>

        {/* Donation Amount Section */}
        <View className="mb-8">
          <Text
            className="text-base font-space-bold mb-3"
            style={{ color: theme.text }}
          >
            Choose an Amount:
          </Text>
          <View className="flex-row flex-wrap justify-between gap-2">
            {DONATION_AMOUNTS.map((amount) => (
              <TouchableOpacity
                key={amount}
                className={`w-[30%] items-center justify-center p-3 rounded-xl border-2`}
                style={{
                  backgroundColor:
                    selectedAmount === amount ? theme.accent : theme.card,
                  borderColor:
                    selectedAmount === amount ? theme.accent : theme.card,
                }}
                onPress={() => setSelectedAmount(amount)}
              >
                <Text
                  className="font-space-bold text-lg"
                  style={{
                    color:
                      selectedAmount === amount ? theme.textLight : theme.text,
                  }}
                >
                  ₹{amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      <View
        className="px-6 py-4"
        style={{
          backgroundColor: theme.background,
        }}
      >
        <FancyButton
          onPress={handleDonate}
          text={`Donate ₹${selectedAmount || "—"}`}
          type="secondary"
        />

        <TouchableOpacity className="mt-4" onPress={handleOpenPrivacyPolicy}>
          <Text
            className="text-xs text-center underline font-space-italic"
            style={{ color: theme.textSecondary }}
          >
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default DonationPage;
