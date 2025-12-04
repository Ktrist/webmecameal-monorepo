import { useState } from 'react'
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Button,
  SimpleGrid,
  Card,
  CardBody,
  Badge,
  List,
  ListItem,
  ListIcon,
  useToast,
  Spinner,
  Center,
  Icon,
  Flex,
} from '@chakra-ui/react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { FiCheck, FiClock, FiCalendar } from 'react-icons/fi'
import { STRIPE_PRICES } from './config'
import { supabase } from './supabaseClient'

// 🔥 DEBUG MODULE LOADING
console.log('🔥 SubscriptionPage.jsx LOADED!')
console.log('🔥 STRIPE_PRICES from config:', STRIPE_PRICES)

// Plans d'abonnement
const SUBSCRIPTION_PLANS = [
  {
    id: 'hebdo_2j',
    name: 'Hebdo 2 jours',
    price: 25.80,
    pricePerDay: 12.90,
    frequency: 'semaine',
    daysPerWeek: 2,
    stripePriceId: STRIPE_PRICES.HEBDO_2J || 'price_1SaC5xIHvDc7GYq5ItUTUVHU',
    features: [
      '2 repas par semaine',
      '12.90€ par repas',
      'Livraison gratuite',
      'Desserts inclus',
      'Choix parmi 2 plats chaque jour',
      'Pause à tout moment',
    ],
    isPopular: false,
    color: 'blue',
  },
  {
    id: 'hebdo_3j',
    name: 'Hebdo 3 jours',
    price: 35.70,
    pricePerDay: 11.90,
    frequency: 'semaine',
    daysPerWeek: 3,
    stripePriceId: STRIPE_PRICES.HEBDO_3J || 'price_1SaC9XIHvDc7GYq5XbLGuZX0',
    features: [
      '3 repas par semaine',
      '11.90€ par repas',
      'Livraison gratuite',
      'Desserts inclus',
      'Choix parmi 2 plats chaque jour',
      'Pause à tout moment',
      'Économisez 8% vs 2 jours',
    ],
    isPopular: true,
    color: 'green',
  },
  {
    id: 'hebdo_5j',
    name: 'Hebdo 5 jours',
    price: 54.50,
    pricePerDay: 10.90,
    frequency: 'semaine',
    daysPerWeek: 5,
    stripePriceId: STRIPE_PRICES.HEBDO_5J || 'price_1SaCCbIHvDc7GYq5fcSaXlW6',
    features: [
      '5 repas par semaine',
      '10.90€ par repas',
      'Livraison gratuite',
      'Desserts inclus',
      'Choix parmi 2 plats chaque jour',
      'Pause à tout moment',
      'Économisez 16% vs 2 jours',
      'Idéal pour bureaux',
    ],
    isPopular: false,
    color: 'teal',
  },
  {
    id: 'mensuel',
    name: 'Mensuel Flexible',
    price: 10.00,
    priceMin: 10.00,
    frequency: 'mois',
    isFlexible: true,
    stripePriceId: STRIPE_PRICES.MENSUEL || 'price_1SaCDxIHvDc7GYq5aqK8F3yE',
    features: [
      'À partir de 10€/mois',
      'Choisissez vos jours de livraison',
      'Maximum jours travaillés du mois',
      'Livraison gratuite',
      'Desserts inclus',
      'Choix parmi 2 plats chaque jour',
      'Pause à tout moment',
      'Flexibilité maximale',
    ],
    isPopular: false,
    color: 'purple',
  },
]

