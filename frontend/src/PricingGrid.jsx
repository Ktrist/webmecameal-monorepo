import { Box, Button, Container, Flex, Heading, Text, VStack, Badge } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Link as RouterLink } from 'react-router-dom'

const MotionBox = motion(Box)

// Composant Carte Individuelle
const PricingCard = ({ offer, index }) => {
  // On sécurise les données (au cas où Strapi renvoie des noms différents)
  const { titre, price_per_meal, features, is_popular } = offer;

  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      flex="1"
      bg="white"
      // Design spécial si "Populaire"
      borderRadius="3xl"
      border="2px solid"
      borderColor={is_popular ? "brand.green" : "transparent"}
      shadow={is_popular ? "xl" : "md"}
      p={8}
      position="relative"
      transform={is_popular ? { md: "scale(1.05)" } : "none"}
      zIndex={is_popular ? 1 : 0}
      display="flex"
      flexDirection="column"
    >
      {is_popular && (
        <Badge 
          position="absolute" top="-3" right="50%" transform="translateX(50%)" 
          colorScheme="green" px={4} py={1} borderRadius="full" fontSize="xs" textTransform="uppercase"
        >
          Le plus choisi
        </Badge>
      )}

      <VStack spacing={6} align="stretch" flex="1">
        <Box textAlign="center">
          <Heading size="md" mb={2} color="brand.dark">{titre}</Heading>
          <Flex justify="center" align="baseline" gap={1}>
            <Text fontSize="4xl" fontWeight="bold" color="brand.green">{price_per_meal}</Text>
            <Text fontSize="2xl" fontWeight="bold" color="brand.green">€</Text>
          </Flex>
        </Box>

        {/* Zone de contenu riche (Liste à puces CKEditor) */}
        <Box 
          className="ck-content"
          flex="1"
          color="gray.600"
          sx={{
            'ul': { paddingLeft: '20px', listStyleType: 'none' },
            'li': { marginBottom: '0.5rem', display: 'flex', alignItems: 'center' },
            'li::before': { content: '"✓"', color: 'var(--chakra-colors-brand-green)', marginRight: '10px', fontWeight: 'bold' }
          }}
          dangerouslySetInnerHTML={{ __html: features }} 
        />

        <Box mt="auto" pt={6} w="full">
          <Button 
            as={RouterLink}
            to="/checkout" // Ou vers une page d'abonnement spécifique plus tard
            size="lg" 
            colorScheme={is_popular ? "teal" : "gray"} 
            variant={is_popular ? "solid" : "outline"}
            w="full"
            borderRadius="xl"
            _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
          >
            Je m'abonne
          </Button>
        </Box>
      </VStack>
    </MotionBox>
  )
}

// Composant Principal
export default function PricingGrid({ data }) {
  // Récupération sécurisée du tableau d'offres
  const offers = data.offers || [] 

  if (!offers || offers.length === 0) {
    return null // On n'affiche rien si pas d'offres configurées
  }

  return (
    <Box py={24} bg="gray.50">
      <Container maxW="container.xl">
        {/* En-tête du bloc */}
        <VStack spacing={4} mb={16} textAlign="center">
          <Heading as="h2" size="2xl" color="brand.dark" letterSpacing="tight">
            {data.titre || "Nos Formules"}
          </Heading>
          {data.sous_titre && (
            <Text fontSize="xl" color="gray.500" maxW="2xl">
              {data.sous_titre}
            </Text>
          )}
        </VStack>

        {/* Grille des cartes */}
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          gap={8} 
          align={{ base: 'stretch', md: 'center' }}
          justify="center"
        >
          {offers.map((offer, idx) => (
            <PricingCard key={offer.id || idx} offer={offer} index={idx} />
          ))}
        </Flex>
      </Container>
    </Box>
  )
}