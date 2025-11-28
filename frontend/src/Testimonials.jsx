import { Box, Container, SimpleGrid, Heading, Text, Avatar, VStack, HStack, Icon } from '@chakra-ui/react'
import { FaStar } from 'react-icons/fa'

const STRAPI_URL = 'http://localhost:1337'

export default function Testimonials({ data }) {
  const reviews = data.avis || []

  return (
    <Box py={20} bg="gray.50">
      <Container maxW="container.xl">
        <Heading textAlign="center" mb={16} size="xl">
          {data.titre || "Ils se régalent"}
        </Heading>

        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
          {reviews.map((review, idx) => (
            <Box key={idx} bg="white" p={8} borderRadius="xl" shadow="sm">
              <HStack mb={4} color="yellow.400">
                {[...Array(review.note || 5)].map((_, i) => <Icon key={i} as={FaStar} />)}
              </HStack>
              <Text color="gray.600" mb={6} fontStyle="italic">
                "{review.texte}"
              </Text>
              <HStack>
                <Avatar 
                  src={review.photo?.url ? `${STRAPI_URL}${review.photo.url}` : null} 
                  name={review.nom} 
                />
                <Box>
                  <Text fontWeight="bold" fontSize="sm">{review.nom}</Text>
                  <Text fontSize="xs" color="gray.500">{review.poste}</Text>
                </Box>
              </HStack>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}