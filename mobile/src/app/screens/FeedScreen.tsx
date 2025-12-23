import React, { useCallback, useState } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { Card, Text, useTheme } from "react-native-paper";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { listPublishedUpcomingRides, Ride } from "../../lib/rides";
import { formatDateTimeLocal } from "../../lib/datetime";
import type { FeedStackParamList } from "../navigation/AppNavigator";

export default function FeedScreen() {
  const [rides, setRides] = useState<Ride[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const navigation = useNavigation<NativeStackNavigationProp<FeedStackParamList>>();
  const theme = useTheme();


  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listPublishedUpcomingRides(50);
      setRides(data);
    } catch (e: any) {
      console.log("Feed load error:", e?.message ?? e);
    } finally {
      setLoading(false);
    }
  }, []);

  
  useFocusEffect(
    useCallback(() => {
      load();
      // no cleanup needed
      return () => {};
    }, [load])
  );

  return (
  <ScrollView
    style={{ flex: 1, backgroundColor: theme.colors.background }}
    contentContainerStyle={{ padding: 16, paddingBottom: 24 }}
    refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
  >
 

  <Text style={{ marginBottom: 8, color: theme.colors.onBackground, opacity: 0.7 }}>
    Drag down to refresh · Upcoming rides
  </Text>

<View style={{ marginTop: 12, gap: 12 }}>
  {rides.length === 0 ? (
    <Card>
      <Card.Content>
        <Text>No rides yet. Create one from the Create tab.</Text>
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
            When: {formatDateTimeLocal(r.start_at)}
          </Text>

          <Text style={{ opacity: 0.8 }}>
            Where:{" "}
            {r.start_name ??
              `${r.start_lat.toFixed(4)}, ${r.start_lng.toFixed(4)}`}
          </Text>

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
);
}
