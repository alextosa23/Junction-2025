// EventsScreen.tsx
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const EVENTS_KEY = "events";

type StoredEvent = {
  id: string;
  title: string;
  date: string;
  recurrence: "once" | "daily";
  notificationId?: string;
};

type EventsScreenProps = {
  onBack?: () => void;
};

const EventsScreen: React.FC<EventsScreenProps> = ({ onBack }) => {
  const [events, setEvents] = useState<StoredEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      const stored = await AsyncStorage.getItem(EVENTS_KEY);
      const parsed: StoredEvent[] = stored ? JSON.parse(stored) : [];

      const now = new Date();

      // Remove past one-time events
      const filtered = parsed.filter((ev) => {
        const evDate = new Date(ev.date);
        if (ev.recurrence === "once" && evDate < now) {
          return false; // drop from list
        }
        return true;
      });

      // Persist cleaned list if anything was removed
      if (filtered.length !== parsed.length) {
        await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(filtered));
      }

      setEvents(filtered);
    } catch (e) {
      console.warn("Error loading events", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const getRecurrenceLabel = (ev: StoredEvent) => {
    const d = new Date(ev.date);
    if (ev.recurrence === "once") return "One-time";

    return `Every day at ${d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })}`;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.headerRow}>
          {onBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backText}>‹ Back</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.backButton} />
          )}

          <Text style={styles.title}>My Events</Text>
          <View style={{ width: 60 }} />
        </View>

        {loading ? (
          <Text>Loading events...</Text>
        ) : events.length === 0 ? (
          <Text style={styles.emptyText}>
            You don’t have any events yet.
          </Text>
        ) : (
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 24 }}
            renderItem={({ item }) => {
              const d = new Date(item.date);
              return (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                  <Text style={styles.cardDate}>
                    {d.toLocaleDateString()} •{" "}
                    {d.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Text>
                  <Text style={styles.cardRecurrence}>
                    {getRecurrenceLabel(item)}
                  </Text>
                </View>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 16 },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    justifyContent: "space-between",
  },
  backButton: {
    width: 60,
    paddingVertical: 4,
  },
  backText: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "600",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },

  addButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },
  addButtonText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },

  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
  },

  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 14,
    color: "#4B5563",
  },
  cardRecurrence: {
    marginTop: 4,
    fontSize: 13,
    color: "#6B7280",
  },
});

export default EventsScreen;
