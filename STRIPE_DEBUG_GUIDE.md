# 🔍 Guide de Diagnostic Stripe

## Problème Actuel
Erreur 400 lors de la création d'une session de checkout Stripe pour les abonnements.

## Cause Probable
**Le STRIPE_SECRET_KEY configuré dans Supabase ne correspond pas au compte Stripe où les Price IDs ont été créés.**

---

## ✅ Vérifications à Effectuer

### 1. Vérifier le Mode (Test vs Live)

**Dans votre `.env` frontend :**
```bash
VITE_STRIPE_PUBLIC_KEY=pk_test_51SZuzjIHvDc7GYq5...
```
- ✅ Commence par `pk_test_` = **Mode Test**

**Dans Supabase Secrets, votre `STRIPE_SECRET_KEY` doit :**
- ✅ Commencer par `sk_test_` (pas `sk_live_`)
- ✅ Avoir le **même préfixe de compte** : `sk_test_51SZuzjIHvDc7GYq5...`

### 2. Vérifier que les Price IDs Existent

Vos Price IDs configurés :
```bash
HEBDO_2J: price_1SaC5xIHvDc7GYq5ItUTUVHU
HEBDO_3J: price_1SaC9XIHvDc7GYq5XbLGuZX0
HEBDO_5J: price_1SaCCbIHvDc7GYq5fcSaXlW6
MENSUEL:  price_1SaCDxIHvDc7GYq5aqK8F3yE
```

**Dans Stripe Dashboard :**
1. Allez sur : https://dashboard.stripe.com/test/products
2. Cliquez sur chaque produit d'abonnement
3. Vérifiez que les **Price IDs** correspondent EXACTEMENT

### 3. Vérifier le Secret Key dans Supabase

**Pour vérifier quel secret key est configuré :**

1. Allez sur : https://supabase.com/dashboard/project/kxahqxygbxlhasgivkgi/settings/vault
2. Cherchez le secret `STRIPE_SECRET_KEY`
3. Vérifiez qu'il commence par `sk_test_` (pas `sk_live_`)

**Pour récupérer la bonne clé depuis Stripe :**

1. Allez sur : https://dashboard.stripe.com/test/apikeys
2. Copiez la **Secret Key** (commence par `sk_test_...`)
3. Mettez à jour le secret dans Supabase si nécessaire

---

## 🚀 Étapes Suivantes

### Étape 1 : Redéployer l'Edge Function avec Debug

J'ai ajouté des logs de debug détaillés. Vous devez redéployer :

**Option A : Via Dashboard Supabase**
1. Allez sur : https://supabase.com/dashboard/project/kxahqxygbxlhasgivkgi/functions
2. Sélectionnez `create-stripe-checkout`
3. Remplacez le code par celui de `frontend/supabase/functions/create-stripe-checkout/index.ts`
4. Déployez

### Étape 2 : Tester et Consulter les Logs

1. Allez sur : http://127.0.0.1:3000/abonnements
2. Cliquez sur "Je m'abonne"
3. Consultez les logs Supabase : https://supabase.com/dashboard/project/kxahqxygbxlhasgivkgi/logs/edge-functions

**Vous devriez voir :**
```
🔑 Stripe key format: sk_test...
🔑 Key is test mode: true
📦 Request mode: subscription
💳 Price ID: price_1SaCCbIHvDc7GYq5fcSaXlW6
📋 Plan type: hebdo_5j
👤 User ID: present
```

**Si erreur, vous verrez :**
```
❌ Erreur Stripe: [message d'erreur détaillé]
❌ Error type: [type]
❌ Error code: [code]
```

---

## 🔧 Erreurs Courantes et Solutions

### Erreur : "No such price: 'price_xxx'"
**Cause :** Le Price ID n'existe pas dans le compte Stripe lié au secret key.

**Solution :**
- Vérifiez que le STRIPE_SECRET_KEY dans Supabase correspond au compte où vous avez créé les Price IDs
- OU créez les Price IDs dans le compte Stripe correspondant au secret key actuel

### Erreur : "Invalid API Key"
**Cause :** Le secret key est invalide ou mal formaté.

**Solution :**
- Vérifiez que le secret key dans Supabase commence par `sk_test_` ou `sk_live_`
- Copiez-collez une nouvelle clé depuis Stripe Dashboard

### Erreur : "testmode mismatch"
**Cause :** Vous essayez d'utiliser un Price ID de test avec une clé live (ou vice versa).

**Solution :**
- Assurez-vous que tout est en mode test (`pk_test_`, `sk_test_`, `price_1...` créés en test)

---

## 📞 Informations Utiles

**Supabase Project Ref :** `kxahqxygbxlhasgivkgi`

**URLs Importantes :**
- Stripe Dashboard (Test) : https://dashboard.stripe.com/test/dashboard
- Stripe Products : https://dashboard.stripe.com/test/products
- Stripe API Keys : https://dashboard.stripe.com/test/apikeys
- Supabase Functions : https://supabase.com/dashboard/project/kxahqxygbxlhasgivkgi/functions
- Supabase Vault : https://supabase.com/dashboard/project/kxahqxygbxlhasgivkgi/settings/vault
- Supabase Logs : https://supabase.com/dashboard/project/kxahqxygbxlhasgivkgi/logs/edge-functions
