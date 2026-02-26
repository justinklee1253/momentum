import React, { useState, useRef, useCallback, useEffect } from 'react';
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
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useNavigation } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { UserIcon } from '../../components/UserIcon';
import { useQuery } from '@tanstack/react-query';
import { colors, typography, spacing, radius, fontWeights } from '../../lib/theme';
import { useSystem } from '../../hooks/useSystem';
import { useUserId } from '../../hooks/useUserId';
import { useChatSessions } from '../../hooks/useChatSessions';
import { useChatStore } from '../../stores/chatStore';
import { ChatSidebar } from '../../components/chat/ChatSidebar';
import { supabase } from '../../lib/supabase';
import { AIConversation } from '../../lib/database.types';
import { CoachingStyle, COACHING_STYLE_LABELS } from '../../lib/constants';

/* ─── SVG Icons ─── */

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

function HamburgerIcon() {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 6h18M3 12h18M3 18h18"
        stroke={colors.textSecondary}
        strokeWidth={1.8}
        strokeLinecap="round"
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

/* ─── Header ─── */

function Header({
  coachingStyle,
}: {
  coachingStyle: CoachingStyle;
}) {
  const insets = useSafeAreaInsets();
  const modeColor = getModeColor(coachingStyle);

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <View style={styles.headerLeft}>
        <Pressable
          style={styles.logoPress}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.navigate('/(tabs)/');
          }}
        >
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
        </Pressable>
      </View>

      <View style={styles.headerRight}>
        <Pressable
          style={styles.avatarWrap}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.push('/settings');
          }}
        >
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <UserIcon size={18} color={colors.textSecondary} />
            </View>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

/* ─── Message Bubble ─── */

function MessageBubble({ message }: { message: AIConversation }) {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, []);

  const isUser = message.role === 'USER';
  return (
    <Animated.View
      style={[
        styles.bubble,
        isUser ? styles.bubbleUser : styles.bubbleAI,
        {
          opacity: anim,
          transform: [
            { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) },
          ],
        },
      ]}
    >
      {!isUser && (
        <Text style={styles.roleLabel}>SYSTEM</Text>
      )}
      <Text style={[styles.messageText, isUser ? styles.messageTextUser : styles.messageTextAI]}>
        {message.content}
      </Text>
      <Text style={styles.timestamp}>
        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </Animated.View>
  );
}

/* ─── Thinking Indicator ─── */

function ThinkingIndicator() {
  const dot1 = useRef(new Animated.Value(0.25)).current;
  const dot2 = useRef(new Animated.Value(0.25)).current;
  const dot3 = useRef(new Animated.Value(0.25)).current;

  useEffect(() => {
    const makeDotAnim = (val: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(val, { toValue: 0.25, duration: 300, useNativeDriver: true }),
          Animated.delay(Math.max(0, 900 - delay)),
        ])
      );

    const a1 = makeDotAnim(dot1, 0);
    const a2 = makeDotAnim(dot2, 200);
    const a3 = makeDotAnim(dot3, 400);

    a1.start();
    a2.start();
    a3.start();

    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  return (
    <View style={[styles.bubble, styles.bubbleAI, styles.thinkingBubble]}>
      <Text style={styles.roleLabel}>SYSTEM</Text>
      <View style={{ flexDirection: 'row', gap: 5, paddingVertical: 2 }}>
        {([dot1, dot2, dot3] as Animated.Value[]).map((opacity, i) => (
          <Animated.View key={i} style={[styles.thinkingDot, { opacity }]} />
        ))}
      </View>
    </View>
  );
}

/* ─── Input Row ─── */

function InputRow({
  input,
  setInput,
  onSend,
  isSending,
  style,
}: {
  input: string;
  setInput: (v: string) => void;
  onSend: () => void;
  isSending: boolean;
  style?: object;
}) {
  return (
    <View style={[styles.inputRow, style]}>
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
          onSubmitEditing={onSend}
        />
        <Pressable style={styles.inputTrailing}>
          <MicIcon />
        </Pressable>
      </View>

      <View style={styles.sendBtn}>
        <Pressable
          onPress={onSend}
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
  );
}

/* ─── Suggestions ─── */

const SUGGESTIONS = [
  { id: 'plan', label: 'Plan day', icon: PlanDayIcon },
  { id: 'logs', label: 'Review logs', icon: ReviewLogsIcon },
  { id: 'reflect', label: 'Reflect', icon: ReflectIcon },
] as const;

/* ─── Main Chat Tab ─── */

