# 🎮 Mosaic Analytics — Checklist Prod

> Fichier de suivi vivant. Mis à jour après chaque fonctionnalité.
> Dernière mise à jour : 2026-02-25

---

## 📋 Fonctionnalités implémentées

### 🔐 Authentification & Onboarding
- [x] Landing page (hero, features, pricing, auth, footer)
- [x] Login / Signup avec Supabase Auth (email + mot de passe)
- [x] Onboarding 4 étapes (avatar, nom + devise, tour features, confirmation)
- [x] Toggle langue FR / EN sur la landing page
- [x] AuthForm extrait et réutilisable (LandingPage + Onboarding)

### 📊 Dashboard principal
- [x] Stats overview (jeux achetés, dépense totale, prix moyen, micro-transactions)
- [x] Filtre par année (pill compact avec icône calendrier)
- [x] Graphiques analytics (répartition par plateforme, genre, boutique)
- [x] Liste des transactions (tableau triable avec edit/delete)
- [x] Budget widget avec barre de progression mensuelle (Premium)

### 💰 Gestion des transactions
- [x] Ajout / édition via modale (jeu, DLC, micro-transaction, abonnement)
- [x] Champs : nom, prix, devise, plateforme, genre, boutique, date, statut, jeu parent
- [x] Multi-devises (EUR, USD, GBP, JPY) avec taux de change temps réel
- [x] Statuts : Backlog, Playing, Completed, Dropped, Wishlist

### 💜 Vue Wishlist
- [x] Onglet All / Wishlist dans le header
- [x] Grille de cartes visuelles (jaquette, titre, tags, prix)
- [x] Action rapide (déplacer vers Backlog, éditer, supprimer)
- [x] État vide avec CTA

### 🔍 Recherche & Notifications
- [x] Search overlay (Cmd+K / Ctrl+K, recherche instantanée)
- [x] Notification dropdown (alertes budget 80%+, résumé mensuel)

### ⚙️ Paramètres
- [x] Profil (avatar emoji, nom d'affichage, devise par défaut)
- [x] Thème Dark / Light mode
- [x] Langue FR / EN (react-i18next)
- [x] Gestion abonnement (voir plan, annuler)

### 💎 Premium (Stripe)
- [x] Checkout Stripe intégré
- [x] Transactions illimitées (vs 50 en free)
- [x] Multi-devises, graphiques avancés, budget, export CSV, jaquettes RAWG

### 🛡️ Robustesse & UX
- [x] ErrorBoundary (catch erreurs JS, page de fallback avec reload)
- [x] Bannière offline (détection perte réseau, alerte fixée en bas)
- [x] Meta tags SEO + Open Graph + Twitter Card
- [x] Favicon SVG custom (manette verte Mosaic)
- [x] Responsive mobile vérifié (landing + dashboard + view-tabs)

---

## 🚀 Checklist avant mise en prod

### Infrastructure & Config
- [x] Exécuter migration SQL `onboarding_completed` sur Supabase
- [ ] Variables d'env prod (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_STRIPE_*)
- [ ] Domaine custom + HTTPS (Vercel / Netlify)
- [ ] Stripe webhook en mode live (remplacer clé test)

### Sécurité
- [ ] Vérifier RLS (Row Level Security) sur toutes les tables Supabase
- [ ] Rate limiting / protection abuse (Supabase Edge Functions)
- [ ] Audit des variables d'env (aucun secret côté client)

### SEO & Marketing
- [x] Meta tags + OG dans `index.html`
- [x] Favicon SVG + Apple touch icon
- [ ] OG image (capture écran ou illustration)
- [ ] PWA manifest (optionnel)
- [ ] Sitemap.xml (optionnel)

### UX & Contenu
- [ ] Personnaliser les email templates Supabase (confirmation, reset password)
- [ ] Page RGPD / mentions légales (si utilisateurs EU)
- [x] ErrorBoundary + bannière offline
- [x] Responsive mobile / tablette

### Qualité
- [ ] Tests E2E (Playwright / Cypress)
- [ ] Tests unitaires hooks critiques (useAuth, useProfile, usePlan)
- [ ] Lighthouse audit (performance, accessibilité, SEO)
- [x] Test responsive mobile / tablette

### Monitoring
- [ ] Error tracking (Sentry ou équivalent)
- [ ] Analytics (Plausible, PostHog, ou GA4)
- [ ] Monitoring uptime Supabase

---

## 📝 Historique des modifications

| Date | Modification |
|---|---|
| 2026-02-25 | Création du fichier — Récap complet post Landing Page + Onboarding |
| 2026-02-25 | Meta tags + favicon SVG + OG + Twitter Card dans index.html |
| 2026-02-25 | Responsive mobile : view-tabs full-width sur mobile, landing vérifié |
| 2026-02-25 | ErrorBoundary + OfflineBanner + CSS erreur/offline |
| 2026-02-25 | Migration SQL onboarding_completed exécutée par l'utilisateur |