export default function SubscriptionPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const context = useOutletContext()
  const session = context?.session || null
  const user = context?.user || null

  const [loading, setLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  // DEBUG: Vérifier les Price IDs
  console.log('🔍 DEBUG STRIPE_PRICES:', STRIPE_PRICES)
  console.log('🔍 DEBUG Plans:', SUBSCRIPTION_PLANS.map(p => ({ id: p.id, stripePriceId: p.stripePriceId })))

  const handleSubscribe = async (plan) => {
    // Vérifier l'authentification
    if (!session || !user) {
      toast({
        title: 'Connexion requise',
        description: 'Veuillez vous connecter pour souscrire à un abonnement',
        status: 'info',
        duration: 3000,
      })
      navigate('/login')
      return
    }

    // Vérifier que le price ID est configuré
    if (!plan.stripePriceId) {
      toast({
        title: 'Configuration incomplète',
        description: 'Le plan sélectionné n\'est pas encore disponible. Contactez le support.',
        status: 'error',
        duration: 5000,
      })
      return
    }

    setLoading(true)
    setSelectedPlan(plan.id)

    try {
      // Appeler l'edge function Stripe pour créer la session checkout
      const { data, error } = await supabase.functions.invoke('create-stripe-checkout', {
        body: {
          priceId: plan.stripePriceId,
          mode: 'subscription',
          planType: plan.id,
          userId: user.id,
        },
      })

      if (error) throw error

      if (data?.url) {
        // Rediriger vers Stripe Checkout
        window.location.href = data.url
      } else {
        throw new Error('URL de paiement non reçue')
      }
    } catch (error) {
      console.error('Erreur souscription:', error)
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de créer la session de paiement',
        status: 'error',
        duration: 5000,
      })
      setLoading(false)
      setSelectedPlan(null)
    }
  }

  return (
    <Box py={10} bg="gray.50" minH="100vh">
      <Container maxW="container.xl">
        {/* En-tête */}
        <VStack spacing={4} mb={12} textAlign="center">
          <Heading size="2xl" color="brand.dark">
            Choisissez votre formule
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            Recevez des repas frais et équilibrés directement à votre bureau.
            Sans engagement, pausez ou annulez à tout moment.
          </Text>
        </VStack>

        {/* Grille des plans */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={10}>
          {SUBSCRIPTION_PLANS.map((plan) => (
            <Card
              key={plan.id}
              position="relative"
              borderWidth={plan.isPopular ? '3px' : '1px'}
              borderColor={plan.isPopular ? 'green.400' : 'gray.200'}
              shadow={plan.isPopular ? 'xl' : 'md'}
              transition="all 0.3s"
              _hover={{
                transform: 'translateY(-4px)',
                shadow: 'xl',
              }}
            >
              {plan.isPopular && (
                <Badge
                  position="absolute"
                  top="-3"
                  left="50%"
                  transform="translateX(-50%)"
                  colorScheme="green"
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="xs"
                  zIndex={1}
                >
                  ⭐ Le plus populaire
                </Badge>
              )}

              <CardBody>
                <VStack align="stretch" spacing={4}>
                  {/* En-tête du plan */}
                  <Box textAlign="center">
                    <Heading size="md" mb={2} color="brand.dark">
                      {plan.name}
                    </Heading>

                    <Flex justify="center" align="baseline" gap={1}>
                      <Text fontSize="3xl" fontWeight="bold" color={`${plan.color}.500`}>
                        {plan.price.toFixed(2)}€
                      </Text>
                      <Text color="gray.600">/ {plan.frequency}</Text>
                    </Flex>

                    {plan.pricePerDay && (
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        {plan.pricePerDay.toFixed(2)}€ par repas
                      </Text>
                    )}

                    {plan.isFlexible && (
                      <Text fontSize="sm" color="gray.500" mt={1}>
                        Minimum {plan.priceMin.toFixed(2)}€/mois
                      </Text>
                    )}
                  </Box>

                  {/* Caractéristiques */}
                  <List spacing={2} fontSize="sm">
                    {plan.features.map((feature, index) => (
                      <ListItem key={index} display="flex" alignItems="flex-start">
                        <ListIcon as={FiCheck} color={`${plan.color}.500`} mt={0.5} />
                        <Text>{feature}</Text>
                      </ListItem>
                    ))}
                  </List>

                  {/* Bouton d'action */}
                  <Button
                    colorScheme={plan.color}
                    size="lg"
                    w="full"
                    mt={4}
                    onClick={() => handleSubscribe(plan)}
                    isLoading={loading && selectedPlan === plan.id}
                    loadingText="Redirection..."
                    _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                    transition="all 0.2s"
                  >
                    {plan.isPopular ? 'Je choisis cette formule' : 'Je m\'abonne'}
                  </Button>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {/* Informations complémentaires */}
        <Box bg="white" p={8} borderRadius="xl" shadow="sm">
          <VStack spacing={6} align="stretch">
            <Heading size="md" textAlign="center">
              Comment ça marche ?
            </Heading>

            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
              <VStack>
                <Icon as={FiCalendar} boxSize={10} color="brand.green" />
                <Heading size="sm">1. Choisissez</Heading>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Sélectionnez la formule qui vous convient parmi nos 4 options
                </Text>
              </VStack>

              <VStack>
                <Icon as={FiCheck} boxSize={10} color="brand.green" />
                <Heading size="sm">2. Personnalisez</Heading>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Chaque jour, choisissez parmi 2 plats savoureux préparés par nos chefs
                </Text>
              </VStack>

              <VStack>
                <Icon as={FiClock} boxSize={10} color="brand.green" />
                <Heading size="sm">3. Recevez</Heading>
                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Livraison gratuite à votre bureau aux jours convenus
                </Text>
              </VStack>
            </SimpleGrid>

            <Box textAlign="center" pt={4}>
              <Text fontSize="sm" color="gray.500">
                Sans engagement • Pause à tout moment • Desserts inclus • Zone Annecy
              </Text>
            </Box>
          </VStack>
        </Box>
      </Container>
    </Box>
  )
}
