import { useState, useEffect } from 'react'
import {
  Box, Container, Heading, Text, VStack, HStack, Button, SimpleGrid,
  Radio, RadioGroup, Stack, Image, Badge, useToast, Spinner, Center,
  Card, CardBody, Flex, Icon
} from '@chakra-ui/react'
import { useNavigate } from 'react-router-dom'
import { FiCheck, FiUser } from 'react-icons/fi'
import { useCart } from './CartContext'
import { STRAPI_URL } from './config'

// Grille tarifaire
const PRICING = {
  1: 15,    // 1 plat = 15€
  2: 14,    // 2 plats = 14€/plat
  3: 13,    // 3 plats = 13€/plat
  5: 11.90  // 5 plats = 11.90€/plat
}

export default function PersonnalisationPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const { addToCart } = useCart()

  // États
  const [portions, setPortions] = useState('1')
  const [nbPlats, setNbPlats] = useState('3')
  const [selectedRecipes, setSelectedRecipes] = useState([])
  const [availableRecipes, setAvailableRecipes] = useState([])
  const [loading, setLoading] = useState(true)

  // Récupération des recettes depuis Strapi
  useEffect(() => {
    async function fetchRecipes() {
      try {
        const res = await fetch(`${STRAPI_URL}/api/fiche-recettes?populate=image_marketing`)
        const json = await res.json()
        if (json.data) {
          setAvailableRecipes(json.data)
        }
      } catch (error) {
        console.error('Erreur chargement recettes:', error)
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les recettes',
          status: 'error',
          duration: 3000
        })
      }
      setLoading(false)
    }
    fetchRecipes()
  }, [])

  // Gestion sélection recette
  const toggleRecipe = (recipe) => {
    const isSelected = selectedRecipes.find(r => r.documentId === recipe.documentId)
    const maxRecipes = parseInt(nbPlats)

    if (isSelected) {
      setSelectedRecipes(selectedRecipes.filter(r => r.documentId !== recipe.documentId))
    } else {
      if (selectedRecipes.length < maxRecipes) {
        setSelectedRecipes([...selectedRecipes, recipe])
      } else {
        toast({
          title: 'Maximum atteint',
          description: `Vous ne pouvez sélectionner que ${maxRecipes} plats`,
          status: 'warning',
          duration: 2000
        })
      }
    }
  }

  // Calcul du prix total
  const calculateTotal = () => {
    const nbRecipes = parseInt(nbPlats)
    const nbPortions = parseInt(portions)
    const pricePerMeal = PRICING[nbRecipes] || 15
    return (pricePerMeal * nbRecipes * nbPortions).toFixed(2)
  }

  // Validation et passage au checkout
  const handleCommander = () => {
    if (selectedRecipes.length !== parseInt(nbPlats)) {
      toast({
        title: 'Sélection incomplète',
        description: `Veuillez sélectionner ${nbPlats} plats`,
        status: 'warning',
        duration: 3000
      })
      return
    }

    // Ajout au panier
    selectedRecipes.forEach(recipe => {
      addToCart({
        id: recipe.supabase_menu_id || recipe.documentId,
        week_name: recipe.titre,
        price: PRICING[parseInt(nbPlats)],
        quantity: parseInt(portions)
      })
    })

    toast({
      title: 'Ajouté au panier !',
      description: `${selectedRecipes.length} plats × ${portions} portion(s)`,
      status: 'success',
      duration: 2000
    })

    // Redirection vers checkout
    setTimeout(() => navigate('/checkout'), 1000)
  }

  if (loading) {
    return (
      <Center h="80vh">
        <Spinner size="xl" color="brand.green" />
      </Center>
    )
  }

  return (
    <Box py={10} bg="gray.50" minH="100vh">
      <Container maxW="container.xl">

        {/* En-tête */}
        <VStack spacing={4} mb={10} textAlign="center">
          <Heading size="2xl" color="brand.dark">
            Personnalisez votre première commande
          </Heading>
          <Text fontSize="lg" color="gray.600" maxW="2xl">
            Choisissez vos portions, le nombre de plats et composez votre box. Desserts inclus automatiquement !
          </Text>
        </VStack>

        {/* Étape 1 : Nombre de portions */}
        <Card mb={8} shadow="md">
          <CardBody>
            <VStack align="stretch" spacing={6}>
              <Heading size="md" color="brand.dark">
                1. Combien de personnes ?
              </Heading>
              <RadioGroup value={portions} onChange={setPortions}>
                <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                  <PortionOption value="1" icon="👤" label="1 personne" />
                  <PortionOption value="2" icon="👥" label="2 personnes" />
                  <PortionOption value="4" icon="👨‍👩‍👧‍👦" label="4 personnes" />
                </Stack>
              </RadioGroup>
            </VStack>
          </CardBody>
        </Card>

        {/* Étape 2 : Nombre de plats */}
        <Card mb={8} shadow="md">
          <CardBody>
            <VStack align="stretch" spacing={6}>
              <Heading size="md" color="brand.dark">
                2. Combien de plats souhaitez-vous ?
              </Heading>
              <RadioGroup value={nbPlats} onChange={(val) => {
                setNbPlats(val)
                setSelectedRecipes([]) // Reset sélection
              }}>
                <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
                  <PlatsOption value="2" price={PRICING[2]} label="2 plats" />
                  <PlatsOption value="3" price={PRICING[3]} label="3 plats" isPopular />
                  <PlatsOption value="5" price={PRICING[5]} label="5 plats" />
                </Stack>
              </RadioGroup>
            </VStack>
          </CardBody>
        </Card>

        {/* Étape 3 : Sélection des recettes */}
        <Card mb={8} shadow="md">
          <CardBody>
            <VStack align="stretch" spacing={6}>
              <Flex justify="space-between" align="center">
                <Heading size="md" color="brand.dark">
                  3. Choisissez vos {nbPlats} plats
                </Heading>
                <Badge colorScheme="green" fontSize="md" px={3} py={1} borderRadius="full">
                  {selectedRecipes.length} / {nbPlats} sélectionné(s)
                </Badge>
              </Flex>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {availableRecipes.map((recipe) => (
                  <RecipeCard
                    key={recipe.documentId}
                    recipe={recipe}
                    isSelected={selectedRecipes.find(r => r.documentId === recipe.documentId)}
                    onToggle={() => toggleRecipe(recipe)}
                  />
                ))}
              </SimpleGrid>

              {availableRecipes.length === 0 && (
                <Text textAlign="center" color="gray.500" py={10}>
                  Aucune recette disponible pour le moment
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Résumé et Prix */}
        <Card bg="brand.green" color="white" shadow="xl">
          <CardBody>
            <Flex
              direction={{ base: 'column', md: 'row' }}
              justify="space-between"
              align="center"
              gap={6}
            >
              <VStack align={{ base: 'center', md: 'flex-start' }} spacing={2}>
                <Heading size="lg">Votre commande</Heading>
                <Text opacity={0.9}>
                  {nbPlats} plats × {portions} portion(s)
                </Text>
                <Text fontSize="sm" opacity={0.8}>
                  Desserts inclus • Livraison gratuite
                </Text>
              </VStack>

              <VStack spacing={4}>
                <VStack spacing={0}>
                  <Text fontSize="sm" opacity={0.9}>Total</Text>
                  <Heading size="2xl">{calculateTotal()} €</Heading>
                </VStack>
                <Button
                  size="lg"
                  colorScheme="orange"
                  w="full"
                  minW={{ base: 'full', md: '200px' }}
                  onClick={handleCommander}
                  _hover={{ transform: 'translateY(-2px)', shadow: 'xl' }}
                  transition="all 0.2s"
                >
                  Commander
                </Button>
              </VStack>
            </Flex>
          </CardBody>
        </Card>

      </Container>
    </Box>
  )
}

