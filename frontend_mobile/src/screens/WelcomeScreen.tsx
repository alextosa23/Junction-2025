import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from "react-native";

type WelcomeScreenProps = {
  onStartOnboarding: () => void;
};

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onStartOnboarding,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to the app</Text>
        <Text style={styles.subtitle}>
          This app is here to help you socialize, stay connected, and enjoy your day.
        </Text>

        <TouchableOpacity
          style={styles.button}
          onPress={onStartOnboarding}
          accessibilityRole="button"
          accessibilityLabel="Start setup"
        >
          <Text style={styles.buttonText}>Get started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 20,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 32,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: "#1D4ED8",
  },
  buttonText: {
    fontSize: 22,
    color: "#FFFFFF",
    fontWeight: "600",
  },
});

export default WelcomeScreen;
