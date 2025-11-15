// App.tsx - CORRECTED VERSION
import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, View } from "react-native";
import Onboarding, { OnboardingData } from "./src/screens/Onboarding";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import CategorySelection from "./src/screens/CategorySelection";

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

  // Load app state from storage on app start
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

  // First time user flow
  if (!appState.hasCompletedOnboarding) {
    return (
      <WelcomeScreen
        onStartOnboarding={() => {
          saveAppState({ hasCompletedOnboarding: true });
        }}
      />
    );
  }

  // User has seen welcome screen but not completed onboarding
  if (!appState.profile) {
    return (
      <Onboarding
        onFinish={(data) => {
          saveAppState({ profile: data });
          console.log("Onboarding finished:", data);
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
          console.log("Selected categories:", selectedCategories);
          saveAppState({ hasSelectedCategories: true });
          // Here you would also save the selected categories
        }}
      />
    );
  }

  // Main app - user has completed everything
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
