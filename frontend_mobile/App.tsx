

// App.tsx - UPDATED WITH PERSISTENT STORAGE
import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Onboarding, { OnboardingData } from "./src/screens/Onboarding";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import CategorySelection from "./src/screens/CategorySelection";
<<<<<<< HEAD
import OnboardingScreen from "./src/screens/OnboardingScreen"; // ✅ use this
=======
import AddEvent from "./src/screens/AddEvent";
>>>>>>> 93171df (add event)

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
  const [showAddEvent, setShowAddEvent] = useState(false);

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


  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 18 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Debug log
  console.log("🔍 CURRENT APP STATE:", appState);


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
  /*if (!appState.hasSelectedCategories) {
    return (
      <CategorySelection
        userData={appState.profile}
        onCategoriesSelected={(selectedCategories) => {
          console.log("📂 [App] Selected categories:", selectedCategories);
          saveAppState({ hasSelectedCategories: true });
        }}
      />
    );
  }*/

  if (showAddEvent) {
    return (
      <AddEvent
        onSave={(event) => {
          console.log("Saved event:", event);
          setShowAddEvent(false); // Go back to category selection
        }}
      />
    );
  }

<<<<<<< HEAD
  // Main app
=======
  /*return (
    <CategorySelection
      userData={appState.profile}
      onCategoriesSelected={(selectedCategories) => {
        console.log("Selected categories:", selectedCategories);
        saveAppState({ hasSelectedCategories: true });
      }}
      onAddEvent={() => setShowAddEvent(true)} 
    />
  );*/

  if (!appState.hasSelectedCategories) {
    return (
      <CategorySelection
        userData={appState.profile}
        onCategoriesSelected={(categories) =>
          saveAppState({ hasSelectedCategories: true })
        }
        onAddEvent={() => setShowAddEvent(true)}  
      />
    );
  }

  

  // Main app - user has completed everything

>>>>>>> 93171df (add event)
  return (
    <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Main App Screen</Text>
      <Text style={{ fontSize: 16, marginTop: 20 }}>
        Welcome back, {appState.profile?.name}!
      </Text>
      <Text style={{ fontSize: 14, marginTop: 10, textAlign: 'center' }}>
        This is where the main voice companion interface will be.
      </Text>
    </SafeAreaView>
  );
}