// types.ts
export type CustomModalProps = {
  visible: boolean;
  onClose: () => void;

  heading?: string;
  description?: string;
  descriptionNumberOfLines?: number;
  descriptionIcon?: any;
  descriptionIconColor?: string;

  children?: React.ReactNode;

  /** bottom sheet mode */
  isBottom?: boolean;

  /** Tailwind classes for content container */
  containerStyle?: string;
  addPadding?: boolean;

  showCloseButton?: boolean;
  showBackButton?: boolean;
  onBack?: () => void;

  /** New features */
  breakpoints?: number[]; // e.g. [0.5, 0.9]
  initialBreakpointIndex?: number; // default 0
  enableBackdropDismiss?: boolean; // default true
  enableSwipeDownToClose?: boolean; // center modal swipe-down
  backdropOpacity?: number; // default 0.5
};
