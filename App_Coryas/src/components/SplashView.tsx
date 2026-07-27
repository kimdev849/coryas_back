// ============================================================
// SPLASH VIEW - Animation d'accueil réutilisable
// ============================================================
// Utilisé par :
//   - app/index.tsx (route splash standard)
//   - app/_layout.tsx (rendu conditionnel pendant chargement auth)
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
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    const spinLoop = Animated.loop(
      Animated.timing(spinnerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    );
    spinLoop.start();

    return () => {
      spinLoop.stop();
    };
  }, []);

  const spinnerRotate = spinnerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Animated.Image
          source={require("../../assets/logo.png")}
          style={[
            styles.logoImage,
            {
              transform: [{ scale: logoScale }],
              opacity: logoOpacity,
            },
          ]}
        />
        <Animated.Text style={[styles.appName, { opacity: logoOpacity }]}>
          PRESENCE
        </Animated.Text>
        <Animated.Text style={[styles.appNameSub, { opacity: logoOpacity }]}>
          CORYAS
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
    flex: 1,
    backgroundColor: Colors.black,
    alignItems: "center",
    justifyContent: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 100,
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 30,
  },
  appName: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: 4,
  },
  appNameSub: {
    color: Colors.primary,
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 3,
  },
  spinnerContainer: {
    position: "absolute",
    bottom: 150,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: "transparent",
    borderTopColor: Colors.primary,
  },
});
