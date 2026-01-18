import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppTheme } from '../../hooks/useAppTheme';
import { AppButton, AppInput, GradientBackground, AppCard } from '../../components';
import { ROUTES } from '../../constants/routes';
import { AuthStackParamList } from '../../navigation/types';
import { spacing as spacingConstants } from '../../constants/theme';
import { authService } from '../../services/authService';
import { useSnackbar } from '../../hooks/useSnackbar';
import { useTranslation } from 'react-i18next';

const createForgotPasswordSchema = (t: any) => z.object({
  email: z.string().email(t('auth.invalidEmail')),
});

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export const ForgotPasswordScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { showSnackbar } = useSnackbar();
  const { colors, spacing } = useAppTheme();
  const [isLoading, setIsLoading] = React.useState(false);
  const [emailSent, setEmailSent] = React.useState(false);

  const forgotPasswordSchema = createForgotPasswordSchema(t);
  type FormData = z.infer<typeof forgotPasswordSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const email = watch('email');

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      setEmailSent(true);
      showSnackbar(t('auth.resetCodeSent'), 'success');
    } catch (error) {
      showSnackbar((error as Error).message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <GradientBackground>
        <SafeAreaView style={styles.container}>
          <View style={[styles.content, { padding: spacing.lg }]}>
            <AppCard variant="glass" style={styles.card}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{t('auth.checkYourEmail')}</Text>
                <Text style={[styles.message, { color: colors.textSecondary }]}>
                  {t('auth.resetCodeSentTo')} {email}
                </Text>
                <Text style={[styles.hint, { color: colors.textSecondary }]}>
                  {t('auth.enterCode')}: 123456
                </Text>
              </View>
              <AppButton
                label={t('auth.continueToReset')}
                onPress={() =>
                  navigation.navigate(ROUTES.RESET_PASSWORD, {
                    email: email || '',
                    code: '123456',
                  })
                }
                style={styles.button}
              />
            </AppCard>
          </View>
        </SafeAreaView>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={[styles.title, { color: colors.textPrimary }]}>{t('auth.forgotPassword')}</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {t('auth.enterEmailForReset')}
                </Text>
              </View>

              <AppCard variant="glass" style={styles.formCard}>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <AppInput
                      label={t('auth.email')}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.email?.message}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  )}
                />

                <AppButton
                  label={t('auth.sendResetCode')}
                  onPress={handleSubmit(onSubmit)}
                  loading={isLoading}
                  style={styles.button}
                />

                <AppButton
                  label={t('auth.backToSignIn')}
                  variant="ghost"
                  onPress={() => navigation.goBack()}
                  style={styles.linkButton}
                />
              </AppCard>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </GradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacingConstants.lg,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: spacingConstants.xl * 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: spacingConstants.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacingConstants.sm,
  },
  hint: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: spacingConstants.sm,
  },
  formCard: {
    padding: spacingConstants.lg,
    marginBottom: spacingConstants.xl,
  },
  card: {
    padding: spacingConstants.lg,
  },
  button: {
    marginTop: spacingConstants.md,
  },
  linkButton: {
    marginTop: spacingConstants.sm,
  },
});

ForgotPasswordScreen.displayName = 'ForgotPasswordScreen';