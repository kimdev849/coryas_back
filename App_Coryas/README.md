# 🍊 App Coryas

Application mobile créée avec **React Native** et **Expo**.

## 📱 À quoi sert l'application ?

App Coryas est une application mobile qui propose :
- Une **page d'accueil** avec le logo
- Un **écran de connexion** (email + mot de passe)
- Un **tableau de bord** avec des cartes d'information
- Une page **Explorer** pour découvrir les fonctionnalités

## 🏗️ Structure du projet

```
App_Coryas/
│
├── app/                          ← 📂 Toutes les pages de l'appli
│   ├── _layout.tsx                ← Layout racine (navigation principale)
│   ├── index.tsx                  ← Page d'accueil (landing)
│   ├── login.tsx                  ← Page de connexion
│   │
│   └── (tabs)/                   ← 📂 Groupe d'onglets (navigation en bas)
│       ├── _layout.tsx            ← Configuration des onglets
│       ├── index.tsx              ← Onglet Accueil / Tableau de bord
│       └── explore.tsx            ← Onglet Explorer
│
├── assets/                       ← Images et icônes
├── app.json                      ← Configuration Expo
├── package.json                  ← Dépendances du projet
└── tsconfig.json                 ← Configuration TypeScript
```

## 🧭 Comment navigue-t-on dans l'appli ?

```
Accueil (/) → Connexion (/login) → Onglets (/(tabs))
                                        ├── Accueil (Dashboard)
                                        └── Explorer
```

**Explication du flux :**
1. L'utilisateur ouvre l'app → voit le **logo + bouton Connexion**
2. Il clique sur **Connexion** → va sur la page de connexion
3. Il entre son **email + mot de passe** → clique sur "Se connecter"
4. Il arrive sur les **onglets** avec le Tableau de bord et Explorer
5. Il peut **se déconnecter** pour revenir à l'accueil

## 🚀 Comment lancer l'application ?

```bash
# 1. Installer les dépendances (déjà fait)
npm install

# 2. Lancer l'application
npx expo start

# 3. Scanner le QR code avec l'app "Expo Go" sur ton téléphone
#    Ou appuyer sur 'w' pour ouvrir dans le navigateur web
```

## 📦 Technologies utilisées

- **Expo SDK 54** — Plateforme pour créer des apps React Native facilement
- **Expo Router v6** — Navigation entre les pages (comme un GPS pour l'app)
- **React Native** — Framework pour créer des apps mobiles
- **TypeScript** — JavaScript avec des types (évite les erreurs)
- **@expo/vector-icons** — Bibliothèque d'icônes (Ionicons)

## 🛠️ Pour aller plus loin (prochaines étapes possibles)

- 🔐 Ajouter Firebase pour une vraie authentification
- 📊 Remplir les cartes du tableau de bord avec de vraies données
- 🗄️ Ajouter une base de données (Supabase, Firebase, etc.)

---

✨ Documentation rédigée pour les débutants — Chaque fichier du dossier `app/`
contient des commentaires détaillés en français pour t'aider à comprendre.
