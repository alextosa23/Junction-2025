import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";

export type OnboardingData = {
  name: string;
  age: string;
  location: string;
  activities: string[];
  topics: string[];
  chatTime: string | null;
  activityPlace: string | null;
  goals: string[];
};

type OnboardingProps = {
  onFinish: (data: OnboardingData) => void;
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

const Onboarding: React.FC<OnboardingProps> = ({ onFinish }) => {
  const [step, setStep] = useState<number>(0);

  const [name, setName] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [location, setLocation] = useState<string>("");

  const [activities, setActivities] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [chatTime, setChatTime] = useState<string | null>(null);
  const [activityPlace, setActivityPlace] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>([]);

  const totalSteps = 8; // 0–7

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

  const canGoNext = (): boolean => {
    switch (step) {
      case 0:
        return name.trim().length > 0;
      case 1:
        return age.trim().length > 0;
      case 2:
        return location.trim().length > 0;
      case 3:
        return activities.length > 0;
      case 4:
        return topics.length > 0;
      case 5:
        return chatTime !== null;
      case 6:
        return activityPlace !== null;
      case 7:
        return goals.length > 0;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < totalSteps - 1) {
      setStep((prev) => prev + 1);
    } else {
      const data: OnboardingData = {
        name,
        age,
        location,
        activities,
        topics,
        chatTime,
        activityPlace,
        goals,
      };
      onFinish(data);
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep((prev) => prev - 1);
    }
  };

  const renderQuestion = () => {
    switch (step) {
      case 0:
        return (
          <>
            <Text style={styles.questionText}>What’s your name?</Text>
            <TextInput
              style={styles.input}
              placeholder="Type your name"
              placeholderTextColor="#6B7280"
              value={name}
              onChangeText={setName}
            />
          </>
        );
      case 1:
        return (
          <>
            <Text style={styles.questionText}>How old are you?</Text>
            <TextInput
              style={styles.input}
              placeholder="Type your age"
              placeholderTextColor="#6B7280"
              keyboardType="number-pad"
              value={age}
              onChangeText={setAge}
            />
          </>
        );
      case 2:
        return (
          <>
            <Text style={styles.questionText}>Where do you live?</Text>
            <TextInput
              style={styles.input}
              placeholder="City / area"
              placeholderTextColor="#6B7280"
              value={location}
              onChangeText={setLocation}
            />
          </>
        );
      case 3:
        return (
          <>
            <Text style={styles.questionText}>
              What kinds of activities do you enjoy?
            </Text>
            <Text style={styles.helperText}>
              You can select more than one.
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
          </>
        );
      case 4:
        return (
          <>
            <Text style={styles.questionText}>
              What topics do you enjoy talking about?
            </Text>
            <Text style={styles.helperText}>
              You can select more than one.
            </Text>
            {topicOptions.map((option) => (
              <OptionButton
                key={option}
                label={option}
                selected={topics.includes(option)}
                onPress={() => toggleMultiSelect(option, topics, setTopics)}
              />
            ))}
          </>
        );
      case 5:
        return (
          <>
            <Text style={styles.questionText}>
              When do you usually prefer to chat?
            </Text>
            {chatTimeOptions.map((option) => (
              <OptionButton
                key={option}
                label={option}
                selected={chatTime === option}
                onPress={() => setChatTime(option)}
              />
            ))}
          </>
        );
      case 6:
        return (
          <>
            <Text style={styles.questionText}>
              Do you enjoy indoor or outdoor activities?
            </Text>
            {activityPlaceOptions.map((option) => (
              <OptionButton
                key={option}
                label={option}
                selected={activityPlace === option}
                onPress={() => setActivityPlace(option)}
              />
            ))}
          </>
        );
      case 7:
        return (
          <>
            <Text style={styles.questionText}>What are you looking for?</Text>
            <Text style={styles.helperText}>
              You can select more than one.
            </Text>
            {goalOptions.map((option) => (
              <OptionButton
                key={option}
                label={option}
                selected={goals.includes(option)}
                onPress={() => toggleMultiSelect(option, goals, setGoals)}
              />
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Progress text */}
        <Text style={styles.progressText}>
          Question {step + 1} of {totalSteps}
        </Text>

        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          {renderQuestion()}
        </ScrollView>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[
              styles.navButton,
              ! (step > 0) && styles.navButtonDisabled,
            ]}
            onPress={handleBack}
            disabled={step === 0}
            accessibilityRole="button"
            accessibilityLabel="Go to previous question"
          >
            <Text
              style={[
                styles.navButtonText,
                !(step > 0) && styles.navButtonTextDisabled,
              ]}
            >
              Back
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.navButton,
              !canGoNext() && styles.navButtonDisabled,
            ]}
            onPress={handleNext}
            disabled={!canGoNext()}
            accessibilityRole="button"
            accessibilityLabel="Go to next question"
          >
            <Text
              style={[
                styles.navButtonText,
                !canGoNext() && styles.navButtonTextDisabled,
              ]}
            >
              {step === totalSteps - 1 ? "Finish" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
}) => {
  return (
    <TouchableOpacity
      style={[styles.optionButton, selected && styles.optionButtonSelected]}
      onPress={onPress}
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
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6", // light gray, good contrast
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  progressText: {
    fontSize: 18,
    color: "#4B5563",
    marginBottom: 8,
  },
  content: {
    paddingVertical: 16,
  },
  questionText: {
    fontSize: 24, // big font
    fontWeight: "700",
    color: "#111827", // almost black
    marginBottom: 16,
  },
  helperText: {
    fontSize: 18,
    color: "#4B5563",
    marginBottom: 12,
  },
  input: {
    fontSize: 20,
    borderWidth: 2,
    borderColor: "#9CA3AF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    color: "#111827",
  },
  optionButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
    marginBottom: 10,
  },
  optionButtonSelected: {
    backgroundColor: "#1D4ED8", // blue
    borderColor: "#1D4ED8",
  },
  optionButtonText: {
    fontSize: 20,
    color: "#111827",
  },
  optionButtonTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 16,
  },
  navButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#111827",
    alignItems: "center",
  },
  navButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  navButtonText: {
    fontSize: 20,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  navButtonTextDisabled: {
    color: "#E5E7EB",
  },
});

export default Onboarding;