export default function ChatTab() {
  const userId = useUserId();
  const navigation = useNavigation();

  const {
    activeSessionId,
    setActiveSessionId,
    sidebarOpen,
    setSidebarOpen,
    toggleSidebar,
  } = useChatStore();

  const { sessions, createSession, deleteSession } = useChatSessions(userId);
  const { data: messages, isLoading, sendMessage, seedAndSend, isSending } = useSystem(userId, activeSessionId);

  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const isNearBottomRef = useRef(true);

  // Reset to empty state every time the tab gains focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      setActiveSessionId(null);
      setSidebarOpen(false);
    });
    return unsubscribe;
  }, [navigation, setActiveSessionId, setSidebarOpen]);

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

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isSending) return;
    setInput('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      let sessionId = activeSessionId;

      if (!sessionId) {
        const session = await createSession(text);
        sessionId = session.id;

        const promise = seedAndSend(text, sessionId);
        setActiveSessionId(sessionId);

        await promise;
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
        return;
      }

      await sendMessage(text, sessionId);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    } catch (e) {
      console.error('Chat send error:', e);
      const isAuthError = e instanceof Error && e.message?.includes('Session expired');

      if (isAuthError) {
        await supabase.auth.signOut();
        Alert.alert('Session expired', 'Sign in again to continue.', [
          { text: 'OK', onPress: () => router.replace('/(auth)/login') },
        ]);
        return;
      }

      Alert.alert('Send failed', 'Try again.', [{ text: 'OK' }]);
    }
  }, [input, isSending, activeSessionId, createSession, setActiveSessionId, sendMessage, seedAndSend]);

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

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    setSidebarOpen(false);
  }, [setActiveSessionId, setSidebarOpen]);

  const handleNewChat = useCallback(() => {
    setActiveSessionId(null);
    setSidebarOpen(false);
  }, [setActiveSessionId, setSidebarOpen]);

  const handleDeleteSession = useCallback(async (id: string) => {
    Alert.alert(
      'Delete conversation',
      'This will permanently remove this conversation.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteSession(id);
            if (activeSessionId === id) {
              setActiveSessionId(null);
            }
          },
        },
      ],
    );
  }, [deleteSession, activeSessionId, setActiveSessionId]);

  const hasMessages = activeSessionId && messages && messages.length > 0;

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <ChatSidebar
        open={sidebarOpen}
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={handleSelectSession}
        onNewChat={handleNewChat}
        onDeleteSession={handleDeleteSession}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Header */}
      <Header
        coachingStyle={coachingStyle}
      />

      {/* Detached hamburger — sits below header, above content */}
      <View style={styles.menuRow}>
        <Pressable
          style={styles.menuBtn}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            toggleSidebar();
          }}
          hitSlop={8}
        >
          <HamburgerIcon />
        </Pressable>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.flex}
        keyboardVerticalOffset={0}
      >
        {activeSessionId && isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color={colors.accent} />
          </View>
        ) : !hasMessages ? (
          /* ─── Empty / Default State ─── */
          <View style={styles.flex}>
            <View style={styles.heroArea}>
              <View style={styles.emptyIconCard}>
                <BoltIconLarge />
              </View>
              <Text style={styles.emptyTitle}>How can I help you today?</Text>
            </View>

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

              <InputRow
                input={input}
                setInput={setInput}
                onSend={handleSend}
                isSending={isSending}
              />
            </View>
          </View>
        ) : (
          /* ─── Conversation View ─── */
          <View style={styles.flex}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => <MessageBubble message={item} />}
              contentContainerStyle={styles.messageList}
              showsVerticalScrollIndicator={false}
              scrollEventThrottle={100}
              onScroll={(e) => {
                const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
                isNearBottomRef.current =
                  contentOffset.y + layoutMeasurement.height >= contentSize.height - 150;
              }}
              onContentSizeChange={() => {
                if (isNearBottomRef.current) {
                  flatListRef.current?.scrollToEnd({ animated: true });
                }
              }}
              ListFooterComponent={isSending ? <ThinkingIndicator /> : null}
            />

            <InputRow
              input={input}
              setInput={setInput}
              onSend={handleSend}
              isSending={isSending}
              style={styles.inputRowMessages}
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </View>
  );
}

/* ─── Styles ─── */

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
  menuRow: {
    paddingHorizontal: 17,
    paddingVertical: 8,
  },
  menuBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoPress: {
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
  avatarWrap: {},
  avatarRing: {
    width: 36,
    height: 36,
    borderRadius: 9999,
    borderWidth: 2,
    borderColor: 'rgba(59,130,246,0.3)',
    padding: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 9999,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
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
    paddingBottom: 110,
    paddingTop: 16,
    gap: 20,
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
  thinkingBubble: {
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
  },
  thinkingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.accent,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  inputRowMessages: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 110,
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
