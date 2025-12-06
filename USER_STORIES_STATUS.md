# Webmecameal - État des User Stories
# Mise à jour : 2025-01-05

## ✅ TERMINÉES (Sprint 1 - Core Features)

### Authentification & Compte
- [x] US-003: Page compte client (/compte)
- [x] US-006: Rôle admin dans Supabase
- [x] US-029: Mot de passe oublié

### Abonnements & Paiements Stripe
- [x] US-001: Abonnements Stripe (Hebdo 2j/3j/5j, Mensuel)
- [x] US-005: Configuration plans Stripe
- [x] US-007: Gestion abonnement (pause/arrêt)
- [x] US-025: Débits automatiques

### Menus & Commandes
- [x] US-002: Sélection menus quotidiens (2 plats/jour)
- [x] US-019: Détail commande amélioré
- [x] US-020: Fiche recette avec recipe_details
- [x] US-031: Liste allergènes (EU 1169/2011)

### Admin Interface
- [x] US-004: Vérification code postal (74xxx)
- [x] US-022: Gestion menus quotidiens admin

### Pages & UX
- [x] US-008: Responsive mobile
- [x] US-021: Pages légales (Mentions, CGV, RGPD)
- [x] US-032: Uniformisation flat design
- [x] US-033: Bandeau code promo -10% première commande

---

## 🟡 EN COURS (Sprint 2)

### Admin Features
- [ ] US-034: Page /admin/commandes (tableau)
- [ ] US-035: Changement statut commande
- [ ] US-036: Filtres commandes (ID, Date)
- [ ] US-037: Onglet "Historique" commandes livrées

### Emails & Notifications
- [ ] US-024: Emails confirmation (inscription, commande)
- [ ] US-030: Email hebdomadaire menu
- [ ] US-038: Email rappel mardi (Cron + Resend)
- [ ] US-039: Lien magique dans email rappel

---

## 🔴 À FAIRE (Sprint 3+)

### Personnalisation & Options
- [ ] US-009: Personnalisation première commande oneshot
- [ ] US-040: Options menu (boisson, dessert)
- [ ] US-041: Système portions dégressives (base 15€)

### Intégrations
- [ ] US-042: Intégration CRM HubSpot
- [ ] US-043: Système parrainage

### Business & B2B
- [ ] US-044: Offre B2B entreprises
- [ ] US-045: Application mobile dédiée

### Qualité & Tests
- [ ] US-046: Tests automatisés (CTA & parcours)
- [ ] US-047: Refactorisation code
- [ ] US-048: Rapport d'erreurs automatique

---

## 📈 Statistiques

- **Total US:** 48
- **Terminées:** 16 (33%)
- **En cours:** 9 (19%)
- **À faire:** 23 (48%)

---

## 🎯 Prochaines priorités immédiates

1. **US-034**: Page admin commandes
2. **US-035**: Changement statut commande
3. **US-024**: Emails confirmation
4. **US-030**: Email hebdomadaire menu

---

## 📋 Notes

### Migrations SQL à exécuter
```sql
-- US-020: Recipe details
ALTER TABLE menus ADD COLUMN IF NOT EXISTS recipe_details TEXT;

-- US-031: Allergens
ALTER TABLE menus ADD COLUMN IF NOT EXISTS allergens JSONB DEFAULT '[]'::jsonb;
CREATE INDEX IF NOT EXISTS idx_menus_allergens ON menus USING GIN (allergens);
```

### Dépendances externes
- Email service (Resend/SendGrid) pour US-024, US-030, US-038
- CRM HubSpot pour US-042
- Mobile framework (React Native/Flutter) pour US-045
