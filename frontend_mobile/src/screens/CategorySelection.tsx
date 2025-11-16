// src/screens/CategorySelection.tsx
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import VoiceButton from "./VoiceButton";
import CameraButton from "./CameraButton";

export type ActivityCategory = {
  id: string;
  name: string;
  description: string;
  icon: string;
};

type CategorySelectionProps = {
  userData: any;
  // ✔ Only return ONE category name
  onCategoriesSelected: (selectedCategoryName: string) => void;
  onAddEvent: () => void;
  onShowEvents: () => void;
  onOpenVoice?: () => void;
  onOpenCamera?: () => void;
  onOpenSettings?: () => void;
};

const RECOMMENDED_CATEGORIES: ActivityCategory[] = [
  { id: "physical", name: "Physical Activities", description: "Gentle exercises and movement", icon: "💪" },
  { id: "social", name: "Social Events", description: "Community gatherings and socializing", icon: "👥" },
  { id: "mental", name: "Mental Stimulation", description: "Brain games and learning", icon: "🧠" },
  { id: "creative", name: "Creative Arts", description: "Arts, crafts, and creative expression", icon: "🎨" },
  { id: "nature", name: "Nature & Outdoors", description: "Gardening, walking, and outdoor activities", icon: "🌳" },
  { id: "animals", name: "Animal Companions", description: "Pet therapy and animal interactions", icon: "🐾" },
];

export const CategorySelection: React.FC<CategorySelectionProps> = ({
  userData,
  onCategoriesSelected,
  onAddEvent,
  onShowEvents,
  onOpenVoice,
  onOpenCamera,
  onOpenSettings,
}) => {

  // ✔ Only ONE selected category (stores the name)
  const [selectedCategoryName, setSelectedCategoryName] = useState<string | null>(null);

  const handleContinue = () => {
    if (!selectedCategoryName) {
      alert("Please select a category to continue.");
      return;
    }
    onCategoriesSelected(selectedCategoryName);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* <Text style={styles.title}>Choose a Category</Text>
        <TouchableOpacity 
          onPress={onOpenSettings}
          style={{ position: "absolute", top: 20, right: 20 }}
        >
          <Text style={{ fontSize: 22 }}>⚙️</Text>
        </TouchableOpacity>
        <Text style={styles.subtitle}>
          Select the category that interests you most.
        </Text> */}
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View style={{ width: 32 }} /> {/* spacer to balance gear icon */}
          <Text style={styles.title}>Choose a Category</Text>

          <TouchableOpacity onPress={onOpenSettings}>
            <Text style={{ fontSize: 26 }}>⚙️</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.subtitle}>
          Select the category that interests you most.
        </Text>

        <ScrollView
          style={styles.categoriesContainer}
          contentContainerStyle={{ paddingBottom: 300 }}
        >
          {RECOMMENDED_CATEGORIES.map((category) => {
            const isSelected = selectedCategoryName === category.name;

            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryCard,
                  isSelected && styles.categoryCardSelected,
                ]}
                onPress={() => setSelectedCategoryName(category.name)} // ✔ Only one
              >
                <Text style={styles.categoryIcon}>{category.icon}</Text>

                <View style={styles.categoryTextContainer}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.categoryDescription}>
                    {category.description}
                  </Text>
                </View>

                <View
                  style={[
                    styles.selectionIndicator,
                    isSelected && styles.selectionIndicatorSelected,
                  ]}
                >
                  {isSelected && <Text style={styles.checkmark}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}

          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedCategoryName && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            disabled={!selectedCategoryName}
          >
            <Text style={styles.continueButtonText}>
              Continue {selectedCategoryName ? `(${selectedCategoryName})` : ""}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addButton} onPress={onAddEvent}>
            <Text style={styles.addButtonText}>Add Event</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addButton} onPress={onShowEvents}>
            <Text style={styles.addButtonText}>Your Events</Text>
          </TouchableOpacity>
        </ScrollView>

        {onOpenCamera && (
          <View style={styles.cameraButtonContainer}>
            <CameraButton onPress={onOpenCamera} />
          </View>
        )}

        {onOpenVoice && (
          <View style={styles.voiceButtonContainer}>
            <VoiceButton onPress={onOpenVoice} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 22,
  },
  categoriesContainer: {
    flex: 1,
  },
  categoryCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  categoryCardSelected: {
    borderColor: "#1D4ED8",
    backgroundColor: "#EFF6FF",
  },
  categoryIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  categoryDescription: {
    fontSize: 14,
    color: "#6B7280",
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
  },
  selectionIndicatorSelected: {
    backgroundColor: "#1D4ED8",
    borderColor: "#1D4ED8",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    backgroundColor: "#1D4ED8",
    alignItems: "center",
    marginTop: 16,
  },
  continueButtonDisabled: {
    backgroundColor: "#9CA3AF",
  },
  continueButtonText: {
    fontSize: 18,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  addButton: {
    marginTop: 20,
    paddingVertical: 16,
    backgroundColor: "#2563EB",
    borderRadius: 16,
    alignItems: "center",
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },
  cameraButtonContainer: {
    position: "absolute",
    bottom: 32,
    left: 24,
  },
  voiceButtonContainer: {
    position: "absolute",
    bottom: 32,
    right: 24,
  },
});

export default CategorySelection;
