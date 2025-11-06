import CustomModal from "@/components/common/customModal";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Animated,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Types
interface Asset {
  id: string;
  category: AssetCategory;
  name: string;
  value: number;
  isLiability?: boolean;
}

type AssetCategory =
  | "cash"
  | "gold"
  | "silver"
  | "investments"
  | "business"
  | "property"
  | "livestock"
  | "receivables"
  | "debts";

interface CategoryInfo {
  label: string;
  icon: string;
  description: string;
  zakaatable: boolean;
}

const CATEGORIES: Record<AssetCategory, CategoryInfo> = {
  cash: {
    label: "Cash & Savings",
    icon: "cash-outline",
    description: "Bank accounts, cash at home",
    zakaatable: true,
  },
  gold: {
    label: "Gold",
    icon: "diamond-outline",
    description: "Gold jewelry, coins, bars (85g nisab)",
    zakaatable: true,
  },
  silver: {
    label: "Silver",
    icon: "square-outline",
    description: "Silver items (595g nisab)",
    zakaatable: true,
  },
  investments: {
    label: "Investments",
    icon: "trending-up-outline",
    description: "Stocks, bonds, mutual funds, crypto",
    zakaatable: true,
  },
  business: {
    label: "Business Assets",
    icon: "briefcase-outline",
    description: "Inventory, trade goods",
    zakaatable: true,
  },
  property: {
    label: "Rental Property",
    icon: "home-outline",
    description: "Investment properties (rental income)",
    zakaatable: true,
  },
  livestock: {
    label: "Livestock",
    icon: "paw-outline",
    description: "Cattle, sheep, goats, camels",
    zakaatable: true,
  },
  receivables: {
    label: "Money Owed to You",
    icon: "return-down-back-outline",
    description: "Loans given, pending payments",
    zakaatable: true,
  },
  debts: {
    label: "Debts & Liabilities",
    icon: "remove-circle-outline",
    description: "Loans, outstanding payments",
    zakaatable: false,
  },
};

const ZAKAAT_RATE = 0.025; // 2.5%
const NISAB_SILVER_GRAMS = 595;
const NISAB_GOLD_GRAMS = 85;

