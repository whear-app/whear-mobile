import React from 'react';
import { View, StyleSheet, ScrollView, Alert, TouchableOpacity, Text, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppText, AppButton, GradientBackground, AppCard } from '../../components';
import { ROUTES } from '../../constants/routes';
import { MainStackParamList } from '../../navigation/types';
import { spacing as spacingConstants, borderRadius as borderRadiusConstants } from '../../constants/theme';
import { useAuthStore } from '../../features/authStore';
import { useProfileStore } from '../../features/profileStore';
import { useThemeStore } from '../../features/themeStore';
import { useLanguageStore } from '../../features/languageStore';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useTranslation } from 'react-i18next';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export const SettingsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { t } = useTranslation();
  const { user, logout } = useAuthStore();
  const { deleteAccount } = useProfileStore();
  const { themeMode, setThemeMode } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const { showSnackbar } = useSnackbar();
  const { colors, spacing, borderRadius } = useAppTheme();
  const [isDarkMode, setIsDarkMode] = React.useState(themeMode === 'dark');

  const handleThemeToggle = (value: boolean) => {
    setIsDarkMode(value);
    setThemeMode(value ? 'dark' : 'light');
  };

  const handleDeleteAccount = () => {
    if (!user) return;

    Alert.alert(
      t('profile.deleteAccount'),
      t('profile.deleteAccountConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount(user.id);
              await logout();
              showSnackbar(t('profile.accountDeleted'), 'success');
            } catch (error) {
              showSnackbar((error as Error).message, 'error');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logout'),
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const handleLanguageChange = async (newLanguage: 'en' | 'vi') => {
    await setLanguage(newLanguage);
  };

  const SettingItem: React.FC<{
    icon: string;
    title: string;
    onPress?: () => void;
    right?: React.ReactNode;
    destructive?: boolean;
  }> = ({ icon, title, onPress, right, destructive }) => (
    <TouchableOpacity
      style={[
        styles.settingItem,
        {
          backgroundColor: colors.glassSurface,
          borderColor: colors.glassBorder,
          borderRadius: borderRadius.lg,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingLeft}>
        <Text style={styles.settingIcon}>{icon}</Text>
        <AppText variant="body" color={destructive ? colors.error : colors.textPrimary}>
          {title}
        </AppText>
      </View>
      {right}
    </TouchableOpacity>
  );

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={[styles.header, { paddingHorizontal: spacing.lg, paddingTop: spacing.lg }]}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={[styles.backIcon, { color: colors.textPrimary }]}>←</Text>
          </TouchableOpacity>
          <AppText variant="h1" style={{ fontWeight: '700' }}>{t('profile.settings')}</AppText>
          <View style={styles.placeholder} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={[styles.content, { padding: spacing.lg }]}>
            <AppCard variant="glass" style={[styles.section, { marginBottom: spacing.lg }]}>
              <AppText variant="body" style={[styles.sectionTitle, { marginBottom: spacing.md, fontWeight: '600' }]}>
                {t('profile.appearance')}
              </AppText>
              <SettingItem
                icon="🌓"
                title={t('profile.darkMode')}
                right={
                  <Switch
                    value={isDarkMode}
                    onValueChange={handleThemeToggle}
                    trackColor={{ false: colors.glassBorder, true: colors.accent }}
                    thumbColor="#FFFFFF"
                  />
                }
              />
              <SettingItem
                icon="🌐"
                title={t('profile.language')}
                right={
                  <View style={styles.languageSelector}>
                    <TouchableOpacity
                      onPress={() => handleLanguageChange('en')}
                      style={[
                        styles.languageOption,
                        language === 'en' && { backgroundColor: colors.accentLight, borderColor: colors.accent }
                      ]}
                    >
                      <AppText variant="caption" style={{ fontWeight: language === 'en' ? '600' : '400' }}>
                        {t('profile.english')}
                      </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleLanguageChange('vi')}
                      style={[
                        styles.languageOption,
                        language === 'vi' && { backgroundColor: colors.accentLight, borderColor: colors.accent }
                      ]}
                    >
                      <AppText variant="caption" style={{ fontWeight: language === 'vi' ? '600' : '400' }}>
                        {t('profile.vietnamese')}
                      </AppText>
                    </TouchableOpacity>
                  </View>
                }
              />
            </AppCard>

            <AppCard variant="glass" style={[styles.section, { marginBottom: spacing.lg }]}>
              <AppText variant="body" style={[styles.sectionTitle, { marginBottom: spacing.md, fontWeight: '600' }]}>
                {t('profile.account')}
              </AppText>
              <SettingItem icon="🔒" title={t('profile.privacyPolicy')} onPress={() => {}} />
              <SettingItem icon="📄" title={t('profile.termsOfService')} onPress={() => {}} />
              <SettingItem icon="🗑️" title={t('profile.deleteAccount')} onPress={handleDeleteAccount} destructive />
            </AppCard>

            <AppCard variant="glass" style={[styles.section, { marginBottom: spacing.lg }]}>
              <AppText variant="body" style={[styles.sectionTitle, { marginBottom: spacing.md, fontWeight: '600' }]}>
                {t('profile.about')}
              </AppText>
              <SettingItem icon="ℹ️" title={t('profile.appVersion')} right={<AppText variant="caption" color={colors.textSecondary}>1.0.0</AppText>} />
              <SettingItem icon="⭐" title={t('profile.upgradeToPro')} onPress={() => navigation.navigate(ROUTES.UPGRADE)} />
            </AppCard>

            <AppButton
              label={t('profile.logout')}
              variant="glass"
              onPress={handleLogout}
              style={styles.logoutButton}
            />
          </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacingConstants.md,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadiusConstants.full,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  backIcon: {
    fontSize: 24,
    fontWeight: '300',
  },
  placeholder: {
    width: 40,
  },
  content: {
    paddingBottom: spacingConstants.xl,
  },
  section: {
    padding: spacingConstants.lg,
  },
  sectionTitle: {
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacingConstants.md,
    paddingHorizontal: spacingConstants.md,
    borderWidth: 1,
    marginBottom: spacingConstants.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacingConstants.md,
  },
  settingIcon: {
    fontSize: 20,
  },
  logoutButton: {
    marginTop: spacingConstants.xl,
  },
  languageSelector: {
    flexDirection: 'row',
    gap: spacingConstants.sm,
  },
  languageOption: {
    paddingHorizontal: spacingConstants.md,
    paddingVertical: spacingConstants.xs,
    borderRadius: borderRadiusConstants.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
});

SettingsScreen.displayName = 'SettingsScreen';