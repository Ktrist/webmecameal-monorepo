import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import { useCart } from './CartContext'
import { useOutletContext, useNavigate } from 'react-router-dom'
import {
  Container, Heading, VStack, FormControl, FormLabel, Input,
  Textarea, Button, useToast, Spinner, Center, Text,
  Box, HStack, Divider, Radio, RadioGroup, Stack, Flex
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

  // Promo code states
  const [promoCode, setPromoCode] = useState('')
  const [appliedPromo, setAppliedPromo] = useState(null)
  const [promoError, setPromoError] = useState('')
  const [isCheckingPromo, setIsCheckingPromo] = useState(false) 

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

  // Calculate discount and final total
  const calculateDiscount = () => {
    if (!appliedPromo) return 0

    if (appliedPromo.discount_type === 'percentage') {
      return (total * appliedPromo.discount_value) / 100
    } else {
      return Math.min(appliedPromo.discount_value, total)
    }
  }

  const discount = calculateDiscount()
  const finalTotal = Math.max(0, total - discount)

  // Validate and apply promo code
  const handleApplyPromo = async () => {
    if (!promoCode.trim()) {
      setPromoError('Veuillez entrer un code promo')
      return
    }

    setIsCheckingPromo(true)
    setPromoError('')

    try {
      // Fetch promo code from database
      const { data: promoData, error: promoFetchError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', promoCode.toUpperCase())
        .eq('is_active', true)
        .single()

      if (promoFetchError || !promoData) {
        setPromoError('Code promo invalide ou expiré')
        setIsCheckingPromo(false)
        return
      }

      // Check validity dates
      const now = new Date()
      const validFrom = new Date(promoData.valid_from)
      const validUntil = promoData.valid_until ? new Date(promoData.valid_until) : null

      if (now < validFrom || (validUntil && now > validUntil)) {
        setPromoError('Ce code promo n\'est pas valide actuellement')
        setIsCheckingPromo(false)
        return
      }

      // Check max uses
      if (promoData.max_uses && promoData.current_uses >= promoData.max_uses) {
        setPromoError('Ce code promo a atteint sa limite d\'utilisation')
        setIsCheckingPromo(false)
        return
      }

      // Check minimum order amount
      if (promoData.min_order_amount && total < promoData.min_order_amount) {
        setPromoError(`Montant minimum de commande : ${promoData.min_order_amount}€`)
        setIsCheckingPromo(false)
        return
      }

      // Check if first order only
      if (promoData.first_order_only) {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('status', 'paid')

        if (count > 0) {
          setPromoError('Ce code est réservé aux premières commandes uniquement')
          setIsCheckingPromo(false)
          return
        }
      }

      // Check if user already used this code
      const { data: usageData } = await supabase
        .from('promo_code_usage')
        .select('*')
        .eq('promo_code_id', promoData.id)
        .eq('user_id', user.id)
        .maybeSingle()

      if (usageData) {
        setPromoError('Vous avez déjà utilisé ce code promo')
        setIsCheckingPromo(false)
        return
      }

      // All validations passed - apply promo
      setAppliedPromo(promoData)
      toast({
        title: '✅ Code promo appliqué !',
        description: promoData.description,
        status: 'success',
        duration: 3000,
      })
    } catch (error) {
      console.error('Error validating promo code:', error)
      setPromoError('Erreur lors de la validation du code')
    } finally {
      setIsCheckingPromo(false)
    }
  }

  const handleRemovePromo = () => {
    setAppliedPromo(null)
    setPromoCode('')
    setPromoError('')
  }

  const handleValidateOrder = async (e) => {
    e.preventDefault()
    if (!deliveryDate) {
      toast({ title: "Date de livraison requise.", status: "warning" })
      return
    }

    // Validation adresse complète
    if (!address || address.trim().length < 10) {
      toast({
        title: "Adresse incomplète",
        description: "Veuillez saisir une adresse complète (numéro, rue, code postal, ville)",
        status: "warning"
      })
      return
    }

    // Extraire le code postal de l'adresse
    const postalCodeMatch = address.match(/\b\d{5}\b/)
    if (!postalCodeMatch) {
      toast({
        title: "Code postal manquant",
        description: "Veuillez inclure votre code postal dans l'adresse (5 chiffres). Exemple: 12 rue de la Gare, 74000 Annecy",
        status: "warning",
        duration: 4000
      })
      return
    }

    const postalCode = postalCodeMatch[0]
    if (!isDeliverable(postalCode)) {
      toast({
        title: "Zone non desservie",
        description: `Désolé, nous ne livrons pas au code postal ${postalCode}. Zones livrables : 74000, 74370, 74600, 74940, 74960 (Annecy et environs)`,
        status: "error",
        duration: 5000
      })
      return
    }

    // Vérifier que l'adresse contient plus que juste le code postal
    const addressWithoutPostalCode = address.replace(postalCode, '').trim()
    if (addressWithoutPostalCode.length < 5) {
      toast({
        title: "Adresse incomplète",
        description: "Veuillez indiquer le numéro et le nom de la rue en plus du code postal",
        status: "warning"
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
          total_price: finalTotal,
          promo_code_id: appliedPromo ? appliedPromo.id : null,
          discount_amount: discount,
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

      // Record promo code usage if applicable
      if (appliedPromo) {
        const { error: usageError } = await supabase
          .from('promo_code_usage')
          .insert({
            promo_code_id: appliedPromo.id,
            user_id: user.id,
            order_id: orderData.id,
            discount_applied: discount
          })

        if (usageError) console.error('Error recording promo usage:', usageError)

        // Increment current_uses
        await supabase
          .from('promo_codes')
          .update({ current_uses: appliedPromo.current_uses + 1 })
          .eq('id', appliedPromo.id)
      }

      // 4. Gestion du Paiement
      if (paymentMethod === 'cb') {
        const { data: paymentData, error: paymentError } = await supabase.functions.invoke(
          'create-stripe-checkout',
          {
            body: {
              cartItems: cartItems,
              orderId: orderData.id,
              discount: discount,
              finalTotal: finalTotal
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
      <Stack direction={{ base: 'column', md: 'row' }} align="flex-start" spacing={10}>
        <VStack as="form" onSubmit={handleValidateOrder} spacing={4} align="stretch" flex={2}>
          
          <Heading size="md" mb={2}>1. Informations de Livraison</Heading>
          <Text fontSize="sm" color="gray.500" mb={2}>
            Pré-rempli avec votre profil. Modifiez si vous commandez pour quelqu'un d'autre.
          </Text>
          
          <Stack direction={{ base: 'column', md: 'row' }} spacing={4}>
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
          </Stack>

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
          
          {/* Promo Code Section */}
          <Box mt={6} p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
            <Heading size="sm" mb={3}>Code promo</Heading>
            {!appliedPromo ? (
              <HStack>
                <Input
                  placeholder="Entrez votre code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                  bg="white"
                  isInvalid={!!promoError}
                />
                <Button
                  onClick={handleApplyPromo}
                  isLoading={isCheckingPromo}
                  colorScheme="teal"
                  flexShrink={0}
                >
                  Appliquer
                </Button>
              </HStack>
            ) : (
              <Flex
                p={3}
                bg="green.50"
                borderWidth="1px"
                borderColor="green.200"
                borderRadius="md"
                justify="space-between"
                align="center"
              >
                <Box>
                  <Text fontWeight="bold" color="green.700">
                    {appliedPromo.code}
                  </Text>
                  <Text fontSize="sm" color="green.600">
                    -{discount.toFixed(2)} €
                  </Text>
                </Box>
                <Button size="sm" variant="ghost" onClick={handleRemovePromo}>
                  Retirer
                </Button>
              </Flex>
            )}
            {promoError && (
              <Text fontSize="sm" color="red.500" mt={2}>
                {promoError}
              </Text>
            )}
          </Box>

          <Button type="submit" colorScheme="green" size="lg" mt={6} isLoading={isSubmitting}>
            {paymentMethod === 'cb' ? `Payer ${finalTotal.toFixed(2)} €` : 'Valider la commande'}
          </Button>
        </VStack>
        
        <Box
          flex={1}
          p={6}
          borderWidth="1px"
          borderRadius="lg"
          position={{ base: 'relative', md: 'sticky' }}
          top={{ base: 'auto', md: 10 }}
        >
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
              <Text>Sous-total</Text>
              <Text fontWeight="medium">{total.toFixed(2)} €</Text>
            </HStack>

            {appliedPromo && (
              <HStack justifyContent="space-between" color="green.600">
                <Text>Code promo ({appliedPromo.code})</Text>
                <Text fontWeight="medium">-{discount.toFixed(2)} €</Text>
              </HStack>
            )}

            <Divider />
            <HStack justifyContent="space-between">
              <Text fontSize="lg" fontWeight="bold">Total</Text>
              <Text fontSize="lg" fontWeight="bold" color="brand.green">
                {finalTotal.toFixed(2)} €
              </Text>
            </HStack>

            {appliedPromo && (
              <Box bg="green.50" p={3} borderRadius="md" borderWidth="1px" borderColor="green.200">
                <Text fontSize="sm" color="green.700" textAlign="center">
                  🎉 Vous économisez {discount.toFixed(2)} € !
                </Text>
              </Box>
            )}
          </VStack>
        </Box>
      </Stack>
    </Container>
  )
}