import { View } from "react-native";

const Capsule = ({
  theme,
  children,
}: {
  theme: any;
  children: React.ReactNode;
}) => (
  <View
    className="px-2 py-1 rounded-full flex-row items-center"
    style={{ backgroundColor: theme.accentLight ?? "#ffffff16" }}
  >
    {children}
  </View>
);

export default Capsule;
