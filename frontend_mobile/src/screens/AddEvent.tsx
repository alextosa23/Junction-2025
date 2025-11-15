// src/screens/AddEvent.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import AsyncStorage from "@react-native-async-storage/async-storage";

type RecurrenceType = "once" | "daily";

type AddEventProps = {
  onSave?: (event: { title: string; date: Date; recurrence: RecurrenceType }) => void;
  onBack?: () => void;
};

const EVENTS_KEY = "events";

const AddEvent: React.FC<AddEventProps> = ({ onSave, onBack }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [recurrence, setRecurrence] = useState<RecurrenceType>("once");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = async () => {
    if (title.trim().length === 0) return;

    // Build event object to store
    const newEvent = {
      id: Date.now().toString(),
      title,
      date: date.toISOString(),
      recurrence,
      // notificationId can be added later when you wire notifications in a separate file
    };

    try {
      const stored = await AsyncStorage.getItem(EVENTS_KEY);
      const events = stored ? JSON.parse(stored) : [];
      const updatedEvents = [...events, newEvent];

      await AsyncStorage.setItem(EVENTS_KEY, JSON.stringify(updatedEvents));

      // Let parent know (if it cares)
      if (onSave) {
        onSave({ title, date, recurrence });
      }

      // Reset UI a bit
      setTitle("");
      // setDate(new Date()); // uncomment if you want to reset date too
    } catch (err) {
      console.warn("Error saving event", err);
    }
  };

  // --- Date & Time pickers ---

  const handleDateChange = (
    event: DateTimePickerEvent,
    selectedDate?: Date
  ) => {
    setShowDatePicker(false);
    if (event.type === "dismissed" || !selectedDate) return;

    const updated = new Date(date);
    updated.setFullYear(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate()
    );
    setDate(updated);
  };

  const handleTimeChange = (
    event: DateTimePickerEvent,
    selectedTime?: Date
  ) => {
    setShowTimePicker(false);
    if (event.type === "dismissed" || !selectedTime) return;

    const updated = new Date(date);
    updated.setHours(selectedTime.getHours());
    updated.setMinutes(selectedTime.getMinutes());
    setDate(updated);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header with back button + centered title */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backText}>‹ Back</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Add New Event</Text>

          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.label}>Event Title</Text>
        <TextInput
          style={styles.input}
          placeholder="Doctor appointment"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Date</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.selectorText}>{date.toDateString()}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Time</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => setShowTimePicker(true)}
        >
          <Text style={styles.selectorText}>
            {date.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </TouchableOpacity>

        <Text style={styles.label}>Repeat</Text>
        <View style={styles.recurrenceRow}>
          <TouchableOpacity
            style={[
              styles.recurrenceOption,
              recurrence === "once" && styles.recurrenceOptionActive,
            ]}
            onPress={() => setRecurrence("once")}
          >
            <Text
              style={[
                styles.recurrenceText,
                recurrence === "once" && styles.recurrenceTextActive,
              ]}
            >
              One-time
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.recurrenceOption,
              recurrence === "daily" && styles.recurrenceOptionActive,
            ]}
            onPress={() => setRecurrence("daily")}
          >
            <Text
              style={[
                styles.recurrenceText,
                recurrence === "daily" && styles.recurrenceTextActive,
              ]}
            >
              Every day
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Event</Text>
        </TouchableOpacity>

        {/* Show pickers only when field is pressed */}
        {showDatePicker && (
          <DateTimePicker
            mode="date"
            display="spinner"
            value={date}
            onChange={handleDateChange}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            mode="time"
            display="spinner"
            value={date}
            onChange={handleTimeChange}
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
    paddingVertical: 4,
    paddingHorizontal: 8,
    width: 80,
    alignItems: "flex-start",
  },
  backText: {
    fontSize: 16,
    color: "#2563EB",
    fontWeight: "600",
    textAlign: "left",
  },
  headerSpacer: {
    width: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
  },

  label: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    fontSize: 16,
  },
  selector: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  selectorText: {
    fontSize: 16,
  },

  recurrenceRow: {
    flexDirection: "row",
    marginTop: 4,
    gap: 12,
  },
  recurrenceOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  recurrenceOptionActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  recurrenceText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },
  recurrenceTextActive: {
    color: "white",
  },

  saveButton: {
    marginTop: 32,
    backgroundColor: "#2563EB",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default AddEvent;