const ZakaatCalculatorScreen: React.FC = () => {
  const { theme } = useTheme();

  // State
  const [assets, setAssets] = useState<Asset[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showNisabModal, setShowNisabModal] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<AssetCategory>("cash");
  const [assetName, setAssetName] = useState("");
  const [assetValue, setAssetValue] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [deductDebts, setDeductDebts] = useState(true);
  const [silverPrice, setSilverPrice] = useState(""); // per gram
  const [goldPrice, setGoldPrice] = useState(""); // per gram

  // Animations
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Calculations
  const totalAssets = useMemo(() => {
    return assets
      .filter((a) => !a.isLiability)
      .reduce((sum, asset) => sum + asset.value, 0);
  }, [assets]);

  const totalLiabilities = useMemo(() => {
    return assets
      .filter((a) => a.isLiability)
      .reduce((sum, asset) => sum + asset.value, 0);
  }, [assets]);

  const zakaatableWealth = useMemo(() => {
    const base = totalAssets - (deductDebts ? totalLiabilities : 0);
    return Math.max(0, base);
  }, [totalAssets, totalLiabilities, deductDebts]);

  const nisabThreshold = useMemo(() => {
    const sp = parseFloat(silverPrice) || 0;
    const gp = parseFloat(goldPrice) || 0;

    const silverNisab = sp * NISAB_SILVER_GRAMS;
    const goldNisab = gp * NISAB_GOLD_GRAMS;

    // Use lower of the two (more beneficial to poor)
    if (silverNisab > 0 && goldNisab > 0) {
      return Math.min(silverNisab, goldNisab);
    }
    return silverNisab > 0 ? silverNisab : goldNisab;
  }, [silverPrice, goldPrice]);

  const isAboveNisab = useMemo(() => {
    if (nisabThreshold === 0) return true; // If no nisab set, calculate anyway
    return zakaatableWealth >= nisabThreshold;
  }, [zakaatableWealth, nisabThreshold]);

  const zakaatDue = useMemo(() => {
    return isAboveNisab ? zakaatableWealth * ZAKAAT_RATE : 0;
  }, [isAboveNisab, zakaatableWealth]);

  const progressToNisab = useMemo(() => {
    if (nisabThreshold === 0) return 100;
    return Math.min(100, (zakaatableWealth / nisabThreshold) * 100);
  }, [zakaatableWealth, nisabThreshold]);

  // Asset grouping by category
  const assetsByCategory = useMemo(() => {
    return assets.reduce(
      (acc, asset) => {
        if (!acc[asset.category]) {
          acc[asset.category] = [];
        }
        acc[asset.category].push(asset);
        return acc;
      },
      {} as Record<string, Asset[]>
    );
  }, [assets]);

  // Add asset
  const handleAddAsset = useCallback(() => {
    const value = parseFloat(assetValue);
    if (!assetName || isNaN(value) || value <= 0) return;

    const newAsset: Asset = {
      id: Date.now().toString(),
      category: selectedCategory,
      name: assetName,
      value,
      isLiability: selectedCategory === "debts",
    };

    setAssets((prev) => [...prev, newAsset]);
    setAssetName("");
    setAssetValue("");
    setShowAddModal(false);
  }, [assetName, assetValue, selectedCategory]);

  // Delete asset
  const deleteAsset = useCallback((id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  }, []);

  // Format currency
  const formatCurrency = useCallback(
    (amount: number) => {
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
        minimumFractionDigits: 2,
      }).format(amount);
    },
    [currency]
  );

  return (
    <SafeAreaView
      className="flex-1"
      style={{ backgroundColor: theme.background }}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingBottom: 40,
          paddingTop: 8,
        }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-xs" style={{ color: theme.textSecondary }}>
              Zakaat Calculator
            </Text>
            <Text
              className="text-2xl font-bold mt-1"
              style={{ color: theme.text }}
            >
              Your Zakaat
            </Text>
          </View>
          <View className="flex-row gap-2">
            <Pressable
              onPress={() => setShowNisabModal(true)}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.card }}
            >
              <Ionicons
                name="calculator-outline"
                size={20}
                color={theme.text}
              />
            </Pressable>
            <Pressable
              onPress={() => setShowInfoModal(true)}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: theme.card }}
            >
              <Ionicons
                name="information-circle-outline"
                size={22}
                color={theme.text}
              />
            </Pressable>
          </View>
        </View>

        {/* Zakaat Due Card */}
        <Animated.View
          className="rounded-2xl border p-6 mb-4"
          style={{
            borderColor: theme.accentLight ?? "#ffffff22",
            backgroundColor: theme.card,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          <Text className="text-xs mb-2" style={{ color: theme.textSecondary }}>
            Your Zakaat Due
          </Text>
          <Text
            style={{
              color: theme.primary,
              fontSize: 48,
              fontWeight: "900",
              marginBottom: 16,
            }}
          >
            {formatCurrency(zakaatDue)}
          </Text>

          {nisabThreshold > 0 && (
            <>
              {/* Nisab Progress */}
              <View className="mb-4">
                <View
                  className="h-3 rounded-full overflow-hidden"
                  style={{ backgroundColor: theme.background }}
                >
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${progressToNisab}%`,
                      backgroundColor: isAboveNisab
                        ? theme.primary
                        : theme.textSecondary,
                    }}
                  />
                </View>
                <View className="flex-row justify-between mt-2">
                  <Text
                    className="text-xs"
                    style={{ color: theme.textSecondary }}
                  >
                    Nisab: {formatCurrency(nisabThreshold)}
                  </Text>
                  <Text
                    className="text-xs font-semibold"
                    style={{
                      color: isAboveNisab ? theme.primary : theme.textSecondary,
                    }}
                  >
                    {isAboveNisab ? "✓ Above Nisab" : "Below Nisab"}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Stats Grid */}
          <View className="flex-row gap-3">
            <View
              className="flex-1 p-3 rounded-xl"
              style={{ backgroundColor: theme.background }}
            >
              <Text className="text-xs" style={{ color: theme.textSecondary }}>
                Total Assets
              </Text>
              <Text
                className="text-base font-bold mt-1"
                style={{ color: theme.text }}
              >
                {formatCurrency(totalAssets)}
              </Text>
            </View>
            <View
              className="flex-1 p-3 rounded-xl"
              style={{ backgroundColor: theme.background }}
            >
              <Text className="text-xs" style={{ color: theme.textSecondary }}>
                Liabilities
              </Text>
              <Text
                className="text-base font-bold mt-1"
                style={{ color: theme.text }}
              >
                {formatCurrency(totalLiabilities)}
              </Text>
            </View>
          </View>

          {/* Deduct Debts Toggle */}
          <View
            className="flex-row items-center justify-between mt-4 pt-4 border-t"
            style={{ borderTopColor: theme.background }}
          >
            <Text className="text-sm" style={{ color: theme.text }}>
              Deduct debts from zakaat calculation
            </Text>
            <Switch
              value={deductDebts}
              onValueChange={setDeductDebts}
              trackColor={{ false: theme.textSecondary, true: theme.primary }}
              thumbColor="#fff"
            />
          </View>
        </Animated.View>

        {/* Add Asset Button */}
        <Pressable
          onPress={() => setShowAddModal(true)}
          className="flex-row items-center justify-center py-4 rounded-2xl mb-6 border-2 border-dashed"
          style={{
            borderColor: theme.primary + "44",
            backgroundColor: theme.primary + "11",
          }}
        >
          <Ionicons name="add-circle-outline" size={24} color={theme.primary} />
          <Text className="ml-2 font-semibold" style={{ color: theme.primary }}>
            Add Asset
          </Text>
        </Pressable>

        {/* Assets List by Category */}
        {Object.entries(assetsByCategory).map(([category, categoryAssets]) => {
          const info = CATEGORIES[category as AssetCategory];
          const total = categoryAssets.reduce((sum, a) => sum + a.value, 0);

          return (
            <View key={category} className="mb-4">
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-row items-center">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center mr-2"
                    style={{ backgroundColor: theme.primary + "22" }}
                  >
                    <Ionicons
                      name={info.icon as any}
                      size={16}
                      color={theme.primary}
                    />
                  </View>
                  <Text className="font-semibold" style={{ color: theme.text }}>
                    {info.label}
                  </Text>
                </View>
                <Text
                  className="text-sm font-bold"
                  style={{ color: theme.text }}
                >
                  {formatCurrency(total)}
                </Text>
              </View>

              {categoryAssets.map((asset) => (
                <View
                  key={asset.id}
                  className="flex-row items-center justify-between p-3 rounded-xl mb-2"
                  style={{ backgroundColor: theme.card }}
                >
                  <View className="flex-1">
                    <Text className="font-medium" style={{ color: theme.text }}>
                      {asset.name}
                    </Text>
                    <Text
                      className="text-xs mt-1"
                      style={{ color: theme.textSecondary }}
                    >
                      {asset.isLiability ? "Liability" : "Asset"}
                    </Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Text className="font-bold" style={{ color: theme.text }}>
                      {formatCurrency(asset.value)}
                    </Text>
                    <Pressable
                      onPress={() => deleteAsset(asset.id)}
                      className="p-1"
                    >
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color="#ef4444"
                      />
                    </Pressable>
                  </View>
                </View>
              ))}
            </View>
          );
        })}

        {/* Empty State */}
        {assets.length === 0 && (
          <View className="items-center py-12">
            <Ionicons
              name="wallet-outline"
              size={64}
              color={theme.textSecondary}
            />
            <Text
              className="text-lg font-semibold mt-4"
              style={{ color: theme.text }}
            >
              No assets added yet
            </Text>
            <Text
              className="text-center mt-2 px-8"
              style={{ color: theme.textSecondary }}
            >
              Add your assets to calculate your zakaat obligation
            </Text>
          </View>
        )}

        {/* Info Footer */}
        <Text
          className="text-center mt-6 text-xs px-4"
          style={{ color: theme.textSecondary }}
        >
          Zakaat is obligatory on wealth held for one lunar year. Rate: 2.5% •
          Consult a scholar for specific situations.
        </Text>
      </ScrollView>

      {/* Add Asset Modal */}
      <CustomModal
        visible={showAddModal}
        variant="bottom"
        onClose={() => setShowAddModal(false)}
        heading="Add Asset"
      >
        <ScrollView showsVerticalScrollIndicator={false} className="mb-12">
          {/* Category Selection */}
          <Text
            className="text-sm font-semibold mb-3"
            style={{ color: theme.textSecondary }}
          >
            Select Category
          </Text>
          <View className="gap-2 mb-4">
            {(
              Object.entries(CATEGORIES) as [AssetCategory, CategoryInfo][]
            ).map(([key, info]) => (
              <Pressable
                key={key}
                onPress={() => setSelectedCategory(key)}
                className="flex-row items-center p-3 rounded-xl border"
                style={{
                  backgroundColor:
                    selectedCategory === key
                      ? theme.primary + "22"
                      : theme.background,
                  borderColor:
                    selectedCategory === key
                      ? theme.primary
                      : (theme.accentLight ?? "#ffffff22"),
                }}
              >
                <View
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{
                    backgroundColor:
                      selectedCategory === key ? theme.primary : theme.card,
                  }}
                >
                  <Ionicons
                    name={info.icon as any}
                    size={20}
                    color={selectedCategory === key ? "#fff" : theme.text}
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold" style={{ color: theme.text }}>
                    {info.label}
                  </Text>
                  <Text
                    className="text-xs mt-1"
                    style={{ color: theme.textSecondary }}
                  >
                    {info.description}
                  </Text>
                </View>
                {selectedCategory === key && (
                  <Ionicons
                    name="checkmark-circle"
                    size={24}
                    color={theme.primary}
                  />
                )}
              </Pressable>
            ))}
          </View>

          {/* Asset Details */}
          <Text
            className="text-sm font-semibold mb-3"
            style={{ color: theme.textSecondary }}
          >
            Asset Details
          </Text>
          <TextInput
            value={assetName}
            onChangeText={setAssetName}
            placeholder="Asset name (e.g., Savings Account)"
            placeholderTextColor={theme.textSecondary}
            className="p-4 rounded-xl mb-3"
            style={{
              backgroundColor: theme.background,
              color: theme.text,
              borderWidth: 1,
              borderColor: theme.accentLight ?? "#ffffff22",
            }}
          />
          <TextInput
            value={assetValue}
            onChangeText={setAssetValue}
            placeholder="Value (e.g., 5000)"
            keyboardType="decimal-pad"
            placeholderTextColor={theme.textSecondary}
            className="p-4 rounded-xl mb-4"
            style={{
              backgroundColor: theme.background,
              color: theme.text,
              borderWidth: 1,
              borderColor: theme.accentLight ?? "#ffffff22",
            }}
          />

          <Pressable
            onPress={handleAddAsset}
            className="py-4 rounded-xl items-center"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="font-semibold text-base" style={{ color: "#fff" }}>
              Add Asset
            </Text>
          </Pressable>
        </ScrollView>
      </CustomModal>

      {/* Nisab Calculator Modal */}
      <CustomModal
        visible={showNisabModal}
        variant="bottom"
        onClose={() => setShowNisabModal(false)}
        heading="Nisab Calculator"
        description="Enter current prices to calculate nisab threshold. Nisab is the minimum amount of wealth required before zakaat is due."
      >
        <View className="">
          <Text
            className="text-xs font-semibold mb-2"
            style={{ color: theme.textSecondary }}
          >
            Silver Price (per gram)
          </Text>
          <TextInput
            value={silverPrice}
            onChangeText={setSilverPrice}
            placeholder="e.g., 0.75"
            keyboardType="decimal-pad"
            placeholderTextColor={theme.textSecondary}
            className="p-4 rounded-xl mb-4"
            style={{
              backgroundColor: theme.background,
              color: theme.text,
              borderWidth: 1,
              borderColor: theme.accentLight ?? "#ffffff22",
            }}
          />

          <Text
            className="text-xs font-semibold mb-2"
            style={{ color: theme.textSecondary }}
          >
            Gold Price (per gram)
          </Text>
          <TextInput
            value={goldPrice}
            onChangeText={setGoldPrice}
            placeholder="e.g., 65.00"
            keyboardType="decimal-pad"
            placeholderTextColor={theme.textSecondary}
            className="p-4 rounded-xl mb-4"
            style={{
              backgroundColor: theme.background,
              color: theme.text,
              borderWidth: 1,
              borderColor: theme.accentLight ?? "#ffffff22",
            }}
          />

          {nisabThreshold > 0 && (
            <View
              className="p-4 rounded-xl"
              style={{ backgroundColor: theme.primary + "22" }}
            >
              <Text
                className="text-xs mb-1"
                style={{ color: theme.textSecondary }}
              >
                Calculated Nisab Threshold
              </Text>
              <Text
                className="text-2xl font-bold"
                style={{ color: theme.primary }}
              >
                {formatCurrency(nisabThreshold)}
              </Text>
              <Text
                className="text-xs mt-2"
                style={{ color: theme.textSecondary }}
              >
                Based on {NISAB_SILVER_GRAMS}g silver or {NISAB_GOLD_GRAMS}g
                gold (lower value used)
              </Text>
            </View>
          )}

          <Pressable
            onPress={() => setShowNisabModal(false)}
            className="py-4 rounded-xl items-center mt-4"
            style={{ backgroundColor: theme.primary }}
          >
            <Text className="font-semibold" style={{ color: "#fff" }}>
              Done
            </Text>
          </Pressable>
        </View>
      </CustomModal>

      {/* Info Modal */}
      <CustomModal
        visible={showInfoModal}
        variant="bottom"
        onClose={() => setShowInfoModal(false)}
        heading="About Zakaat"
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="mb-4">
            <Text className="font-semibold mb-2" style={{ color: theme.text }}>
              What is Zakaat?
            </Text>
            <Text className="leading-6" style={{ color: theme.textSecondary }}>
              Zakaat is one of the Five Pillars of Islam. It's an obligatory
              charity on wealth that has been in your possession for one lunar
              year (hawl).
            </Text>
          </View>

          <View className="mb-4">
            <Text className="font-semibold mb-2" style={{ color: theme.text }}>
              Zakaat Rate
            </Text>
            <Text className="leading-6" style={{ color: theme.textSecondary }}>
              The standard rate is 2.5% of your zakaatable wealth. Different
              rates may apply to agricultural produce and livestock.
            </Text>
          </View>

          <View className="mb-4">
            <Text className="font-semibold mb-2" style={{ color: theme.text }}>
              Nisab Threshold
            </Text>
            <Text className="leading-6" style={{ color: theme.textSecondary }}>
              Nisab is the minimum amount of wealth before zakaat is due. It's
              equivalent to 85 grams of gold or 595 grams of silver. The lower
              value is typically used.
            </Text>
          </View>

          <View className="mb-4">
            <Text className="font-semibold mb-2" style={{ color: theme.text }}>
              Zakaatable Assets
            </Text>
            <Text className="leading-6" style={{ color: theme.textSecondary }}>
              Cash, savings, gold, silver, investments, business inventory,
              rental income, livestock, and money owed to you.
            </Text>
          </View>

          <View className="mb-4">
            <Text className="font-semibold mb-2" style={{ color: theme.text }}>
              Debts & Liabilities
            </Text>
            <Text className="leading-6" style={{ color: theme.textSecondary }}>
              Many scholars allow deducting immediate debts from your wealth
              before calculating zakaat. This calculator gives you the option to
              include or exclude debts.
            </Text>
          </View>

          <View
            className="p-4 rounded-xl"
            style={{ backgroundColor: theme.primary + "11" }}
          >
            <Text
              className="text-xs font-semibold"
              style={{ color: theme.primary }}
            >
              ⚠️ Important Note
            </Text>
            <Text
              className="text-xs mt-2 leading-5"
              style={{ color: theme.textSecondary }}
            >
              This calculator provides estimates. For specific situations,
              please consult a qualified Islamic scholar. Zakaat calculations
              can vary based on madhab and individual circumstances.
            </Text>
          </View>
        </ScrollView>
      </CustomModal>
    </SafeAreaView>
  );
};

export default ZakaatCalculatorScreen;
