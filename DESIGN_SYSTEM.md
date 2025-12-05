# Webmecameal - Design System (Flat Design)
# Version 1.0 - Janvier 2025

## 🎨 Principes du Flat Design

1. **Simplicité visuelle** - Pas de gradients complexes, effets 3D ou textures
2. **Clarté** - Interface épurée avec hiérarchie claire
3. **Couleurs vives** - Palette colorée et contrastée
4. **Typographie nette** - Fontes sans-serif, tailles cohérentes
5. **Espacement généreux** - Air entre les éléments

---

## 🎨 Palette de couleurs

### Couleurs principales
```
Brand Green:  #319795 (teal.500)
Brand Dark:   #2D3748 (gray.800)
Brand Orange: #DD6B20 (orange.600)
```

### Couleurs d'état
```
Success: #38A169 (green.500)
Warning: #DD6B20 (orange.500)
Error:   #E53E3E (red.500)
Info:    #3182CE (blue.500)
```

### Couleurs de fond
```
Background: #FFFFFF (white)
Surface:    #F7FAFC (gray.50)
Border:     #E2E8F0 (gray.200)
```

---

## 📐 Espacements

### Padding/Margin standards
```
xs:  4px   (1)
sm:  8px   (2)
md:  16px  (4)
lg:  24px  (6)
xl:  32px  (8)
2xl: 48px  (12)
```

### Border Radius
```
Small:  4px  (sm)
Medium: 8px  (md)
Large:  12px (lg)
XLarge: 16px (xl)
```

---

## 🔘 Composants

### Boutons

**Primary (Teal)**
- Background: teal.500
- Color: white
- Border-radius: 8px
- Padding: 12px 24px
- Shadow: none ou subtile (sm)
- Hover: teal.600 + translateY(-2px)

**Secondary (Outline)**
- Border: 2px solid gray.300
- Color: gray.700
- Background: transparent
- Border-radius: 8px
- Hover: bg gray.50

**Danger (Red)**
- Background: red.500
- Color: white
- Border-radius: 8px

### Cards

- Background: white
- Border: 1px solid gray.200
- Border-radius: 12px
- Padding: 24px
- Shadow: none ou subtile (sm)
- Hover: shadow md + border teal.200

### Inputs

- Border: 2px solid gray.200
- Border-radius: 8px
- Padding: 12px 16px
- Focus: border teal.500 + shadow teal.100
- Background: white

### Badges

- Border-radius: 6px
- Padding: 4px 12px
- Font-size: sm
- Font-weight: 600

---

## 📝 Typographie

### Headings
```
H1: 2.5rem (40px) - font-bold
H2: 2rem (32px) - font-bold
H3: 1.5rem (24px) - font-semibold
H4: 1.25rem (20px) - font-semibold
```

### Body
```
Large:   1.125rem (18px)
Default: 1rem (16px)
Small:   0.875rem (14px)
XSmall:  0.75rem (12px)
```

---

## 🎯 Règles d'application

### Shadows (utilisation minimale)
- Cards au repos: shadow="sm" ou none
- Cards hover: shadow="md"
- Modals: shadow="xl"
- Buttons: Pas de shadow (ou très subtile)

### Borders
- Toujours 1px ou 2px
- Couleur: gray.200 ou gray.300
- Hover: teal.200 ou teal.300

### Transitions
- Durée: 0.2s
- Easing: ease-in-out
- Propriétés: background, border, transform, shadow

---

## ✅ Checklist d'uniformisation

### Pages à mettre à jour
- [ ] HomePage (DynamicPage)
- [ ] MenuDetailPage
- [ ] SubscriptionPage
- [ ] AccountPage
- [ ] CheckoutPage
- [ ] AuthPage
- [ ] AdminMenusPage
- [ ] AdminDailyMenusPage
- [ ] AdminOrdersPage
- [ ] Layout (Header/Footer)

### Composants à uniformiser
- [ ] Buttons (tous)
- [ ] Cards/Box
- [ ] Inputs/Forms
- [ ] Badges
- [ ] Modals
- [ ] Tables
- [ ] Alerts

---

## 🚀 Implémentation

### 1. Mettre à jour theme.js
- Définir styles par défaut
- Créer variants consistants

### 2. Appliquer aux composants
- Utiliser props Chakra standardisés
- Éviter les styles inline custom

### 3. Tester la cohérence
- Vérifier toutes les pages
- Screenshots avant/après
