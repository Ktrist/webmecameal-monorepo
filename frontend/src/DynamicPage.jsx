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
  const context = useOutletContext()
  
  const { slug } = useParams() 
  const currentSlug = slug || "accueil" 

  useEffect(() => {
    async function fetchPageData() {
      setLoading(true)
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
                
                // --- CORRECTION DU NOM DU CHAMP ICI ---
                'blocs-page.features-list': { 
                  populate: { feature_item: { populate: 'icone' } } // <-- C'est 'feature_item'
                },
                
                // Vérifiez aussi ces noms dans votre Strapi si ça plante encore :
                'blocs-page.testimonials-grid': { 
                  populate: { avis: { populate: 'photo' } } 
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
      }
      setLoading(false)
    }
    fetchPageData()
  }, [currentSlug])

  if (loading) return <Center h="50vh"><Spinner size="xl" color="brand.green" /></Center>
  
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