import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { authService } from '../services/AuthService';
import { User } from '../models/User';

const BROWN = '#622B14';
const BG = '#f5f0eb';

export default function LoginScreen({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const insets = useSafeAreaInsets();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ username?: string; password?: string; general?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const e: { username?: string; password?: string } = {};
    if (!username.trim()) e.username = "Le nom d'utilisateur est obligatoire.";
    if (!password.trim()) e.password = "Le mot de passe est obligatoire.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setErrors({});
    try {
      const user = new User();
      user.username = username;
      user.password = password;
      authService.item = user;
      const token = await authService.login();
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('username', username);
      onLoginSuccess();
    } catch (error: any) {
      if (error.message.includes('401') || error.message.includes('404') || error.message.includes('403')) {
        setErrors({ general: 'Utilisateur inexistant ou mot de passe incorrect.' });
      } else {
        setErrors({ general: 'Une erreur est survenue. Vérifiez votre réseau.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={[styles.content, { paddingTop: insets.top + 16 }]} keyboardShouldPersistTaps="handled">

        {/* Top bar */}
        <View style={styles.topBar}>
          <Ionicons name="business-outline" size={20} color={BROWN} />
          <Text style={styles.topBarText}>FST Marrakech</Text>
        </View>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>F≡</Text>
            <Text style={styles.logoSub}>FST MARRAKECH</Text>
          </View>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.title}>Connexion</Text>
          <Text style={styles.subtitle}>Veuillez vous authentifier pour accéder à votre espace.</Text>

          {/* Username */}
          <Text style={styles.label}>NOM D'UTILISATEUR</Text>
          <View style={[styles.inputRow, errors.username && styles.inputError]}>
            <Ionicons name="person-outline" size={18} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Entrez votre nom d'utilisateur"
              placeholderTextColor="#bbb"
              value={username}
              onChangeText={t => { setUsername(t); if (errors.username) setErrors({ ...errors, username: undefined }); }}
              autoCapitalize="none"
              editable={!isLoading}
            />
          </View>
          {errors.username && <Text style={styles.errorText}>{errors.username}</Text>}

          {/* Password */}
          <Text style={styles.label}>MOT DE PASSE</Text>
          <View style={[styles.inputRow, errors.password && styles.inputError]}>
            <Ionicons name="lock-closed-outline" size={18} color="#aaa" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Entrez votre mot de passe"
              placeholderTextColor="#bbb"
              value={password}
              onChangeText={t => { setPassword(t); if (errors.password) setErrors({ ...errors, password: undefined }); }}
              secureTextEntry={!showPassword}
              editable={!isLoading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
              <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={18} color="#aaa" />
            </TouchableOpacity>
          </View>
          {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

          {/* Remember / Forgot */}
          <View style={styles.row}>
            <View style={styles.rememberRow}>
              <View style={styles.checkbox} />
              <Text style={styles.rememberText}>Se souvenir de moi</Text>
            </View>
            <TouchableOpacity onPress={() => Alert.alert('Mot de passe oublié', 'Contactez votre administrateur pour réinitialiser votre mot de passe.\n\nEmail : admin@fst-marrakech.ac.ma')}>
              <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
            </TouchableOpacity>
          </View>

          {/* Error */}
          {errors.general && (
            <View style={styles.alertError}>
              <Text style={styles.alertErrorText}>{errors.general}</Text>
            </View>
          )}

          {/* Button */}
          <TouchableOpacity style={[styles.button, isLoading && { opacity: 0.7 }]} onPress={handleLogin} disabled={isLoading}>
            {isLoading
              ? <ActivityIndicator color="#fff" />
              : <><Text style={styles.buttonText}>Se connecter</Text><Text style={{ color: '#fff', marginLeft: 8, fontSize: 16 }}>→</Text></>
            }
          </TouchableOpacity>

          <Text style={styles.helpText}>Besoin d'aide ? <Text style={styles.helpLink} onPress={() => Alert.alert('Support', 'Contactez-nous à : support@fst-marrakech.ac.ma\nTél : +212 5 24 43 46 49')}>Contactez le support</Text></Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 FST Marrakech. Tous droits réservés.</Text>
          <View style={styles.footerLinks}>
            <Text style={styles.footerLink}>Aide</Text>
            <Text style={styles.footerLink}>Mentions légales</Text>
            <Text style={styles.footerLink}>Accessibilité</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  topBar: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 24 },
  topBarText: { fontSize: 16, fontWeight: '700', color: BROWN },
  logoContainer: { alignItems: 'center', marginBottom: 24 },
  logoBox: {
    backgroundColor: '#fff', width: 100, height: 100, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  logoText: { fontSize: 32, fontWeight: '800', color: BROWN },
  logoSub: { fontSize: 9, fontWeight: '700', color: BROWN, letterSpacing: 1 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, elevation: 3, marginBottom: 24,
  },
  title: { fontSize: 24, fontWeight: '800', color: BROWN, textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 13, color: '#888', textAlign: 'center', marginBottom: 24, lineHeight: 20 },
  label: { fontSize: 11, fontWeight: '700', color: '#888', letterSpacing: 1, marginBottom: 6 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#e0d6cc',
    borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#faf8f5', marginBottom: 16,
  },
  inputError: { borderColor: '#e53e3e' },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 14, fontSize: 14, color: '#1a1a1a' },
  eyeBtn: { padding: 4 },
  errorText: { color: '#e53e3e', fontSize: 12, marginTop: -12, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  rememberRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 16, height: 16, borderWidth: 1.5, borderColor: '#ccc', borderRadius: 3 },
  rememberText: { fontSize: 13, color: '#555' },
  forgotText: { fontSize: 13, color: BROWN, fontWeight: '700' },
  alertError: { backgroundColor: '#fdecea', padding: 12, borderRadius: 10, marginBottom: 16, alignItems: 'center' },
  alertErrorText: { color: '#c62828', fontSize: 13 },
  button: {
    backgroundColor: BROWN, borderRadius: 30, paddingVertical: 15,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  helpText: { textAlign: 'center', fontSize: 13, color: '#888' },
  helpLink: { color: BROWN, fontWeight: '700' },
  footer: { alignItems: 'center', gap: 8 },
  footerText: { fontSize: 12, color: BROWN, fontWeight: '600' },
  footerLinks: { flexDirection: 'row', gap: 16 },
  footerLink: { fontSize: 12, color: '#888' },
});
