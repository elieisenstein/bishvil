import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { Card, Text, useTheme, Button, Portal, Modal, Divider, Icon } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { listFilteredRides, Ride, type RideFilters } from "../../lib/rides";
import { formatDateTimeLocal } from "../../lib/datetime";
import type { FeedStackParamList } from "../navigation/AppNavigator";

// Available options
const RIDE_TYPES = ["XC", "Trail", "Enduro", "Gravel", "Road"];
const SKILL_LEVELS = ["Beginner", "Intermediate", "Advanced"];
const DAY_OPTIONS = [1, 3, 7, 14, 30];

export default function FeedScreen() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const navigation = useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const theme = useTheme();

  // Current active filters
  const [filters, setFilters] = useState<RideFilters>({
    rideTypes: [], // Empty = all types
    skillLevels: [], // Empty = all skills (will store 0 or 1 item after update)
    maxDays: 7,
    // No location filter by default
  });

  // Draft filters (for editing in modal before applying)
  const [draftFilters, setDraftFilters] = useState<RideFilters>(filters);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listFilteredRides(filters, 50);
      setRides(data);
    } catch (e: any) {
      console.log("Feed load error:", e?.message ?? e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useFocusEffect(
    useCallback(() => {
      load();
      return () => {};
    }, [load])
  );

  // Build filter summary text
  function getFilterSummary(): string {
    const parts: string[] = [];

    // Ride types
    if (filters.rideTypes.length === 0) {
      parts.push("All types");
    } else if (filters.rideTypes.length === RIDE_TYPES.length) {
      parts.push("All types");
    } else {
      parts.push(filters.rideTypes.join(", "));
    }

    // Skill levels
    if (filters.skillLevels.length === 0) {
      parts.push("All skills");
    } else if (filters.skillLevels.length === SKILL_LEVELS.length) {
      parts.push("All skills");
    } else {
      parts.push(filters.skillLevels.join(", "));
    }

    // Time range
    if (filters.maxDays === 1) {
      parts.push("Today");
    } else {
      parts.push(`${filters.maxDays}d`);
    }

    return parts.join(" • ");
  }

  function openFilterModal() {
    setDraftFilters(filters); // Copy current filters to draft
    setFilterModalVisible(true);
  }

  function applyFilters() {
    setFilters(draftFilters); // Apply draft to active
    setFilterModalVisible(false);
    // Feed will auto-reload via useEffect dependency on filters
  }

  function resetFilters() {
    const defaultFilters: RideFilters = {
      rideTypes: [],
      skillLevels: [],
      maxDays: 7,
    };
    setDraftFilters(defaultFilters);
  }

  function toggleRideType(type: string) {
    const current = draftFilters.rideTypes;
    if (current.includes(type)) {
      setDraftFilters({ ...draftFilters, rideTypes: current.filter(t => t !== type) });
    } else {
      setDraftFilters({ ...draftFilters, rideTypes: [...current, type] });
    }
  }

  function toggleSkillLevel(level: string) {
    const current = draftFilters.skillLevels;
    // Single select behavior - if clicking same level, deselect (empty = all)
    if (current.length === 1 && current[0] === level) {
      setDraftFilters({ ...draftFilters, skillLevels: [] });
    } else {
      // Select this level only
      setDraftFilters({ ...draftFilters, skillLevels: [level] });
    }
  }

  return (
    <>
      <ScrollView
        style={{ flex: 1, backgroundColor: theme.colors.background }}
        contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        {/* Filter Summary */}
        <View style={{ 
          flexDirection: "row", 
          alignItems: "center", 
          marginBottom: 12,
          padding: 12,
          backgroundColor: theme.colors.surfaceVariant,
          borderRadius: 8,
        }}>
          <Text style={{ flex: 1, color: theme.colors.onSurfaceVariant, fontSize: 12 }}>
            Filters: {getFilterSummary()}
          </Text>
          <Button 
            mode="contained" 
            compact
            onPress={openFilterModal}
          >
            Edit
          </Button>
        </View>

        {/* Ride List */}
        <View style={{ gap: 12 }}>
          {rides.length === 0 ? (
            <Card>
              <Card.Content style={{ alignItems: 'center', padding: 32 }}>
                <Icon source="bike-fast" size={64} color={theme.colors.outline} />
                <Text 
                  variant="titleMedium" 
                  style={{ marginTop: 16, marginBottom: 8, textAlign: 'center' }}
                >
                  No rides found
                </Text>
                <Text 
                  style={{ opacity: 0.7, textAlign: 'center', marginBottom: 16 }}
                >
                  Try adjusting your filters or be the first to create a ride!
                </Text>
                <Button 
                  mode="outlined" 
                  onPress={openFilterModal}
                  icon="filter-variant"
                >
                  Adjust Filters
                </Button>
              </Card.Content>
            </Card>
          ) : (
            rides.map((r) => (
              <Card
                key={r.id}
                onPress={() => navigation.navigate("RideDetails", { rideId: r.id })}
              >
                <Card.Content style={{ gap: 6 }}>
                  <Text variant="titleMedium">
                    {r.ride_type} · {r.skill_level}
                  </Text>

                  <Text style={{ opacity: 0.8 }}>
                    When: {(() => {
                      const startDate = new Date(r.start_at);
                      const endDate = new Date(startDate);
                      endDate.setHours(endDate.getHours() + r.duration_hours);
                      
                      const dateStr = startDate.toLocaleDateString('he-IL', { 
                        day: '2-digit',
                        month: '2-digit', 
                        year: 'numeric'
                      });
                      const startTime = startDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
                      const endTime = endDate.toLocaleTimeString('he-IL', { hour: '2-digit', minute: '2-digit' });
                      
                      return `${dateStr} ${startTime}-${endTime} (${r.duration_hours}h)`;
                    })()}
                  </Text>

                  <Text style={{ opacity: 0.8 }}>
                    Where: {r.start_name || "Location TBD"}
                  </Text>

                  {r.notes && (
                    <Text style={{ opacity: 0.8, fontStyle: 'italic' }}>
                      Route: {r.notes}
                    </Text>
                  )}

                  <Text style={{ opacity: 0.8 }}>
                    Group: {r.join_mode} · max {r.max_participants}
                  </Text>

                  {r.distance_km != null || r.elevation_m != null ? (
                    <Text style={{ opacity: 0.8 }}>
                      {r.distance_km != null ? `${r.distance_km} km` : ""}
                      {r.distance_km != null && r.elevation_m != null ? " · " : ""}
                      {r.elevation_m != null ? `${r.elevation_m} m` : ""}
                    </Text>
                  ) : null}
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>

      {/* Filter Modal */}
      <Portal>
        <Modal
          visible={filterModalVisible}
          onDismiss={() => setFilterModalVisible(false)}
          contentContainerStyle={{
            backgroundColor: theme.colors.surface,
            margin: 20,
            padding: 20,
            borderRadius: 8,
          }}
        >
          <Text variant="titleLarge" style={{ marginBottom: 16 }}>
            Filter Rides
          </Text>

          {/* Ride Types */}
          <Text variant="titleMedium" style={{ marginTop: 8, marginBottom: 8 }}>
            Ride Types
          </Text>
          <Text style={{ opacity: 0.7, marginBottom: 8, fontSize: 12 }}>
            Select none for all types
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {RIDE_TYPES.map(type => (
              <Button
                key={type}
                mode={draftFilters.rideTypes.includes(type) ? "contained" : "outlined"}
                onPress={() => toggleRideType(type)}
                buttonColor={type === "Road" && draftFilters.rideTypes.includes(type) ? "#2196F3" : undefined}
                textColor={type === "Road" && !draftFilters.rideTypes.includes(type) ? "#2196F3" : undefined}
              >
                {type}
              </Button>
            ))}
          </View>

          <Divider style={{ marginVertical: 12 }} />

          {/* Skill Levels */}
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>
            Skill Level
          </Text>
          <Text style={{ opacity: 0.7, marginBottom: 8, fontSize: 12 }}>
            Select one or leave blank for all
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {SKILL_LEVELS.map(level => (
              <Button
                key={level}
                mode={draftFilters.skillLevels.includes(level) ? "contained" : "outlined"}
                onPress={() => toggleSkillLevel(level)}
              >
                {level}
              </Button>
            ))}
          </View>

          <Divider style={{ marginVertical: 12 }} />

          {/* Time Range */}
          <Text variant="titleMedium" style={{ marginBottom: 8 }}>
            Time Range
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {DAY_OPTIONS.map(days => (
              <Button
                key={days}
                mode={draftFilters.maxDays === days ? "contained" : "outlined"}
                onPress={() => setDraftFilters({ ...draftFilters, maxDays: days })}
                style={{ minWidth: 80 }}
              >
                {days === 1 ? "Today" : `${days}d`}
              </Button>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
            <Button 
              mode="outlined" 
              onPress={resetFilters}
              style={{ flex: 1 }}
            >
              Reset
            </Button>
            <Button 
                mode="contained" 
                onPress={applyFilters}
                style={{ flex: 1 }}
              >
                Apply
              </Button>
            </View>
        </Modal>
      </Portal>
    </>
  );
}
