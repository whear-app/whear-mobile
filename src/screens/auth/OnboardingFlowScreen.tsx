import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText, AppButton, GradientBackground } from '../../components';
import { ROUTES } from '../../constants/routes';
import { AuthStackParamList } from '../../navigation/types';
import { spacing as spacingConstants, borderRadius as borderRadiusConstants } from '../../constants/theme';
import { useAuthStore } from '../../features/authStore';
import { useProfileStore } from '../../features/profileStore';
import { useTranslation } from 'react-i18next';

const Icon = MaterialCommunityIcons;
const { width: SCREEN_WIDTH } = Dimensions.get('window');
type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';
type BodyShape = 'hourglass' | 'rectangle' | 'pear' | 'apple' | 'inverted-triangle' | 'oval';

interface OnboardingData {
  gender?: Gender;
  weight?: string;
  height?: string;
  bust?: string;
  waist?: string;
  hips?: string;
  bodyShape?: BodyShape;
  stylePreferences?: string[];
}

// Body shapes will be translated dynamically using i18n
const getBodyShapes = (t: any): { value: BodyShape; label: string; description: string; image: string }[] => [
  { value: 'hourglass', label: t('bodyShapes.hourglass'), description: t('bodyShapes.hourglassDesc'), image: 'https://images.unsplash.com/photo-1594736797933-d0c0d0e0e0e0?w=300&h=400&fit=crop' },
  { value: 'rectangle', label: t('bodyShapes.rectangle'), description: t('bodyShapes.rectangleDesc'), image: 'https://images.unsplash.com/photo-1594736797933-d0c0d0e0e0e0?w=300&h=400&fit=crop' },
  { value: 'pear', label: t('bodyShapes.pear'), description: t('bodyShapes.pearDesc'), image: 'https://images.unsplash.com/photo-1594736797933-d0c0d0e0e0e0?w=300&h=400&fit=crop' },
  { value: 'apple', label: t('bodyShapes.apple'), description: t('bodyShapes.appleDesc'), image: 'https://images.unsplash.com/photo-1594736797933-d0c0d0e0e0e0?w=300&h=400&fit=crop' },
  { value: 'inverted-triangle', label: t('bodyShapes.invertedTriangle'), description: t('bodyShapes.invertedTriangleDesc'), image: 'https://images.unsplash.com/photo-1594736797933-d0c0d0e0e0e0?w=300&h=400&fit=crop' },
  { value: 'oval', label: t('bodyShapes.oval'), description: t('bodyShapes.ovalDesc'), image: 'https://images.unsplash.com/photo-1594736797933-d0c0d0e0e0e0?w=300&h=400&fit=crop' },
];

