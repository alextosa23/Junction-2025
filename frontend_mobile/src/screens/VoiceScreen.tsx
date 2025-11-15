// src/screens/VoiceScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Audio } from "expo-av";

type VoiceScreenProps = {
  onBack: () => void;
};

const VoiceScreen: React.FC<VoiceScreenProps> = ({ onBack }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcript, setTranscript] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Pulsating animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.15,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [scale]);

  const startRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Microphone needed",
          "Please allow microphone access so you can talk to Bondy."
        );
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const rec = new Audio.Recording();
      await rec.prepareToRecordAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      await rec.startAsync();

      setRecording(rec);
      setTranscript("");
      setIsRecording(true);
    } catch (e) {
      console.log("Error starting recording:", e);
      Alert.alert("Error", "Could not start recording.");
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setIsRecording(false);
      setRecording(null);

      if (!uri) {
        Alert.alert("Error", "No audio file recorded.");
        return;
      }

      await sendToBackend(uri);
    } catch (e) {
      console.log("Error stopping recording:", e);
      Alert.alert("Error", "Could not stop recording.");
      setIsRecording(false);
      setRecording(null);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // 👇 Call your backend STT service here
  const sendToBackend = async (fileUri: string) => {
    try {
      setIsSending(true);
      setTranscript("Transcribing…");

      const formData = new FormData();
      formData.append("audio", {
        uri: fileUri,
        name: "recording.m4a",
        type: "audio/m4a",
      } as any);

      // TODO: replace this with your real backend URL
      const response = await fetch(
        "https://YOUR_BACKEND_URL_HERE/transcribe",
        {
          method: "POST",
          body: formData,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (!response.ok) {
        console.log("Transcription failed:", await response.text());
        Alert.alert("Error", "Transcription failed on server.");
        setTranscript("");
        return;
      }

      const data = await response.json();
      setTranscript(data.text || "");
    } catch (e) {
      console.log("Error sending to backend:", e);
      Alert.alert("Error", "Could not send audio for transcription.");
      setTranscript("");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Talk to Bondy</Text>
        <View style={{ width: 60 }} />
      </View>

      {/* Content */}
      <View style={styles.container}>
        <TouchableOpacity onPress={toggleRecording} activeOpacity={0.8}>
          <Animated.View
            style={[
              styles.micCircle,
              { transform: [{ scale }] },
              isRecording && styles.micCircleActive,
            ]}
          >
            <Text style={styles.micIcon}>🎤</Text>
          </Animated.View>
        </TouchableOpacity>

        <Text style={styles.statusText}>
          {isRecording
            ? "Listening… tap to stop"
            : "Tap the microphone to start recording"}
        </Text>

        <View style={styles.transcriptBox}>
          <Text style={styles.transcriptLabel}>You said:</Text>
          {isSending ? (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <ActivityIndicator style={{ marginRight: 8 }} />
              <Text style={styles.transcriptText}>Transcribing…</Text>
            </View>
          ) : (
            <Text style={styles.transcriptText}>
              {transcript || "Your words will appear here once transcribed."}
            </Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F3F4F6" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    justifyContent: "space-between",
  },
  backButton: { paddingVertical: 8, paddingHorizontal: 12 },
  backText: { fontSize: 18, color: "#2563EB" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#111827" },
  container: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  micCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#2563EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  micCircleActive: { backgroundColor: "#DC2626" },
  micIcon: { fontSize: 50, color: "#FFFFFF" },
  statusText: {
    fontSize: 18,
    color: "#4B5563",
    marginBottom: 24,
    textAlign: "center",
  },
  transcriptBox: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    width: "100%",
    minHeight: 120,
  },
  transcriptLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 18,
    color: "#111827",
  },
});

export default VoiceScreen;
