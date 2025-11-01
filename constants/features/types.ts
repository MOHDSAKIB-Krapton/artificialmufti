export type BadgeType = "NEW" | "BETA" | "SOON" | null;
export interface FeatureItem {
  id: string;
  label: string;
  subtitle?: string;
  route?: string; // undefined for coming soon
  icon?: { name: string; set?: "ion" | "mci" }; // fallback if no image
  badge?: BadgeType;
  category?: string;
  tint?: string; // hex for accent on the card
  locked?: boolean; // disables navigation
  highlight?: boolean; // visual boost
  tags?: string[];
}
