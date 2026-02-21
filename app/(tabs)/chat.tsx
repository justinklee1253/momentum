import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { useQuery } from '@tanstack/react-query';
import { colors, typography, spacing, radius, fontWeights } from '../../lib/theme';
import { useSystem } from '../../hooks/useSystem';
import { useUserId } from '../../hooks/useUserId';
import { useMetrics } from '../../hooks/useMetrics';
import { supabase } from '../../lib/supabase';
import { AIConversation } from '../../lib/database.types';
import { CoachingStyle, COACHING_STYLE_LABELS } from '../../lib/constants';

function BoltIcon() {
  return (
    <Svg width={10} height={11.43} viewBox="0 0 26.25 30.0011" fill="none">
      <Path
        d="M20.4727 2.61381C20.8184 1.81108 20.5605 0.873577 19.8516 0.357952C19.1426 -0.157673 18.1758 -0.110798 17.5137 0.463421L2.51367 13.5884C1.92773 14.104 1.7168 14.9302 1.99219 15.6568C2.26758 16.3833 2.9707 16.8755 3.75 16.8755H10.2832L5.77734 27.3872C5.43164 28.19 5.68945 29.1275 6.39844 29.6431C7.10742 30.1587 8.07422 30.1119 8.73633 29.5376L23.7363 16.4126C24.3223 15.897 24.5332 15.0708 24.2578 14.3443C23.9824 13.6177 23.2852 13.1314 22.5 13.1314H15.9668L20.4727 2.61381V2.61381"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function BoltIconLarge() {
  return (
    <Svg width={26.25} height={30} viewBox="0 0 26.25 30.0011" fill="none">
      <Path
        d="M20.4727 2.61381C20.8184 1.81108 20.5605 0.873577 19.8516 0.357952C19.1426 -0.157673 18.1758 -0.110798 17.5137 0.463421L2.51367 13.5884C1.92773 14.104 1.7168 14.9302 1.99219 15.6568C2.26758 16.3833 2.9707 16.8755 3.75 16.8755H10.2832L5.77734 27.3872C5.43164 28.19 5.68945 29.1275 6.39844 29.6431C7.10742 30.1587 8.07422 30.1119 8.73633 29.5376L23.7363 16.4126C24.3223 15.897 24.5332 15.0708 24.2578 14.3443C23.9824 13.6177 23.2852 13.1314 22.5 13.1314H15.9668L20.4727 2.61381V2.61381"
        fill="#3B82F6"
      />
    </Svg>
  );
}

function HistoryIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 14 14" fill="none">
      <Path
        d="M2.05078 2.05078L1.12109 1.12109C0.708203 0.708203 0 1.00078 0 1.5832V4.59375C0 4.95742 0.292578 5.25 0.65625 5.25H3.6668C4.25195 5.25 4.54453 4.5418 4.13164 4.12891L3.28945 3.28672C4.23828 2.33789 5.55078 1.75 7 1.75C9.89844 1.75 12.25 4.10156 12.25 7C12.25 9.89844 9.89844 12.25 7 12.25C5.88437 12.25 4.85078 11.9027 4.00039 11.3094C3.60391 11.0332 3.05977 11.1289 2.78086 11.5254C2.50195 11.9219 2.60039 12.466 2.99688 12.7449C4.13438 13.5352 5.51523 14 7 14C10.8664 14 14 10.8664 14 7C14 3.13359 10.8664 0 7 0C5.0668 0 3.3168 0.784766 2.05078 2.05078V2.05078M7 3.5C6.63633 3.5 6.34375 3.79258 6.34375 4.15625V7C6.34375 7.175 6.41211 7.3418 6.53516 7.46484L8.50391 9.43359C8.76094 9.69063 9.17656 9.69063 9.43086 9.43359C9.68516 9.17655 9.68789 8.76094 9.43086 8.50664L7.65352 6.7293V4.15625C7.65352 3.79258 7.36094 3.5 6.99727 3.5H7"
        fill="#A1A1AA"
      />
    </Svg>
  );
}

function PlanDayIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 14 14" fill="none">
      <Path
        d="M1 5h12M4 1v2M10 1v2M2 3h10a1 1 0 0 1 1 1v8a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        stroke={colors.textSecondary}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ReviewLogsIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 14 14" fill="none">
      <Path
        d="M5 3h8M5 7h8M5 11h8M1.5 3h0M1.5 7h0M1.5 11h0"
        stroke={colors.textSecondary}
        strokeWidth={1.4}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ReflectIcon() {
  return (
    <Svg width={11} height={11} viewBox="0 0 14 14" fill="none">
      <Path
        d="M7 1C4.24 1 2 3.24 2 6c0 1.4.58 2.66 1.5 3.56V12l2-1.2A5.07 5.07 0 0 0 7 11c2.76 0 5-2.24 5-5S9.76 1 7 1Z"
        stroke={colors.accent}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlusIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke="#FFFFFF"
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function MicIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3Z"
        stroke={colors.textMuted}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"
        stroke={colors.textMuted}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function HeadphoneIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 18v-6a9 9 0 0 1 18 0v6M3 18a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v4M21 18a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4"
        stroke="#000000"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function getModeColor(mode: CoachingStyle): string {
  switch (mode) {
    case CoachingStyle.DIRECT: return colors.direct;
    case CoachingStyle.STRATEGIC: return colors.strategic;
    case CoachingStyle.DRIVEN: return colors.driven;
    default: return colors.textSecondary;
  }
}

function Header({ score, coachingStyle }: { score: number; coachingStyle: CoachingStyle }) {
  const insets = useSafeAreaInsets();
  const modeColor = getModeColor(coachingStyle);

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerLeft}>
        <LinearGradient
          colors={['#3B82F6', '#9333EA']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.logoGradient}
        >
          <BoltIcon />
        </LinearGradient>
        <View>
          <Text style={styles.logoText}>MOMENTUM</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: modeColor }]} />
            <Text style={styles.modeText}>
              MODE: {COACHING_STYLE_LABELS[coachingStyle]}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.headerRight}>
        <Pressable
          style={styles.iconBtn}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <HistoryIcon />
        </Pressable>
        <Pressable
          style={styles.avatarWrap}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/settings');
          }}
        >
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitial}>U</Text>
          </View>
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreBadgeText}>{Math.round(score)}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function MessageBubble({ message }: { message: AIConversation }) {
  const isUser = message.role === 'USER';
  return (
    <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAI]}>
      {!isUser && (
        <Text style={styles.roleLabel}>SYSTEM</Text>
      )}
      <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAI]}>
        {message.content}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const SUGGESTIONS = [
  { id: 'plan', label: 'Plan day', icon: PlanDayIcon },
  { id: 'logs', label: 'Review logs', icon: ReviewLogsIcon },
  { id: 'reflect', label: 'Reflect', icon: ReflectIcon },
] as const;

