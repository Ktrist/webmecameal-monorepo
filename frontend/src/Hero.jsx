import { Box, Button, Container, Heading, Text, VStack } from '@chakra-ui/react'
import { Link as RouterLink } from 'react-router-dom'
import { STRAPI_URL } from './config'

export default function Hero({ data }) {
  // data = { titre: "...", sous_titre: "...", image_fond: {...} }
  
  // On construit l'URL complète de l'image
  const imageUrl = STRAPI_URL + data.image_fond.url
  
  return (
    <Box
      w="full"
      // Responsive Height : 50vh sur mobile, 70vh sur desktop
      h={{ base: "50vh", md: "70vh" }} 
      bgImage={`url(${imageUrl})`}
      bgSize="cover"
      bgPosition="center"
      position="relative"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Box position="absolute" inset={0} bg="blackAlpha.600" />
      
      <Container maxW="container.lg" zIndex={1} color="white" textAlign="center" px={4}>
        <VStack spacing={{ base: 4, md: 6 }}>
          <Heading 
            as="h1" 
            // Taille responsive du texte
            size={{ base: "xl", md: "3xl" }} 
            fontWeight="bold"
            lineHeight="1.2"
          >
            {data.titre}
          </Heading>
          
          <Text 
            fontSize={{ base: "md", md: "xl" }} 
            maxW="xl"
            display={{ base: "none", md: "block" }} // Optionnel : Cacher le sous-titre sur très petits écrans ?
          >
            {data.sous_titre}
          </Text>

          <Button 
            as={RouterLink} 
            to="#menu-grid" 
            colorScheme="teal" 
            size={{ base: "md", md: "lg" }} // Bouton un peu plus petit sur mobile
            px={8}
          >
            Découvrir les menus
          </Button>
        </VStack>
      </Container>
    </Box>
  )
}