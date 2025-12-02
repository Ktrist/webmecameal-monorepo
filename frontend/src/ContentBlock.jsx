import { Box, Container, Heading, Text, Flex, Image, VStack } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { STRAPI_URL } from './config'

export default function ContentBlock({ data }) {
  // data.inverse = true/false (défini dans Strapi pour changer le sens)
  const isInverse = data.inverse
  
  // URL image (avec fallback)
  const imageUrl = data.image?.url 
    ? `${STRAPI_URL}${data.image.url}` 
    : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'

  return (
    <Box py={24} overflow="hidden">
      <Container maxW="container.xl">
        <Flex 
          direction={{ base: 'column', md: isInverse ? 'row-reverse' : 'row' }} 
          align="center" 
          gap={{ base: 10, md: 20 }}
        >
          {/* Partie Texte */}
          <VStack 
            as={motion.div}
            initial={{ opacity: 0, x: isInverse ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            flex="1" 
            align="flex-start" 
            spacing={6}
          >
            <Heading size="2xl" lineHeight="1.2">
              {data.titre || "Des ingrédients d'exception."}
            </Heading>
            <Box
              fontSize="lg"
              color="gray.600"
              lineHeight="tall"
              dangerouslySetInnerHTML={{
                __html: data.texte || "Nous sélectionnons nos producteurs avec soin. Pas de surgelé, pas de conservateurs. Juste de la vraie cuisine, préparée le matin même dans nos cuisines."
              }}
            />
          </VStack>

          {/* Partie Image */}
          <Box 
            flex="1" 
            as={motion.div}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Image 
              src={imageUrl} 
              alt="Illustration" 
              borderRadius="3xl" 
              shadow="2xl" 
              objectFit="cover"
              w="100%"
              h="500px"
            />
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}