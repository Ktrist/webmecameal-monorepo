import { extendTheme } from '@chakra-ui/react'

// 1. Définir nos polices (pas de changement)
const fonts = {
  heading: `'Inter', sans-serif`,
  body: `'Inter', sans-serif`,
}

// 2. Définir nos COULEURS "HIJACK"
const colors = {
  // On ne crée pas "brand". On REMPLACE les couleurs par défaut.
  
  // Le 'vert Quitoque'
  // Il va remplacer "blue" (que nos titres utilisent)
  blue: {
    500: '#2C8C6C', // (bleu 500 = notre vert)
    // ... on pourrait ajouter d'autres nuances ici
  },
  
  // L' 'orange Quitoque'
  // Il va remplacer "teal" (que nos boutons utilisent)
  teal: {
    50: '#feedde',  // L'orange très clair
    100: '#fdd9c2',
    200: '#fbbca0',
    300: '#f99e7e',
    400: '#f7805c',
    500: '#EF5000', // (teal 500 = notre orange action)
    600: '#d14300',
    700: '#b03700',
    800: '#8f2c00',
    900: '#732300',
  },
  
  // On peut aussi définir nos couleurs "brand" pour un usage futur
  brand: {
    green: '#2C8C6C',
    orange: '#EF5000',
    lightGreen: '#F0F7F5',
    dark: '#333333',
    grey: '#757575',
  },
}

// 3. Appliquer des styles globaux (pas de changement)
const styles = {
  global: {
    'html, body': {
      color: 'brand.dark',
      lineHeight: 'tall',
    },
    'a': {
      color: 'brand.green',
    }
  },
}

// 4. Exporter le thème complet
export const theme = extendTheme({
  colors,
  fonts,
  styles,
})