export default function ChatTab() {
  const userId = useUserId();
  const metrics = useMetrics(userId);
  const { data: messages, isLoading, sendMessage, isSending } = useSystem(userId);
  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { data: profile } = useQuery({
    queryKey: ['ai_personality', userId],
    enabled: !!userId,
    queryFn: async () => {
      const { data } = await supabase
        .from('ai_personality_profiles')
        .select('coaching_style')
        .eq('user_id', userId!)
        .single();
      return data as { coaching_style: CoachingStyle } | null;
    },
  });
  const coachingStyle = profile?.coaching_style ?? CoachingStyle.DIRECT;

  async function handleSend() {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      await sendMessage(text);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch {
      // Error handled by mutation
    }
  }

  function onSuggestion(id: string, label: string) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (id === 'plan') {
      router.push('/(tabs)/calendar');
      return;
    }
    if (id === 'logs') {
      router.push('/journal');
      return;
    }
    setInput(label);
  }

  const hasMessages = messages && messages.length > 0;

  return (
    <View style={styles.container}>
      <Header score={metrics.data?.momentumScore ?? 0} coachingStyle={coachingStyle} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : !hasMessages ? (
          <View style={styles.flex}>
            {/* Centered hero */}
            <View style={styles.heroArea}>
              <View style={styles.emptyIconCard}>
                <BoltIconLarge />
              </View>
              <Text style={styles.emptyTitle}>How can I help you today?</Text>
            </View>

            {/* Bottom-pinned: pills + input */}
            <View style={styles.bottomArea}>
              <View style={styles.pillRow}>
                {SUGGESTIONS.map(({ id, label, icon: Icon }) => (
                  <Pressable
                    key={id}
                    onPress={() => onSuggestion(id, label)}
                    style={styles.pill}
                  >
                    <View style={styles.pillInner}>
                      <Icon />
                      <Text style={styles.pillText}>{label}</Text>
                    </View>
                  </Pressable>
                ))}
              </View>

              <View style={styles.inputRow}>
                <View style={styles.circleBtn}>
                  <Pressable
                    style={styles.circleBtnPress}
                    onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                  >
                    <PlusIcon />
                  </Pressable>
                </View>

                <View style={styles.inputWrap}>
                  <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Ask anything..."
                    placeholderTextColor="#71717A"
                    style={styles.textInput}
                    multiline
                    maxLength={500}
                    onSubmitEditing={handleSend}
                  />
                  <Pressable style={styles.inputTrailing}>
                    <MicIcon />
                  </Pressable>
                </View>

                <View style={styles.sendBtn}>
                  <Pressable
                    onPress={handleSend}
                    disabled={isSending}
                    style={styles.circleBtnPress}
                  >
                    {isSending ? (
                      <ActivityIndicator size="small" color="#000" />
                    ) : (
                      <HeadphoneIcon />
                    )}
                  </Pressable>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.flex}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <MessageBubble message={item} />}
              contentContainerStyle={styles.messageList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
              ListFooterComponent={
                isSending ? (
                  <View style={styles.typingIndicator}>
                    <Text style={styles.typingText}>SYSTEM PROCESSING...</Text>
                  </View>
                ) : null
              }
            />

            <View style={styles.inputRowMessages}>
              <View style={styles.circleBtn}>
                <Pressable
                  style={styles.circleBtnPress}
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
                >
                  <PlusIcon />
                </Pressable>
              </View>

              <View style={styles.inputWrap}>
                <TextInput
                  value={input}
                  onChangeText={setInput}
                  placeholder="Ask anything..."
                  placeholderTextColor="#71717A"
                  style={styles.textInput}
                  multiline
                  maxLength={500}
                  onSubmitEditing={handleSend}
                />
                <Pressable style={styles.inputTrailing}>
                  <MicIcon />
                </Pressable>
              </View>

              <View style={styles.sendBtn}>
                <Pressable
                  onPress={handleSend}
                  disabled={isSending}
                  style={styles.circleBtnPress}
                >
                  {isSending ? (
                    <ActivityIndicator size="small" color="#000" />
                  ) : (
                    <HeadphoneIcon />
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 17,
    paddingBottom: 13,
    backgroundColor: 'rgba(24,24,27,0.7)',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.indexBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
  },
  logoText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.4,
    color: '#EDEDED',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  modeText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    lineHeight: 14,
    letterSpacing: 0.45,
    color: colors.textPrimary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarInitial: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    color: colors.textSecondary,
  },
  scoreBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scoreBadgeText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 8,
    lineHeight: 12,
    color: colors.indexBlue,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  emptyIconCard: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    backgroundColor: colors.input,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 8,
  },
  emptyTitle: {
    fontFamily: 'Inter_500Medium',
    fontSize: 20,
    lineHeight: 28,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  bottomArea: {
    paddingHorizontal: 16,
    paddingBottom: 80,
    paddingTop: 16,
    gap: 16,
  },
  pillRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  pill: {
    backgroundColor: '#18181B',
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingVertical: 7,
    paddingHorizontal: 13,
  },
  pillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pillText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    lineHeight: 17,
    color: '#A1A1AA',
  },
  messageList: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: 16,
    gap: spacing.md,
  },
  bubble: {
    maxWidth: '85%',
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  bubbleUser: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accentMuted,
    borderWidth: 1,
    borderColor: colors.borderActive,
  },
  bubbleAI: {
    alignSelf: 'flex-start',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleLabel: {
    ...typography.micro,
    color: colors.accent,
    marginBottom: spacing.xs,
    fontSize: 9,
  },
  messageText: {
    ...typography.body,
    lineHeight: 22,
  },
  messageTextUser: {
    color: colors.textPrimary,
  },
  messageTextAI: {
    color: colors.textPrimary,
  },
  timestamp: {
    ...typography.caption,
    color: colors.textMuted,
    marginTop: spacing.xs,
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  typingIndicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  typingText: {
    ...typography.micro,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  inputRowMessages: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 80,
    backgroundColor: colors.base,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#27272A',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
  },
  circleBtnPress: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 4,
  },
  inputWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27272A',
    borderRadius: 24,
    paddingLeft: 17,
    paddingRight: 10,
    minHeight: 44,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    paddingVertical: 9,
    paddingRight: 8,
    color: colors.textPrimary,
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
  },
  inputTrailing: {
    paddingLeft: 8,
    justifyContent: 'center',
  },
});
