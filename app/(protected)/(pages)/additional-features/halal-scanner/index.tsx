// HalalFoodScanner.tsx
import ProgressBar from "@/components/pagePartials/prayerTimes/progressBar";
import { useTheme } from "@/hooks/useTheme";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Types
type HalalStatus = "halal" | "haram" | "mushbooh" | "unknown";

interface Ingredient {
  name: string;
  code?: string;
  status: HalalStatus;
  reason?: string;
  alternatives?: string[];
  category?: string;
}

interface Product {
  id: string;
  name: string;
  barcode?: string;
  brand?: string;
  category: string;
  overallStatus: HalalStatus;
  ingredients: Ingredient[];
  certifications: string[];
  scannedAt: Date;
  imageUrl?: string;
  additionalInfo?: string;
}

interface ScanResult {
  product: Product;
  confidence: number;
  warnings: string[];
}

// E-Numbers Database (sample)
const E_NUMBERS_DB: Record<string, Ingredient> = {
  E120: {
    name: "Carmine/Cochineal",
    code: "E120",
    status: "haram",
    reason: "Derived from insects (cochineal beetles)",
    alternatives: ["E163 (Anthocyanins)", "Beetroot extract"],
    category: "Colorant",
  },
  E441: {
    name: "Gelatin",
    code: "E441",
    status: "mushbooh",
    reason: "May be from pork or beef source. Check certification.",
    alternatives: ["Agar-agar", "Pectin", "Carrageenan"],
    category: "Gelling agent",
  },
  E471: {
    name: "Mono- and Diglycerides",
    code: "E471",
    status: "mushbooh",
    reason: "Can be from animal or plant sources",
    alternatives: ["E322 (Lecithin - plant based)"],
    category: "Emulsifier",
  },
  E631: {
    name: "Disodium Inosinate",
    code: "E631",
    status: "mushbooh",
    reason: "May be derived from pork or fish",
    alternatives: ["Yeast extract", "Mushroom powder"],
    category: "Flavor enhancer",
  },
  E100: {
    name: "Curcumin",
    code: "E100",
    status: "halal",
    reason: "Plant-based colorant from turmeric",
    category: "Colorant",
  },
  E330: {
    name: "Citric Acid",
    code: "E330",
    status: "halal",
    reason: "Plant-based, commonly from citrus fruits",
    category: "Acidity regulator",
  },
};

// Haram ingredients keywords
const HARAM_KEYWORDS = [
  "pork",
  "bacon",
  "ham",
  "lard",
  "pepperoni",
  "prosciutto",
  "alcohol",
  "wine",
  "beer",
  "rum",
  "vodka",
  "sake",
  "gelatin",
  "carmine",
  "cochineal",
  "rennet",
];

// Mushbooh ingredients keywords
const MUSHBOOH_KEYWORDS = [
  "mono-diglycerides",
  "monoglycerides",
  "diglycerides",
  "glycerin",
  "glycerol",
  "whey",
  "enzymes",
  "lipase",
  "vanilla extract",
  "natural flavors",
  "artificial flavors",
];

