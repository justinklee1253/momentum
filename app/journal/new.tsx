import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Svg, { Path } from "react-native-svg";
import { colors, typography, spacing, radius } from "../../lib/theme";
import { SegmentedControl } from "../../components/ui/SegmentedControl";
import { TextInput } from "../../components/ui/TextInput";
import { useSignalLog } from "../../hooks/useSignalLog";
import { useUserId } from "../../hooks/useUserId";
import { JournalMode } from "../../lib/constants";

const MODE_LABELS = ["OPEN", "STRUCTURED", "SYSTEM"];

export default function NewJournalScreen() {
  const userId = useUserId();
  const { createEntry, isCreating } = useSignalLog(userId);

  const [modeIndex, setModeIndex] = useState(0);
  const [clarity, setClarity] = useState(5);
  const [openContent, setOpenContent] = useState("");
  const [executedWell, setExecutedWell] = useState("");
  const [needsAdjustment, setNeedsAdjustment] = useState("");
  const [keyInsight, setKeyInsight] = useState("");

  const mode =
    modeIndex === 0
      ? JournalMode.OPEN
      : modeIndex === 1
        ? JournalMode.STRUCTURED
        : JournalMode.SYSTEM;

  const canSave =
    mode === JournalMode.OPEN
      ? openContent.trim().length > 0
      : mode === JournalMode.STRUCTURED
        ? executedWell.trim().length > 0 ||
          needsAdjustment.trim().length > 0 ||
          keyInsight.trim().length > 0
        : false;

  async function handleSave() {
    let content = "";

    if (mode === JournalMode.OPEN) {
      content = openContent.trim();
    } else if (mode === JournalMode.STRUCTURED) {
      const parts = [];
      if (executedWell.trim())
        parts.push(`EXECUTED WELL:\n${executedWell.trim()}`);
      if (needsAdjustment.trim())
        parts.push(`NEEDS ADJUSTMENT:\n${needsAdjustment.trim()}`);
      if (keyInsight.trim()) parts.push(`KEY INSIGHT:\n${keyInsight.trim()}`);
      content = parts.join("\n\n");
    }

    if (!content) return;

    try {
      await createEntry({ content, mood: clarity });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (err: any) {
      Alert.alert("Failed to save signal", err.message);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <SafeAreaView style={styles.safe}>
        <View style={styles.modalHeader}>
          <Pressable onPress={() => router.back()} style={styles.cancelBtn}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Text style={styles.title}>LOG SIGNAL</Text>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Mode selector */}
          <View style={styles.modeSection}>
            <SegmentedControl
              options={MODE_LABELS}
              selectedIndex={modeIndex}
              onChange={setModeIndex}
            />
          </View>

          {/* OPEN mode */}
          {mode === JournalMode.OPEN && (
            <View style={styles.fieldSection}>
              <TextInput
                label="FREE WRITE"
                value={openContent}
                onChangeText={setOpenContent}
                placeholder="Log your operational state. No structure required."
                multiline
                style={styles.openTextarea}
                maxLength={2000}
                showCharCount
              />
            </View>
          )}

          {/* STRUCTURED mode */}
          {mode === JournalMode.STRUCTURED && (
            <View style={styles.fieldSection}>
              <View style={styles.structuredField}>
                <TextInput
                  label="WHAT EXECUTED WELL"
                  value={executedWell}
                  onChangeText={setExecutedWell}
                  placeholder="Protocols held, deep work completed, momentum maintained..."
                  multiline
                  style={styles.structuredTextarea}
                  maxLength={600}
                  showCharCount
                />
              </View>
              <View style={styles.structuredField}>
                <TextInput
                  label="WHAT NEEDS ADJUSTMENT"
                  value={needsAdjustment}
                  onChangeText={setNeedsAdjustment}
                  placeholder="Friction points, missed windows, execution gaps..."
                  multiline
                  style={styles.structuredTextarea}
                  maxLength={600}
                  showCharCount
                />
              </View>
              <View style={styles.structuredField}>
                <TextInput
                  label="KEY INSIGHT"
                  value={keyInsight}
                  onChangeText={setKeyInsight}
                  placeholder="One thing learned or observed today..."
                  multiline
                  style={styles.structuredTextarea}
                  maxLength={400}
                  showCharCount
                />
              </View>
            </View>
          )}

          {/* SYSTEM mode — skeleton */}
          {mode === JournalMode.SYSTEM && (
            <View style={styles.systemSkeleton}>
              <Text style={styles.systemLabel}>SYSTEM MODE</Text>
              <Text style={styles.systemText}>
                AI-generated journaling prompts based on your execution data.
                Coming in the next update.
              </Text>
            </View>
          )}

          {/* Clarity picker */}
          {mode !== JournalMode.SYSTEM && (
            <View style={styles.claritySection}>
              <Text style={styles.clarityLabel}>CLARITY — {clarity}/10</Text>
              <Text style={styles.clarityDesc}>
                Mental clarity and focus level for today
              </Text>
              <View style={styles.clarityRow}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                  <Pressable
                    key={val}
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setClarity(val);
                    }}
                    style={[
                      styles.clarityButton,
                      val <= clarity && styles.clarityButtonActive,
                      val === clarity && styles.clarityButtonSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.clarityButtonText,
                        val <= clarity && styles.clarityButtonTextActive,
                      ]}
                    >
                      {val}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <View style={styles.clarityScale}>
                <Text style={styles.clarityScaleLabel}>LOW</Text>
                <Text style={styles.clarityScaleLabel}>HIGH</Text>
              </View>
            </View>
          )}

          {mode !== JournalMode.SYSTEM && (
            <View style={styles.deployBtnWrap}>
              <Pressable onPress={handleSave} disabled={!canSave || isCreating}>
                <View style={styles.deployBtn}>
                  {isCreating ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.signalOrange}
                    />
                  ) : (
                    <View style={styles.deployBtnInner}>
                      <View style={styles.deployBtnIcon}>
                        <Svg
                          width={12}
                          height={12}
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <Path
                            d="M12 5v14M5 12h14"
                            stroke={
                              canSave ? colors.signalOrange : colors.textMuted
                            }
                            strokeWidth={2.5}
                            strokeLinecap="round"
                          />
                        </Svg>
                      </View>
                      <Text
                        style={[
                          styles.deployBtnText,
                          !canSave && styles.deployBtnTextDisabled,
                        ]}
                      >
                        SAVE SIGNAL
                      </Text>
                    </View>
                  )}
                </View>
              </Pressable>
            </View>
          )}

          <View style={{ height: spacing.xxl }} />
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  safe: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelBtn: {
    padding: spacing.xs,
  },
  cancelText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  title: {
    ...typography.micro,
    color: colors.textPrimary,
    letterSpacing: 2,
  },
  headerSpacer: {
    width: 64,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  modeSection: {
    marginBottom: spacing.lg,
  },
  fieldSection: {
    marginBottom: spacing.lg,
    gap: spacing.md,
  },
  openTextarea: {
    minHeight: 200,
  },
  structuredField: {},
  structuredTextarea: {
    minHeight: 100,
  },
  systemSkeleton: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    marginBottom: spacing.lg,
    minHeight: 160,
    justifyContent: "center",
  },
  systemLabel: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: spacing.sm,
  },
  systemText: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 24,
  },
  claritySection: {
    marginBottom: spacing.lg,
  },
  clarityLabel: {
    ...typography.micro,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  clarityDesc: {
    ...typography.caption,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  clarityRow: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  clarityButton: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
  },
  clarityButtonActive: {
    backgroundColor: colors.accentDim,
    borderColor: colors.borderActive,
  },
  clarityButtonSelected: {
    backgroundColor: colors.accentMuted,
    borderColor: colors.accent,
  },
  clarityButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.textMuted,
  },
  clarityButtonTextActive: {
    color: colors.accent,
  },
  clarityScale: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.xs,
  },
  clarityScaleLabel: {
    ...typography.micro,
    color: colors.textMuted,
    fontSize: 9,
  },
  deployBtnWrap: {
    position: "relative",
    marginTop: spacing.sm,
  },
  deployBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: radius.md,
    borderWidth: 0,
    backgroundColor: colors.input,
  },
  deployBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  deployBtnIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "rgba(249, 115, 22, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  deployBtnText: {
    fontFamily: "Inter_600SemiBold",
    fontSize: 12,
    letterSpacing: 1.5,
    color: colors.signalOrange,
  },
  deployBtnTextDisabled: {
    color: colors.textMuted,
  },
});
