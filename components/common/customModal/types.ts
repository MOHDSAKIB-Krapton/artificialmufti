import { Ionicons } from "@expo/vector-icons";

export interface CustomModalProps {
  heading?: string;
  description?: string;
  descriptionNumberOfLines?: number;
  descriptionIcon?: keyof typeof Ionicons.glyphMap;
  descriptionIconColor?: string;
  visible?: boolean;
  onClose?: () => void;
  onBack?: () => void;
  children?: React.ReactNode;
  isBottom?: boolean;
  showCloseButton?: boolean;
  containerStyle?: string;
  addPadding?: boolean;
  showBackButton?: boolean;
}
