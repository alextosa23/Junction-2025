import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Onboarding, { OnboardingData } from "./src/screens/Onboarding";
import WelcomeScreen from "./src/screens/WelcomeScreen";
import CategorySelection from "./src/screens/CategorySelection";
import * as Notifications from "expo-notifications";
import OnboardingScreen from "./src/screens/OnboardingScreen";
import AddEvent from "./src/screens/AddEvent";
import EventsScreen from "./src/screens/EventsScreen";
import { registerForNotificationsAsync } from "./src/services/notifications";
import VoiceButton from "./src/screens/VoiceButton";
import VoiceScreen from "./src/screens/VoiceScreen";
import CameraButton from "./src/screens/CameraButton";
import PhotoHelpScreen from "./src/screens/PhotoHelpScreen";

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

  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showEvents, setShowEvents] = useState(false);
  const [showPhotoHelp, setShowPhotoHelp] = useState(false);

  const [showVoice, setShowVoice] = useState(false); // controls VoiceScreen

  useEffect(() => {
    registerForNotificationsAsync();
  }, []);

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

  console.log("🔍 CURRENT APP STATE:", appState);

  // Voice screen overrides everything
  if (showVoice) {
    return <VoiceScreen onBack={() => setShowVoice(false)} />;
  }

  // Photo help screen
  if (showPhotoHelp) {
    return <PhotoHelpScreen onBack={() => setShowPhotoHelp(false)} />;
  }

  if (!appState.hasCompletedOnboarding) {
    return (
      <WelcomeScreen
        onStartOnboarding={() => {
          saveAppState({ hasCompletedOnboarding: true });
        }}
      />
    );
  }

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

  if (showAddEvent) {
    return (
      <AddEvent
        onSave={(event) => {
          console.log("Saved event:", event);
          setShowAddEvent(false);
        }}
        onBack={() => setShowAddEvent(false)}
      />
    );
  }

  if (showEvents) {
    return (
      <EventsScreen
        onBack={() => setShowEvents(false)}
      />
    );
  }

  if (!appState.hasSelectedCategories) {
    return (
      <CategorySelection
        userData={appState.profile}
        onCategoriesSelected={(categories) =>
          saveAppState({ hasSelectedCategories: true })
        }
        onShowEvents={() => setShowEvents(true)}
        onAddEvent={() => setShowAddEvent(true)}
        onOpenVoice={() => setShowVoice(true)}
        onOpenCamera={() => setShowPhotoHelp(true)}
      />
    );
  }

  // Main app - user has completed everything
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 24, fontWeight: "bold" }}>
          Main App Screen
        </Text>
        <Text style={{ fontSize: 16, marginTop: 20 }}>
          Welcome back, {appState.profile?.name}!
        </Text>
        <Text style={{ fontSize: 14, marginTop: 10, textAlign: "center" }}>
          This is where the main voice companion interface will be.
        </Text>
      </View>

      {/* Mic + Camera in bottom-right */}
      <View
        style={{
          position: "absolute",
          bottom: 32,
          right: 24,
          flexDirection: "row",
          gap: 16,
        }}
      >
        <VoiceButton onPress={() => setShowVoice(true)} />
        <CameraButton onPress={() => setShowPhotoHelp(true)} />
      </View>
    </SafeAreaView>
  );
}
