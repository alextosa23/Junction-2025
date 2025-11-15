// App.tsx - UPDATED WITH PERSISTENT STORAGE
import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Onboarding, { OnboardingData } from "./src/screens/Onboarding";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import CategorySelection from "./src/screens/CategorySelection";

type AppState = {
  hasCompletedOnboarding: boolean;
  hasSelectedCategories: boolean;
  profile: OnboardingData | null;
};

// Storage keys
const STORAGE_KEYS = {
  APP_STATE: 'appState',
};

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    hasCompletedOnboarding: false,
    hasSelectedCategories: false,
    profile: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load app state from storage on app start
  useEffect(() => {
    const loadAppState = async () => {
      try {
        console.log("📱 Loading app state from storage...");
        const savedState = await AsyncStorage.getItem(STORAGE_KEYS.APP_STATE);
        
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          console.log("✅ Loaded saved state:", parsedState);
          setAppState(parsedState);
        } else {
          console.log("📝 No saved state found, using defaults");
          setAppState({
            hasCompletedOnboarding: false,
            hasSelectedCategories: false,
            profile: null,
          });
        }
      } catch (error) {
        console.error("❌ Error loading app state:", error);
        setAppState({
          hasCompletedOnboarding: false,
          hasSelectedCategories: false,
          profile: null,
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAppState();
  }, []);

  const saveAppState = async (newState: Partial<AppState>) => {
    try {
      const updatedState = { ...appState, ...newState };
      setAppState(updatedState);
      
      // Save to persistent storage
      await AsyncStorage.setItem(STORAGE_KEYS.APP_STATE, JSON.stringify(updatedState));
      console.log("💾 Saved app state:", updatedState);
    } catch (error) {
      console.error("❌ Error saving app state:", error);
    }
  };

  // Show loading screen while restoring state
  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Debug log
  console.log("🔍 CURRENT APP STATE:", appState);

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
      <Text style={{ fontSize: 16, marginTop: 20 }}>Welcome back, {appState.profile.name}!</Text>
      <Text style={{ fontSize: 14, marginTop: 10, textAlign: 'center' }}>
        This is where the main voice companion interface will be.
      </Text>
    </SafeAreaView>
  );
}