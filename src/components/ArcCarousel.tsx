import React, { memo, useMemo, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, PanResponder, Animated } from 'react-native';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppTheme } from '../hooks/useAppTheme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
// Calculate radius to fit screen with equal padding on left/right
const HORIZONTAL_PADDING = 20; // Equal padding on both sides
const ARC_RADIUS = (SCREEN_WIDTH - HORIZONTAL_PADDING * 2) / 2;
const THUMB = 56;
const CENTER = 72;
const MIN_ITEMS_FOR_HALF_CIRCLE = 5;

type Item = {
  id: string;
  imageUri: string;
  isAccepted?: boolean;
  isRejected?: boolean;
};

export const ArcCarousel = memo(function ArcCarousel({
  items,
  activeIndex,
  onItemPress,
}: {
  items: Item[];
  activeIndex: number;
  onItemPress: (index: number) => void;
}) {
  const { colors } = useAppTheme();
  const rotationRef = useRef(new Animated.Value(0)).current;
  const startRotationRef = useRef(0);
  const isSpinningRef = useRef(false);
  const lastActiveIndexRef = useRef(activeIndex);

  // Calculate if we should show full circle or half circle
  const shouldShowFullCircle = items.length >= MIN_ITEMS_FOR_HALF_CIRCLE * 2;
  const ARC_ANGLE = shouldShowFullCircle ? 360 : 180;
  
  // Show all items in a circle or half circle
  const visible = useMemo(() => {
    return items.map((_, idx) => idx);
  }, [items.length]);

  // Calculate angle step for even distribution
  const step = visible.length > 1 ? ARC_ANGLE / visible.length : 0;
  const startAngle = shouldShowFullCircle ? 0 : -ARC_ANGLE / 2;

  // Initialize rotation based on activeIndex
  useEffect(() => {
    if (lastActiveIndexRef.current !== activeIndex && !isSpinningRef.current) {
      const rotationStep = ARC_ANGLE / items.length;
      const targetRotation = activeIndex * rotationStep;
      Animated.spring(rotationRef, {
        toValue: targetRotation,
        useNativeDriver: true,
        damping: 20,
        stiffness: 300,
      }).start();
      lastActiveIndexRef.current = activeIndex;
    }
  }, [activeIndex, items.length, rotationRef, ARC_ANGLE]);

  const pos = (index: number) => {
    if (visible.length === 1) return { x: 0, y: 0 };
    // Calculate angle based on index
    const baseAngle = startAngle + index * step;
    const rad = (baseAngle * Math.PI) / 180;
    const x = ARC_RADIUS * Math.sin(rad);
    // For full circle, center vertically; for half circle, position at bottom
    const y = shouldShowFullCircle 
      ? ARC_RADIUS * (1 - Math.cos(rad))
      : ARC_RADIUS * (1 - Math.cos(rad));
    return { x, y };
  };

  // Handle spin gesture - like old phone dial
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 8 || Math.abs(gestureState.dy) > 8;
      },
      onPanResponderGrant: () => {
        startRotationRef.current = (rotationRef as any)._value || 0;
        isSpinningRef.current = true;
      },
      onPanResponderMove: (_, gestureState) => {
        if (!isSpinningRef.current) return;
        // Calculate rotation based on horizontal movement
        // Convert horizontal movement to angle rotation (like phone dial)
        const anglePerPixel = ARC_ANGLE / (ARC_RADIUS * 2);
        const rotation = startRotationRef.current + gestureState.dx * anglePerPixel;
        rotationRef.setValue(rotation);
      },
      onPanResponderRelease: (_, gestureState) => {
        isSpinningRef.current = false;
        // Snap to nearest item based on rotation
        const currentRotation = (rotationRef as any)._value || 0;
        const rotationStep = ARC_ANGLE / items.length;
        
        // Normalize rotation to 0-360 range
        let normalizedRotation = currentRotation % 360;
        if (normalizedRotation < 0) normalizedRotation += 360;
        
        // For full circle, wrap around
        const maxRotation = shouldShowFullCircle ? 360 : ARC_ANGLE;
        const clampedRotation = shouldShowFullCircle 
          ? normalizedRotation % 360
          : Math.max(0, Math.min(ARC_ANGLE, normalizedRotation));
        
        // Find nearest item index
        const nearestIndex = Math.round(clampedRotation / rotationStep) % items.length;
        const clampedIndex = Math.max(0, Math.min(items.length - 1, nearestIndex));
        const targetRotation = clampedIndex * rotationStep;
        
        // Update active index
        if (clampedIndex !== activeIndex) {
          onItemPress(clampedIndex);
        }
        
        Animated.spring(rotationRef, {
          toValue: targetRotation,
          useNativeDriver: true,
          damping: 20,
          stiffness: 300,
        }).start(() => {
          lastActiveIndexRef.current = clampedIndex;
        });
      },
    })
  ).current;

  // Handle item click - ensure it updates the main card
  const handleItemPress = useCallback((index: number) => {
    if (index >= 0 && index < items.length && index !== activeIndex && !isSpinningRef.current) {
      const rotationStep = ARC_ANGLE / items.length;
      const targetRotation = index * rotationStep;
      
      Animated.spring(rotationRef, {
        toValue: targetRotation,
        useNativeDriver: true,
        damping: 20,
        stiffness: 300,
      }).start(() => {
        lastActiveIndexRef.current = index;
      });
      
      onItemPress(index);
    }
  }, [items.length, activeIndex, onItemPress, rotationRef, ARC_ANGLE]);

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <Animated.View 
        style={[
          styles.center,
          {
            transform: [
              { 
                rotate: rotationRef.interpolate({
                  inputRange: [-360, 0, 360],
                  outputRange: ['-360deg', '0deg', '360deg'],
                  extrapolate: 'clamp',
                })
              },
            ],
          }
        ]}
        pointerEvents="box-none"
        {...panResponder.panHandlers}
      >
        {visible.map((realIndex) => {
          const item = items[realIndex];
          if (!item) return null;
          
          const isActive = realIndex === activeIndex;
          const { x, y } = pos(realIndex);

          const size = isActive ? CENTER : THUMB;
          // Calculate distance for opacity/scale
          const dist = Math.min(
            Math.abs(realIndex - activeIndex),
            Math.abs(realIndex - activeIndex + items.length),
            Math.abs(realIndex - activeIndex - items.length)
          );
          const opacity = dist === 0 ? 1 : dist === 1 ? 0.8 : dist === 2 ? 0.65 : dist === 3 ? 0.5 : 0.35;
          const scale = isActive ? 1 : 0.85;

          return (
            <View
              key={`${item.id}-${realIndex}`}
              style={[
                styles.item,
                {
                  width: size,
                  height: size,
                  borderRadius: size / 2,
                  transform: [
                    { translateX: x },
                    { translateY: y },
                    { scale },
                  ],
                  opacity,
                  zIndex: isActive ? 100 : 50 - dist,
                },
              ]}
            >
              <TouchableOpacity
                style={styles.press}
                activeOpacity={0.85}
                onPress={() => handleItemPress(realIndex)}
                disabled={isSpinningRef.current}
              >
                {isActive && (
                  <View
                    style={[
                      styles.ring,
                      {
                        width: size + 10,
                        height: size + 10,
                        borderRadius: (size + 10) / 2,
                        borderColor: colors.accent,
                      },
                    ]}
                  />
                )}

                <Image
                  source={{ uri: item.imageUri }}
                  style={[
                    styles.image,
                    {
                      width: size - 10,
                      height: size - 10,
                      borderRadius: (size - 10) / 2,
                    },
                  ]}
                  contentFit="cover"
                  transition={150}
                  cachePolicy="memory-disk"
                  recyclingKey={item.id}
                  priority={isActive ? 'high' : 'normal'}
                />

                {item.isAccepted && (
                  <View style={styles.badge}>
                    <Icon name="check" size={18} color={colors.success} />
                  </View>
                )}
                {item.isRejected && (
                  <View style={[styles.badge, styles.badgeReject]}>
                    <Icon name="close" size={18} color="#fff" />
                  </View>
                )}
              </TouchableOpacity>
            </View>
          );
        })}
      </Animated.View>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: HORIZONTAL_PADDING,
    right: HORIZONTAL_PADDING,
    bottom: 32,
    height: ARC_RADIUS * 2.2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    width: ARC_RADIUS * 2,
    height: ARC_RADIUS * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  item: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  press: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    borderWidth: 3.5,
    backgroundColor: 'rgba(255,255,255,0.1)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 8,
  },
  image: {
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  badge: {
    position: 'absolute',
    right: -5,
    bottom: -5,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.6)',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  badgeReject: {
    backgroundColor: 'rgba(239,68,68,0.95)',
    borderColor: 'rgba(255,255,255,0.4)',
  },
});
