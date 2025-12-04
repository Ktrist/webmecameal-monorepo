import { useState } from 'react'
import { Box, Container, Heading, Button, Text, VStack, Code, Alert, AlertIcon } from '@chakra-ui/react'
import { supabase } from './supabaseClient'

export default function TestStripePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const runTest = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const { data, error: funcError } = await supabase.functions.invoke('test-stripe-config')

      if (funcError) {
        throw funcError
      }

      setResult(data)
    } catch (err) {
      setError(err.message)
      console.error('Test error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box py={10} bg="gray.50" minH="100vh">
      <Container maxW="container.xl">
        <VStack spacing={6} align="stretch">
          <Heading>🧪 Test Configuration Stripe</Heading>

          <Text>
            Ce test vérifie que votre configuration Stripe est correcte et que tous les Price IDs existent
            dans le compte Stripe associé à votre STRIPE_SECRET_KEY.
          </Text>

          <Button
            colorScheme="blue"
            size="lg"
            onClick={runTest}
            isLoading={loading}
            loadingText="Test en cours..."
          >
            🚀 Lancer le test
          </Button>

          {error && (
            <Alert status="error">
              <AlertIcon />
              Erreur : {error}
            </Alert>
          )}

          {result && (
            <Box>
              {result.success ? (
                <Alert status={result.summary.allPricesExist ? 'success' : 'warning'} mb={4}>
                  <AlertIcon />
                  {result.summary.allPricesExist
                    ? '✅ Tous les Price IDs existent dans votre compte Stripe !'
                    : `⚠️ ${result.summary.missingPrices.length} Price ID(s) manquant(s)`}
                </Alert>
              ) : (
                <Alert status="error" mb={4}>
                  <AlertIcon />
                  ❌ {result.error}
                </Alert>
              )}

              <Box bg="white" p={6} borderRadius="md" shadow="sm">
                <Heading size="sm" mb={4}>
                  Résultats du test :
                </Heading>
                <Code display="block" whiteSpace="pre" p={4} borderRadius="md" fontSize="xs">
                  {JSON.stringify(result, null, 2)}
                </Code>
              </Box>

              {result.summary && !result.summary.allPricesExist && (
                <Alert status="warning" mt={4}>
                  <AlertIcon />
                  <VStack align="start" spacing={2}>
                    <Text fontWeight="bold">Price IDs manquants :</Text>
                    {result.summary.missingPrices.map((priceId) => (
                      <Code key={priceId}>{priceId}</Code>
                    ))}
                    <Text fontSize="sm" mt={2}>
                      ➡️ Soit créez ces Price IDs dans votre Stripe Dashboard, soit mettez à jour
                      STRIPE_SECRET_KEY pour utiliser le bon compte Stripe.
                    </Text>
                  </VStack>
                </Alert>
              )}
            </Box>
          )}
        </VStack>
      </Container>
    </Box>
  )
}
