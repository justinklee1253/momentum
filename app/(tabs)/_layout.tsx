import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { BlurView } from 'expo-blur';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { colors } from '../../lib/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function RocketIcon({ focused }: { focused: boolean }) {
  const c = focused ? colors.indexBlue : colors.textSecondary;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09Z" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2Z" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ProtocolsIcon({ focused }: { focused: boolean }) {
  const c = focused ? colors.indexBlue : colors.textSecondary;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M5 18h14V6H5v12Z" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 14h12V8H7v6Z" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 10h12V4H9v6Z" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function CalendarIcon({ focused }: { focused: boolean }) {
  const c = focused ? colors.indexBlue : colors.textSecondary;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M3 9h18M7 3v2M17 3v2M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function MetricsIcon({ focused }: { focused: boolean }) {
  const c = focused ? colors.indexBlue : colors.textSecondary;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M4 16v4M10 10v10M16 14v6M22 6v14" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}

function ChatIcon({ focused }: { focused: boolean }) {
  const c = focused ? colors.indexBlue : colors.textSecondary;
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={c} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM12 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM15 11a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z" fill={c} />
    </Svg>
  );
}

function TabLabel({ label, focused }: { label: string; focused: boolean }) {
  return (
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {label}
    </Text>
  );
}

function ActiveIndicator({ focused }: { focused: boolean }) {
  if (!focused) return null;
  return <View style={styles.activeIndicator} />;
}

function TabIconWrap({ children, focused }: { children: React.ReactNode; focused: boolean }) {
  return (
    <View style={styles.tabIconWrap}>
      <ActiveIndicator focused={focused} />
      {children}
    </View>
  );
}

function TabBarBackground() {
  return (
    <BlurView
      intensity={40}
      tint="dark"
      style={StyleSheet.absoluteFill}
    />
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const tabBarStyle = {
    ...styles.tabBar,
    paddingBottom: insets.bottom || 20,
    height: 44 + (insets.bottom || 20),
  };
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: tabBarStyle,
        tabBarActiveTintColor: colors.indexBlue,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarBackground: () => <TabBarBackground />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Mission" focused={focused} />,
          tabBarIcon: ({ focused }) => (
            <TabIconWrap focused={focused}>
              <RocketIcon focused={focused} />
            </TabIconWrap>
          ),
        }}
        listeners={{
          tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        }}
      />
      <Tabs.Screen
        name="protocols"
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Protocols" focused={focused} />,
          tabBarIcon: ({ focused }) => (
            <TabIconWrap focused={focused}>
              <ProtocolsIcon focused={focused} />
            </TabIconWrap>
          ),
        }}
        listeners={{
          tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Calendar" focused={focused} />,
          tabBarIcon: ({ focused }) => (
            <TabIconWrap focused={focused}>
              <CalendarIcon focused={focused} />
            </TabIconWrap>
          ),
        }}
        listeners={{
          tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        }}
      />
      <Tabs.Screen
        name="metrics"
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Metrics" focused={focused} />,
          tabBarIcon: ({ focused }) => (
            <TabIconWrap focused={focused}>
              <MetricsIcon focused={focused} />
            </TabIconWrap>
          ),
        }}
        listeners={{
          tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarLabel: ({ focused }) => <TabLabel label="Chat" focused={focused} />,
          tabBarIcon: ({ focused }) => (
            <TabIconWrap focused={focused}>
              <ChatIcon focused={focused} />
            </TabIconWrap>
          ),
        }}
        listeners={{
          tabPress: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light),
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
  },
  tabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 10,
    lineHeight: 15,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.indexBlue,
  },
  tabIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    top: -14,
    width: 32,
    height: 2,
    borderBottomLeftRadius: 9999,
    borderBottomRightRadius: 9999,
    backgroundColor: colors.indexBlue,
    shadowColor: colors.indexBlue,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
});
