import React from "react";
import { View } from "react-native";
import { Button, Text, TextInput } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { CreateRideDraft, JoinMode } from "../createRideTypes";

const joinModes: { mode: JoinMode }[] = [
  { mode: "express" },
  { mode: "approval" },
];

export default function StepGroup({
  draft,
  onChange,
}: {
  draft: CreateRideDraft;
  onChange: (patch: Partial<CreateRideDraft>) => void;
}) {
  const { t } = useTranslation();

  return (
    <View style={{ gap: 12 }}>
      <Text>{t("createRide.group.joinMode")}</Text>
      <View style={{ gap: 8 }}>
        {joinModes.map((jm) => (
          <Button
            key={jm.mode}
            mode={draft.join_mode === jm.mode ? "contained" : "outlined"}
            onPress={() => onChange({ join_mode: jm.mode })}
          >
            {t(`createRide.group.joinModes.${jm.mode}`)}
          </Button>
        ))}
      </View>

      <TextInput
        label={t("createRide.group.maxParticipants")}
        value={draft.max_participants?.toString() ?? "4"}
        onChangeText={(v) => onChange({ max_participants: v === "" ? undefined : Number(v) })}
        keyboardType="numeric"
      />

      <Text style={{ opacity: 0.7 }}>
        {t("createRide.group.recommendation")}
      </Text>
    </View>
  );
}
