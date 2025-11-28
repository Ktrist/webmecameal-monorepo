import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useCart } from './CartContext'
import { 
  Box, Button, Container, Heading, Text, Tag,
  SimpleGrid, Image, useToast, Skeleton, Badge, VStack, Spinner
} from '@chakra-ui/react'
import { Link as RouterLink, useNavigate } from 'react-router-dom' 
import { motion } from 'framer-motion'
import qs from 'qs'

const MotionBox = motion(Box)
const STRAPI_URL = 'http://localhost:1337'

export default function MenuGrid({ data, context }) {
  // On récupère les données passées par le parent (peut être vide)
  const inputRecipes = data?.fiches_recettes || []

  const { session } = context
  const navigate = useNavigate()
  const toast = useToast()
  const { addToCart } = useCart()

  const [recipes, setRecipes] = useState([])
  const [prices, setPrices] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      let recipesToDisplay = inputRecipes

      try {
        // --- FILET DE SÉCURITÉ ---
        // Si le parent n'a rien envoyé (problème de populate), on fetch tout nous-mêmes
        if (recipesToDisplay.length === 0) {
          console.log("MenuGrid: Aucune recette reçue du parent, tentative de fetch autonome...")
          
          const query = qs.stringify({
            populate: ['image_marketing'] // On demande les images directement
          }, { encodeValuesOnly: true })

          const res = await fetch(`${STRAPI_URL}/api/fiche-recettes?${query}`)
          const json = await res.json()
          
          if (json.data && json.data.length > 0) {
            recipesToDisplay = json.data
            console.log("MenuGrid: Récupération autonome réussie !", recipesToDisplay)
          }
        } else {
          // Si on a reçu des données mais incomplètes (sans images), on les complète
           // (Code optionnel si le parent envoie déjà des IDs mais pas les images)
           // Pour l'instant, on assume que le fallback ci-dessus gère le cas vide.
        }

        // Si après tout ça on a toujours rien, on arrête
        if (recipesToDisplay.length === 0) {
          setLoading(false)
          return
        }

        setRecipes(recipesToDisplay)

        // --- RÉCUPÉRATION DES PRIX (SUPABASE) ---
        const supabaseIds = recipesToDisplay.map(r => r.supabase_menu_id).filter(Boolean)
        
        if (supabaseIds.length > 0) {
          const { data: menusData, error } = await supabase
            .from('menus')
            .select('id, price, is_active')
            .in('id', supabaseIds)
          
          if (error) console.error("Erreur Supabase:", error)
          else {
            const pricesMap = {}
            menusData.forEach(m => { pricesMap[m.id] = m })
            setPrices(pricesMap)
          }
        }

      } catch (error) {
        console.error("Erreur globale MenuGrid:", error)
      }
      setLoading(false)
    }

    loadData()
  }, [inputRecipes.length]) // On relance si l'input change

  const handleAddToCartClick = (e, recipe, priceData) => {
    e.preventDefault() 
    if (!session) navigate('/login')
    else {
      addToCart({
        id: recipe.supabase_menu_id,
        week_name: recipe.titre,
        price: priceData?.price || 0,
      })
      toast({ title: "Ajouté au panier", status: "success", duration: 1500, position: 'top-right' })
    }
  }

  const MenuCard = ({ recipe, index }) => {
    const imageUrl = recipe.image_marketing?.url 
      ? `${STRAPI_URL}${recipe.image_marketing.url}` 
      : 'https://placehold.co/400x300?text=Image+Manquante'

    const priceData = prices[recipe.supabase_menu_id]
    const displayPrice = priceData ? `${priceData.price} €` : "Prix N/A"
    const isActive = priceData ? priceData.is_active : false

    return (
      <MotionBox
        as={RouterLink}
        to={`/menu/${recipe.supabase_menu_id}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        bg="white"
        borderRadius="3xl"
        overflow="hidden"
        boxShadow="lg"
        whileHover={{ y: -8, boxShadow: "2xl" }}
        height="100%"
        display="flex"
        flexDirection="column"
      >
        <Box h="220px" overflow="hidden" position="relative">
          <Image 
            src={imageUrl} 
            alt={recipe.titre} 
            w="100%" h="100%" 
            objectFit="cover"
            transition="transform 0.4s"
            _hover={{ transform: "scale(1.05)" }}
          />
          <Badge position="absolute" bottom={4} right={4} bg="white" fontSize="md" px={3} py={1} borderRadius="full" boxShadow="md">
            {displayPrice}
          </Badge>
          
          {/* Debugging : Si pas de lien Supabase */}
          {!priceData && (
            <Badge position="absolute" top={4} left={4} colorScheme="purple" fontSize="xs">
              ID {recipe.supabase_menu_id} introuvable
            </Badge>
          )}
        </Box>
        
        <VStack p={6} align="start" spacing={3} flex="1">
          <Heading size="md" noOfLines={2} color="brand.dark">{recipe.titre}</Heading>
          <Box flex="1" />
          <Button 
            colorScheme="brand"
            bg="brand.orange" color="white"
            size="lg" w="full" borderRadius="xl"
            _hover={{ bg: "orange.600" }}
            isDisabled={priceData && !isActive} 
            onClick={(e) => handleAddToCartClick(e, recipe, priceData)}
          >
            Ajouter au panier
          </Button>
        </VStack>
      </MotionBox>
    )
  }

  // Si vraiment rien ne charge
  if (!recipes || recipes.length === 0) {
    return (
      <Container maxW="container.lg" py={10} textAlign="center">
        <Text color="gray.500">Chargement des menus...</Text>
        <Spinner mt={4} color="brand.green"/>
      </Container>
    )
  }

  return (
    <Box py={20} bg="white">
      <Container maxW="container.xl">
        <VStack spacing={2} mb={12} textAlign="center">
          <Heading as="h2" size="2xl" color="brand.dark" letterSpacing="tight">
            {data.titre || "Nos Menus"}
          </Heading>
          <Text fontSize="lg" color="gray.500">Fraîcheur garantie, cuisiné chaque matin.</Text>
        </VStack>
        
        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
             {[1,2,3].map(i => <Skeleton key={i} height="400px" borderRadius="3xl" />)}
          </SimpleGrid>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10}>
            {recipes.map((recipe, index) => (
              <MenuCard key={recipe.documentId || recipe.id || index} recipe={recipe} index={index} />
            ))}
          </SimpleGrid>
        )}
      </Container>
    </Box>
  )
}