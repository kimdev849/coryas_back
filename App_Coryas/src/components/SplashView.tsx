// ============================================================
// SPLASH VIEW — Animation d'accueil PRÉSENCIA
// ============================================================

import { StyleSheet, Text, View, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { Colors } from "../constants/Colors";

export function SplashView() {
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const spinnerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();

    const spinLoop = Animated.loop(
      Animated.timing(spinnerAnim, { toValue: 1, duration: 1000, useNativeDriver: true })
    );
    spinLoop.start();
    return () => { spinLoop.stop(); };
  }, []);

  const spinnerRotate = spinnerAnim.interpolate({
    inputRange: [0, 1], outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Animated.View
          style={[
            styles.logoCircle,
            { transform: [{ scale: logoScale }], opacity: logoOpacity },
          ]}
        >
          <Text style={styles.logoLetter}>P</Text>
        </Animated.View>
        <Animated.Text style={[styles.appName, { opacity: logoOpacity }]}>
          PRÉSENCIA
        </Animated.Text>
        <Animated.Text style={[styles.appTagline, { opacity: logoOpacity }]}>
          Gestion des présences
        </Animated.Text>
      </View>
      <View style={styles.spinnerContainer}>
        <Animated.View style={[styles.spinner, { transform: [{ rotate: spinnerRotate }] }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: Colors.bgDark,
    alignItems: "center", justifyContent: "center",
  },
  logoContainer: { alignItems: "center", marginBottom: 100 },
  logoCircle: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: Colors.primary,
    alignItems: "center", justifyContent: "center",
    marginBottom: 24,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  logoLetter: { fontSize: 44, fontWeight: "800", color: Colors.white },
  appName: { color: Colors.white, fontSize: 28, fontWeight: "800", letterSpacing: 3 },
  appTagline: { color: Colors.textSecondary, fontSize: 14, marginTop: 6 },
  spinnerContainer: { position: "absolute", bottom: 150 },
  spinner: {
    width: 40, height: 40, borderRadius: 20,
    borderWidth: 3, borderColor: "transparent",
    borderTopColor: Colors.primary,
  },
});
