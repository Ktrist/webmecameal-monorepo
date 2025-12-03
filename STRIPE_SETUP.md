# Configuration Stripe pour Webmecameal

## 🎯 Objectif
Configurer les produits et prix d'abonnement dans Stripe Dashboard.

## 📍 Étapes à suivre

### 1. Se connecter à Stripe Dashboard
- Aller sur : https://dashboard.stripe.com/test/products
- Mode TEST activé (bascule en haut à droite)

---

### 2. Créer les Produits d'Abonnement

#### Produit 1: Formule Hebdomadaire 2 jours
```
Nom du produit: Formule Hebdo 2 jours
Description: Livraison de repas 2 fois par semaine

Prix récurrent:
- Montant: 25.80 EUR
- Fréquence: Hebdomadaire (Weekly)
- Type: Récurrent (Recurring)

→ Copier le Price ID: price_xxxxxxxxxxxxxxxxx
```

#### Produit 2: Formule Hebdomadaire 3 jours
```
Nom du produit: Formule Hebdo 3 jours
Description: Livraison de repas 3 fois par semaine

Prix récurrent:
- Montant: 35.70 EUR
- Fréquence: Hebdomadaire (Weekly)
- Type: Récurrent (Recurring)

→ Copier le Price ID: price_xxxxxxxxxxxxxxxxx
```

#### Produit 3: Formule Hebdomadaire 5 jours
```
Nom du produit: Formule Hebdo 5 jours
Description: Livraison de repas 5 fois par semaine

Prix récurrent:
- Montant: 54.50 EUR
- Fréquence: Hebdomadaire (Weekly)
- Type: Récurrent (Recurring)

→ Copier le Price ID: price_xxxxxxxxxxxxxxxxx
```

#### Produit 4: Formule Mensuelle Flexible
```
Nom du produit: Formule Mensuelle
Description: Abonnement mensuel flexible (minimum 10€)

Prix récurrent:
- Montant: 10.00 EUR (minimum)
- Fréquence: Mensuelle (Monthly)
- Type: Récurrent (Recurring)

→ Copier le Price ID: price_xxxxxxxxxxxxxxxxx
```

---

### 3. Ajouter les Price IDs dans le code

Après avoir créé les produits, copier les Price IDs et les ajouter dans :

**Fichier: `frontend/.env`**
```env
# Stripe Price IDs (Test Mode)
VITE_STRIPE_PRICE_HEBDO_2J=price_xxxxxxxxxxxxxxxxx
VITE_STRIPE_PRICE_HEBDO_3J=price_xxxxxxxxxxxxxxxxx
VITE_STRIPE_PRICE_HEBDO_5J=price_xxxxxxxxxxxxxxxxx
VITE_STRIPE_PRICE_MENSUEL=price_xxxxxxxxxxxxxxxxx
```

**Fichier: `frontend/src/config.js`**
```javascript
// Stripe Price IDs
export const STRIPE_PRICES = {
  HEBDO_2J: import.meta.env.VITE_STRIPE_PRICE_HEBDO_2J,
  HEBDO_3J: import.meta.env.VITE_STRIPE_PRICE_HEBDO_3J,
  HEBDO_5J: import.meta.env.VITE_STRIPE_PRICE_HEBDO_5J,
  MENSUEL: import.meta.env.VITE_STRIPE_PRICE_MENSUEL,
}
```

---

### 4. Configurer le Webhook (si pas déjà fait)

1. Aller sur : https://dashboard.stripe.com/test/webhooks
2. Ajouter endpoint : `https://VOTRE_PROJECT.supabase.co/functions/v1/stripe-webhook`
3. Sélectionner les événements :
   - ✅ `checkout.session.completed`
   - ✅ `invoice.payment_succeeded`
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_failed`

4. Copier le Signing Secret (whsec_...)
5. Ajouter dans Supabase secrets:
```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

---

## ✅ Checklist

- [ ] 4 produits créés dans Stripe
- [ ] Price IDs copiés
- [ ] Price IDs ajoutés dans `.env`
- [ ] Price IDs ajoutés dans `config.js`
- [ ] Webhook configuré avec tous les événements
- [ ] Webhook secret ajouté dans Supabase

---

## 🧪 Test

Pour tester les abonnements, utiliser les cartes de test Stripe :
- **Succès** : 4242 4242 4242 4242
- **Échec** : 4000 0000 0000 0002
- Date : N'importe quelle date future
- CVC : N'importe quel 3 chiffres

---

## 📚 Ressources

- [Stripe Products & Prices](https://stripe.com/docs/products-prices/overview)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
