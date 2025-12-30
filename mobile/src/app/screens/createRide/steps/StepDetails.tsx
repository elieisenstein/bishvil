import React from "react";
import { View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { CreateRideDraft, RideType, SkillLevel } from "../createRideTypes";

const rideTypes: RideType[] = ["XC", "Trail", "Enduro", "Gravel", "Road"];
const skillLevels: SkillLevel[] = ["Beginner", "Intermediate", "Advanced"];
const paceOptions = ["Slow", "Moderate", "Fast"];

export default function StepDetails({
  draft,
  onChange,
}: {
  draft: CreateRideDraft;
  onChange: (patch: Partial<CreateRideDraft>) => void;
}) {
  const { t } = useTranslation();

  return (
    <View style={{ gap: 12 }}>
      <Text>{t("createRide.details.rideType")}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {rideTypes.map((rt) => (
          <Button 
            key={rt} 
            mode={draft.ride_type === rt ? "contained" : "outlined"} 
            onPress={() => onChange({ ride_type: rt })}
            buttonColor={rt === "Road" && draft.ride_type === rt ? "#2196F3" : undefined}
            textColor={rt === "Road" && draft.ride_type !== rt ? "#2196F3" : undefined}
          >
            {t(`rideTypes.${rt}`)}
          </Button>
        ))}
      </View>

      <Text>{t("createRide.details.skillLevel")}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {skillLevels.map((sl) => (
          <Button 
            key={sl} 
            mode={draft.skill_level === sl ? "contained" : "outlined"} 
            onPress={() => onChange({ skill_level: sl })}
          >
            {t(`skillLevels.${sl}`)}
          </Button>
        ))}
      </View>

      <Text>{t("profile.pace")}</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {paceOptions.map((pace) => (
          <Button 
            key={pace} 
            mode={draft.pace === pace ? "contained" : "outlined"} 
            onPress={() => onChange({ pace: pace as "Slow" | "Moderate" | "Fast" })}
          >
            {t(`paceOptions.${pace}`)}
          </Button>
        ))}
      </View>

      <TextInput
        label={t("createRide.details.distance")}
        value={draft.distance_km?.toString() ?? ""}
        onChangeText={(v) => onChange({ distance_km: v === "" ? null : Number(v) })}
        keyboardType="numeric"
      />

      <TextInput
        label={t("createRide.details.elevation")}
        value={draft.elevation_m?.toString() ?? ""}
        onChangeText={(v) => onChange({ elevation_m: v === "" ? null : Number(v) })}
        keyboardType="numeric"
      />
    </View>
  );
}