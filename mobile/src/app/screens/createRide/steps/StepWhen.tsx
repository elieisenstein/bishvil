import React, { useState } from "react";
import { View, Platform, Alert } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTranslation } from "react-i18next";
import { CreateRideDraft } from "../createRideTypes";

export default function StepWhen({
  draft,
  onChange,
}: {
  draft: CreateRideDraft;
  onChange: (patch: Partial<CreateRideDraft>) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();
  
  const getDefaultDate = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1, 0, 0, 0);
    return now;
  };
  
  const selectedDate = draft.start_at ? new Date(draft.start_at) : getDefaultDate();
  
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);

  function handleDateChange(event: any, date?: Date) {
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }
    
    if (date) {
      const newDate = new Date(selectedDate);
      newDate.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
      
      const now = new Date();
      if (newDate < now) {
        Alert.alert(t("common.error"), t("createRide.when.pastError"));
        return;
      }
      
      onChange({ start_at: newDate.toISOString() });
    }
  }

  function handleTimeChange(event: any, date?: Date) {
    if (Platform.OS === "android") {
      setShowTimePicker(false);
    }
    
    if (date) {
      const newDate = new Date(selectedDate);
      newDate.setHours(date.getHours(), date.getMinutes(), 0, 0);
      
      const now = new Date();
      if (newDate < now) {
        Alert.alert(t("common.error"), t("createRide.when.pastError"));
        return;
      }
      
      onChange({ start_at: newDate.toISOString() });
    }
  }

  return (
    <View style={{ gap: 16 }}>
      <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
        {t("createRide.when.title")}
      </Text>

      {/* Date/Time Selection */}
      <View style={{ gap: 8 }}>
        <Text style={{ color: theme.colors.onBackground, opacity: 0.7 }}>
          {t("createRide.when.chooseDateTime")}
        </Text>

        {/* Date Picker */}
        {Platform.OS === "android" && (
          <Button 
            mode="contained" 
            onPress={() => setShowDatePicker(true)}
            icon="calendar"
          >
            {selectedDate.toLocaleDateString()}
          </Button>
        )}

        {(showDatePicker || Platform.OS === "ios") && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleDateChange}
            minimumDate={new Date()}
            style={{ backgroundColor: theme.colors.surface }}
          />
        )}

        {/* Time Picker */}
        {Platform.OS === "android" && (
          <Button 
            mode="contained" 
            onPress={() => setShowTimePicker(true)}
            icon="clock-outline"
          >
            {selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Button>
        )}

        {(showTimePicker || Platform.OS === "ios") && (
          <DateTimePicker
            value={selectedDate}
            mode="time"
            display={Platform.OS === "ios" ? "spinner" : "default"}
            onChange={handleTimeChange}
            style={{ backgroundColor: theme.colors.surface }}
          />
        )}
      </View>

      {/* Selected Date/Time Display */}
      <View 
        style={{ 
          padding: 16, 
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 8 
        }}
      >
        <Text style={{ color: theme.colors.onBackground, opacity: 0.7 }}>
          {t("createRide.when.selected")}
        </Text>
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
          {selectedDate.toLocaleDateString('he-IL', { 
            weekday: 'short',
            month: 'short', 
            day: 'numeric',
            year: 'numeric'
          })}
        </Text>
        <Text variant="titleLarge" style={{ color: theme.colors.onBackground }}>
          {selectedDate.toLocaleTimeString('he-IL', { 
            hour: '2-digit', 
            minute: '2-digit'
          })}
        </Text>
      </View>

      {/* Duration Picker */}
      <View style={{ gap: 8, marginTop: 8 }}>
        <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
          {t("createRide.when.duration")}
        </Text>
        
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((hours) => (
            <Button
              key={hours}
              mode={draft.duration_hours === hours ? "contained" : "outlined"}
              onPress={() => onChange({ duration_hours: hours })}
              style={{ minWidth: 70 }}
            >
              {hours}h
            </Button>
          ))}
        </View>

        {/* Show end time if duration is selected */}
        {draft.duration_hours && (
          <Text style={{ color: theme.colors.onBackground, opacity: 0.7, marginTop: 4 }}>
            {t("createRide.when.endsAt", {
              time: (() => {
                const endDate = new Date(selectedDate);
                endDate.setHours(endDate.getHours() + draft.duration_hours);
                return endDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
              })(),
              hours: draft.duration_hours
            })}
          </Text>
        )}
      </View>
    </View>
  );
}
