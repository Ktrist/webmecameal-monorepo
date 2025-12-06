import { useState } from 'react'
import { Box, Container, Text, Flex, IconButton } from '@chakra-ui/react'
import { FiX } from 'react-icons/fi'

export default function PromoBar() {
  const [isVisible, setIsVisible] = useState(() => {
    // Check if user has dismissed the banner in this session
    return !sessionStorage.getItem('promoBannerDismissed')
  })

  const handleDismiss = () => {
    setIsVisible(false)
    sessionStorage.setItem('promoBannerDismissed', 'true')
  }

  if (!isVisible) return null

  return (
    <Box
      bg="linear-gradient(135deg, #DD6B20 0%, #FF8C42 100%)"
      color="white"
      py={3}
      position="sticky"
      top={0}
      zIndex={20}
      boxShadow="sm"
      sx={{
        '@keyframes slideDown': {
          from: { transform: 'translateY(-100%)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 }
        },
        animation: 'slideDown 0.4s ease-out'
      }}
    >
      <Container maxW="container.xl">
        <Flex alignItems="center" justifyContent="center" gap={2}>
          <Text
            fontSize={{ base: 'sm', md: 'md' }}
            fontWeight="600"
            textAlign="center"
          >
            🎉 Première commande ? Profitez de <Text as="span" fontWeight="bold" fontSize={{ base: 'md', md: 'lg' }}>-10%</Text> avec le code{' '}
            <Text
              as="span"
              bg="rgba(255,255,255,0.25)"
              px={3}
              py={1}
              borderRadius="md"
              fontWeight="bold"
              letterSpacing="wider"
            >
              BIENVENUE10
            </Text>
          </Text>

          <IconButton
            icon={<FiX />}
            size="sm"
            variant="ghost"
            color="white"
            _hover={{ bg: 'rgba(255,255,255,0.2)' }}
            onClick={handleDismiss}
            aria-label="Fermer la bannière"
            position="absolute"
            right={{ base: 2, md: 4 }}
          />
        </Flex>
      </Container>
    </Box>
  )
}
