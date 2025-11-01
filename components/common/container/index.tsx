import { useTheme } from "@/hooks/useTheme";
import React from "react";
import { SafeAreaView, StyleSheet } from "react-native";

type ContainerProps = {
  children: React.ReactNode;
};

const Container = ({ children }: ContainerProps) => {
  const { theme } = useTheme();
  return (
    <SafeAreaView
      className="flex-1 px-4 py-2"
      style={{ backgroundColor: theme.background }}
    >
      {children}
    </SafeAreaView>
  );
};

export default Container;

const styles = StyleSheet.create({});
