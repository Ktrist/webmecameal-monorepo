import { useEffect, useState } from 'react'
import { useSearchParams, Link as RouterLink } from 'react-router-dom'
import { supabase } from './supabaseClient'
import {
  Box, Container, Heading, Text, VStack, Button,
  Spinner, Center, Alert, AlertIcon,
  Divider, HStack, Badge
  // J'AI SUPPRIMÉ 'CheckCircleIcon' D'ICI
} from '@chakra-ui/react'

// J'AI GARDÉ CETTE LIGNE (car vous avez installé le paquet)
import { CheckCircleIcon } from '@chakra-ui/icons' 

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get('order_id')
  
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId) {
      setLoading(false)
      return
    }

    async function fetchOrder() {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            menus ( week_name )
          )
        `)
        .eq('id', orderId)
        .single()

      if (!error) {
        setOrder(data)
      }
      setLoading(false)
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return <Center h="50vh"><Spinner size="xl" /></Center>
  }

  if (!orderId || !order) {
    return (
      <Container py={10}>
        <Alert status="warning">
          <AlertIcon />
          Commande introuvable.
        </Alert>
        <Button as={RouterLink} to="/" mt={4}>Retour à l'accueil</Button>
      </Container>
    )
  }

  return (
    <Container maxW="container.md" py={16} textAlign="center">
      <VStack spacing={8}>
        <Box color="green.500">
          <CheckCircleIcon w={20} h={20} /> 
        </Box>
        
        <Heading as="h1" size="xl">Merci pour votre commande !</Heading>
        
        <Text fontSize="lg" color="gray.600">
          Votre commande <b>#{order.id}</b> a bien été enregistrée.
        </Text>

        <Box 
          w="full" 
          p={6} 
          borderWidth="1px" 
          borderRadius="lg" 
          bg="gray.50" 
          textAlign="left"
        >
          <Heading size="md" mb={4}>Détails de la livraison</Heading>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <Text color="gray.600">Date de livraison :</Text>
              <Text fontWeight="bold">
                {new Date(order.delivery_date).toLocaleDateString('fr-FR', { 
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
                })}
              </Text>
            </HStack>
            
            <HStack justify="space-between">
               <Text color="gray.600">Statut actuel :</Text>
               <Badge colorScheme={order.status === 'paid' ? 'green' : 'yellow'}>
                 {order.status === 'paid' ? 'Payé' : 'En attente de confirmation'}
               </Badge>
            </HStack>

            <Divider my={2} />

            <Text fontWeight="bold" mb={2}>Articles :</Text>
            {order.order_items.map((item, index) => (
              <HStack key={index} justify="space-between">
                <Text>
                  {item.quantity}x {item.menus?.week_name || 'Menu supprimé'}
                </Text>
                <Text>{(item.unit_price * item.quantity).toFixed(2)} €</Text>
              </HStack>
            ))}
            
            <Divider my={2} />
            
            <HStack justify="space-between">
              <Heading size="sm">Total</Heading>
              <Heading size="sm">{order.total_price} €</Heading>
            </HStack>
          </VStack>
        </Box>

        <Button as={RouterLink} to="/" colorScheme="teal" size="lg">
          Retour à l'accueil
        </Button>
      </VStack>
    </Container>
  )
}