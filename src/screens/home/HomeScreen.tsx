import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../../components/AppText';
import { SwipeableCard } from '../../components/SwipeableCard';
import { ArcCarousel } from '../../components/ArcCarousel';
import { MainStackParamList } from '../../navigation/types';
import { ROUTES } from '../../constants/routes';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;
const CARD_HEIGHT = CARD_WIDTH * 1.4;

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface OutfitSuggestion {
  id: string;
  imageUri: string;
  title: string;
  subtitle: string;
  reason: string;
  isAccepted?: boolean;
  isRejected?: boolean;
}

// Mock data - replace with actual API call
const mockOutfits: OutfitSuggestion[] = [
  {
    id: '1',
    imageUri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    title: 'Casual Summer Look',
    subtitle: 'Light & breezy',
    reason: 'Hot day + Casual + Light fabric',
  },
  {
    id: '2',
    imageUri: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800',
    title: 'Office Ready',
    subtitle: 'Professional & polished',
    reason: 'Work day + Formal + Comfortable',
  },
  {
    id: '3',
    imageUri: 'https://images.unsplash.com/photo-1506629905607-5c8b5c8b5c8b?w=800',
    title: 'Evening Elegance',
    subtitle: 'Date night perfect',
    reason: 'Evening + Date + Elegant',
  },
  {
    id: '4',
    imageUri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    title: 'Weekend Vibes',
    subtitle: 'Relaxed & comfortable',
    reason: 'Weekend + Casual + Cozy',
  },
  {
    id: '5',
    imageUri: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800',
    title: 'Sporty Active',
    subtitle: 'Ready to move',
    reason: 'Active + Sport + Breathable',
  },
  {
    id: '6',
    imageUri: 'https://images.unsplash.com/photo-1506629905607-5c8b5c8b5c8b?w=800',
    title: 'Layered Comfort',
    subtitle: 'Perfect for transitions',
    reason: 'Cool day + Versatile + Layered',
  },
  {
    id: '7',
    imageUri: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800',
    title: 'Minimalist Chic',
    subtitle: 'Less is more',
    reason: 'Any day + Minimal + Timeless',
  },
  {
    id: '8',
    imageUri: 'https://images.unsplash.com/photo-1490578474895-699cd4e2cf59?w=800',
    title: 'Bold Statement',
    subtitle: 'Make an impact',
    reason: 'Special + Bold + Confident',
  },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, typography, spacing, borderRadius, blur: blurAmount } = useAppTheme();
  
  const [outfits, setOutfits] = useState<OutfitSuggestion[]>(mockOutfits);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swipeHistory, setSwipeHistory] = useState<Array<{ index: number; action: 'left' | 'right' }>>([]);
  
  // Hide tab bar when this screen is focused
  useFocusEffect(
    React.useCallback(() => {
      const parent = navigation.getParent();
      if (parent) {
        parent.setOptions({
          tabBarStyle: { display: 'none' },
        });
      }
      
      return () => {
        if (parent) {
          parent.setOptions({
            tabBarStyle: undefined,
          });
        }
      };
    }, [navigation])
  );

  const handleSwipeLeft = () => {
    const currentOutfit = outfits[activeIndex];
    if (currentOutfit) {
      setOutfits((prev) =>
        prev.map((outfit) =>
          outfit.id === currentOutfit.id ? { ...outfit, isRejected: true } : outfit
        )
      );
      setSwipeHistory((prev) => [...prev, { index: activeIndex, action: 'left' }]);
      setActiveIndex((prev) => Math.min(prev + 1, outfits.length - 1));
    }
  };

  const handleSwipeRight = () => {
    const currentOutfit = outfits[activeIndex];
    if (currentOutfit) {
      setOutfits((prev) =>
        prev.map((outfit) =>
          outfit.id === currentOutfit.id ? { ...outfit, isAccepted: true } : outfit
        )
      );
      setSwipeHistory((prev) => [...prev, { index: activeIndex, action: 'right' }]);
      setActiveIndex((prev) => Math.min(prev + 1, outfits.length - 1));
    }
  };

  const handleUndo = () => {
    if (swipeHistory.length === 0) return;
    
    const lastSwipe = swipeHistory[swipeHistory.length - 1];
    setSwipeHistory((prev) => prev.slice(0, -1));
    
    setOutfits((prev) =>
      prev.map((outfit, idx) =>
        idx === lastSwipe.index
          ? { ...outfit, isAccepted: false, isRejected: false }
          : outfit
      )
    );
    
    setActiveIndex(lastSwipe.index);
  };

  const handleThumbnailPress = (index: number) => {
    setActiveIndex(index);
  };

  const handleNext = () => {
    // Navigate to Today's Collection screen (showing accepted outfits)
    // Filter accepted outfits and pass them if needed
    const acceptedOutfits = outfits.filter((outfit) => outfit.isAccepted);
    navigation.navigate(ROUTES.OUTFIT_HISTORY);
  };

  const visibleCards = outfits.slice(activeIndex, activeIndex + 3);
  const cardOffset = 8;

  return (
    <View style={styles.container}>
      {/* Animated Background Gradient */}
      <LinearGradient
        colors={colors.backgroundGradient as [string, string, ...string[]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <AppText variant="display" style={styles.headerTitle}>
              Today
            </AppText>
          </View>
          
          <View style={styles.headerRight}>
            {/* Hot Badge */}
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.glassSurface,
                  borderColor: colors.glassBorder,
                  borderRadius: borderRadius.full,
                },
              ]}
            >
              {Platform.OS === 'ios' ? (
                <BlurView intensity={blurAmount.medium} style={styles.badgeBlur}>
                  <AppText variant="caption" style={styles.badgeText}>
                    Hot 🔥
                  </AppText>
                </BlurView>
              ) : (
                <AppText variant="caption" style={styles.badgeText}>
                  Hot 🔥
                </AppText>
              )}
            </View>
            
            {/* Next Button */}
            <TouchableOpacity
              onPress={handleNext}
              style={[
                styles.nextButton,
                {
                  backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.glassSurface,
                  borderColor: colors.glassBorder,
                  borderRadius: borderRadius.md,
                },
              ]}
              activeOpacity={0.8}
            >
              {Platform.OS === 'ios' ? (
                <BlurView intensity={blurAmount.medium} style={styles.nextButtonBlur}>
                  <AppText variant="body" style={styles.nextButtonText}>
                    Next →
                  </AppText>
                </BlurView>
              ) : (
                <AppText variant="body" style={styles.nextButtonText}>
                  Next →
                </AppText>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Undo Button */}
        {swipeHistory.length > 0 && (
          <TouchableOpacity
            onPress={handleUndo}
            style={[
              styles.undoButton,
              {
                backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.glassSurface,
                borderColor: colors.glassBorder,
                borderRadius: borderRadius.full,
              },
            ]}
            activeOpacity={0.8}
          >
            {Platform.OS === 'ios' ? (
              <BlurView intensity={blurAmount.medium} style={styles.undoButtonBlur}>
                <Icon name="undo" size={20} color={colors.textPrimary} />
              </BlurView>
            ) : (
              <Icon name="undo" size={20} color={colors.textPrimary} />
            )}
          </TouchableOpacity>
        )}

        {/* Card Stack */}
        <View style={styles.cardContainer}>
          {visibleCards.length > 0 ? (
            visibleCards.map((outfit, index) => {
              const cardIndex = activeIndex + index;
              const isActive = index === 0;
              
              return (
                <SwipeableCard
                  key={outfit.id}
                  outfit={outfit}
                  index={cardIndex}
                  onSwipeLeft={handleSwipeLeft}
                  onSwipeRight={handleSwipeRight}
                  isActive={isActive}
                  style={{
                    zIndex: 10 - index,
                    transform: [
                      { translateX: index * cardOffset - cardOffset },
                      { translateY: index * cardOffset },
                    ],
                  }}
                />
              );
            })
          ) : (
            <View style={styles.emptyState}>
              <AppText variant="h2" style={styles.emptyText}>
                All done! 🎉
              </AppText>
              <AppText variant="body" style={styles.emptySubtext}>
                Check your Today's Collection
              </AppText>
            </View>
          )}
        </View>

        {/* Arc Carousel */}
        <ArcCarousel
          items={outfits}
          activeIndex={activeIndex}
          onItemPress={handleThumbnailPress}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    overflow: 'hidden',
  },
  badgeBlur: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  nextButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  nextButtonBlur: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  undoButton: {
    position: 'absolute',
    left: 24,
    top: 100,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 100,
  },
  undoButtonBlur: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 40,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyText: {
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    color: '#FFFFFF',
    opacity: 0.8,
    textAlign: 'center',
  },
});

HomeScreen.displayName = 'HomeScreen';

export { HomeScreen };

