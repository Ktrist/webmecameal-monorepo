import { useEffect, useState } from 'react'
import { Box, Text, Spinner, Center } from '@chakra-ui/react'
import { useOutletContext, useParams } from 'react-router-dom' 
import qs from 'qs'

// Composants de Blocs
import Hero from './Hero'
import MenuGrid from './MenuGrid'
import PricingGrid from './PricingGrid' 
import ContentBlock from './ContentBlock'
import FeaturesList from './FeaturesList'
import Testimonials from './Testimonials'
import Faq from './Faq'
import { STRAPI_URL } from './config'

// Le Moteur de Rendu
function BlockRenderer({ blocs, context }) {
  if (!blocs) return null;

  return blocs.map((bloc, index) => {
    switch (bloc.__component) {
      case 'blocs-page.hero':
        return <Hero key={index} data={bloc} />
      
      case 'blocs-page.grille-menus':
        return <MenuGrid key={index} data={bloc} context={context} />
      
      case 'blocs-page.pricing-grid':
         return <PricingGrid key={index} data={bloc} />
         
      case 'blocs-page.content-block':
         return <ContentBlock key={index} data={bloc} />

      case 'blocs-page.features-list':
         return <FeaturesList key={index} data={bloc} />
      
      case 'blocs-page.testimonials-grid':
         return <Testimonials key={index} data={bloc} />
      
      case 'blocs-page.faq-section':
         return <Faq key={index} data={bloc} />

      default:
        console.warn(`Bloc ignoré : ${bloc.__component}`)
        return null 
    }
  })
}

export default function DynamicPage() {
  const [pageData, setPageData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const context = useOutletContext()

  const { slug } = useParams()
  const currentSlug = slug || "accueil" 

  useEffect(() => {
    async function fetchPageData() {
      setLoading(true)
      setError(null)
      try {
        const query = qs.stringify({
          filters: {
            slug: { $eq: currentSlug },
          },
          populate: {
            blocs: {
              on: {
                // Hero & Grille
                'blocs-page.hero': { populate: 'image_fond' },
                'blocs-page.grille-menus': { populate: '*' },

                // Offres & Contenu
                'blocs-page.pricing-grid': { populate: { offers: true } },
                'blocs-page.content-block': { populate: 'image' },

                // Features, Testimonials & FAQ
                'blocs-page.features-list': {
                  populate: { feature_item: { populate: 'icone' } }
                },
                'blocs-page.testimonials-grid': {
                  populate: { testimonial_card: { populate: 'photo' } }
                },
                'blocs-page.faq-section': {
                  populate: { questions: true }
                }
              }
            }
          }
        }, { encodeValuesOnly: true })

        const res = await fetch(`${STRAPI_URL}/api/pages?${query}`)

        if (!res.ok) {
          if (res.status === 403) {
            setError('permissions')
            return
          }
          const errorDetails = await res.json();
          console.error("ERREUR STRAPI:", errorDetails);
          throw new Error(errorDetails.error?.message || res.statusText);
        }

        const json = await res.json()

        if (json.data && json.data.length > 0) {
          setPageData(json.data[0].attributes)
        } else {
          setPageData(null)
        }
      } catch (error) {
        console.error("Erreur fetch:", error)
        setError('fetch')
      }
      setLoading(false)
    }
    fetchPageData()
  }, [currentSlug])

  if (loading) return <Center h="50vh"><Spinner size="xl" color="brand.green" /></Center>

  if (error === 'permissions') {
    return (
      <Center h="50vh" flexDirection="column" p={8}>
        <Text fontSize="2xl" fontWeight="bold" mb={4} color="red.500">⚠️ Erreur de Permissions</Text>
        <Text fontSize="lg" mb={4} textAlign="center" maxW="600px">
          L'API Strapi n'est pas accessible publiquement. Vous devez configurer les permissions.
        </Text>
        <Box bg="gray.50" p={6} borderRadius="lg" maxW="700px">
          <Text fontWeight="bold" mb={3}>🔧 Solution :</Text>
          <Text mb={2}>1. Allez sur <strong>http://localhost:1337/admin</strong></Text>
          <Text mb={2}>2. Settings → Roles → Public</Text>
          <Text mb={2}>3. Activez les permissions :</Text>
          <Text ml={4} mb={1}>• <strong>Page</strong>: find, findOne</Text>
          <Text ml={4} mb={1}>• <strong>Global</strong>: find</Text>
          <Text ml={4} mb={1}>• <strong>Menu</strong>: find, findOne</Text>
          <Text ml={4} mb={1}>• <strong>Fiche-recette</strong>: find, findOne</Text>
          <Text mt={3}>4. Cliquez sur <strong>Save</strong></Text>
          <Text mt={3}>5. Rechargez cette page</Text>
        </Box>
      </Center>
    )
  }

  if (!pageData) return (
    <Center h="50vh" flexDirection="column">
      <Text fontSize="xl" fontWeight="bold" mb={2}>Page introuvable ({currentSlug})</Text>
      <Text color="gray.500">Vérifiez que le slug est correct et publié dans Strapi.</Text>
    </Center>
  )

  return (
    <Box>
      <BlockRenderer blocs={pageData.blocs} context={context} />
    </Box>
  )
}