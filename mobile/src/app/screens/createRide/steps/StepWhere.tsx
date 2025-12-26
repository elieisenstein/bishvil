import React from "react";
import { View } from "react-native";
import { Text, TextInput, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { CreateRideDraft } from "../createRideTypes";

export default function StepWhere({
  draft,
  onChange,
}: {
  draft: CreateRideDraft;
  onChange: (patch: Partial<CreateRideDraft>) => void;
}) {
  const theme = useTheme();
  const { t } = useTranslation();

  return (
    <View style={{ gap: 16 }}>
      <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
        {t("createRide.where.title")}
      </Text>

      {/* Meeting Point */}
      <TextInput
        label={t("createRide.where.meetingPointLabel")}
        placeholder={t("createRide.where.meetingPointPlaceholder")}
        value={draft.start_name || ""}
        onChangeText={(text) => onChange({ start_name: text })}
        mode="outlined"
        style={{ backgroundColor: theme.colors.surface }}
      />

      <Text style={{ opacity: 0.7, fontSize: 12, marginTop: -8 }}>
        {t("createRide.where.meetingPointHelp")}
      </Text>

      {/* Optional Route Description */}
      <TextInput
        label={t("createRide.where.routeLabel")}
        placeholder={t("createRide.where.routePlaceholder")}
        value={draft.notes || ""}
        onChangeText={(text) => onChange({ notes: text })}
        mode="outlined"
        multiline
        numberOfLines={3}
        style={{ backgroundColor: theme.colors.surface }}
      />

      <Text style={{ opacity: 0.7, fontSize: 12, marginTop: -8 }}>
        {t("createRide.where.routeHelp")}
      </Text>

      {/* Summary Display */}
      {draft.start_name && (
        <View 
          style={{ 
            padding: 16, 
            backgroundColor: theme.colors.surfaceVariant,
            borderRadius: 8,
            marginTop: 8
          }}
        >
          <Text style={{ opacity: 0.7, fontSize: 12 }}>
            {t("createRide.where.summaryMeeting")}
          </Text>
          <Text variant="titleMedium" style={{ color: theme.colors.onBackground }}>
            {draft.start_name}
          </Text>
          {draft.notes && (
            <>
              <Text style={{ opacity: 0.7, fontSize: 12, marginTop: 8 }}>
                {t("createRide.where.summaryRoute")}
              </Text>
              <Text style={{ color: theme.colors.onBackground }}>
                {draft.notes}
              </Text>
            </>
          )}
        </View>
      )}
    </View>
  );
}
