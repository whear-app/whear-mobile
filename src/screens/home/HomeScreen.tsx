import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react';
import { View, StyleSheet, Dimensions, TouchableOpacity, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText } from '../../components/AppText';
import { SwipeableCard } from '../../components/SwipeableCard';
import { ArcCarousel } from '../../components/ArcCarousel';
import { MainStackParamList } from '../../navigation/types';
import { ROUTES } from '../../constants/routes';
import { useTodayCollectionStore } from '../../stores/todayCollectionStore';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export interface OutfitSuggestion {
  id: string;
  imageUri: string;
  title: string;
  subtitle: string;
  handle: string;
  reason: string;
  bgGradient: [string, string, string];
  isAccepted?: boolean;
  isRejected?: boolean;
}

// Optimize image URLs
const img = (u: string) => u.replace('w=1200', 'w=1000');

const mockOutfits: OutfitSuggestion[] = [
  {
    id: '1',
    imageUri: img('https://images.unsplash.com/photo-1520975916090-3105956dac38?w=1200&auto=format&fit=crop'),
    title: 'Body language',
    subtitle: 'with maya daryen',
    handle: '@maya.daryen',
    reason: 'Hot day + Casual + Light fabric',
    bgGradient: ['#B9B0AC', '#C7C0BD', '#D8D6D3'],
  },
  {
    id: '2',
    imageUri: img('https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1200&auto=format&fit=crop'),
    title: 'Office Ready',
    subtitle: 'polished silhouette',
    handle: '@workwear.daily',
    reason: 'Work day + Smart + Comfortable',
    bgGradient: ['#B7B1B2', '#CFC8C9', '#EAE6E6'],
  },
  {
    id: '3',
    imageUri: img('https://images.unsplash.com/photo-1520975732144-442d66dffb6e?w=1200&auto=format&fit=crop'),
    title: 'Layered Comfort',
    subtitle: 'transitional fit',
    handle: '@layers.club',
    reason: 'Cool day + Versatile + Layered',
    bgGradient: ['#B8B7B4', '#D2D1CD', '#F0EFEC'],
  },
  {
    id: '4',
    imageUri: img('https://images.unsplash.com/photo-1520975867722-01286f6abf7d?w=1200&auto=format&fit=crop'),
    title: 'Bold Statement',
    subtitle: 'make an impact',
    handle: '@bold.room',
    reason: 'Special + Bold + Confident',
    bgGradient: ['#B9B2B8', '#D4CFD6', '#F1EEF3'],
  },
  {
    id: '5',
    imageUri: img('https://images.unsplash.com/photo-1520975747456-4097f9c2a5c2?w=1200&auto=format&fit=crop'),
    title: 'Evening Elegance',
    subtitle: 'date-night glow',
    handle: '@night.edit',
    reason: 'Evening + Date + Elegant',
    bgGradient: ['#B5B2B0', '#CDC7C4', '#EEEAE7'],
  },
  {
    id: '6',
    imageUri: img('https://images.unsplash.com/photo-1520975904416-6fd35a5a8e3a?w=1200&auto=format&fit=crop'),
    title: 'Summer Breeze',
    subtitle: 'light drape',
    handle: '@summer.set',
    reason: 'Sunny + Casual + Airy',
    bgGradient: ['#B8C6D4', '#D5E0EA', '#F3F6FA'],
  },
  {
    id: '7',
    imageUri: img('https://images.unsplash.com/photo-1520975833856-63c8c9e98a4a?w=1200&auto=format&fit=crop'),
    title: 'Street Clean',
    subtitle: 'quiet luxury',
    handle: '@street.clean',
    reason: 'City + Neutral + Crisp',
    bgGradient: ['#B9B7C0', '#D7D5DF', '#F4F3F7'],
  },
  {
    id: '8',
    imageUri: img('https://images.unsplash.com/photo-1520975747456-4097f9c2a5c2?w=1200&auto=format&fit=crop'),
    title: 'Minimalist Chic',
    subtitle: 'less is more',
    handle: '@studio.line',
    reason: 'Any day + Minimal + Timeless',
    bgGradient: ['#BFC7D1', '#D7DCE3', '#F0F1F3'],
  },
  {
    id: '9',
    imageUri: img('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop'),
    title: 'Weekend Vibes',
    subtitle: 'relaxed comfort',
    handle: '@weekend.mode',
    reason: 'Weekend + Casual + Cozy',
    bgGradient: ['#C4B5A0', '#D4C7B5', '#E8DFD1'],
  },
  {
    id: '10',
    imageUri: img('https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1200&auto=format&fit=crop'),
    title: 'Athletic Edge',
    subtitle: 'sporty elegance',
    handle: '@active.style',
    reason: 'Active + Sporty + Functional',
    bgGradient: ['#A8B5C0', '#C0D0DB', '#E0E8ED'],
  },
  {
    id: '11',
    imageUri: img('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop'),
    title: 'Bohemian Flow',
    subtitle: 'free spirit',
    handle: '@boho.life',
    reason: 'Festival + Free + Flowy',
    bgGradient: ['#D4B8A8', '#E4CCC0', '#F4E6DC'],
  },
  {
    id: '12',
    imageUri: img('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop'),
    title: 'Classic Tailored',
    subtitle: 'timeless elegance',
    handle: '@classic.cut',
    reason: 'Formal + Tailored + Professional',
    bgGradient: ['#9FA4A8', '#B8BDC2', '#D8DCE0'],
  },
  {
    id: '13',
    imageUri: img('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop'),
    title: 'Urban Explorer',
    subtitle: 'city wanderer',
    handle: '@urban.walk',
    reason: 'City + Practical + Stylish',
    bgGradient: ['#B2AFA8', '#CBC8C0', '#E8E6DF'],
  },
  {
    id: '14',
    imageUri: img('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop'),
    title: 'Romantic Blush',
    subtitle: 'soft femininity',
    handle: '@romance.edit',
    reason: 'Date + Romantic + Delicate',
    bgGradient: ['#E8C4C0', '#F0D4D0', '#F8E4E0'],
  },
  {
    id: '15',
    imageUri: img('https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop'),
    title: 'Monochrome Magic',
    subtitle: 'black & white',
    handle: '@mono.studio',
    reason: 'Any occasion + Classic + Bold',
    bgGradient: ['#6B6B6B', '#8B8B8B', '#B0B0B0'],
  },
];

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { colors, spacing, borderRadius, blur } = useAppTheme();
  const { addAccepted, addRejected, removeAccepted, removeRejected } = useTodayCollectionStore();

  const [outfits, setOutfits] = useState<OutfitSuggestion[]>(mockOutfits);
  const [activeIndex, setActiveIndex] = useState(0);
  const [history, setHistory] = useState<Array<{ item: OutfitSuggestion; index: number; action: 'left' | 'right' }>>([]);
  
  const isSwipingRef = useRef(false);
  const swipeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Prefetch images asynchronously
  useEffect(() => {
    const prefetchImages = async () => {
      const urls = outfits.slice(0, 6).map((o) => o.imageUri);
      try {
        await Promise.all(urls.map(url => Image.prefetch(url).catch(() => {})));
      } catch (error) {
        // Silently fail
      }
    };
    prefetchImages();
  }, [outfits]);

  const active = outfits[activeIndex];
  const bg = useMemo(
    () => active?.bgGradient ?? (colors.backgroundGradient as any),
    [active?.bgGradient, colors.backgroundGradient]
  );

  // Fixed goNext - immediately update index and reset swiping flag
  const goNext = useCallback(() => {
    if (swipeTimeoutRef.current) {
      clearTimeout(swipeTimeoutRef.current);
    }
    
    // Update index immediately
    setActiveIndex((prev) => {
      const next = Math.min(prev + 1, outfits.length - 1);
      // Reset swiping flag after animation completes
      swipeTimeoutRef.current = setTimeout(() => {
        isSwipingRef.current = false;
      }, 350);
      return next;
    });
  }, [outfits.length]);

  // Fixed onLeft - remove from list and add to rejected collection
  const onLeft = useCallback(() => {
    // Prevent multiple simultaneous swipes
    if (isSwipingRef.current) return;
    isSwipingRef.current = true;
    
    const currentIndex = activeIndex;
    const current = outfits[currentIndex];
    if (!current) {
      isSwipingRef.current = false;
      return;
    }

    // Add to rejected collection
    addRejected(current);
    setHistory((prev) => [...prev, { item: current, index: currentIndex, action: 'left' }]);
    
    // Remove from main list and update activeIndex
    setOutfits((prev) => {
      const newList = prev.filter((o) => o.id !== current.id);
      // Adjust activeIndex if needed
      if (currentIndex >= newList.length && newList.length > 0) {
        setActiveIndex(Math.max(0, newList.length - 1));
      } else if (newList.length === 0) {
        setActiveIndex(0);
      }
      return newList;
    });
    
    // Move to next card (or stay if no more cards)
    if (currentIndex >= outfits.length - 1) {
      // If this was the last card, stay at current index (which will be the new last)
      setTimeout(() => {
        isSwipingRef.current = false;
      }, 350);
    } else {
      // If not last, move to next (which will be at same index after removal)
      goNext();
    }
  }, [activeIndex, outfits, goNext, addRejected]);

  // Fixed onRight - remove from list and add to accepted collection
  const onRight = useCallback(() => {
    // Prevent multiple simultaneous swipes
    if (isSwipingRef.current) return;
    isSwipingRef.current = true;
    
    const currentIndex = activeIndex;
    const current = outfits[currentIndex];
    if (!current) {
      isSwipingRef.current = false;
      return;
    }

    // Add to accepted collection
    addAccepted(current);
    setHistory((prev) => [...prev, { item: current, index: currentIndex, action: 'right' }]);
    
    // Remove from main list and update activeIndex
    setOutfits((prev) => {
      const newList = prev.filter((o) => o.id !== current.id);
      // Adjust activeIndex if needed
      if (currentIndex >= newList.length && newList.length > 0) {
        setActiveIndex(Math.max(0, newList.length - 1));
      } else if (newList.length === 0) {
        setActiveIndex(0);
      }
      return newList;
    });
    
    // Move to next card (or stay if no more cards)
    if (currentIndex >= outfits.length - 1) {
      // If this was the last card, stay at current index (which will be the new last)
      setTimeout(() => {
        isSwipingRef.current = false;
      }, 350);
    } else {
      // If not last, move to next (which will be at same index after removal)
      goNext();
    }
  }, [activeIndex, outfits, goNext, addAccepted]);

  const undo = useCallback(() => {
    if (!history.length) return;
    
    const last = history[history.length - 1];
    const item = last.item;
    if (!item) return;

    // Remove from collection
    if (last.action === 'right') {
      removeAccepted(item.id);
    } else {
      removeRejected(item.id);
    }

    // Add back to main list at the original position
    setOutfits((prev) => {
      const newList = [...prev];
      const insertIndex = Math.min(last.index, newList.length);
      newList.splice(insertIndex, 0, item);
      return newList;
    });

    setHistory((prev) => prev.slice(0, -1));
    setActiveIndex(last.index);
  }, [history, removeAccepted, removeRejected]);

  const next = useCallback(() => {
    navigation.navigate(ROUTES.COLLECTIONS);
  }, [navigation]);

  // Handle arc carousel item press - ensure it updates the active card
  const handleArcItemPress = useCallback((index: number) => {
    if (index !== activeIndex && index >= 0 && index < outfits.length && !isSwipingRef.current) {
      isSwipingRef.current = true;
      setActiveIndex(index);
      // Reset swiping flag after a short delay
      setTimeout(() => {
        isSwipingRef.current = false;
      }, 200);
    }
  }, [activeIndex, outfits.length]);

  // Only render active card + 1 next card for performance
  // Use stable reference to prevent unnecessary re-renders
  const visibleCards = useMemo(
    () => {
      const cards = outfits.slice(activeIndex, activeIndex + 2);
      return cards;
    },
    [outfits, activeIndex]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (swipeTimeoutRef.current) {
        clearTimeout(swipeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={bg}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.85, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <View style={[styles.header, { paddingHorizontal: spacing.xl }]}>
          <AppText variant="display" overlay style={styles.headerTitle}>
            Today
          </AppText>

          <View style={styles.headerRight}>
            <View style={[styles.pill, { borderColor: colors.glassBorder }]}>
              {Platform.OS === 'ios' ? (
                <BlurView intensity={blur.medium} tint="light" style={styles.pillInner}>
                  <AppText overlay variant="caption" style={styles.pillText}>
                    Hot 🔥
                  </AppText>
                </BlurView>
              ) : (
                <View style={[styles.pillInner, styles.pillAndroid]}>
                  <AppText overlay variant="caption" style={styles.pillText}>
                    Hot 🔥
                  </AppText>
                </View>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={next}
              style={[styles.pill, { borderColor: colors.glassBorder }]}
            >
              {Platform.OS === 'ios' ? (
                <BlurView intensity={blur.medium} tint="light" style={[styles.pillInner, styles.pillNext]}>
                  <AppText overlay variant="body" style={styles.pillNextText}>
                    Next →
                  </AppText>
                </BlurView>
              ) : (
                <View style={[styles.pillInner, styles.pillAndroid, styles.pillNext]}>
                  <AppText overlay variant="body" style={styles.pillNextText}>
                    Next →
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Undo Button */}
        {history.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={undo}
            style={[styles.undo, { borderColor: colors.glassBorder, borderRadius: borderRadius.full }]}
          >
            {Platform.OS === 'ios' ? (
              <BlurView intensity={blur.medium} tint="light" style={styles.undoInner}>
                <Icon name="undo" size={22} color="rgba(255,255,255,0.95)" />
              </BlurView>
            ) : (
              <View style={[styles.undoInner, styles.undoAndroid]}>
                <Icon name="undo" size={22} color="rgba(255,255,255,0.95)" />
              </View>
            )}
          </TouchableOpacity>
        )}

        {/* Card Stack - Positioned to leave space for arc carousel */}
        {outfits.length > 0 ? (
          <View style={styles.cardZone} pointerEvents="box-none">
            {visibleCards.map((o, idx) => {
              const isActive = idx === 0;
              return (
                <SwipeableCard
                  key={`${o.id}-${activeIndex + idx}`}
                  outfit={o}
                  isActive={isActive}
                  onSwipeLeft={onLeft}
                  onSwipeRight={onRight}
                  style={{
                    zIndex: isActive ? 100 : 50,
                    transform: [
                      { translateX: idx * 6 - 6 },
                      { translateY: idx * 6 },
                    ],
                  }}
                />
              );
            })}
          </View>
        ) : (
          <View style={[styles.cardZone, styles.emptyState]}>
            <AppText overlay variant="h1" style={styles.emptyTitle}>
              All Done! 🎉
            </AppText>
            <AppText overlay muted variant="body" style={styles.emptySubtitle}>
              You've reviewed all outfits for today
            </AppText>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={next}
              style={[styles.pill, { borderColor: colors.glassBorder, marginTop: 24 }]}
            >
              {Platform.OS === 'ios' ? (
                <BlurView intensity={blur.medium} tint="light" style={[styles.pillInner, styles.pillNext]}>
                  <AppText overlay variant="body" style={styles.pillNextText}>
                    View Collections →
                  </AppText>
                </BlurView>
              ) : (
                <View style={[styles.pillInner, styles.pillAndroid, styles.pillNext]}>
                  <AppText overlay variant="body" style={styles.pillNextText}>
                    View Collections →
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* Arc Carousel - Positioned at bottom - only show if there are items */}
        {outfits.length > 0 && (
          <ArcCarousel
            items={outfits}
            activeIndex={activeIndex}
            onItemPress={handleArcItemPress}
          />
        )}
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
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    paddingBottom: 20,
    zIndex: 10,
  },
  headerTitle: {
    fontWeight: '900',
    fontSize: 32,
    letterSpacing: -0.5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pill: {
    borderWidth: 1.5,
    borderRadius: 999,
    overflow: 'hidden',
  },
  pillInner: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillNext: {
    paddingHorizontal: 18,
  },
  pillAndroid: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  pillText: {
    fontWeight: '800',
    fontSize: 13,
  },
  pillNextText: {
    fontWeight: '900',
    fontSize: 15,
  },
  undo: {
    position: 'absolute',
    left: 20,
    top: 110,
    width: 46,
    height: 46,
    overflow: 'hidden',
    borderWidth: 1.5,
    zIndex: 200,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  undoInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  undoAndroid: {
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  cardZone: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    paddingBottom: 180, // Space for arc carousel
  },
  emptyState: {
    paddingBottom: 0,
  },
  emptyTitle: {
    fontWeight: '900',
    fontSize: 32,
    marginBottom: 12,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

HomeScreen.displayName = 'HomeScreen';

export { HomeScreen };
