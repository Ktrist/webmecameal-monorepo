import { extendTheme } from '@chakra-ui/react'

// 1. Polices
const fonts = {
  heading: `'Inter', sans-serif`,
  body: `'Inter', sans-serif`,
}

// 2. Couleurs (Flat Design Optimized)
const colors = {
  // Vert principal (utilisé via teal.*)
  teal: {
    50: '#E6F7F6',
    100: '#B3E7E4',
    200: '#80D7D1',
    300: '#4DC7BE',
    400: '#1AB7AB',
    500: '#319795', // Couleur principale brand
    600: '#2C8887',
    700: '#247978',
    800: '#1D6A69',
    900: '#165B5A',
  },

  // Orange (accents)
  orange: {
    50: '#FFF5F0',
    100: '#FFE0D1',
    200: '#FFCBB2',
    300: '#FFB693',
    400: '#FFA174',
    500: '#DD6B20', // Orange brand
    600: '#C5601C',
    700: '#AD5518',
    800: '#954A14',
    900: '#7D3F10',
  },

  // Brand colors
  brand: {
    green: '#319795',
    orange: '#DD6B20',
    lightGreen: '#E6F7F6',
    dark: '#2D3748',
    grey: '#718096',
  },
}

// 3. Radius (Flat Design)
const radii = {
  none: '0',
  sm: '4px',
  base: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px',
}

// 4. Shadows (Minimales pour Flat Design)
const shadows = {
  xs: '0 0 0 1px rgba(0, 0, 0, 0.05)',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  none: 'none',
}

// 5. Styles globaux
const styles = {
  global: {
    'html, body': {
      color: 'gray.800',
      lineHeight: 'tall',
      backgroundColor: 'gray.50',
    },
    'a': {
      color: 'teal.500',
      _hover: {
        textDecoration: 'underline',
      },
    },
  },
}

// 6. Configuration composants (Flat Design)
const components = {
  Button: {
    baseStyle: {
      fontWeight: '600',
      borderRadius: 'md',
      _focus: {
        boxShadow: 'none',
      },
    },
    variants: {
      solid: {
        bg: 'teal.500',
        color: 'white',
        _hover: {
          bg: 'teal.600',
          transform: 'translateY(-2px)',
          _disabled: {
            bg: 'teal.500',
          },
        },
        _active: {
          bg: 'teal.700',
        },
        transition: 'all 0.2s',
      },
      outline: {
        borderWidth: '2px',
        borderColor: 'gray.300',
        color: 'gray.700',
        _hover: {
          bg: 'gray.50',
          borderColor: 'gray.400',
        },
      },
      ghost: {
        _hover: {
          bg: 'gray.100',
        },
      },
    },
    defaultProps: {
      colorScheme: 'teal',
    },
  },

  Card: {
    baseStyle: {
      container: {
        borderRadius: 'lg',
        boxShadow: 'sm',
        bg: 'white',
        borderWidth: '1px',
        borderColor: 'gray.200',
        transition: 'all 0.2s',
        _hover: {
          boxShadow: 'md',
          borderColor: 'teal.200',
        },
      },
    },
  },

  Input: {
    variants: {
      outline: {
        field: {
          borderWidth: '2px',
          borderColor: 'gray.200',
          borderRadius: 'md',
          _hover: {
            borderColor: 'gray.300',
          },
          _focus: {
            borderColor: 'teal.500',
            boxShadow: '0 0 0 1px var(--chakra-colors-teal-500)',
          },
        },
      },
    },
    defaultProps: {
      variant: 'outline',
    },
  },

  Textarea: {
    variants: {
      outline: {
        borderWidth: '2px',
        borderColor: 'gray.200',
        borderRadius: 'md',
        _hover: {
          borderColor: 'gray.300',
        },
        _focus: {
          borderColor: 'teal.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-teal-500)',
        },
      },
    },
    defaultProps: {
      variant: 'outline',
    },
  },

  Badge: {
    baseStyle: {
      borderRadius: 'base',
      px: 3,
      py: 1,
      fontWeight: '600',
      textTransform: 'none',
    },
  },

  Modal: {
    baseStyle: {
      dialog: {
        borderRadius: 'xl',
        boxShadow: 'xl',
      },
    },
  },

  Alert: {
    variants: {
      'left-accent': {
        container: {
          borderRadius: 'md',
          borderLeftWidth: '4px',
        },
      },
    },
  },
}

// 7. Exporter le thème complet
export const theme = extendTheme({
  colors,
  fonts,
  styles,
  radii,
  shadows,
  components,
})