import { router } from "expo-router";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

const RootScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>RootScreen</Text>
      <Button title="Press me" onPress={() => router.push("/onboarding")} />
    </View>
  );
};

export default RootScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  text: {
    fontSize: 24,
    fontWeight: "bold",
  },
});
