import { useEffect, useState } from 'react'
import { useParams, useOutletContext, useNavigate, Link as RouterLink } from 'react-router-dom'
import { supabase } from './supabaseClient'
import { useCart } from './CartContext'
import { 
  Box, Button, Container, Heading, Text, Spinner, VStack, 
  Image, Breadcrumb, BreadcrumbItem, BreadcrumbLink, useToast,
  Flex, Divider
} from '@chakra-ui/react'

// URL de votre Strapi
const STRAPI_URL = 'http://localhost:1337'

export default function MenuDetailPage() {
  const { menuId } = useParams()
  const { session } = useOutletContext()
  const { addToCart } = useCart()
  const navigate = useNavigate()
  const toast = useToast()
  
  const [menu, setMenu] = useState(null)
  const [recipeData, setRecipeData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        // 1. Fetcher le Produit (Supabase)
        const { data: supabaseData, error } = await supabase
          .from('menus')
          .select('*')
          .eq('id', menuId)
          .single()

        if (error) throw error
        setMenu(supabaseData)

        // 2. Fetcher la Fiche Recette (Strapi)
        try {
          // AJOUT : on ajoute '&populate=*' pour récupérer l'image
          const res = await fetch(
            `${STRAPI_URL}/api/fiche-recettes?filters[supabase_menu_id][$eq]=${menuId}&populate=*`
          )
          const strapiJson = await res.json()

          if (strapiJson.data && strapiJson.data.length > 0) {
            const fiche = strapiJson.data[strapiJson.data.length - 1]
            setRecipeData(fiche) 
          }
        } catch (strapiError) {
          console.warn("Erreur fetch Strapi (Recette non trouvée) :", strapiError)
        }

      } catch (error) {
        console.error('Erreur fetch Supabase:', error)
        if (!menu) navigate('/') 
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [menuId, navigate])

  const handleAddToCartClick = () => {
    if (!session) {
      navigate('/login')
    } else {
      addToCart(menu)
      toast({
        title: "Menu ajouté",
        status: "success",
        duration: 2000,
      })
    }
  }

  if (loading || !menu) {
    return <Container centerContent py={20}><Spinner size="xl" /></Container>
  }

  // --- LOGIQUE DE SÉLECTION DE L'IMAGE ---
  let imageUrl = 'https://via.placeholder.com/400' // Défaut
  
  // 1. Priorité Strapi (Image Marketing)
  if (recipeData && recipeData.image_marketing && recipeData.image_marketing.url) {
    imageUrl = `${STRAPI_URL}${recipeData.image_marketing.url}`
  } 
  // 2. Sinon Supabase (Image Produit)
  else if (menu.image_url) {
    imageUrl = menu.image_url
  }
  // ---------------------------------------

  return (
    <Container maxW="container.lg" py={10}>
      <Breadcrumb mb={6} color="gray.500">
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/">Accueil</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <Text>{menu.week_name}</Text>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <Flex direction={{ base: 'column', md: 'row' }} gap={10}>
        
        {/* COLONNE GAUCHE : Image & Prix */}
        <Box flex="1">
          <Image 
            src={imageUrl} // <-- On utilise notre URL calculée
            alt={menu.week_name} 
            borderRadius="xl" 
            objectFit="cover" 
            w="100%"
            shadow="lg"
            mb={6}
          />
           <Box p={6} borderWidth="1px" borderRadius="xl" shadow="sm" bg="white">
            <Text fontSize="sm" color="gray.500" mb={1}>Prix par personne</Text>
            <Text fontSize="3xl" fontWeight="bold" color="brand.green" mb={4}>
              {menu.price} €
            </Text>
            <Button colorScheme="teal" size="lg" w="full" onClick={handleAddToCartClick}>
              Ajouter au panier
            </Button>
          </Box>
        </Box>

        {/* COLONNE DROITE : Description & Recette */}
        <VStack flex="2" align="stretch" spacing={6}>
          <Heading as="h1" size="2xl">{menu.week_name}</Heading>
          
          {/* Description courte (Supabase) */}
          <Text fontSize="xl" color="gray.600">
            {menu.description}
          </Text>

          <Divider />

          {/* Contenu Riche (Strapi) */}
          {recipeData && recipeData.details_recette ? (
            <Box>
              <Heading size="lg" mb={4} color="brand.orange">
                {recipeData.titre || "La Recette du Chef"}
              </Heading>
              
              <Box 
                className="ck-content"
                dangerouslySetInnerHTML={{ __html: recipeData.details_recette }} 
                sx={{
                  'ul': { paddingLeft: '20px', marginBottom: '1rem' },
                  'ol': { paddingLeft: '20px', marginBottom: '1rem' },
                  'li': { marginBottom: '0.5rem' },
                  'p': { marginBottom: '1rem', lineHeight: '1.6' },
                  'h2': { fontSize: 'xl', fontWeight: 'bold', marginTop: '1.5rem', marginBottom: '0.5rem', color: 'brand.dark' },
                  'h3': { fontSize: 'lg', fontWeight: 'bold', marginTop: '1rem', marginBottom: '0.5rem' },
                  'a': { color: 'brand.green', textDecoration: 'underline' }
                }}
              />
            </Box>
          ) : (
            <Box bg="gray.50" p={4} borderRadius="md">
              <Text fontStyle="italic" color="gray.500">
                La fiche recette détaillée n'est pas encore disponible pour ce menu.
              </Text>
            </Box>
          )}
        </VStack>

      </Flex>
    </Container>
  )
}