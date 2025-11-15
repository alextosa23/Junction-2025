import React from "react";
import { Alert } from "react-native";
import Onboarding, { OnboardingData } from "./Onboarding";

const API_URL = "http://192.168.100.39:8000/preferences";

type PreferenceCreate = {
  device_id: string;
  name: string;
  age: number;
  location: {
    latitude: number;
    longitude: number;
  };
  activities: string[];
  topics: string[];
  chat_times: string[];
  activity_type: string;
  looking_for: string[];
};

type Preference = {
  device_id: string;
  name: string;
  age: number;
  location: {
    latitude: number;
    longitude: number;
  };
  activities: string[];
  topics: string[];
  chat_times: string[];
  activity_type: string;
  looking_for: string[];
  timestamp: string;
};

type OnboardingScreenProps = {
  onSaved: (data: OnboardingData) => void;
};

// TODO: replace this with a real device id
const getDeviceId = () => {
  return "demo-device-id-123";
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onSaved }) => {
  console.log("🟢 [OnboardingScreen] mounted");

  const handleFinish = async (data: OnboardingData) => {
    console.log("📝 [OnboardingScreen] onFinish data:", data);

    const ageNumber = parseInt(data.age, 10);
    if (Number.isNaN(ageNumber)) {
      Alert.alert("Invalid age", "Please enter a valid number for age.");
      return;
    }

    let latitude = NaN;
    let longitude = NaN;

    if (data.location) {
      const parts = data.location.split(",");
      if (parts.length === 2) {
        latitude = parseFloat(parts[0].trim());
        longitude = parseFloat(parts[1].trim());
      }
    }

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      Alert.alert(
        "Location error",
        "Could not read your location. Please try again."
      );
      return;
    }

    const payload: PreferenceCreate = {
      device_id: getDeviceId(),
      name: data.name,
      age: ageNumber,
      location: {
        latitude,
        longitude,
      },
      activities: data.activities,
      topics: data.topics,
      chat_times: data.chatTime ? [data.chatTime] : [],
      activity_type: data.activityPlace ?? "",
      looking_for: data.goals,
    };

    console.log("📤 [OnboardingScreen] Sending payload to backend:", payload);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("📥 [OnboardingScreen] Backend responded with status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("❌ [OnboardingScreen] Backend error:", response.status, errorText);
        Alert.alert(
          "Error",
          `Could not save your preferences. (Status ${response.status})`
        );
        return;
      }

      const createdPreference: Preference = await response.json();
      console.log("✅ [OnboardingScreen] Preference saved:", createdPreference);

      Alert.alert("All set!", "Your preferences have been saved.");

      // notify App that everything is done
      onSaved(data);
    } catch (err) {
      console.error("🌐 [OnboardingScreen] Network error:", err);
      Alert.alert(
        "Network error",
        "Could not reach the server. Please check your connection."
      );
    }
  };

  return <Onboarding onFinish={handleFinish} />;
};

export default OnboardingScreen;
