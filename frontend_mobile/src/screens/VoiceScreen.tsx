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
import * as Speech from 'expo-speech';

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

    // ✅ Just use Expo's built-in preset – usually AAC/M4A on iOS
    await rec.prepareToRecordAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
    await rec.startAsync();

    setRecording(rec);
    setTranscript("");
    setIsRecording(true);
    console.log("✅ Recording started with HIGH_QUALITY");
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
    console.log("🎯 1. sendToBackend STARTED, fileUri:", fileUri);

    setIsSending(true);
    setTranscript("Transcribing…");

    // Read audio file and convert to base64
    const response = await fetch(fileUri);
    const blob = await response.blob();
    console.log("🎯 2. Blob size:", blob.size, "type:", blob.type);
    
    // Get file info from URI
    console.log("🎯 2a. File URI:", fileUri);
    console.log("🎯 2b. File extension:", fileUri.split('.').pop());
    
    // Convert blob to base64
    const reader = new FileReader();
    const audioBase64 = await new Promise<string>((resolve) => {
      reader.onloadend = () => {
        const fullResult = reader.result as string;
        console.log("🎯 3. Full Data URL prefix:", fullResult.split(',')[0]);
        console.log("🎯 3a. Full Data URL length:", fullResult.length);
        // Remove data URL prefix
        const base64 = fullResult.split(',')[1];
        console.log("🎯 3b. Base64 length:", base64?.length);
        resolve(base64);
      };
      reader.readAsDataURL(blob);
    });

    console.log("🎯 6. Sending to backend...");


    // Send to your backend
    const speechResponse = await fetch(
      "http://192.168.100.45:8000/speech-to-text",  // ✅ Your backend URL
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          audio: audioBase64,
        }),
      }
    );

    console.log("🎯 7. Backend response status:", speechResponse.status);
    console.log("🎯 8. Backend response ok:", speechResponse.ok);

    if (!speechResponse.ok) {
      throw new Error(`Server error: ${speechResponse.status}`);
    }

    const data = await speechResponse.json();
    console.log("🎯 6. Backend response data:", JSON.stringify(data, null, 2));

    if (data.success && data.text) {
      console.log("🎯 7. Success! Text:", data.text);
      setTranscript(data.text);
      // Auto-process the command
      handleTranscript(data.text);
    } else {
      console.log("🎯 8. Backend returned success:false, error:", data.error);
      Alert.alert("Error", "Could not understand your speech. Please try again.");
      setTranscript("");
    }
  } catch (e) {
    console.log("Error sending to backend:", e);
    Alert.alert("Error", "Could not send audio for transcription.");
    setTranscript("");
  } finally {
    setIsSending(false);
  }
};

const speakResponse = (text: string) => {
  Speech.stop(); // Stop any current speech
  
  Speech.speak(text, {
    language: 'en-US',
    pitch: 1.0,
    rate: 0.85,
    onStart: () => console.log("🎤 Bondy started speaking"),
    onDone: () => console.log("✅ Bondy finished speaking"),
    onStopped: () => console.log("⏹️ Speech stopped"),
    onError: (error) => console.log("❌ Speech error:", error),
  });
};

const stopSpeaking = () => {
  Speech.stop();
  console.log("🔇 Stopped Bondy's speech");
};

const handleTranscript = (text: string) => {
  console.log("Processing command:", text);
  
  let response = "";
  
  if (text.toLowerCase().includes("social") || text.toLowerCase().includes("events")) {
    response = "I'll show you social events happening this week.";
  } else if (text.toLowerCase().includes("physical") || text.toLowerCase().includes("exercise")) {
    response = "Let me find some gentle physical activities for you.";
  } else if (text.toLowerCase().includes("garden")) {
    response = "I found several gardening groups in your area.";
  } else if (text.toLowerCase().includes("book") || text.toLowerCase().includes("read")) {
    response = "There are book clubs meeting this week. Would you like to join?";
  } else if (text.toLowerCase().includes("hello") || text.toLowerCase().includes("hi")) {
    response = "Hello! I'm Bondy. How can I help you today?";
  } else if (text.toLowerCase().includes("thank")) {
    response = "You're welcome! Is there anything else I can help you with?";
  } else {
    response = "I understand you said: \"" + text + "\". How can I help you with that?";
  }
  
  // Show alert AND speak the response
  Alert.alert("Bondy Response", response);
  speakResponse(response);
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
