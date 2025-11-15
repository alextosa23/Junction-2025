import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

type AddEventProps = {
  onSave: (event: { title: string; date: Date }) => void;
};

const AddEvent: React.FC<AddEventProps> = ({ onSave }) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  const handleSave = () => {
    if (title.trim().length === 0) return;
    onSave({ title, date });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.title}>Add New Event</Text>

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
          <Text style={styles.selectorText}>
            {date.toDateString()}
          </Text>
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

        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveText}>Save Event</Text>
        </TouchableOpacity>

        {/* {showDatePicker && (
          <DateTimePicker
            mode="date"
            value={date}
            onChange={(event: any, selectedDate?: Date) => {
                setShowDatePicker(false);
                if (!selectedDate) return;

                const updated = new Date(date);
                updated.setFullYear(
                    selectedDate.getFullYear(),
                    selectedDate.getMonth(),
                    selectedDate.getDate()
                );
                setDate(updated);
        }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            mode="time"
            value={date}
            onChange={(event: any, selectedTime?: Date) => {
                setShowTimePicker(false);
                if (!selectedTime) return;

                const updated = new Date(date);
                updated.setHours(selectedTime.getHours());
                updated.setMinutes(selectedTime.getMinutes());
                setDate(updated);
            }}
          />
        )} */}

        {showDatePicker && (
          <DateTimePicker
            mode="date"
            display="spinner"
            value={date}
            onChange={(event, selectedDate) => {
              if (event.type === "dismissed") {
                setShowDatePicker(false);
                return;
              }
              setShowDatePicker(false);
              if (selectedDate) {
                const updated = new Date(date);
                updated.setFullYear(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate()
                );
                setDate(updated);
              }
            }}
          />
        )}

        {showTimePicker && (
          <DateTimePicker
            mode="time"
            display="spinner"
            value={date}
            onChange={(event, selectedTime) => {
              if (event.type === "dismissed") {
                setShowTimePicker(false);
                return;
              }
              setShowTimePicker(false);
              if (selectedTime) {
                const updated = new Date(date);
                updated.setHours(selectedTime.getHours());
                updated.setMinutes(selectedTime.getMinutes());
                setDate(updated);
              }
            }}
          />
        )}






      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F9FAFB" },
  container: { paddingHorizontal: 24, paddingTop: 40 },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 30,
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