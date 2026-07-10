import { StyleSheet, Text, View, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Colors } from "../src/constants/Colors";
import { checkAuth } from "../src/services/auth";

export default function SplashScreen() {
  const router = useRouter();
  
  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const spinnerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start animations
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

    // Spinner animation (looping)
    Animated.loop(
      Animated.timing(spinnerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    // Check auth and navigate after delay
    const timer = setTimeout(async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        router.replace("/(tabs)");
      } else {
        router.replace("/login");
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  const spinnerRotate = spinnerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Animated.View style={[styles.logoCircle, {
          transform: [{ scale: logoScale }],
          opacity: logoOpacity,
        }]}>
          {/* Placeholder for logo icon (we can use a simple SVG or text for now) */}
          <Text style={styles.logoIcon}>👤</Text>
        </Animated.View>
        
        {/* App Name */}
        <Animated.Text style={[styles.appName, { opacity: logoOpacity }]}>
          PRESENCE
        </Animated.Text>
        <Animated.Text style={[styles.appNameSub, { opacity: logoOpacity }]}>
          CORYAS
        </Animated.Text>
      </View>

      {/* Spinner */}
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
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.white,
    borderTopColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 30,
  },
  logoIcon: {
    fontSize: 48,
    color: Colors.white,
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
