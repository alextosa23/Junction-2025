// App.tsx
import React, { useState, useEffect } from "react";
import { SafeAreaView, Text } from "react-native";
import { OnboardingData } from "./src/screens/Onboarding";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import CategorySelection from "./src/screens/CategorySelection";
import OnboardingScreen from "./src/screens/OnboardingScreen"; // ✅ use this

type AppState = {
  hasCompletedOnboarding: boolean;
  hasSelectedCategories: boolean;
  profile: OnboardingData | null;
};

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    hasCompletedOnboarding: false,
    hasSelectedCategories: false,
    profile: null,
  });

  useEffect(() => {
    const loadAppState = async () => {
      // Mock loading - replace with actual storage
      const savedState = {
        hasCompletedOnboarding: false,
        hasSelectedCategories: false,
        profile: null,
      };
      setAppState(savedState);
    };
    loadAppState();
  }, []);

  const saveAppState = (newState: Partial<AppState>) => {
    setAppState(prev => ({ ...prev, ...newState }));
    // In real app, save to AsyncStorage here
  };

  // First-time user flow: show welcome screen
  if (!appState.hasCompletedOnboarding) {
    return (
      <WelcomeScreen
        onStartOnboarding={() => {
          saveAppState({ hasCompletedOnboarding: true });
        }}
      />
    );
  }

  // User has seen welcome screen but not completed onboarding (no profile yet)
  if (!appState.profile) {
    return (
      <OnboardingScreen
        onSaved={(data) => {
          console.log("📱 [App] Onboarding saved, profile:", data);
          saveAppState({ profile: data });
        }}
      />
    );
  }

  // User completed onboarding but hasn't selected categories
  if (!appState.hasSelectedCategories) {
    return (
      <CategorySelection
        userData={appState.profile}
        onCategoriesSelected={(selectedCategories) => {
          console.log("📂 [App] Selected categories:", selectedCategories);
          saveAppState({ hasSelectedCategories: true });
        }}
      />
    );
  }

  // Main app
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Main App Screen</Text>
      <Text style={{ fontSize: 16, marginTop: 20 }}>Welcome to your companion app!</Text>
      <Text style={{ fontSize: 14, marginTop: 10, textAlign: 'center' }}>
        This is where the main voice companion interface will be.
      </Text>
    </SafeAreaView>
  );
}
