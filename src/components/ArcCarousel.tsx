import React from 'react';
import { View, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const ARC_RADIUS = SCREEN_WIDTH * 0.6;
const THUMBNAIL_SIZE = 56;
const CENTER_THUMBNAIL_SIZE = 72;
const ARC_ANGLE = 120; // degrees
const ITEM_COUNT = 8; // Number of thumbnails in the arc

interface ArcCarouselItem {
  id: string;
  imageUri: string;
  isAccepted?: boolean;
  isRejected?: boolean;
}

interface ArcCarouselProps {
  items: ArcCarouselItem[];
  activeIndex: number;
  onItemPress: (index: number) => void;
}

export const ArcCarousel: React.FC<ArcCarouselProps> = ({
  items,
  activeIndex,
  onItemPress,
}) => {
  const { colors } = useAppTheme();

  const getAngleForIndex = (index: number, total: number, centerIndex: number) => {
    // Center the arc around the active index
    const relativeIndex = index - centerIndex;
    const startAngle = -ARC_ANGLE / 2;
    const angleStep = ARC_ANGLE / Math.max(1, total - 1);
    const baseAngle = startAngle + angleStep * (total / 2);
    return baseAngle + angleStep * relativeIndex;
  };

  const getPositionForIndex = (index: number, total: number, centerIndex: number) => {
    const angle = getAngleForIndex(index, total, centerIndex);
    const radian = (angle * Math.PI) / 180;
    const x = ARC_RADIUS * Math.sin(radian);
    const y = -ARC_RADIUS * Math.cos(radian);
    return { x, y };
  };

  return (
    <View style={styles.container}>
      {items.map((item, index) => {
        const { x, y } = getPositionForIndex(index, items.length, activeIndex);
        const isActive = index === activeIndex;
        const distanceFromCenter = Math.abs(index - activeIndex);

        const scale = isActive ? 1.2 : 1;
        const opacity =
          distanceFromCenter === 0
            ? 1
            : distanceFromCenter === 1
            ? 0.7
            : distanceFromCenter === 2
            ? 0.4
            : 0.2;

        const size = isActive ? CENTER_THUMBNAIL_SIZE : THUMBNAIL_SIZE;

        return (
          <View
            key={item.id}
            style={[
              styles.thumbnailContainer,
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
              },
            ]}
          >
            <TouchableOpacity
              onPress={() => onItemPress(index)}
              activeOpacity={0.8}
              style={styles.thumbnailButton}
            >
              {/* Ring for active item */}
              {isActive && (
                <View
                  style={[
                    styles.activeRing,
                    {
                      width: size + 4,
                      height: size + 4,
                      borderRadius: (size + 4) / 2,
                      borderColor: colors.accent,
                    },
                  ]}
                />
              )}
              
              {/* Thumbnail image */}
              <Image
                source={{ uri: item.imageUri }}
                style={[
                  styles.thumbnailImage,
                  {
                    width: size - 4,
                    height: size - 4,
                    borderRadius: (size - 4) / 2,
                  },
                ]}
                resizeMode="cover"
              />
              
              {/* Status indicators */}
              {item.isAccepted && (
                <View style={styles.statusBadge}>
                  <Icon name="check" size={16} color={colors.success} />
                </View>
              )}
              
              {item.isRejected && (
                <View style={[styles.statusBadge, { backgroundColor: colors.error }]}>
                  <Icon name="close" size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 120,
    left: SCREEN_WIDTH / 2,
    width: ARC_RADIUS * 2,
    height: ARC_RADIUS * 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumbnailButton: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeRing: {
    position: 'absolute',
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  thumbnailImage: {
    backgroundColor: '#E5E5E5',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  statusBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
});