const styleOptions: { value: string; label: string; image: string }[] = [
  { value: 'casual', label: 'Casual', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop' },
  { value: 'formal', label: 'Formal', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop' },
  { value: 'sporty', label: 'Sporty', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop' },
  { value: 'elegant', label: 'Elegant', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop' },
  { value: 'bohemian', label: 'Bohemian', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop' },
  { value: 'vintage', label: 'Vintage', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop' },
  { value: 'minimalist', label: 'Minimalist', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop' },
  { value: 'streetwear', label: 'Streetwear', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=400&fit=crop' },
];

export const OnboardingFlowScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { updateProfile, fetchProfile, profile } = useProfileStore();
  const { colors, spacing, borderRadius, isDark } = useAppTheme();
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<OnboardingData>({});
  const [isCheckingProfile, setIsCheckingProfile] = useState(true);

  const totalSteps = 4;

  // Pre-fill data from existing profile if available (but always show onboarding)
  React.useEffect(() => {
    const loadProfile = async () => {
      if (user) {
        try {
          await fetchProfile(user.id);
          // Pre-fill data from existing profile if available
          if (profile) {
            setData({
              gender: profile.gender,
              height: profile.height?.toString(),
              weight: profile.weight?.toString(),
              stylePreferences: profile.stylePreferences || [],
            });
          }
        } catch (error) {
          // Profile doesn't exist, start fresh
          console.log('No profile found, starting fresh onboarding');
        }
      }
      setIsCheckingProfile(false);
    };
    loadProfile();
  }, [user]);

  const updateData = (updates: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!user) return;

    try {
      await updateProfile(user.id, {
        gender: data.gender,
        height: data.height ? parseFloat(data.height) : undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        stylePreferences: data.stylePreferences,
      });
      // Refresh profile - this will update profile in store
      await fetchProfile(user.id);
      
      // After profile is updated, App.tsx will automatically re-render
      // and shouldShowMainStack will become true (because profile is now complete)
      // We need to wait a bit for App.tsx to re-render, then navigate
      setTimeout(() => {
        const parent = navigation.getParent();
        if (parent) {
          (parent as any).navigate('Main', { 
            screen: ROUTES.WEAR_TODAY,
          });
        } else {
          (navigation as any).navigate('Main', { 
            screen: ROUTES.WEAR_TODAY,
          });
        }
      }, 300);
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return !!data.gender;
      case 2:
        return !!(data.height && data.weight);
      case 3:
        return !!data.bodyShape;
      case 4:
        return data.stylePreferences && data.stylePreferences.length > 0;
      default:
        return false;
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <AppText variant="h1" style={{ fontWeight: '700', marginBottom: spacing.sm, textAlign: 'center' }}>
        {t('onboarding.chooseGender')}
      </AppText>
      <AppText variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl, textAlign: 'center' }}>
        {t('onboarding.genderDescription')}
      </AppText>

      <View style={styles.genderContainer}>
        <TouchableOpacity
          style={[
            styles.genderCard,
            {
              backgroundColor: data.gender === 'male' ? colors.accentLight : colors.cardBackground,
              borderColor: data.gender === 'male' ? colors.accent : colors.glassBorder,
              borderWidth: data.gender === 'male' ? 3 : 1,
            },
          ]}
          onPress={() => updateData({ gender: 'male' })}
          activeOpacity={0.7}
        >
          <View style={[styles.genderIconContainer, { backgroundColor: `${colors.accent}15` }]}>
            <Icon name="gender-male" size={80} color={colors.accent} />
          </View>
          <AppText variant="h3" style={{ fontWeight: '600', marginTop: spacing.md }}>
            {t('onboarding.male')}
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.genderCard,
            {
              backgroundColor: data.gender === 'female' ? colors.accentLight : colors.cardBackground,
              borderColor: data.gender === 'female' ? colors.accent : colors.glassBorder,
              borderWidth: data.gender === 'female' ? 3 : 1,
            },
          ]}
          onPress={() => updateData({ gender: 'female' })}
          activeOpacity={0.7}
        >
          <View style={[styles.genderIconContainer, { backgroundColor: `${colors.accent}15` }]}>
            <Icon name="gender-female" size={80} color={colors.accent} />
          </View>
          <AppText variant="h3" style={{ fontWeight: '600', marginTop: spacing.md }}>
            {t('onboarding.female')}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <AppText variant="h1" style={{ fontWeight: '700', marginBottom: spacing.sm, textAlign: 'center' }}>
        {t('onboarding.bodyInformation')}
      </AppText>
      <AppText variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl, textAlign: 'center' }}>
        {t('onboarding.bodyDescription')}
      </AppText>

      <View style={styles.inputGroup}>
        <View style={styles.inputRow}>
          <View style={[styles.inputContainer, { flex: 1, marginRight: spacing.md }]}>
            <AppText variant="body" style={[styles.inputLabel, { fontWeight: '600', marginBottom: spacing.sm }]}>
              {t('onboarding.height')}
            </AppText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.glassSurface,
                  borderColor: colors.glassBorder,
                  color: colors.textPrimary,
                  borderRadius: borderRadius.md,
                },
              ]}
              value={data.height}
              onChangeText={(text) => updateData({ height: text })}
              placeholder={t('onboarding.heightPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>

          <View style={[styles.inputContainer, { flex: 1 }]}>
            <AppText variant="body" style={[styles.inputLabel, { fontWeight: '600', marginBottom: spacing.sm }]}>
              {t('onboarding.weight')}
            </AppText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.glassSurface,
                  borderColor: colors.glassBorder,
                  color: colors.textPrimary,
                  borderRadius: borderRadius.md,
                },
              ]}
              value={data.weight}
              onChangeText={(text) => updateData({ weight: text })}
              placeholder={t('onboarding.weightPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              keyboardType="numeric"
            />
          </View>
        </View>

        {data.gender === 'female' && (
          <>
            <View style={styles.inputContainer}>
              <AppText variant="body" style={[styles.inputLabel, { fontWeight: '600', marginBottom: spacing.sm }]}>
                {t('onboarding.bust')}
              </AppText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.glassSurface,
                    borderColor: colors.glassBorder,
                    color: colors.textPrimary,
                    borderRadius: borderRadius.md,
                  },
                ]}
                value={data.bust}
                onChangeText={(text) => updateData({ bust: text })}
                placeholder={t('onboarding.bustPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <AppText variant="body" style={[styles.inputLabel, { fontWeight: '600', marginBottom: spacing.sm }]}>
                {t('onboarding.waist')}
              </AppText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.glassSurface,
                    borderColor: colors.glassBorder,
                    color: colors.textPrimary,
                    borderRadius: borderRadius.md,
                  },
                ]}
                value={data.waist}
                onChangeText={(text) => updateData({ waist: text })}
                placeholder={t('onboarding.waistPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputContainer}>
              <AppText variant="body" style={[styles.inputLabel, { fontWeight: '600', marginBottom: spacing.sm }]}>
                {t('onboarding.hips')}
              </AppText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.glassSurface,
                    borderColor: colors.glassBorder,
                    color: colors.textPrimary,
                    borderRadius: borderRadius.md,
                  },
                ]}
                value={data.hips}
                onChangeText={(text) => updateData({ hips: text })}
                placeholder={t('onboarding.hipsPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                keyboardType="numeric"
              />
            </View>
          </>
        )}
      </View>
    </View>
  );

  const renderStep3 = () => {
    const bodyShapes = getBodyShapes(t);
    return (
      <View style={styles.stepContainer}>
        <AppText variant="h1" style={{ fontWeight: '700', marginBottom: spacing.sm, textAlign: 'center' }}>
          {t('onboarding.bodyShape')}
        </AppText>
        <AppText variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl, textAlign: 'center' }}>
          {t('onboarding.bodyShapeDescription')}
        </AppText>

        <ScrollView
          contentContainerStyle={styles.bodyShapeGrid}
          showsVerticalScrollIndicator={false}
        >
          {bodyShapes.map((shape) => (
          <TouchableOpacity
            key={shape.value}
            style={[
              styles.bodyShapeCard,
              {
                backgroundColor: data.bodyShape === shape.value ? colors.accentLight : colors.cardBackground,
                borderColor: data.bodyShape === shape.value ? colors.accent : colors.glassBorder,
                borderWidth: data.bodyShape === shape.value ? 3 : 1,
              },
            ]}
            onPress={() => updateData({ bodyShape: shape.value })}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: shape.image }}
              style={[styles.bodyShapeImage, { borderRadius: borderRadius.md }]}
              contentFit="cover"
            />
            <View style={styles.bodyShapeInfo}>
              <AppText variant="h3" style={{ fontWeight: '600', marginBottom: spacing.xs }}>
                {shape.label}
              </AppText>
              <AppText variant="caption" color={colors.textSecondary}>
                {shape.description}
              </AppText>
            </View>
            {data.bodyShape === shape.value && (
              <View style={[styles.checkBadge, { backgroundColor: colors.accent }]}>
                <Icon name="check" size={20} color="#FFFFFF" />
              </View>
            )}
          </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderStep4 = () => (
    <View style={styles.stepContainer}>
      <AppText variant="h1" style={{ fontWeight: '700', marginBottom: spacing.sm, textAlign: 'center' }}>
        {t('onboarding.stylePreferences')}
      </AppText>
      <AppText variant="body" color={colors.textSecondary} style={{ marginBottom: spacing.xl, textAlign: 'center' }}>
        {t('onboarding.stylePreferencesDescription')}
      </AppText>

      <ScrollView
        contentContainerStyle={styles.styleGrid}
        showsVerticalScrollIndicator={false}
      >
        {styleOptions.map((style) => {
          const isSelected = data.stylePreferences?.includes(style.value) || false;
          return (
            <TouchableOpacity
              key={style.value}
              style={[
                styles.styleCard,
                {
                  backgroundColor: isSelected ? colors.accentLight : colors.cardBackground,
                  borderColor: isSelected ? colors.accent : colors.glassBorder,
                  borderWidth: isSelected ? 3 : 1,
                },
              ]}
              onPress={() => {
                const current = data.stylePreferences || [];
                const updated = isSelected
                  ? current.filter((s) => s !== style.value)
                  : [...current, style.value];
                updateData({ stylePreferences: updated });
              }}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: style.image }}
                style={[styles.styleImage, { borderRadius: borderRadius.md }]}
                contentFit="cover"
              />
              <View style={styles.styleOverlay}>
                <AppText variant="body" style={{ fontWeight: '600', color: '#FFFFFF' }}>
                  {style.label}
                </AppText>
                {isSelected && (
                  <View style={[styles.checkBadge, { backgroundColor: colors.accent }]}>
                    <Icon name="check" size={16} color="#FFFFFF" />
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return null;
    }
  };

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={[styles.progressBar, { backgroundColor: colors.glassBorder }]}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${(currentStep / totalSteps) * 100}%`,
                  backgroundColor: colors.accent,
                },
              ]}
            />
          </View>
          <AppText variant="caption" color={colors.textSecondary} style={{ marginTop: spacing.xs }}>
            {t('onboarding.step')} {currentStep} {t('onboarding.of')} {totalSteps}
          </AppText>
        </View>

        {/* Step Content */}
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          {renderCurrentStep()}
        </ScrollView>

        {/* Navigation Buttons */}
        <View style={[styles.navigation, { paddingHorizontal: spacing.lg, paddingBottom: spacing.lg }]}>
          <AppButton
            label={currentStep === totalSteps ? t('common.complete') : t('common.next')}
            onPress={handleNext}
            disabled={!canProceed()}
            style={[styles.navButton, { width: '100%', marginBottom: currentStep > 1 ? spacing.md : 0 }]}
          />
          {currentStep > 1 && (
            <AppButton
              label={t('common.back')}
              variant="glass"
              onPress={handleBack}
              style={[styles.navButton, { width: '100%' }]}
            />
          )}
          {!canProceed() && currentStep === 1 && (
            <AppText variant="caption" color={colors.textSecondary} style={{ textAlign: 'center', marginTop: spacing.xs, width: '100%' }}>
              {t('onboarding.pleaseSelectGender')}
            </AppText>
          )}
        </View>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  progressContainer: {
    paddingHorizontal: spacingConstants.lg,
    paddingTop: spacingConstants.lg,
    paddingBottom: spacingConstants.md,
  },
  progressBar: {
    height: 4,
    borderRadius: borderRadiusConstants.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: borderRadiusConstants.full,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacingConstants.lg,
    paddingTop: spacingConstants.xl,
    paddingBottom: spacingConstants.xl,
    flexGrow: 1,
  },
  stepContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: spacingConstants.lg,
    justifyContent: 'center',
  },
  genderCard: {
    flex: 1,
    alignItems: 'center',
    padding: spacingConstants.xl,
    borderRadius: borderRadiusConstants.xl,
    borderWidth: 1,
    minHeight: 300,
    justifyContent: 'center',
  },
  genderIconContainer: {
    width: 150,
    height: 150,
    borderRadius: borderRadiusConstants.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    gap: spacingConstants.lg,
    width: '100%',
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: spacingConstants.md,
  },
  inputContainer: {
    marginBottom: spacingConstants.md,
  },
  inputLabel: {
    fontWeight: '600',
  },
  input: {
    height: 56,
    paddingHorizontal: spacingConstants.md,
    borderWidth: 1,
    fontSize: 16,
  },
  bodyShapeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacingConstants.md,
    paddingBottom: spacingConstants.xl,
  },
  bodyShapeCard: {
    width: (SCREEN_WIDTH - spacingConstants.lg * 2 - spacingConstants.md) / 2,
    borderRadius: borderRadiusConstants.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  bodyShapeImage: {
    width: '100%',
    height: 220,
  },
  bodyShapeInfo: {
    padding: spacingConstants.md,
  },
  checkBadge: {
    position: 'absolute',
    top: spacingConstants.md,
    right: spacingConstants.md,
    width: 32,
    height: 32,
    borderRadius: borderRadiusConstants.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacingConstants.md,
    paddingBottom: spacingConstants.xl,
  },
  styleCard: {
    width: (SCREEN_WIDTH - spacingConstants.lg * 2 - spacingConstants.md) / 2,
    borderRadius: borderRadiusConstants.lg,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  styleImage: {
    width: '100%',
    height: 200,
  },
  styleOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacingConstants.md,
    backgroundColor: 'rgba(0,0,0,0.5)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navigation: {
    width: '100%',
    minHeight: 60,
    zIndex: 10,
  },
  navButton: {
    marginVertical: 0,
    width: '100%',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

OnboardingFlowScreen.displayName = 'OnboardingFlowScreen';