const HalalFoodScanner = () => {
  const { theme } = useTheme();
  const [scanMode, setScanMode] = useState<"camera" | "manual" | "barcode">(
    "manual"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<Product[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Simulate barcode scan
  const simulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      const mockProduct: Product = {
        id: "1",
        name: "Chocolate Cookies",
        barcode: "8901234567890",
        brand: "Sweet Delights",
        category: "Snacks",
        overallStatus: "mushbooh",
        ingredients: [
          {
            name: "Wheat Flour",
            status: "halal",
            category: "Base ingredient",
          },
          {
            name: "Sugar",
            status: "halal",
            category: "Sweetener",
          },
          {
            name: "Cocoa Powder",
            status: "halal",
            category: "Flavoring",
          },
          {
            ...E_NUMBERS_DB["E471"],
          },
          {
            name: "Natural Flavors",
            status: "mushbooh",
            reason: "Source not specified. May contain alcohol-based extracts.",
            category: "Flavoring",
          },
          {
            ...E_NUMBERS_DB["E330"],
          },
        ],
        certifications: [],
        scannedAt: new Date(),
        additionalInfo:
          "Contains emulsifiers from unknown sources. Contact manufacturer for clarification.",
      };

      setScanResult({
        product: mockProduct,
        confidence: 87,
        warnings: [
          "Contains E471 (uncertain source)",
          "Natural flavors may contain alcohol",
          "No halal certification found",
        ],
      });
      setRecentScans((prev) => [mockProduct, ...prev.slice(0, 4)]);
      setIsScanning(false);
      setShowDetails(true);
    }, 2000);
  };

  // Analyze ingredients from text
  const analyzeIngredients = (text: string) => {
    setIsScanning(true);
    setTimeout(() => {
      const ingredients: Ingredient[] = [];
      const lowerText = text.toLowerCase();

      // Check for E-numbers
      Object.values(E_NUMBERS_DB).forEach((eNumber) => {
        if (lowerText.includes(eNumber.code!.toLowerCase())) {
          ingredients.push(eNumber);
        }
      });

      // Check for haram keywords
      HARAM_KEYWORDS.forEach((keyword) => {
        if (lowerText.includes(keyword)) {
          ingredients.push({
            name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
            status: "haram",
            reason: "Prohibited ingredient in Islamic dietary law",
            category: "Flagged ingredient",
          });
        }
      });

      // Check for mushbooh keywords
      MUSHBOOH_KEYWORDS.forEach((keyword) => {
        if (
          lowerText.includes(keyword) &&
          !ingredients.find((i) => i.name.toLowerCase() === keyword)
        ) {
          ingredients.push({
            name: keyword.charAt(0).toUpperCase() + keyword.slice(1),
            status: "mushbooh",
            reason: "Source verification required",
            category: "Doubtful ingredient",
          });
        }
      });

      // Determine overall status
      const hasHaram = ingredients.some((i) => i.status === "haram");
      const hasMushbooh = ingredients.some((i) => i.status === "mushbooh");

      const overallStatus: HalalStatus = hasHaram
        ? "haram"
        : hasMushbooh
          ? "mushbooh"
          : "halal";

      const mockProduct: Product = {
        id: Date.now().toString(),
        name: "Manual Scan Result",
        category: "User Input",
        overallStatus,
        ingredients,
        certifications: [],
        scannedAt: new Date(),
      };

      setScanResult({
        product: mockProduct,
        confidence: ingredients.length > 0 ? 75 : 50,
        warnings: hasHaram
          ? ["Contains prohibited (Haram) ingredients"]
          : hasMushbooh
            ? [
                "Contains doubtful (Mushbooh) ingredients - verify with manufacturer",
              ]
            : [],
      });
      setRecentScans((prev) => [mockProduct, ...prev.slice(0, 4)]);
      setIsScanning(false);
      setShowDetails(true);
    }, 1500);
  };

  const getStatusColor = (status: HalalStatus) => {
    switch (status) {
      case "halal":
        return "#10b981"; // green
      case "haram":
        return "#ef4444"; // red
      case "mushbooh":
        return "#f59e0b"; // orange
      default:
        return theme.textSecondary;
    }
  };

  const getStatusIcon = (status: HalalStatus) => {
    switch (status) {
      case "halal":
        return "checkmark-circle";
      case "haram":
        return "close-circle";
      case "mushbooh":
        return "alert-circle";
      default:
        return "help-circle";
    }
  };

  const toggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  return (
    <View className="flex-1" style={{ backgroundColor: theme.background }}>
      {/* Header */}
      <View
        className="rounded-2xl border p-4 mb-4"
        style={{
          borderColor: theme.accentLight ?? "#ffffff22",
          backgroundColor: theme.card,
        }}
      >
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-2xl font-bold" style={{ color: theme.text }}>
              Halal Scanner
            </Text>
            <Text
              className="text-sm mt-1"
              style={{ color: theme.textSecondary }}
            >
              Verify ingredients instantly
            </Text>
          </View>
          <View
            className="w-12 h-12 rounded-full items-center justify-center"
            style={{
              backgroundColor: theme.primaryLight ?? theme.primary + "20",
            }}
          >
            <Ionicons name="scan" size={24} color={theme.primary} />
          </View>
        </View>

        {/* Scan Mode Tabs */}
        <View className="flex-row space-x-2 mb-4">
          {[
            {
              mode: "barcode" as const,
              icon: "barcode-outline",
              label: "Barcode",
            },
            { mode: "camera" as const, icon: "camera-outline", label: "Photo" },
            { mode: "manual" as const, icon: "text-outline", label: "Manual" },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.mode}
              onPress={() => setScanMode(tab.mode)}
              className="flex-1 py-3 rounded-lg items-center flex-row justify-center"
              style={{
                backgroundColor:
                  scanMode === tab.mode ? theme.primary : theme.background,
              }}
            >
              <Ionicons
                name={tab.icon as any}
                size={18}
                color={scanMode === tab.mode ? "#fff" : theme.textSecondary}
                style={{ marginRight: 4 }}
              />
              <Text
                className="text-sm font-semibold"
                style={{
                  color: scanMode === tab.mode ? "#fff" : theme.textSecondary,
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Search/Input Area */}
        {scanMode === "manual" && (
          <View>
            <View
              className="flex-row items-center px-4 py-3 rounded-lg mb-3"
              style={{ backgroundColor: theme.background }}
            >
              <Ionicons name="search" size={20} color={theme.textSecondary} />
              <TextInput
                className="flex-1 ml-2"
                placeholder="Enter ingredients or E-numbers..."
                placeholderTextColor={theme.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={{ color: theme.text, fontSize: 15 }}
                multiline
              />
            </View>
            <TouchableOpacity
              onPress={() => analyzeIngredients(searchQuery)}
              disabled={!searchQuery.trim() || isScanning}
              className="py-3 rounded-lg items-center flex-row justify-center"
              style={{
                backgroundColor:
                  searchQuery.trim() && !isScanning
                    ? theme.primary
                    : theme.accentLight,
              }}
            >
              {isScanning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="analytics"
                    size={18}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text className="text-white font-semibold">
                    Analyze Ingredients
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {scanMode === "barcode" && (
          <View
            className="p-8 rounded-lg items-center"
            style={{ backgroundColor: theme.background }}
          >
            <View
              className="w-32 h-32 rounded-2xl items-center justify-center mb-4"
              style={{
                backgroundColor: theme.card,
                borderWidth: 2,
                borderColor: theme.primary,
                borderStyle: "dashed",
              }}
            >
              <Ionicons
                name="barcode-outline"
                size={64}
                color={theme.primary}
              />
            </View>
            <Text
              className="text-sm mb-4"
              style={{ color: theme.textSecondary }}
            >
              Position barcode within frame
            </Text>
            <TouchableOpacity
              onPress={simulateScan}
              disabled={isScanning}
              className="px-6 py-3 rounded-lg"
              style={{ backgroundColor: theme.primary }}
            >
              {isScanning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white font-semibold">Start Scanning</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {scanMode === "camera" && (
          <View
            className="p-8 rounded-lg items-center"
            style={{ backgroundColor: theme.background }}
          >
            <View
              className="w-32 h-32 rounded-2xl items-center justify-center mb-4"
              style={{
                backgroundColor: theme.card,
                borderWidth: 2,
                borderColor: theme.primary,
                borderStyle: "dashed",
              }}
            >
              <Ionicons name="camera" size={64} color={theme.primary} />
            </View>
            <Text
              className="text-sm text-center mb-4"
              style={{ color: theme.textSecondary }}
            >
              Take a photo of the ingredient list
            </Text>
            <TouchableOpacity
              onPress={simulateScan}
              disabled={isScanning}
              className="px-6 py-3 rounded-lg flex-row items-center"
              style={{ backgroundColor: theme.primary }}
            >
              {isScanning ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name="camera"
                    size={18}
                    color="#fff"
                    style={{ marginRight: 6 }}
                  />
                  <Text className="text-white font-semibold">
                    Capture Image
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Quick E-Number Lookup */}
      <View
        className="rounded-2xl border p-4 mb-4"
        style={{
          borderColor: theme.accentLight ?? "#ffffff22",
          backgroundColor: theme.card,
        }}
      >
        <View className="flex-row items-center mb-3">
          <Ionicons
            name="library"
            size={20}
            color={theme.primary}
            style={{ marginRight: 8 }}
          />
          <Text className="font-bold text-base" style={{ color: theme.text }}>
            Quick E-Number Lookup
          </Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {Object.values(E_NUMBERS_DB).map((eNumber, idx) => (
            <TouchableOpacity
              key={idx}
              className="mr-2 px-3 py-2 rounded-lg"
              style={{
                backgroundColor: theme.background,
                borderWidth: 1,
                borderColor: getStatusColor(eNumber.status) + "40",
              }}
              onPress={() => {
                setScanResult({
                  product: {
                    id: Date.now().toString(),
                    name: `${eNumber.code} - ${eNumber.name}`,
                    category: "E-Number Lookup",
                    overallStatus: eNumber.status,
                    ingredients: [eNumber],
                    certifications: [],
                    scannedAt: new Date(),
                  },
                  confidence: 100,
                  warnings:
                    eNumber.status !== "halal" ? [eNumber.reason || ""] : [],
                });
                setShowDetails(true);
              }}
            >
              <View className="flex-row items-center">
                <Ionicons
                  name={getStatusIcon(eNumber.status) as any}
                  size={14}
                  color={getStatusColor(eNumber.status)}
                  style={{ marginRight: 4 }}
                />
                <Text
                  className="font-semibold text-xs"
                  style={{ color: theme.text }}
                >
                  {eNumber.code}
                </Text>
              </View>
              <Text
                className="text-[10px] mt-1"
                style={{ color: theme.textSecondary }}
              >
                {eNumber.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent Scans */}
      {recentScans.length > 0 && (
        <View className="mb-4">
          <Text
            className="text-sm font-semibold mb-2"
            style={{ color: theme.textSecondary }}
          >
            RECENT SCANS
          </Text>
          {recentScans.map((product, idx) => (
            <TouchableOpacity
              key={idx}
              className="rounded-xl border p-3 mb-2 flex-row items-center"
              style={{
                borderColor: theme.accentLight ?? "#ffffff22",
                backgroundColor: theme.card,
              }}
              onPress={() => {
                setScanResult({
                  product,
                  confidence: 85,
                  warnings: [],
                });
                setShowDetails(true);
              }}
            >
              <View
                className="w-10 h-10 rounded-full items-center justify-center mr-3"
                style={{
                  backgroundColor: getStatusColor(product.overallStatus) + "20",
                }}
              >
                <Ionicons
                  name={getStatusIcon(product.overallStatus) as any}
                  size={20}
                  color={getStatusColor(product.overallStatus)}
                />
              </View>
              <View className="flex-1">
                <Text className="font-semibold" style={{ color: theme.text }}>
                  {product.name}
                </Text>
                <Text
                  className="text-xs mt-0.5"
                  style={{ color: theme.textSecondary }}
                >
                  {product.brand ? `${product.brand} • ` : ""}
                  {product.ingredients.length} ingredients
                </Text>
              </View>
              <Ionicons
                name="chevron-forward"
                size={20}
                color={theme.textSecondary}
              />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Details Modal */}
      <Modal
        visible={showDetails}
        animationType="slide"
        transparent
        onRequestClose={() => setShowDetails(false)}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="flex-1"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
            onPress={() => setShowDetails(false)}
          />
          <View
            className="rounded-t-3xl p-6"
            style={{
              backgroundColor: theme.background,
              maxHeight: "90%",
            }}
          >
            {scanResult && (
              <ScanResultDetails
                result={scanResult}
                theme={theme}
                onClose={() => setShowDetails(false)}
                isFavorite={favorites.includes(scanResult.product.id)}
                onToggleFavorite={() => toggleFavorite(scanResult.product.id)}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Scan Result Details Component
const ScanResultDetails = ({
  result,
  theme,
  onClose,
  isFavorite,
  onToggleFavorite,
  getStatusColor,
  getStatusIcon,
}: {
  result: ScanResult;
  theme: any;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  getStatusColor: (status: HalalStatus) => string;
  getStatusIcon: (status: HalalStatus) => string;
}) => {
  const { product, confidence, warnings } = result;
  const statusColor = getStatusColor(product.overallStatus);

  const statusLabels = {
    halal: "Halal ✓",
    haram: "Haram ✗",
    mushbooh: "Mushbooh ⚠",
    unknown: "Unknown ?",
  };

  const halalCount = product.ingredients.filter(
    (i) => i.status === "halal"
  ).length;
  const haramCount = product.ingredients.filter(
    (i) => i.status === "haram"
  ).length;
  const mushboohCount = product.ingredients.filter(
    (i) => i.status === "mushbooh"
  ).length;

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text
          className="text-2xl font-bold flex-1"
          style={{ color: theme.text }}
        >
          Scan Result
        </Text>
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={onToggleFavorite}
            className="w-10 h-10 rounded-full items-center justify-center mr-2"
            style={{ backgroundColor: theme.card }}
          >
            <Ionicons
              name={isFavorite ? "heart" : "heart-outline"}
              size={20}
              color={isFavorite ? "#ef4444" : theme.textSecondary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onClose}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: theme.card }}
          >
            <Ionicons name="close" size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Overall Status Card */}
      <View
        className="rounded-2xl p-6 mb-4"
        style={{
          backgroundColor: statusColor + "15",
          borderWidth: 2,
          borderColor: statusColor,
        }}
      >
        <View className="items-center">
          <View
            className="w-20 h-20 rounded-full items-center justify-center mb-3"
            style={{ backgroundColor: statusColor + "30" }}
          >
            <Ionicons
              name={getStatusIcon(product.overallStatus) as any}
              size={40}
              color={statusColor}
            />
          </View>
          <Text
            className="text-2xl font-bold mb-2"
            style={{ color: statusColor }}
          >
            {statusLabels[product.overallStatus]}
          </Text>
          <Text
            className="text-center font-semibold text-lg mb-1"
            style={{ color: theme.text }}
          >
            {product.name}
          </Text>
          {product.brand && (
            <Text
              className="text-center text-sm"
              style={{ color: theme.textSecondary }}
            >
              {product.brand}
            </Text>
          )}
          {product.barcode && (
            <View className="flex-row items-center mt-2">
              <Ionicons
                name="barcode-outline"
                size={14}
                color={theme.textSecondary}
              />
              <Text
                className="text-xs ml-1"
                style={{ color: theme.textSecondary }}
              >
                {product.barcode}
              </Text>
            </View>
          )}
        </View>

        {/* Confidence & Stats */}
        <View className="mt-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text
              className="text-xs font-semibold"
              style={{ color: theme.textSecondary }}
            >
              Analysis Confidence
            </Text>
            <Text className="text-xs font-bold" style={{ color: statusColor }}>
              {confidence}%
            </Text>
          </View>
          <ProgressBar
            trackColor={theme.background + "80"}
            fillColor={statusColor}
            pct={confidence}
          />
        </View>

        {/* Ingredient Summary */}
        <View
          className="flex-row justify-around mt-4 pt-4"
          style={{ borderTopWidth: 1, borderTopColor: statusColor + "30" }}
        >
          <View className="items-center">
            <Text
              className="text-2xl font-bold"
              style={{ color: getStatusColor("halal") }}
            >
              {halalCount}
            </Text>
            <Text
              className="text-xs mt-1"
              style={{ color: theme.textSecondary }}
            >
              Halal
            </Text>
          </View>
          <View className="items-center">
            <Text
              className="text-2xl font-bold"
              style={{ color: getStatusColor("mushbooh") }}
            >
              {mushboohCount}
            </Text>
            <Text
              className="text-xs mt-1"
              style={{ color: theme.textSecondary }}
            >
              Doubtful
            </Text>
          </View>
          <View className="items-center">
            <Text
              className="text-2xl font-bold"
              style={{ color: getStatusColor("haram") }}
            >
              {haramCount}
            </Text>
            <Text
              className="text-xs mt-1"
              style={{ color: theme.textSecondary }}
            >
              Haram
            </Text>
          </View>
        </View>
      </View>

      {/* Warnings */}
      {warnings.length > 0 && (
        <View
          className="rounded-xl p-4 mb-4"
          style={{
            backgroundColor: getStatusColor("mushbooh") + "15",
            borderWidth: 1,
            borderColor: getStatusColor("mushbooh") + "40",
          }}
        >
          <View className="flex-row items-center mb-2">
            <Ionicons
              name="warning"
              size={18}
              color={getStatusColor("mushbooh")}
              style={{ marginRight: 6 }}
            />
            <Text
              className="font-bold"
              style={{ color: getStatusColor("mushbooh") }}
            >
              Warnings
            </Text>
          </View>
          {warnings.map((warning, idx) => (
            <Text
              key={idx}
              className="text-sm leading-5 mb-1"
              style={{ color: theme.text }}
            >
              • {warning}
            </Text>
          ))}
        </View>
      )}

      {/* Certifications */}
      {product.certifications.length > 0 && (
        <View className="mb-4">
          <Text
            className="text-sm font-semibold mb-2"
            style={{ color: theme.textSecondary }}
          >
            CERTIFICATIONS
          </Text>
          <View className="flex-row flex-wrap">
            {product.certifications.map((cert, idx) => (
              <View
                key={idx}
                className="mr-2 mb-2 px-3 py-2 rounded-lg flex-row items-center"
                style={{
                  backgroundColor: getStatusColor("halal") + "20",
                  borderWidth: 1,
                  borderColor: getStatusColor("halal"),
                }}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={14}
                  color={getStatusColor("halal")}
                  style={{ marginRight: 4 }}
                />
                <Text
                  className="text-xs font-semibold"
                  style={{ color: getStatusColor("halal") }}
                >
                  {cert}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Ingredients List */}
      <View className="mb-4">
        <Text
          className="text-sm font-semibold mb-3"
          style={{ color: theme.textSecondary }}
        >
          INGREDIENT ANALYSIS ({product.ingredients.length})
        </Text>
        {product.ingredients.map((ingredient, idx) => (
          <IngredientCard
            key={idx}
            ingredient={ingredient}
            theme={theme}
            getStatusColor={getStatusColor}
            getStatusIcon={getStatusIcon}
          />
        ))}
      </View>

      {/* Additional Info */}
      {product.additionalInfo && (
        <View
          className="rounded-xl p-4 mb-4"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.accentLight,
          }}
        >
          <View className="flex-row items-center mb-2">
            <Ionicons
              name="information-circle"
              size={18}
              color={theme.primary}
              style={{ marginRight: 6 }}
            />
            <Text className="font-bold" style={{ color: theme.text }}>
              Additional Information
            </Text>
          </View>
          <Text
            className="text-sm leading-5"
            style={{ color: theme.textSecondary }}
          >
            {product.additionalInfo}
          </Text>
        </View>
      )}

      {/* Action Buttons */}
      <View className="flex-row space-x-2 mb-6">
        <TouchableOpacity
          className="flex-1 py-3 rounded-lg flex-row items-center justify-center"
          style={{
            backgroundColor: theme.card,
            borderWidth: 1,
            borderColor: theme.accentLight,
          }}
        >
          <Ionicons
            name="share-social"
            size={18}
            color={theme.primary}
            style={{ marginRight: 6 }}
          />
          <Text className="font-semibold" style={{ color: theme.primary }}>
            Share
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 py-3 rounded-lg flex-row items-center justify-center"
          style={{ backgroundColor: theme.primary }}
        >
          <Ionicons
            name="document-text"
            size={18}
            color="#fff"
            style={{ marginRight: 6 }}
          />
          <Text className="font-semibold text-white">Full Report</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// Ingredient Card Component
const IngredientCard = ({
  ingredient,
  theme,
  getStatusColor,
  getStatusIcon,
}: {
  ingredient: Ingredient;
  theme: any;
  getStatusColor: (status: HalalStatus) => string;
  getStatusIcon: (status: HalalStatus) => string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const statusColor = getStatusColor(ingredient.status);

  return (
    <Pressable
      onPress={() => setIsExpanded(!isExpanded)}
      className="rounded-xl border p-3 mb-2"
      style={{
        borderColor: statusColor + "40",
        backgroundColor: theme.card,
      }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <View
            className="w-8 h-8 rounded-full items-center justify-center mr-3"
            style={{ backgroundColor: statusColor + "20" }}
          >
            <Ionicons
              name={getStatusIcon(ingredient.status) as any}
              size={16}
              color={statusColor}
            />
          </View>
          <View className="flex-1">
            <Text className="font-semibold" style={{ color: theme.text }}>
              {ingredient.name}
            </Text>
            {ingredient.code && (
              <Text
                className="text-xs mt-0.5"
                style={{ color: theme.textSecondary }}
              >
                {ingredient.code}
                {ingredient.category && ` • ${ingredient.category}`}
              </Text>
            )}
          </View>
        </View>
        <Ionicons
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={20}
          color={theme.textSecondary}
        />
      </View>

      {isExpanded && (
        <View
          className="mt-3 pt-3"
          style={{ borderTopWidth: 1, borderTopColor: theme.accentLight }}
        >
          {ingredient.reason && (
            <View
              className="p-3 rounded-lg mb-2"
              style={{ backgroundColor: theme.background }}
            >
              <Text
                className="text-xs font-semibold mb-1"
                style={{ color: theme.textSecondary }}
              >
                REASON
              </Text>
              <Text className="text-sm leading-5" style={{ color: theme.text }}>
                {ingredient.reason}
              </Text>
            </View>
          )}

          {ingredient.alternatives && ingredient.alternatives.length > 0 && (
            <View>
              <Text
                className="text-xs font-semibold mb-2"
                style={{ color: theme.textSecondary }}
              >
                HALAL ALTERNATIVES
              </Text>
              {ingredient.alternatives.map((alt, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center mb-1 px-2 py-1"
                >
                  <Ionicons
                    name="arrow-forward"
                    size={12}
                    color={getStatusColor("halal")}
                    style={{ marginRight: 6 }}
                  />
                  <Text className="text-sm" style={{ color: theme.text }}>
                    {alt}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}
    </Pressable>
  );
};

export default HalalFoodScanner;
