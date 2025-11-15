// src/screens/CategoryEvents.tsx
import React, { useState, useEffect } from "react";
import * as Device from "expo-device";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

type EventItem = {
  id: string;
  name: string;
  description: string;
  start_date: string;
  category?: string;
};

type CategoryEventsProps = {
  categoryName: string | null; // e.g. "Social Events"
  onBack: () => void;
};

const EVENTS_KEY = "events";
const API_BASE = "https://junction-2025.onrender.com";

const CategoryEvents: React.FC<CategoryEventsProps> = ({
  categoryName,
  onBack,
}) => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [enrolledIds, setEnrolledIds] = useState<string[]>([]); // for button UI

  const getDeviceId = async () => {
    return (
      Device.osInternalBuildId ||
      Device.modelId ||
      "unknown-device"
    );
  };

  // Load recommended events for this category
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const deviceId = "demo-device-id-123";
        // const deviceId = await getDeviceId();
        console.log("📱 REAL DEVICE ID:", deviceId);

        const response = await fetch(
          `${API_BASE}/recommendations/?device_id=${deviceId}&limit=20`
        );

        const data = await response.json();

        console.log("🔥 Raw events from backend:", data);
        console.log("Category filter:", categoryName);

        if (!Array.isArray(data)) {
          console.log("❌ Backend returned an error:", data);
          setEvents([]);
          return;
        }

        const filtered = data.filter(
          (ev: any) =>
            ev.category?.toLowerCase() === categoryName?.toLowerCase()
        );

        console.log("🎯 Filtered events:", filtered);

        setEvents(filtered);
      } catch (error) {
        console.log("Error loading events:", error);
      }
    };

    loadEvents();
  }, [categoryName]);

  // Load enrolled events from AsyncStorage so already-enrolled show as "Enrolled"
  useEffect(() => {
    const loadEnrolledFromStorage = async () => {
      try {
        const stored = await AsyncStorage.getItem(EVENTS_KEY);
        const existing = stored ? JSON.parse(stored) : [];

        const ids = existing
          .map((e: any) => e.id)
          .filter((id: any) => typeof id === "string");

        setEnrolledIds(ids);
        console.log("✅ Enrolled IDs from storage:", ids);
      } catch (err) {
        console.log("❌ Error loading enrolled events from storage:", err);
      }
    };

    loadEnrolledFromStorage();
  }, []);

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short", // e.g. Nov
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleEnroll = async (event: EventItem) => {
    try {
      // Avoid duplicate enrolls in this UI session
      if (enrolledIds.includes(event.id)) {
        console.log("⚠️ Already marked enrolled in UI:", event.id);
        return;
      }

      // 1) Call FastAPI attendance endpoint
      const deviceId = await getDeviceId();

      console.log("📝 Creating attendance for event:", event.id, "device:", deviceId);

      const attendanceResponse = await fetch(
        `${API_BASE}/events/${event.id}/attendances`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ device_id: deviceId }),
        }
      );

      if (!attendanceResponse.ok) {
        const errorBody = await attendanceResponse.json().catch(() => null);
        console.log("❌ Attendance API error:", attendanceResponse.status, errorBody);
        // If backend says "Device already registered", still mark as enrolled in UI
        if (
          errorBody &&
          typeof errorBody.detail === "string" &&
          errorBody.detail.includes("already registered")
        ) {
          setEnrolledIds((prev) =>
            prev.includes(event.id) ? prev : [...prev, event.id]
          );
        }
        return;
      }

      const createdAttendance = await attendanceResponse.json();
      console.log("✅ Attendance created:", createdAttendance);

      // 2) Sync with local AsyncStorage events list (same structure as AddEvent.tsx)
      const stored = await AsyncStorage.getItem(EVENTS_KEY);
      const existing = stored ? JSON.parse(stored) : [];

      // Check if already in storage just in case
      const alreadyInStorage = existing.some((e: any) => e.id === event.id);
      if (alreadyInStorage) {
        console.log("⚠️ Event already in AsyncStorage, skipping add:", event.id);

        setEnrolledIds((prev) =>
          prev.includes(event.id) ? prev : [...prev, event.id]
        );
        return;
      }

      const newEvent = {
        id: event.id,
        title: event.name,
        date: event.start_date, // ISO from backend
        recurrence: "once",
        notificationId: null,
      };

      const updated = [...existing, newEvent];

      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(updated));

      // Update local UI state so button changes
      setEnrolledIds((prev) => [...prev, event.id]);

      console.log("✅ Enrolled in event & saved locally:", newEvent);
    } catch (err) {
      console.log("❌ Error enrolling in event:", err);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Back button */}
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>{categoryName}</Text>

        {/* Events List */}
        <FlatList
          data={events}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 30 }}
          renderItem={({ item }) => {
            const isEnrolled = enrolledIds.includes(item.id);

            return (
              <View style={styles.eventCard}>
                <Text style={styles.eventTitle}>{item.name}</Text>
                <Text style={styles.eventDescription}>{item.description}</Text>
                <Text style={styles.eventDate}>
                  {formatDate(item.start_date)}
                </Text>

                {/* Enroll / Enrolled button */}
                <TouchableOpacity
                  style={[
                    styles.enrollButton,
                    isEnrolled && styles.enrolledButton,
                  ]}
                  onPress={() => handleEnroll(item)}
                  disabled={isEnrolled}
                >
                  <Text style={styles.enrollButtonText}>
                    {isEnrolled ? "Enrolled" : "Enroll"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default CategoryEvents;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F3F4F6" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
  backButton: { marginBottom: 12 },
  backText: { fontSize: 18, color: "#1D4ED8", fontWeight: "600" },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 24,
    textAlign: "center",
    color: "#111827",
  },
  eventCard: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 6,
    color: "#111827",
  },
  eventDescription: { fontSize: 14, color: "#6B7280", marginBottom: 8 },
  eventDate: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2563EB",
    marginBottom: 10,
  },
  enrollButton: {
    marginTop: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#16A34A",
  },
  enrolledButton: {
    backgroundColor: "#9CA3AF",
  },
  enrollButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
  },
});
