import React, { useState } from "react";
import Onboarding, { OnboardingData } from "./src/screens/Onboarding";
import WelcomeScreen from "./src/screens/WelcomeScreen";

export default function App() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [profile, setProfile] = useState<OnboardingData | null>(null);

  if (!showOnboarding) {
    return (
      <WelcomeScreen
        onStartOnboarding={() => {
          setShowOnboarding(true);
        }}
      />
    );
  }

  return (
    <Onboarding
      onFinish={(data) => {
        setProfile(data);
        console.log("Onboarding finished:", data);
      }}
    />
  );
}
