import React, { useState } from 'react';
import { TextInput as RNTextInput, View, Text, StyleSheet, TextInputProps as RNTextInputProps } from 'react-native';
import { colors, radius, spacing, typography } from '../../lib/theme';

interface TextInputProps extends RNTextInputProps {
  label?: string;
  error?: string;
  maxLength?: number;
  showCharCount?: boolean;
}

export function TextInput({
  label,
  error,
  maxLength,
  showCharCount,
  style,
  value,
  onChangeText,
  multiline,
  ...props
}: TextInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      <RNTextInput
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        maxLength={maxLength}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          multiline && styles.multiline,
          focused && styles.focused,
          error && styles.error,
          style,
        ]}
        {...props}
      />
      <View style={styles.footer}>
        {error ? (
          <Text style={styles.errorText}>{error}</Text>
        ) : (
          <View />
        )}
        {showCharCount && maxLength && (
          <Text style={styles.charCount}>{(value?.length ?? 0)}/{maxLength}</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.micro,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.input,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 4,
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
  },
  multiline: {
    minHeight: 100,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  focused: {
    borderColor: colors.borderActive,
  },
  error: {
    borderColor: colors.tierNonNeg,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  errorText: {
    ...typography.caption,
    color: colors.tierNonNeg,
  },
  charCount: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
