import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useCart } from './CartContext'
import { useOutletContext, useNavigate } from 'react-router-dom'
import {
  Container, Heading, VStack, FormControl, FormLabel, Input,
  Textarea, Button, useToast, Spinner, Center, Text,
  Box, HStack, Divider, Radio, RadioGroup, Stack
} from '@chakra-ui/react'
import { isDeliverable } from './utils/deliveryZones'

export default function CheckoutPage() {
  const { profile, user } = useOutletContext()
  const { cartItems, total, clearCart } = useCart()
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // États du formulaire
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [comments, setComments] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('cb') 

  // 1. Pré-remplir le formulaire (MAIS laisser modifiable)
  useEffect(() => {
    if (cartItems.length === 0) {
      navigate('/')
    }
    if (profile) {
      setEmail(profile.email || '')
      setFirstName(profile.first_name || '')
      setLastName(profile.last_name || '')
      setPhone(profile.phone || '')
      setAddress(profile.address || '') // Adresse par défaut du profil
      setLoading(false)
    }
  }, [profile, cartItems, navigate])

  const handleValidateOrder = async (e) => {
    e.preventDefault()
    if (!deliveryDate) {
      toast({ title: "Date de livraison requise.", status: "warning" })
      return
    }

    // Extraire le code postal de l'adresse (derniers 5 chiffres)
    const postalCodeMatch = address.match(/\b\d{5}\b/)
    if (!postalCodeMatch) {
      toast({
        title: "Adresse invalide",
        description: "Veuillez inclure un code postal valide dans votre adresse (5 chiffres)",
        status: "warning"
      })
      return
    }

    const postalCode = postalCodeMatch[0]
    if (!isDeliverable(postalCode)) {
      toast({
        title: "Zone non desservie",
        description: `Désolé, nous ne livrons pas au code postal ${postalCode}. Zones livrables : 74000, 74370, 74600, 74940, 74960`,
        status: "error",
        duration: 5000
      })
      return
    }

    setIsSubmitting(true)

    try {
      // 2. Créer la commande AVEC les infos spécifiques de livraison
      const shippingName = `${firstName} ${lastName}`.trim()

      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          delivery_date: deliveryDate,
          comments: comments,
          status: 'pending',
          total_price: total,
          // NOUVEAU : On enregistre les infos de ce formulaire spécifique
          shipping_name: shippingName,
          shipping_phone: phone,
          shipping_address: address
        })
        .select()
        .single();
  
      if (orderError) throw orderError;
  
      // 3. Créer les lignes de commande
      const itemsToInsert = cartItems.map((item) => ({
        menu_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        order_id: orderData.id,
      }));
  
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(itemsToInsert);
  
      if (itemsError) throw itemsError;

      // 4. Gestion du Paiement
      if (paymentMethod === 'cb') {
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
          'create-stripe-checkout', 
          {
            body: { 
              cartItems: cartItems,
              orderId: orderData.id 
            }
          }
        )

        if (paymentError) throw paymentError

        if (paymentData?.url) {
          clearCart()
          window.location.href = paymentData.url 
          return 
        }

      } else {
        toast({
          title: 'Commande enregistrée !',
          description: 'Le paiement se fera à la livraison.',
          status: 'success',
          duration: 5000,
        });
        clearCart();
        navigate('/'); 
      }
  
    } catch (error) {
      console.error("Erreur commande:", error)
      toast({ title: 'Erreur', description: error.message, status: 'error' })
      setIsSubmitting(false); 
    }
  };

  if (loading) {
    return <Center h="50vh"><Spinner size="xl" /></Center>
  }

  return (
    <Container maxW="container.lg" py={10}>
      <Heading mb={6}>Valider ma commande</Heading>
      <HStack align="flex-start" spacing={10}>
        <VStack as="form" onSubmit={handleValidateOrder} spacing={4} align="stretch" flex={2}>
          
          <Heading size="md" mb={2}>1. Informations de Livraison</Heading>
          <Text fontSize="sm" color="gray.500" mb={2}>
            Pré-rempli avec votre profil. Modifiez si vous commandez pour quelqu'un d'autre.
          </Text>
          
          <HStack>
            {/* 5. CHAMPS MODIFIABLES (Plus de isReadOnly) */}
            <FormControl isRequired>
              <FormLabel>Prénom</FormLabel>
              <Input 
                value={firstName} 
                onChange={(e) => setFirstName(e.target.value)} 
                bg="white" 
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Nom</FormLabel>
              <Input 
                value={lastName} 
                onChange={(e) => setLastName(e.target.value)} 
                bg="white" 
              />
            </FormControl>
          </HStack>

          <FormControl isRequired>
            <FormLabel>Téléphone pour la livraison</FormLabel>
            <Input 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              bg="white" 
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Adresse de livraison (Bureau)</FormLabel>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              bg="white"
              placeholder="Ex: 12 rue de la Gare, 74000 Annecy"
            />
            <Text fontSize="sm" color="gray.600" mt={1}>
              ⚠️ Zones livrables : 74000, 74370, 74600, 74940, 74960 (Annecy et environs)
            </Text>
          </FormControl>

          <Heading size="md" mb={2} mt={6}>2. Date & Paiement</Heading>
          <FormControl isRequired>
            <FormLabel>Date de livraison souhaitée</FormLabel>
            <Input 
              type="date" 
              min={new Date().toISOString().split("T")[0]}
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </FormControl>

          <FormControl as="fieldset" isRequired mt={4}>
            <FormLabel as="legend">Moyen de paiement</FormLabel>
            <RadioGroup onChange={setPaymentMethod} value={paymentMethod}>
              <Stack direction="column">
                <Radio value="cb">Carte Bancaire (Stripe Sécurisé)</Radio>
                <Radio value="ticket_resto">Tickets Restaurant (à la livraison)</Radio>
                <Radio value="sur_place">Paiement sur place</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
          
          <FormControl mt={4}>
            <FormLabel>Commentaire</FormLabel>
            <Textarea placeholder="Ex: Pas de coriandre..." value={comments} onChange={(e) => setComments(e.target.value)} />
          </FormControl>
          
          <Button type="submit" colorScheme="green" size="lg" mt={6} isLoading={isSubmitting}>
            {paymentMethod === 'cb' ? `Payer ${total.toFixed(2)} €` : 'Valider la commande'}
          </Button>
        </VStack>
        
        <Box flex={1} p={6} borderWidth="1px" borderRadius="lg" position="sticky" top={10}>
          <Heading size="md" mb={4}>Récapitulatif</Heading>
          <VStack spacing={4} align="stretch">
            {cartItems.map(item => (
              <HStack key={item.id} justifyContent="space-between">
                <Text>{item.week_name} (x{item.quantity})</Text>
                <Text fontWeight="bold">{(item.price * item.quantity).toFixed(2)} €</Text>
              </HStack>
            ))}
            <Divider />
            <HStack justifyContent="space-between">
              <Text fontSize="lg" fontWeight="bold">Total</Text>
              <Text fontSize="lg" fontWeight="bold">{total.toFixed(2)} €</Text>
            </HStack>
          </VStack>
        </Box>
      </HStack>
    </Container>
  )
}