// Composant Option Portion
function PortionOption({ value, icon, label }) {
  return (
    <Box as="label" flex="1" cursor="pointer">
      <Radio value={value} display="none" />
      <Card
        _hover={{ borderColor: 'brand.green', shadow: 'md' }}
        transition="all 0.2s"
        sx={{
          'input:checked ~ &': {
            borderColor: 'brand.green',
            borderWidth: '2px',
            bg: 'green.50'
          }
        }}
      >
        <CardBody textAlign="center">
          <Text fontSize="3xl" mb={2}>{icon}</Text>
          <Text fontWeight="medium">{label}</Text>
        </CardBody>
      </Card>
    </Box>
  )
}

// Composant Option Plats
function PlatsOption({ value, price, label, isPopular }) {
  return (
    <Box as="label" flex="1" cursor="pointer" position="relative">
      <Radio value={value} display="none" />
      {isPopular && (
        <Badge
          position="absolute"
          top="-3"
          right="50%"
          transform="translateX(50%)"
          colorScheme="orange"
          zIndex={1}
          px={3}
          py={1}
          borderRadius="full"
        >
          Populaire
        </Badge>
      )}
      <Card
        _hover={{ borderColor: 'brand.green', shadow: 'md' }}
        transition="all 0.2s"
        sx={{
          'input:checked ~ &': {
            borderColor: 'brand.green',
            borderWidth: '2px',
            bg: 'green.50'
          }
        }}
      >
        <CardBody textAlign="center">
          <Heading size="md" mb={2}>{label}</Heading>
          <Text fontSize="2xl" fontWeight="bold" color="brand.green">
            {price} € <Text as="span" fontSize="sm" color="gray.600">/plat</Text>
          </Text>
        </CardBody>
      </Card>
    </Box>
  )
}

// Composant Carte Recette
function RecipeCard({ recipe, isSelected, onToggle }) {
  const imageUrl = recipe.image_marketing?.url
    ? `${STRAPI_URL}${recipe.image_marketing.url}`
    : 'https://placehold.co/400x300?text=Image'

  return (
    <Card
      onClick={onToggle}
      cursor="pointer"
      borderWidth={isSelected ? '3px' : '1px'}
      borderColor={isSelected ? 'brand.green' : 'gray.200'}
      position="relative"
      _hover={{ shadow: 'lg', transform: 'translateY(-4px)' }}
      transition="all 0.3s"
      bg={isSelected ? 'green.50' : 'white'}
    >
      {isSelected && (
        <Box
          position="absolute"
          top={4}
          right={4}
          bg="brand.green"
          color="white"
          borderRadius="full"
          w={8}
          h={8}
          display="flex"
          alignItems="center"
          justifyContent="center"
          zIndex={1}
        >
          <Icon as={FiCheck} />
        </Box>
      )}

      <Image
        src={imageUrl}
        alt={recipe.titre}
        h="200px"
        w="full"
        objectFit="cover"
        borderTopRadius="md"
      />

      <CardBody>
        <VStack align="stretch" spacing={2}>
          <Heading size="sm" noOfLines={2}>
            {recipe.titre}
          </Heading>
          {recipe.description && (
            <Text fontSize="sm" color="gray.600" noOfLines={2}>
              {recipe.description}
            </Text>
          )}
          {recipe.temps_preparation && (
            <Text fontSize="xs" color="gray.500">
              ⏱️ {recipe.temps_preparation}
            </Text>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}
