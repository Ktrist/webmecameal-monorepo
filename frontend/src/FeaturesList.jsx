import { Box, Container, SimpleGrid, Heading, Text, VStack, Image } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { STRAPI_URL } from './config'

const MotionBox = motion(Box)

export default function FeaturesList({ data }) {
  // CORRECTION ICI : on lit 'feature_item' au lieu de 'features'
  const features = data.feature_item || []

  return (
    <Box py={20} bg="white">
      <Container maxW="container.xl">
        <Heading textAlign="center" mb={16} size="xl" color="brand.dark">
          {data.titre || "Comment ça marche ?"}
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={10}>
          {features.map((feature, idx) => (
            <MotionBox 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
            >
              <VStack spacing={4} textAlign="center">
                {/* Cercle pour l'icône */}
                <Box p={4} bg="green.50" borderRadius="full" w="80px" h="80px" display="flex" alignItems="center" justifyContent="center" mb={2}>
                  {feature.icone?.data?.attributes?.url ? (
                     // Strapi v4 style
                     <Image src={`${STRAPI_URL}${feature.icone.data.attributes.url}`} w="40px" />
                  ) : feature.icone?.url ? (
                     // Strapi v5 style (celui que vous avez probablement)
                     <Image src={`${STRAPI_URL}${feature.icone.url}`} w="40px" />
                  ) : (
                     // Fallback si pas d'image
                     <Text fontSize="2xl">✨</Text>
                  )}
                </Box>
                <Heading size="md">{feature.titre}</Heading>
                <Text color="gray.600">{feature.description}</Text>
              </VStack>
            </MotionBox>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}