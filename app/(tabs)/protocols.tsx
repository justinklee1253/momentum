import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors, spacing } from '../../lib/theme';
import { useProtocols } from '../../hooks/useProtocols';
import { useUserId } from '../../hooks/useUserId';
import { useMetrics } from '../../hooks/useMetrics';
import { AnchorType } from '../../lib/constants';
import { ProtocolRow } from '../../components/home/ProtocolRow';
import { TierDivider } from '../../components/ui/TierDivider';
import { SectionHeader } from '../../components/ui/SectionHeader';
import { Skeleton } from '../../components/ui/Skeleton';

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

function SearchIcon() {
  return (
    <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
      <Path
        d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35"
        stroke={colors.textSecondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function FilterIcon() {
  return (
    <Svg width={10} height={10} viewBox="0 0 24 24" fill="none">
      <Path
        d="M22 3H2l8 9.46V19l4 2v-8.54L22 3Z"
        stroke={colors.textSecondary}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function PlusIcon() {
  return (
    <Svg width={9} height={10} viewBox="0 0 10 10" fill="none">
      <Path d="M5 0v10M0 5h10" stroke={colors.textSecondary} strokeWidth={1.5} strokeLinecap="round" />
    </Svg>
  );
}

function Header({ score }: { score: number }) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
      <Pressable
        style={styles.headerLeft}
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
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>SYSTEM ACTIVE</Text>
          </View>
        </View>
      </Pressable>

      <View style={styles.headerRight}>
        <Pressable
          style={styles.searchBtn}
          onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
        >
          <SearchIcon />
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

export default function ProtocolsTab() {
  const userId = useUserId();
  const metrics = useMetrics(userId);
  const protocols = useProtocols(userId);
  const isLoading = protocols.isLoading;

  return (
    <View style={styles.container}>
      <Header score={metrics.data?.momentumScore ?? 0} />

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <SectionHeader
          title="PROTOCOLS"
          rightContent={
            <View style={styles.actions}>
              <Pressable style={styles.iconBtn}>
                <FilterIcon />
              </Pressable>
              <Pressable
                style={styles.iconBtn}
                onPress={() => router.push('/settings/add-protocol')}
              >
                <PlusIcon />
              </Pressable>
            </View>
          }
        />

        {isLoading ? (
          <View style={styles.skeletonList}>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} height={56} style={{ borderRadius: 10 }} />
            ))}
          </View>
        ) : protocols.data ? (
          <View style={styles.protocolList}>
            {([AnchorType.NON_NEGOTIABLE, AnchorType.GROWTH, AnchorType.ROTATING_FOCUS] as AnchorType[]).map((tier) => {
              const tierProtocols = protocols.data!.byTier[tier];
              if (tierProtocols.length === 0) return null;
              return (
                <View key={tier} style={styles.tierGroup}>
                  <TierDivider tier={tier} />
                  {tierProtocols.map((protocol) => (
                    <ProtocolRow
                      key={protocol.id}
                      protocol={protocol}
                      onToggle={(habitId, currentStatus) =>
                        protocols.toggleExecution({ habitId, currentStatus })
                      }
                      isToggling={protocols.isToggling}
                      onKebabPress={(p) => router.push(`/settings/edit-protocol?id=${p.id}` as any)}
                    />
                  ))}
                </View>
              );
            })}

            {protocols.data.protocols.length === 0 && (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No protocols configured.</Text>
                <Text style={styles.emptySubtext}>
                  Complete onboarding or add protocols in settings.
                </Text>
              </View>
            )}
          </View>
        ) : null}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.base,
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
    backgroundColor: colors.accent,
  },
  statusText: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 9,
    lineHeight: 14,
    letterSpacing: 0.45,
    color: colors.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBtn: {
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
  scroll: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconBtn: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  protocolList: {
    gap: spacing.md,
  },
  tierGroup: {},
  skeletonList: {
    gap: spacing.sm,
  },
  emptyState: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
  },
  emptyText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: colors.textMuted,
  },
});
