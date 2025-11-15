import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,

} from "react-native";
import type { OnboardingData } from "./Onboarding";

type UserProfileScreenProps = {
  initialData: OnboardingData;
  onBack: () => void;
  onSave: (data: OnboardingData) => void;
};

const activityOptions = [
  "Reading books",
  "Talking with family",
  "Gardening",
  "Music",
  "Walking",
  "Crafts",
  "Games/Puzzles",
];

const topicOptions = [
  "Family",
  "Memories",
  "Hobbies",
  "Travel",
  "News",
  "Technology",
  "Crafts",
  "Sports",
];

const chatTimeOptions = ["Morning", "Afternoon", "Evening", "Anytime"];

const activityPlaceOptions = ["Mostly indoors", "Mostly outdoors", "Both"];

const goalOptions = [
  "Daily activity ideas",
  "Conversation topics",
  "Ways to stay connected",
  "Digital communication help",
  "Light entertainment",
  "Memory-friendly activities",
];

export const UserProfileScreen: React.FC<UserProfileScreenProps> = ({
  initialData,
  onBack,
  onSave,
}) => {
  const [name, setName] = useState(initialData.name);
  const [age, setAge] = useState(initialData.age);
  const [location, setLocation] = useState(initialData.location);
  const [activities, setActivities] = useState<string[]>(initialData.activities);
  const [topics, setTopics] = useState<string[]>(initialData.topics);
  const [chatTime, setChatTime] = useState<string | null>(initialData.chatTime);
  const [activityPlace, setActivityPlace] = useState<string | null>(
    initialData.activityPlace
  );
  const [goals, setGoals] = useState<string[]>(initialData.goals);

  const toggleMultiSelect = (
    value: string,
    selected: string[],
    setter: (next: string[]) => void
  ) => {
    if (selected.includes(value)) {
      setter(selected.filter((item) => item !== value));
    } else {
      setter([...selected, value]);
    }
  };

const handleSave = async () => {
  // 1) Update local OnboardingData for the app
  const updated: OnboardingData = {
    name,
    age,
    location,      // still a string for the UI
    activities,
    topics,
    chatTime,
    activityPlace,
    goals,
  };

  // 2) Build backend payload (matches PreferenceCreate)
  // For now we send dummy coords; you can later plug in real ones
const payload = {
  device_id: "demo-device-id-123",
  name,
  location: {
    lat: 0.0,
    lng: 0.0,
  },
  activities,
  topics,
  chat_times: chatTime ? [chatTime] : [],
  activity_type: activityPlace ?? "",
  looking_for: goals,
};


  try {
    const res = await fetch("/{preference_id}", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const txt = await res.text();
      console.error("Backend error:", txt);
      Alert.alert("Error", "Could not save your changes to the server.");
      // still call onSave so the UI updates
      onSave(updated);
      return;
    }

    const json = await res.json();
    console.log("Preference saved from profile screen:", json);

    Alert.alert("Changes saved", "Your preferences have been saved.");
    onSave(updated); // let the parent know about the new values
  } catch (e) {
    console.error("Network error:", e);
    Alert.alert("Error", "Could not contact the server.");
    onSave(updated);
  }
};


  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My details</Text>
        <View style={{ width: 72 }} />{/* spacer */}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* About you */}
        <Text style={styles.sectionTitle}>About you</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor="#6B7280"
        />

        <Text style={styles.label}>Age</Text>
        <TextInput
          style={styles.input}
          value={age}
          onChangeText={setAge}
          keyboardType="number-pad"
          placeholder="Your age"
          placeholderTextColor="#6B7280"
        />

        <Text style={styles.label}>Where you live</Text>
        <TextInput
          style={styles.input}
          value={location}
          onChangeText={setLocation}
          placeholder="City / area"
          placeholderTextColor="#6B7280"
        />

        {/* Activities */}
        <Text style={styles.sectionTitle}>Activities you enjoy</Text>
        <Text style={styles.helper}>
          Tap the ones that feel right. You can choose more than one.
        </Text>
        {activityOptions.map((option) => (
          <OptionButton
            key={option}
            label={option}
            selected={activities.includes(option)}
            onPress={() =>
              toggleMultiSelect(option, activities, setActivities)
            }
          />
        ))}

        {/* Topics */}
        <Text style={styles.sectionTitle}>Topics you like to talk about</Text>
        <Text style={styles.helper}>You can choose more than one.</Text>
        {topicOptions.map((option) => (
          <OptionButton
            key={option}
            label={option}
            selected={topics.includes(option)}
            onPress={() => toggleMultiSelect(option, topics, setTopics)}
          />
        ))}

        {/* Chat time */}
        <Text style={styles.sectionTitle}>When you prefer to chat</Text>
        {chatTimeOptions.map((option) => (
          <OptionButton
            key={option}
            label={option}
            selected={chatTime === option}
            onPress={() => setChatTime(option)}
          />
        ))}

        {/* Activity place */}
        <Text style={styles.sectionTitle}>Activity places</Text>
        {activityPlaceOptions.map((option) => (
          <OptionButton
            key={option}
            label={option}
            selected={activityPlace === option}
            onPress={() => setActivityPlace(option)}
          />
        ))}

        {/* Goals */}
        <Text style={styles.sectionTitle}>What you want from Bondy</Text>
        <Text style={styles.helper}>You can choose more than one.</Text>
        {goalOptions.map((option) => (
          <OptionButton
            key={option}
            label={option}
            selected={goals.includes(option)}
            onPress={() => toggleMultiSelect(option, goals, setGoals)}
          />
        ))}

      
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>Save changes</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

type OptionButtonProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

const OptionButton: React.FC<OptionButtonProps> = ({
  label,
  selected,
  onPress,
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={[styles.optionButton, selected && styles.optionButtonSelected]}
    accessibilityRole="button"
    accessibilityState={{ selected }}
  >
    <Text
      style={[
        styles.optionButtonText,
        selected && styles.optionButtonTextSelected,
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerButtonText: {
    fontSize: 18,
    color: "#2563EB",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 24,
    marginBottom: 8,
  },
  label: {
    fontSize: 18,
    color: "#374151",
    marginTop: 12,
    marginBottom: 4,
  },
  helper: {
    fontSize: 16,
    color: "#4B5563",
    marginBottom: 8,
  },
  input: {
    fontSize: 18,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },
  optionButton: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: "#1D4ED8",
    borderColor: "#1D4ED8",
  },
  optionButtonText: {
    fontSize: 18,
    color: "#111827",
  },
  optionButtonTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  saveButton: {
    marginTop: 24,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 14,
    backgroundColor: "#16A34A",
    alignItems: "center",
  },
  saveButtonText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "700",
  },
});

export default UserProfileScreen;
