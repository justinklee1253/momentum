import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../lib/theme';
import { ChatSession } from '../../lib/database.types';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SIDEBAR_WIDTH = Math.min(SCREEN_WIDTH * 0.8, 320);

function BoltIconSmall() {
  return (
    <Svg width={10} height={11.43} viewBox="0 0 26.25 30.0011" fill="none">
      <Path
        d="M20.4727 2.61381C20.8184 1.81108 20.5605 0.873577 19.8516 0.357952C19.1426 -0.157673 18.1758 -0.110798 17.5137 0.463421L2.51367 13.5884C1.92773 14.104 1.7168 14.9302 1.99219 15.6568C2.26758 16.3833 2.9707 16.8755 3.75 16.8755H10.2832L5.77734 27.3872C5.43164 28.19 5.68945 29.1275 6.39844 29.6431C7.10742 30.1587 8.07422 30.1119 8.73633 29.5376L23.7363 16.4126C24.3223 15.897 24.5332 15.0708 24.2578 14.3443C23.9824 13.6177 23.2852 13.1314 22.5 13.1314H15.9668L20.4727 2.61381V2.61381"
        fill="#FFFFFF"
      />
    </Svg>
  );
}

function NewChatIcon() {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5v14M5 12h14"
        stroke={colors.textPrimary}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

function ChatBubbleIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"
        stroke={colors.textMuted}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return 'Yesterday';
  if (diffDay < 7) return `${diffDay}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface Props {
  open: boolean;
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  onDeleteSession: (id: string) => void;
  onClose: () => void;
}

export function ChatSidebar({
  open,
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onClose,
}: Props) {
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: open ? 1 : 0,
      duration: 280,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }).start();
  }, [open, progress]);

  const sidebarTranslateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [-SIDEBAR_WIDTH, 0],
  });

  const overlayOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const renderSession = ({ item }: { item: ChatSession }) => {
    const isActive = item.id === activeSessionId;
    return (
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onSelectSession(item.id);
        }}
        onLongPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          onDeleteSession(item.id);
        }}
        style={[
          styles.sessionItem,
          isActive && styles.sessionItemActive,
        ]}
      >
        <ChatBubbleIcon />
        <View style={styles.sessionContent}>
          <Text
            style={[styles.sessionTitle, isActive && styles.sessionTitleActive]}
            numberOfLines={1}
          >
            {item.title}
          </Text>
          <Text style={styles.sessionTime}>
            {formatRelativeTime(item.updated_at)}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <>
      {/* Overlay backdrop */}
      <Animated.View
        pointerEvents={open ? 'auto' : 'none'}
        style={[styles.overlay, { opacity: overlayOpacity }]}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Sidebar drawer */}
      <Animated.View
        style={[
          styles.sidebar,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 16 },
          { transform: [{ translateX: sidebarTranslateX }] },
        ]}
      >
        {/* Branding */}
        <View style={styles.brandRow}>
          <LinearGradient
            colors={['#3B82F6', '#9333EA']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.brandIcon}
          >
            <BoltIconSmall />
          </LinearGradient>
          <Text style={styles.brandText}>MOMENTUM</Text>
        </View>

        {/* New conversation button */}
        <Pressable
          style={({ pressed }) => [
            styles.newChatBtn,
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onNewChat();
          }}
        >
          <NewChatIcon />
          <Text style={styles.newChatText}>New conversation</Text>
        </Pressable>

        {/* Section label */}
        <Text style={styles.sectionLabel}>RECENT</Text>

        {/* Session list */}
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          renderItem={renderSession}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No past conversations</Text>
          }
        />
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
    zIndex: 90,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.card,
    borderRightWidth: 1,
    borderRightColor: colors.border,
    zIndex: 100,
    paddingHorizontal: spacing.md,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: spacing.lg,
  },
  brandIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontFamily: 'Inter_700Bold',
    fontSize: 14,
    letterSpacing: 0.4,
    color: colors.textPrimary,
  },
  newChatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.input,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  newChatText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.textPrimary,
  },
  sectionLabel: {
    ...typography.micro,
    color: colors.textMuted,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  listContent: {
    gap: 2,
  },
  sessionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm + 2,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
  },
  sessionItemActive: {
    backgroundColor: colors.accentDim,
    borderLeftWidth: 2,
    borderLeftColor: colors.accent,
  },
  sessionContent: {
    flex: 1,
    gap: 2,
  },
  sessionTitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: colors.textSecondary,
  },
  sessionTitleActive: {
    color: colors.textPrimary,
    fontFamily: 'Inter_500Medium',
  },
  sessionTime: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.textMuted,
  },
  emptyText: {
    ...typography.caption,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});
