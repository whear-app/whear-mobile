import React, { useEffect } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText, AppButton, AppCard, LoadingSpinner, GradientBackground } from '../../components';
import { MainStackParamList } from '../../navigation/types';
import { spacing as spacingConstants, borderRadius as borderRadiusConstants } from '../../constants/theme';
import { useAuthStore } from '../../features/authStore';
import { useEntitlementsStore } from '../../features/entitlementsStore';
import { useSnackbar } from '../../hooks/useSnackbar';
import { FREE_PLAN_LIMITS, PRO_PLAN_LIMITS } from '../../constants/limits';
import { useTranslation } from 'react-i18next';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const UpgradeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { entitlements, upgradeToPro, isLoading, fetchEntitlements } = useEntitlementsStore();
  const { showSnackbar } = useSnackbar();
  const { colors, spacing, borderRadius } = useAppTheme();

  useEffect(() => {
    if (user) {
      fetchEntitlements(user.id);
    }
  }, [user]);

  const handleUpgrade = async () => {
    if (!user) return;

    try {
      await upgradeToPro(user.id);
      showSnackbar(t('subscription.upgradedSuccess'), 'success');
      navigation.goBack();
    } catch (error) {
      showSnackbar((error as Error).message, 'error');
    }
  };

  if (isLoading) {
    return (
      <GradientBackground>
        <LoadingSpinner />
      </GradientBackground>
    );
  }

  const isPro = entitlements?.plan === 'pro';

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg }]}>
          <AppText variant="h1" style={{ fontWeight: '700' }}>{t('profile.upgradeToPro')}</AppText>
          {isPro && (
            <View style={[styles.proBadge, { backgroundColor: colors.accentLight, marginTop: spacing.sm }]}>
              <AppText variant="caption" color={colors.accent} style={{ fontWeight: '600' }}>
                ✓ {t('subscription.alreadyPro')}
              </AppText>
            </View>
          )}
        </View>

        <ScrollView
          contentContainerStyle={[styles.scrollContent, { padding: spacing.lg }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.plans}>
            <AppCard variant="glass" style={[styles.planCard, { marginBottom: spacing.lg }]}>
              <AppText variant="h2" style={{ fontWeight: '700', marginBottom: spacing.sm }}>
                {t('subscription.freePlan')}
              </AppText>
              <AppText
                variant="display"
                style={{ fontWeight: '700', marginBottom: spacing.md, color: colors.textPrimary }}
              >
                $0
              </AppText>
              <View style={styles.features}>
                <AppText variant="body" color={colors.textSecondary} style={styles.feature}>
                  • {t('subscription.upTo')} {FREE_PLAN_LIMITS.maxClosetItems} {t('subscription.closetItems')}
                </AppText>
                <AppText variant="body" color={colors.textSecondary} style={styles.feature}>
                  • {FREE_PLAN_LIMITS.maxGeneratesPerDay} {t('subscription.outfitGeneratesPerDay')}
                </AppText>
              </View>
            </AppCard>

            <AppCard
              variant="floating"
              style={[
                styles.planCard,
                {
                  borderWidth: 2,
                  borderColor: colors.accent,
                  marginBottom: spacing.lg,
                },
              ]}
            >
              <AppText variant="h2" style={{ fontWeight: '700', marginBottom: spacing.sm }}>
                {t('subscription.proPlan')}
              </AppText>
              <AppText
                variant="display"
                style={{ fontWeight: '700', marginBottom: spacing.md, color: colors.textPrimary }}
              >
                $9.99/mo
              </AppText>
              <View style={styles.features}>
                <AppText variant="body" color={colors.textSecondary} style={styles.feature}>
                  • {t('subscription.upTo')} {PRO_PLAN_LIMITS.maxClosetItems} {t('subscription.closetItems')}
                </AppText>
                <AppText variant="body" color={colors.textSecondary} style={styles.feature}>
                  • {PRO_PLAN_LIMITS.maxGeneratesPerDay} {t('subscription.outfitGeneratesPerDay')}
                </AppText>
                <AppText variant="body" color={colors.textSecondary} style={styles.feature}>
                  • {t('subscription.prioritySupport')}
                </AppText>
                <AppText variant="body" color={colors.textSecondary} style={styles.feature}>
                  • {t('subscription.advancedAI')}
                </AppText>
              </View>
              {!isPro && (
                <AppButton
                  label={t('subscription.upgradeNow')}
                  onPress={handleUpgrade}
                  loading={isLoading}
                  style={styles.upgradeButton}
                />
              )}
            </AppCard>
          </View>

          <AppText variant="caption" color={colors.textSecondary} style={styles.disclaimer}>
            {t('subscription.demoNotice')}
          </AppText>
        </ScrollView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: spacingConstants.md,
  },
  proBadge: {
    paddingHorizontal: spacingConstants.md,
    paddingVertical: spacingConstants.sm,
    borderRadius: borderRadiusConstants.full,
    alignSelf: 'flex-start',
  },
  scrollContent: {
    paddingBottom: spacingConstants.xl,
  },
  plans: {
    marginTop: spacingConstants.lg,
  },
  planCard: {
    padding: spacingConstants.lg,
  },
  features: {
    marginTop: spacingConstants.md,
    gap: spacingConstants.sm,
  },
  feature: {
    marginBottom: spacingConstants.xs,
  },
  upgradeButton: {
    marginTop: spacingConstants.lg,
  },
  disclaimer: {
    marginTop: spacingConstants.xl,
    textAlign: 'center',
  },
});

UpgradeScreen.displayName = 'UpgradeScreen';