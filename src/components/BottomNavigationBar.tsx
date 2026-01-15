import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Animated, Dimensions, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
const Icon = MaterialCommunityIcons;

import { useAppTheme } from '../hooks/useAppTheme';
import { ROUTES } from '../constants/routes';
import { spacing as spacingConstants, borderRadius as borderRadiusConstants } from '../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface BottomNavigationBarProps {
  scrollY?: Animated.Value;
  showOnScrollUp?: boolean;
}

interface NavItem {
  route: string;
  icon: string;
  label: string;
}

const navItems: NavItem[] = [
  { route: ROUTES.SOCIAL, icon: 'account-group', label: 'Social' },
  { route: 'MainTabs', icon: 'tshirt-crew', label: 'Today' }, // Navigate to MainTabs with HOME tab
  { route: ROUTES.COLLECTIONS, icon: 'heart', label: 'Collections' },
];

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  scrollY,
  showOnScrollUp = true,
}) => {
  const navigation = useNavigation();
  const route = useRoute();
  const { colors, borderRadius, blur } = useAppTheme();
  const translateY = useRef(new Animated.Value(0)).current;
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (!scrollY || !showOnScrollUp) return;

    const listenerId = scrollY.addListener(({ value }) => {
      const diff = value - lastScrollY.current;
      lastScrollY.current = value;

      if (diff > 5) {
        // Scrolling down - hide
        Animated.spring(translateY, {
          toValue: 100,
          useNativeDriver: true,
          damping: 20,
          stiffness: 300,
        }).start();
      } else if (diff < -5) {
        // Scrolling up - show
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          damping: 20,
          stiffness: 300,
        }).start();
      }
    });

    return () => {
      scrollY.removeListener(listenerId);
    };
  }, [scrollY, showOnScrollUp, translateY]);

  const isActive = (routeName: string) => {
    if (routeName === 'MainTabs') {
      // Check if we're in MainTabs and on HOME tab
      const parentState = navigation.getState();
      const mainTabsState = parentState?.routes.find(r => r.name === 'MainTabs');
      if (mainTabsState && 'state' in mainTabsState) {
        const tabsState = mainTabsState.state as any;
        return tabsState?.routes?.[tabsState?.index]?.name === 'HomeTab';
      }
      return false;
    }
    return route.name === routeName;
  };

  const handleNavigate = (routeName: string) => {
    if (route.name !== routeName) {
      if (routeName === 'MainTabs') {
        // Navigate to MainTabs and then to HOME tab
        navigation.getParent()?.navigate('MainTabs', { screen: 'HomeTab' });
      } else {
        navigation.navigate(routeName as never);
      }
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          borderTopColor: colors.glassBorder,
        },
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={blur.medium} tint="light" style={styles.blurContainer}>
          <View style={styles.navContent}>
            {navItems.map((item) => {
              const active = isActive(item.route);
              return (
                <TouchableOpacity
                  key={item.route}
                  activeOpacity={0.7}
                  onPress={() => handleNavigate(item.route)}
                  style={styles.navItem}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      active && {
                        backgroundColor: colors.accent + '20',
                        borderRadius: borderRadius.full,
                      },
                    ]}
                  >
                    <Icon
                      name={item.icon}
                      size={24}
                      color={active ? colors.accent : colors.textSecondary}
                    />
                  </View>
                  <View style={[styles.labelContainer, active && { opacity: 1 }]}>
                    <View
                      style={[
                        styles.activeIndicator,
                        { backgroundColor: colors.accent },
                        active && styles.activeIndicatorVisible,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      ) : (
        <View style={[styles.blurContainer, { backgroundColor: colors.glassSurface }]}>
          <View style={styles.navContent}>
            {navItems.map((item) => {
              const active = isActive(item.route);
              return (
                <TouchableOpacity
                  key={item.route}
                  activeOpacity={0.7}
                  onPress={() => handleNavigate(item.route)}
                  style={styles.navItem}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      active && {
                        backgroundColor: colors.accent + '20',
                        borderRadius: borderRadius.full,
                      },
                    ]}
                  >
                    <Icon
                      name={item.icon}
                      size={24}
                      color={active ? colors.accent : colors.textSecondary}
                    />
                  </View>
                  <View style={[styles.labelContainer, active && { opacity: 1 }]}>
                    <View
                      style={[
                        styles.activeIndicator,
                        { backgroundColor: colors.accent },
                        active && styles.activeIndicatorVisible,
                      ]}
                    />
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    zIndex: 1000,
  },
  blurContainer: {
    width: '100%',
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    paddingTop: spacingConstants.md,
  },
  navContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: spacingConstants.md,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    gap: 4,
  },
  iconContainer: {
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacingConstants.sm,
  },
  labelContainer: {
    height: 3,
    width: 24,
    opacity: 0,
  },
  activeIndicator: {
    height: 3,
    width: 24,
    borderRadius: 2,
    opacity: 0,
  },
  activeIndicatorVisible: {
    opacity: 1,
  },
});

BottomNavigationBar.displayName = 'BottomNavigationBar';

