import React, { useCallback, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslation } from "react-i18next";

import { useAppTheme } from "../../hooks/useAppTheme";
import { AppButton, AppInput, GradientBackground, AppCard } from "../../components";
import { ROUTES } from "../../constants/routes";
import type { AuthStackParamList } from "../../navigation/types";
import { spacing as spacingConstants } from "../../constants/theme";
import { useAuthStore } from "../../features/authStore";
import { useSnackbar } from "../../hooks/useSnackbar";
import { useGoogleAuth } from "../../hooks/useGoogleAuth";

const createLoginSchema = (t: any) =>
  z.object({
    email: z.string().email(t("auth.invalidEmail")),
    password: z.string().min(1, t("auth.passwordRequired")),
  });

type NavigationProp = NativeStackNavigationProp<AuthStackParamList>;

export const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const { login, isLoading } = useAuthStore();
  const { showSnackbar } = useSnackbar();
  const { colors } = useAppTheme();

  const {
    isReady: isGoogleReady,
    signInWithGoogle,
    authorizationCode,
    codeVerifier,
  } = useGoogleAuth();

  const loginSchema = createLoginSchema(t);
  type FormData = z.infer<typeof loginSchema>;

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "demo@whear.com",
      password: "demo123",
    },
  });

  const onSubmit = useCallback(
    async (data: FormData) => {
      try {
        await login(data.email, data.password);
        navigation.navigate(ROUTES.ONBOARDING_FLOW);
      } catch (error) {
        showSnackbar((error as Error).message, "error");
      }
    },
    [login, navigation, showSnackbar]
  );

  // ✅ If you want to finish Google login in this screen:
  // When hook returns authorizationCode + codeVerifier, call your API here.
  // Replace this with your actual backend call.
  useEffect(() => {
    const run = async () => {
      if (!authorizationCode || !codeVerifier) return;

      try {
        // Example: call backend to exchange code -> tokens -> create app session
        // await loginWithGoogleCode({ authorizationCode, codeVerifier });

        // For now, just notify so you know values are ready:
        if (__DEV__) {
          console.log("[LOGIN] ✅ Google code ready:", {
            authorizationCode: `${authorizationCode.slice(0, 10)}...`,
            codeVerifier: `${codeVerifier.slice(0, 10)}...`,
          });
        }

        // After your backend login succeeds:
        // navigation.navigate(ROUTES.ONBOARDING_FLOW);
      } catch (e) {
        showSnackbar((e as Error).message, "error");
      }
    };

    run();
  }, [authorizationCode, codeVerifier, showSnackbar]);

  const onPressGoogle = useCallback(async () => {
    try {
      if (!isGoogleReady) {
        showSnackbar(t("auth.googleNotReady") || "Google login is not ready yet.", "error");
        return;
      }
      await signInWithGoogle();
    } catch (e) {
      showSnackbar((e as Error).message, "error");
    }
  }, [isGoogleReady, signInWithGoogle, showSnackbar, t]);

  const googleDisabled = isLoading || !isGoogleReady;

  return (
    <GradientBackground>
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.content}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={[styles.logo, { color: colors.textPrimary }]}>Whear</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  {t("auth.signInToContinue")}
                </Text>
              </View>

              {/* Form Card */}
              <AppCard variant="glass" style={styles.formCard}>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <AppInput
                      label={t("auth.email")}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.email?.message}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                />

                <Controller
                  control={control}
                  name="password"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <AppInput
                      label={t("auth.password")}
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      error={errors.password?.message}
                      secureTextEntry
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                />

                <View style={styles.forgotContainer}>
                  <AppButton
                    label={t("auth.forgotPassword")}
                    variant="ghost"
                    onPress={() => navigation.navigate(ROUTES.FORGOT_PASSWORD)}
                    style={styles.forgotButton}
                  />
                </View>

                <AppButton
                  label={t("auth.signIn")}
                  onPress={handleSubmit(onSubmit)}
                  loading={isLoading}
                  style={styles.loginButton}
                />

                {/* Google Sign In */}
                <AppButton
                  label={t("auth.signInWithGoogle")}
                  variant="glass"
                  onPress={onPressGoogle}
                  disabled={googleDisabled}
                  // style={[
                  //   styles.googleButton,
                  //   googleDisabled ? styles.googleButtonDisabled : null,
                  // ]}
                />

                {/* Small helper text (optional) */}
                {!isGoogleReady ? (
                  <Text style={[styles.helperText, { color: colors.textSecondary }]}>
                    {t("auth.googleLoading") || "Google sign-in is initializing..."}
                  </Text>
                ) : null}
              </AppCard>

              {/* Sign Up */}
              <View style={styles.signupContainer}>
                <Text style={[styles.signupText, { color: colors.textSecondary }]}>
                  {t("auth.dontHaveAccount")}{" "}
                </Text>
                <AppButton
                  label={t("auth.signUp")}
                  variant="ghost"
                  onPress={() => navigation.navigate(ROUTES.REGISTER)}
                  style={styles.signupLink}
                />
              </View>
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
    justifyContent: "center",
    paddingHorizontal: spacingConstants.lg,
  },
  content: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: spacingConstants.xl * 2,
  },
  logo: {
    fontSize: 48,
    fontWeight: "700",
    letterSpacing: -1,
    marginBottom: spacingConstants.sm,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
  },
  formCard: {
    padding: spacingConstants.lg,
    marginBottom: spacingConstants.xl,
  },
  forgotContainer: {
    alignItems: "flex-end",
    marginTop: -spacingConstants.sm,
    marginBottom: spacingConstants.md,
  },
  forgotButton: {
    alignSelf: "flex-end",
  },
  loginButton: {
    marginTop: spacingConstants.md,
  },
  googleButton: {
    marginTop: spacingConstants.md,
  },
  googleButtonDisabled: {
    opacity: 0.6,
  },
  helperText: {
    marginTop: spacingConstants.sm,
    fontSize: 12,
    textAlign: "center",
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacingConstants.xl,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    marginLeft: -spacingConstants.md,
  },
});

LoginScreen.displayName = "LoginScreen";
