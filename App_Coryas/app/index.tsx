// ============================================================
// ÉCRAN SPLASH - Page d'accueil au lancement de l'app
// ============================================================
// Cet écran s'affiche pendant 2,5 secondes au démarrage.
// Il joue une animation (logo qui apparaît + spinner qui tourne)
// puis vérifie si l'utilisateur est déjà connecté pour le
// rediriger vers la bonne page.
//
// ⚙️ Fonctionnement :
// 1. Au montage du composant, on lance des animations
// 2. On attend 2,5 secondes
// 3. On appelle checkAuth() pour voir si un token JWT valide existe
// 4. Si oui → redirection vers l'accueil (tabs)
// 5. Si non → redirection vers la page de connexion
// ============================================================

import { StyleSheet, Text, View, Animated } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Colors } from "../src/constants/Colors";
import { checkAuth } from "../src/services/auth";

export default function SplashScreen() {
  // 📍 Router Expo - permet de naviguer entre les écrans
  const router = useRouter();
  
  // ============================================================
  // VALEURS ANIMÉES (Animated API de React Native)
  // ============================================================
  // useRef crée une valeur persistante qui ne change pas entre
  // les rendus. Animated.Value stocke un nombre que l'on peut
  // faire varier dans le temps pour créer des animations.
  // ============================================================
  const logoScale = useRef(new Animated.Value(0)).current;   // Taille du logo (0 = invisible → 1 = taille normale)
  const logoOpacity = useRef(new Animated.Value(0)).current; // Opacité du logo (0 = transparent → 1 = visible)
  const spinnerAnim = useRef(new Animated.Value(0)).current; // Rotation du spinner (0 → 1 = un tour complet)

  // ============================================================
  // useEffect : s'exécute UNE SEULE FOIS au montage du composant
  // ============================================================
  // Le tableau de dépendances [router] fait que cet effet
  // ne se relance pas quand l'état change (sauf si router change).
  // ============================================================
  useEffect(() => {
    // ============================================================
    // 1. ANIMATION D'APPARITION DU LOGO
    // ============================================================
    // Animated.sequence : joue les animations les unes après les autres
    //  1. delay(200) : attend 200ms
    //  2. parallel : lance les deux animations en même temps :
    //     - spring(logoScale) : effet "ressort" pour la taille
    //     - timing(logoOpacity) : transition douce pour l'opacité
    // ============================================================
    Animated.sequence([
      Animated.delay(200),
      Animated.parallel([
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 5,       // Faible friction = plus d'oscillations
          tension: 40,       // Tension modérée
          useNativeDriver: true, // Utilise le thread natif (plus performant)
        }),
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,     // 500ms pour devenir complètement visible
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // ============================================================
    // 2. ANIMATION DU SPINNER (en boucle infinie)
    // ============================================================
    // Animated.loop : répète l'animation indéfiniment
    // Ici on fait tourner spinnerAnim de 0 à 1 en 1 seconde
    // ============================================================
    Animated.loop(
      Animated.timing(spinnerAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      })
    ).start();

    // ============================================================
    // 3. VÉRIFICATION DE L'AUTHENTIFICATION APRÈS 2,5s
    // ============================================================
    // setTimeout : exécute le code après un délai
    // checkAuth() retourne true si un token JWT valide existe
    //   - router.replace() remplace l'écran actuel (pas de retour possible)
    // ============================================================
    const timer = setTimeout(async () => {
      const isAuthenticated = await checkAuth();
      if (isAuthenticated) {
        router.replace("/(tabs)");     // Utilisateur connecté → page d'accueil
      } else {
        router.replace("/login");      // Pas connecté → page de connexion
      }
    }, 2500);

    // ============================================================
    // NETTOYAGE : quand le composant est démonté
    // ============================================================
    // On annule le setTimeout pour éviter les fuites mémoire
    // si l'utilisateur quitte l'écran avant la fin des 2,5s
    // ============================================================
    return () => clearTimeout(timer);
  }, [router]);

  // ============================================================
  // INTERPOLATION : convertir une valeur en une autre
  // ============================================================
  // spinnerAnim va de 0 à 1 → on le transforme en rotation de 0° à 360°
  // Cela permet de faire tourner le spinner en cercle
  // ============================================================
  const spinnerRotate = spinnerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View style={styles.container}>
      {/* ============================================================ */}
      {/* LOGO                                                         */}
      {/* ============================================================ */}
      <View style={styles.logoContainer}>
        <Animated.Image
          source={require("../assets/logo.png")}
          style={[styles.logoImage, {
            transform: [{ scale: logoScale }],
            opacity: logoOpacity,
          }]}
        />
        
        <Animated.Text style={[styles.appName, { opacity: logoOpacity }]}>
          PRESENCE
        </Animated.Text>
        <Animated.Text style={[styles.appNameSub, { opacity: logoOpacity }]}>
          CORYAS
        </Animated.Text>
      </View>

      {/* ============================================================ */}
      {/* SPINNER DE CHARGEMENT                                        */}
      {/* ============================================================ */}
      {/* Un cercle avec une bordure sur un seul côté qui tourne       */}
      {/* pour donner l'impression d'un chargement en cours            */}
      {/* ============================================================ */}
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
