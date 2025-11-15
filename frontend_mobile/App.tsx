// App.tsx - UPDATED WITH PERSISTENT STORAGE + EVENTS SCREEN
import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Onboarding, { OnboardingData } from "./src/screens/Onboarding";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import CategorySelection from "./src/screens/CategorySelection";
import * as Notifications from "expo-notifications";
import OnboardingScreen from "./src/screens/OnboardingScreen"; // ✅ use this
import AddEvent from "./src/screens/AddEvent";
import EventsScreen from "./src/screens/EventsScreen"; // ✅ NEW: import events list

type AppState = {
  hasCompletedOnboarding: boolean;
  hasSelectedCategories: boolean;
  profile: OnboardingData | null;
};

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    } as Notifications.NotificationBehavior;
  },
});

// Storage keys
const STORAGE_KEYS = {
  APP_STATE: "appState",
};

export default function App() {
  const [appState, setAppState] = useState<AppState>({
    hasCompletedOnboarding: false,
    hasSelectedCategories: false,
    profile: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 🔹 NEW: which “extra” screen to show from CategorySelection
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEvents, setShowEvents] = useState(false); // ✅ NEW

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
      await AsyncStorage.setItem(
        STORAGE_KEYS.APP_STATE,
        JSON.stringify(updatedState)
      );
      console.log("💾 Saved app state:", updatedState);
    } catch (error) {
      console.error("❌ Error saving app state:", error);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
      >
        <Text style={{ fontSize: 18 }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  // Debug log
  console.log("🔍 CURRENT APP STATE:", appState);

  // 1️⃣ Welcome screen
  if (!appState.hasCompletedOnboarding) {
    return (
      <WelcomeScreen
        onStartOnboarding={() => {
          saveAppState({ hasCompletedOnboarding: true });
        }}
      />
    );
  }

  // 2️⃣ Onboarding (collect profile)
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

  // 🔹 EXTRA SCREENS FROM CATEGORY SELECTION STEP

  // 3️⃣ AddEvent screen (from "Add Event" button)
  if (showAddEvent) {
    return (
      <AddEvent
        onSave={(event) => {
          console.log("Saved event:", event);
          setShowAddEvent(false); // Go back to category selection
        }}
        onBack={() => setShowAddEvent(false)} // back button inside AddEvent
      />
    );
  }

  // 4️⃣ Events list screen (from "Your Events" button)
  if (showEvents) {
    return (
      <EventsScreen
        onBack={() => setShowEvents(false)} // you'll go back to CategorySelection
      />
    );
  }

  // 5️⃣ Category selection (shown until categories chosen)
  if (!appState.hasSelectedCategories) {
    return (
      <CategorySelection
        userData={appState.profile}
        onCategoriesSelected={(categories) =>
          saveAppState({ hasSelectedCategories: true })
        }
        onAddEvent={() => setShowAddEvent(true)}   // 👈 opens AddEvent
        onShowEvents={() => setShowEvents(true)}   // 👈 opens EventsScreen
      />
    );
  }

  // 6️⃣ Main app - user has completed everything
  return (
    <SafeAreaView
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>Main App Screen</Text>
      <Text style={{ fontSize: 16, marginTop: 20 }}>
        Welcome back, {appState.profile?.name}!
      </Text>
      <Text style={{ fontSize: 14, marginTop: 10, textAlign: "center" }}>
        This is where the main voice companion interface will be.
      </Text>
    </SafeAreaView>
  );
}
