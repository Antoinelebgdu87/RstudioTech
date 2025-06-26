# Guide de Déploiement - RStudio Tech IA

## Problème Résolu: "Failed to fetch"

L'erreur "TypeError: Failed to fetch" sur Fly.dev était causée par:

1. ❌ Mauvais script de démarrage (`start` pointait vers un fichier inexistant)
2. ❌ `cors` était en devDependencies au lieu de dependencies
3. ❌ Port fixe au lieu d'utiliser `process.env.PORT`
4. ❌ Pas de build automatique au déploiement

## Corrections Apportées

### 1. Script de démarrage corrigé

```json
{
  "scripts": {
    "start": "node server-integrated.cjs",
    "postinstall": "npm run build:client"
  }
}
```

### 2. Dependencies de production

- ✅ `cors` déplacé vers `dependencies`
- ✅ `express` dans les dependencies

### 3. Configuration environnement

- ✅ Port dynamique: `process.env.PORT || 3000`
- ✅ Variables d'environnement pour la clé API
- ✅ Détection automatique du dossier dist/spa

### 4. Build automatique

- ✅ Script `postinstall` qui build automatiquement
- ✅ Vérification de l'existence des fichiers

## Déploiement sur Fly.dev

### Variables d'environnement à configurer:

```bash
fly secrets set OPENROUTER_API_KEY=sk-or-v1-votre-cle-ici
fly secrets set NODE_ENV=production
```

### Commandes de déploiement:

```bash
# Build local (optionnel, se fait automatiquement)
npm run build:client

# Déploiement
fly deploy
```

## Vérification

Après déploiement, l'application devrait:

1. ✅ Servir l'interface React sur la racine
2. ✅ Répondre aux appels API `/api/*`
3. ✅ Afficher les logs de démarrage
4. ✅ Permettre l'envoi de messages sans erreur "Failed to fetch"

## Architecture Finale

```
Application Fly.dev
├── server-integrated.cjs (serveur Express)
├── dist/spa/ (React build)
│   ├── index.html
│   └── assets/
└── API Routes:
    ├── GET /api/ping
    ├── GET /api/models
    ├── GET /api/conversations
    ├── POST /api/conversations/new
    └── POST /api/chat
```

Le serveur intégré gère à la fois:

- Le serving des fichiers statiques React
- Les appels API backend
- La gestion des erreurs et logs
