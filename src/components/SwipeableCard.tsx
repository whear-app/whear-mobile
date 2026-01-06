import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Image,
  Dimensions,
  ViewStyle,
  Animated,
  PanResponder,
} from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import { AppText } from './AppText';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.4;
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.3;

interface SwipeableCardProps {
  outfit: {
    id: string;
    imageUri: string;
    title: string;
    subtitle: string;
    reason: string;
  };
  index: number;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isActive: boolean;
  style?: ViewStyle;
}

export const SwipeableCard: React.FC<SwipeableCardProps> = ({
  outfit,
  index,
  onSwipeLeft,
  onSwipeRight,
  isActive,
  style,
}) => {
  const { colors, borderRadius, shadows } = useAppTheme();

  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(isActive ? 1 : 0.95)).current;
  const [overlayColor, setOverlayColor] = useState<string>('transparent');

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        if (!isActive) return false;
        const { dx, dy } = gestureState;
        return Math.abs(dx) > 4 || Math.abs(dy) > 4;
      },
      onPanResponderGrant: () => {
        Animated.spring(scale, {
          toValue: 0.97,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy);
        
        // Update overlay color based on gesture
        if (gestureState.dx < -SWIPE_THRESHOLD / 2) {
          setOverlayColor(colors.error);
        } else if (gestureState.dx > SWIPE_THRESHOLD / 2) {
          setOverlayColor(colors.success);
        } else {
          setOverlayColor('transparent');
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (!isActive) {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          return;
        }

        const { dx } = gestureState;
        const shouldSwipeLeft = dx < -SWIPE_THRESHOLD;
        const shouldSwipeRight = dx > SWIPE_THRESHOLD;

        if (shouldSwipeLeft) {
          Animated.spring(translateX, {
            toValue: -SCREEN_WIDTH * 1.5,
            useNativeDriver: true,
          }).start(() => {
            onSwipeLeft();
          });
        } else if (shouldSwipeRight) {
          Animated.spring(translateX, {
            toValue: SCREEN_WIDTH * 1.5,
            useNativeDriver: true,
          }).start(() => {
            onSwipeRight();
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
          Animated.spring(scale, {
            toValue: 1,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const rotation = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  const overlayOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0, SWIPE_THRESHOLD],
    outputRange: [0.3, 0, 0.3],
    extrapolate: 'clamp',
  });

  if (!isActive && index > 1) {
    return null; // Only render 2 cards behind
  }

  return (
    <View style={[styles.container, style]}>
      <Animated.View
        style={[
          styles.card,
          {
            width: CARD_WIDTH,
            height: CARD_HEIGHT,
            borderRadius: borderRadius.xl,
            backgroundColor: colors.glassSurface,
            ...shadows.glassStrong,
          },
          {
            transform: [
              { translateX },
              { translateY },
              { rotate: rotation },
              { scale },
            ],
          },
        ]}
        {...panResponder.panHandlers}
      >
        <Image
          source={{ uri: outfit.imageUri }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Overlay for swipe feedback */}
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: overlayOpacity,
              backgroundColor: overlayColor,
            },
          ]}
        />

        {/* Bottom overlay with text */}
        <View style={styles.textOverlay}>
          <View style={styles.scrim} />
          <View style={styles.textContent}>
            <AppText variant="h1" overlay style={styles.title}>
              {outfit.title}
            </AppText>
            <AppText variant="body" overlay style={styles.subtitle}>
              {outfit.subtitle}
            </AppText>
            <AppText variant="caption" overlay style={styles.reason}>
              Because: {outfit.reason}
            </AppText>
          </View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 24,
  },
  textOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  textContent: {
    zIndex: 1,
  },
  title: {
    marginBottom: 4,
    fontWeight: '700',
  },
  subtitle: {
    marginBottom: 8,
    opacity: 0.9,
  },
  reason: {
    opacity: 0.8,
  },
});

