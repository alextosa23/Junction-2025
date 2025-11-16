import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import type { OnboardingData } from "./Onboarding";

const API_BASE_URL = "https://junction-2025.onrender.com";

type UserProfileScreenProps = {
  initialData: OnboardingData;
  onBack: () => void;
  onSave: (data: OnboardingData) => void;
  preferenceId: string;
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
  preferenceId,
}) => {
  const [name, setName] = useState(initialData.name);
  const [age, setAge] = useState(initialData.age);
  const [location, setLocation] = useState(initialData.location); // "lat, lng"
  const [activities, setActivities] = useState<string[]>(initialData.activities);
  const [topics, setTopics] = useState<string[]>(initialData.topics);
  const [chatTime, setChatTime] = useState<string | null>(initialData.chatTime);
  const [activityPlace, setActivityPlace] = useState<string | null>(
    initialData.activityPlace
  );
  const [goals, setGoals] = useState<string[]>(initialData.goals);

  const [loading, setLoading] = useState(false);

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

  // Fetch preference on mount to autocomplete the form
  useEffect(() => {
    const fetchPreference = async () => {
      if (!preferenceId) return;
      setLoading(true);
      try {
        const url = `${API_BASE_URL}/preferences/${preferenceId}`;
        console.log("🔎 [UserProfileScreen] GET", url);
        const res = await fetch(url);

        if (!res.ok) {
          const txt = await res.text();
          console.error("GET preference error:", res.status, txt);
          return;
        }

        const pref = await res.json();
        console.log("✅ Loaded preference:", pref);

        setName(pref.name ?? "");
        setAge(pref.age != null ? String(pref.age) : "");

        // location is an object { latitude, longitude }
        if (pref.location && typeof pref.location === "object") {
          const lat = pref.location.latitude;
          const lng = pref.location.longitude;
          if (lat != null && lng != null) {
            setLocation(`${lat}, ${lng}`);
          } else {
            setLocation("");
          }
        } else {
          setLocation("");
        }

        setActivities(Array.isArray(pref.activities) ? pref.activities : []);
        setTopics(Array.isArray(pref.topics) ? pref.topics : []);

        if (Array.isArray(pref.chat_times) && pref.chat_times.length > 0) {
          setChatTime(pref.chat_times[0]);
        } else {
          setChatTime(null);
        }

        setActivityPlace(pref.activity_type ?? null);
        setGoals(Array.isArray(pref.looking_for) ? pref.looking_for : []);
      } catch (e) {
        console.error("Network error fetching preference:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchPreference();
  }, [preferenceId]);

  const handleSave = async () => {
    // 1) Build the updated onboarding data for the app
    const updated: OnboardingData = {
      name,
      age,
      location,
      activities,
      topics,
      chatTime,
      activityPlace,
      goals,
    };

    // 2) Validate / parse age
    const ageNumber = parseInt(age, 10);
    if (Number.isNaN(ageNumber)) {
      console.warn("[UserProfileScreen] Invalid age:", age);
      return;
    }

    // 3) Parse location string into latitude/longitude
    let latitude = NaN;
    let longitude = NaN;

    if (location) {
      const parts = location.split(",");
      if (parts.length === 2) {
        latitude = parseFloat(parts[0].trim());
        longitude = parseFloat(parts[1].trim());
      }
    }

    if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
      console.warn(
        "[UserProfileScreen] Location parse error. Expected 'lat, lng', got:",
        location
      );
      return;
    }

    // 4) Build backend payload
    const payload = {
      name,
      age: ageNumber,
      location: {
        latitude,
        longitude,
      },
      activities,
      topics,
      chat_times: chatTime ? [chatTime] : [],
      activity_type: activityPlace ?? "",
      looking_for: goals,
    };

    const url = `${API_BASE_URL}/preferences/${preferenceId}`;
    console.log("📤 [UserProfileScreen] PUT", url);
    console.log("📦 [UserProfileScreen] payload:", payload);

    try {
      const res = await fetch(url, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      console.log(
        "📥 [UserProfileScreen] Backend responded with status:",
        res.status
      );

      if (!res.ok) {
        const txt = await res.text();
        console.error("❌ [UserProfileScreen] Backend error:", res.status, txt);
        // still update local state for now
        onSave(updated);
        return;
      }

      const json = await res.json();
      console.log("✅ [UserProfileScreen] Preference saved:", json);

      onSave(updated);
    } catch (e: any) {
      console.error("🌐 [UserProfileScreen] Network error:", e);
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
        {loading && (
          <Text style={{ marginBottom: 12, color: "#6B7280" }}>
            Loading your preferences...
          </Text>
        )}

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
          placeholder="Latitude, Longitude (e.g. 60.17, 24.94)"
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
