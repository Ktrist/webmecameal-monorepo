// Configuration centralisée de l'application

// URL du backend Strapi
export const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1337'

// URL de l'application
export const APP_URL = import.meta.env.VITE_APP_URL || 'http://localhost:3000'

// Stripe Price IDs (Abonnements)
export const STRIPE_PRICES = {
  HEBDO_2J: import.meta.env.VITE_STRIPE_PRICE_HEBDO_2J || '',
  HEBDO_3J: import.meta.env.VITE_STRIPE_PRICE_HEBDO_3J || '',
  HEBDO_5J: import.meta.env.VITE_STRIPE_PRICE_HEBDO_5J || '',
  MENSUEL: import.meta.env.VITE_STRIPE_PRICE_MENSUEL || '',
}
