import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

type PhotoHelpScreenProps = {
  onBack?: () => void;
};

// 👇 YOUR REAL WORKING BACKEND URL — ONLY EDIT THIS ONE LINE
const API_BASE = "https://junction-2025.onrender.com/aihelper";

const PhotoHelpScreen: React.FC<PhotoHelpScreenProps> = ({ onBack }) => {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert("Permission required", "We need access to your photos.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];
      let uri = asset.uri;

      // 🔄 If it's HEIC/HEIF (iPhone), convert to JPEG first
      const lowerUri = uri.toLowerCase();
      if (lowerUri.endsWith(".heic") || lowerUri.endsWith(".heif")) {
        try {
          const manipulated = await ImageManipulator.manipulateAsync(
            uri,
            [], // no transformations, just re-encode
            {
              compress: 0.9,
              format: ImageManipulator.SaveFormat.JPEG,
            }
          );
          uri = manipulated.uri;
          console.log("Converted HEIC to JPEG at:", uri);
        } catch (e) {
          console.log("HEIC conversion failed, using original image:", e);
        }
      }

      setImageUri(uri);
    }
  };

  const createFormData = () => {
    if (!imageUri) {
      Alert.alert("No photo", "Please upload a photo first.");
      return null;
    }

    const form = new FormData();
    form.append("image", {
      uri: imageUri,
      type: "image/jpeg", // we always send as jpeg after conversion
      name: "photo.jpg",
    } as any);

    return form;
  };

  // 🔍 CHECK SCAM
  const handleScamCheck = async () => {
    const form = createFormData();
    if (!form) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/detect-scam-image`, {
        method: "POST",
        body: form,
      });

      const text = await response.text();
      console.log("Scam response:", text);

      if (!response.ok) {
        Alert.alert("Error", "Could not analyze image");
        return;
      }

      const data = JSON.parse(text);

      Alert.alert(
        `Verdict: ${data.verdict || "unknown"}`,
        `Likelihood: ${data.likelihood}%\n\n${data.reasoning}`
      );
    } catch (e) {
      console.log("Scam check error:", e);
      Alert.alert("Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  // 💊 MEDICATION
  const handleMedicationCheck = async () => {
    const form = createFormData();
    if (!form) return;

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/medication-instructions`, {
        method: "POST",
        body: form,
      });

      const text = await response.text();
      console.log("Medication response:", text);

      if (!response.ok) {
        Alert.alert("Error", "Could not analyze medication label.");
        return;
      }

      const data = JSON.parse(text);

      Alert.alert(
        data.medication_name,
        `Instructions: ${data.simple_instructions}\n\nDosage: ${data.dosage}\n\nWarnings: ${data.warnings}`
      );
    } catch (e) {
      console.log("Medication error:", e);
      Alert.alert("Error", "Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {onBack && (
          <TouchableOpacity onPress={onBack}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.title}>Photo Helper</Text>

        <View style={styles.imageBox}>
          {imageUri ? (
            <Image source={{ uri: imageUri }} style={styles.image} />
          ) : (
            <Text style={{ color: "#6B7280" }}>No photo selected</Text>
          )}
        </View>

        <TouchableOpacity style={styles.uploadBtn} onPress={pickImage}>
          <Text style={styles.uploadText}>
            {imageUri ? "Change Photo" : "Upload Photo"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleScamCheck}
          disabled={loading}
        >
          <Text style={styles.actionText}>Check for message scams</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionBtn}
          onPress={handleMedicationCheck}
          disabled={loading}
        >
          <Text style={styles.actionText}>Get tips on medication</Text>
        </TouchableOpacity>

        {loading && (
          <Text style={{ marginTop: 12, textAlign: "center" }}>
            Analyzing...
          </Text>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F3F4F6" },
  container: { flex: 1, padding: 20 },
  backButton: { fontSize: 18, color: "#2563EB", marginBottom: 10 },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  imageBox: {
    height: 250,
    backgroundColor: "#E5E7EB",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    borderStyle: "dashed",
  },
  image: { width: "100%", height: "100%", borderRadius: 12 },
  uploadBtn: {
    backgroundColor: "#2563EB",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },
  uploadText: { color: "#fff", fontSize: 18 },
  actionBtn: {
    backgroundColor: "#1D4ED8",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 12,
  },
  actionText: { color: "white", fontSize: 18, fontWeight: "600" },
});

export default PhotoHelpScreen;
