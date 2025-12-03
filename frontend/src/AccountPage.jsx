import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate, Link as RouterLink, useSearchParams } from 'react-router-dom'
import { supabase } from './supabaseClient'
import {
  Container, Heading, Tabs, TabList, TabPanels, Tab, TabPanel,
  VStack, FormControl, FormLabel, Input, Button, useToast,
  Box, Text, Avatar, Flex, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Spinner, Center, IconButton, Alert, AlertIcon, AlertTitle, AlertDescription,
  // Imports pour le Modal de détail
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton, useDisclosure, Divider
} from '@chakra-ui/react'
import { ViewIcon } from '@chakra-ui/icons'
import { FiCheck, FiX } from 'react-icons/fi'

export default function AccountPage() {
  const { user, profile } = useOutletContext()
  const navigate = useNavigate()
  const toast = useToast()
  const [searchParams] = useSearchParams()

  const [loading, setLoading] = useState(false)

  // États du profil
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')

  // États pour l'historique
  const [orders, setOrders] = useState([])
  const [ordersLoading, setOrdersLoading] = useState(false)

  // États pour l'abonnement
  const [subscription, setSubscription] = useState(null)
  const [subscriptionLoading, setSubscriptionLoading] = useState(false)

  // États pour le Modal de Détail
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedOrder, setSelectedOrder] = useState(null)

  // 1. Sécurité
  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  // 2. Charger le Profil
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '')
      setLastName(profile.last_name || '')
      setPhone(profile.phone || '')
      setAddress(profile.address || '')
    }
  }, [profile])

  // 3. Charger l'Historique (AVEC LES ITEMS)
  useEffect(() => {
    async function fetchMyOrders() {
      if (!user) return
      setOrdersLoading(true)

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
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (!error) {
        setOrders(data)
      }
      setOrdersLoading(false)
    }
    fetchMyOrders()
  }, [user])

  // 4. Charger l'Abonnement
  useEffect(() => {
    async function fetchSubscription() {
      if (!user) return
      setSubscriptionLoading(true)

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing', 'past_due'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (!error && data) {
        setSubscription(data)
      }
      setSubscriptionLoading(false)
    }
    fetchSubscription()
  }, [user])

  // 5. Gérer le message de succès d'abonnement
  useEffect(() => {
    if (searchParams.get('subscription_success') === 'true') {
      toast({
        title: 'Abonnement activé !',
        description: 'Votre abonnement a été créé avec succès. Vous recevrez une confirmation par email.',
        status: 'success',
        duration: 5000,
        isClosable: true,
      })
      // Nettoyer l'URL
      navigate('/compte', { replace: true })
    }
  }, [searchParams, toast, navigate])

  const handleUpdateAddress = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          address: address,
          updated_at: new Date(),
        })
        .eq('id', user.id)

      if (error) throw error
      toast({ title: "Adresse mise à jour", status: "success", duration: 3000 })
    } catch (error) {
      toast({ title: "Erreur", description: error.message, status: "error" })
    } finally {
      setLoading(false)
    }
  }

  // Fonction pour ouvrir le détail
  const handleOpenDetail = (order) => {
    setSelectedOrder(order)
    onOpen()
  }

  if (!user) return null

  return (
    <Container maxW="container.lg" py={10}>
      <Flex align="center" mb={8}>
        <Avatar size="xl" name={`${firstName} ${lastName}`} src={null} bg="brand.green" color="white" mr={6} />
        <Box>
          <Heading size="lg">Mon Espace</Heading>
          <Text color="gray.600">{user?.email}</Text>
        </Box>
      </Flex>

      <Tabs colorScheme="teal" variant="enclosed">
        <TabList>
          <Tab fontWeight="bold">Mes Informations</Tab>
          <Tab fontWeight="bold">Mon Abonnement</Tab>
          <Tab fontWeight="bold">Historique des Commandes</Tab>
        </TabList>

        <TabPanels>
          {/* PANNEAU 1 : PROFIL */}
          <TabPanel borderWidth="1px" borderTopWidth="0" borderRadius="0 0 md md" p={6}>
            <form onSubmit={handleUpdateAddress}>
              <VStack spacing={5} align="stretch" maxW="md">
                <Box>
                    <Heading size="sm" mb={4}>Informations Personnelles</Heading>
                    <Text fontSize="xs" color="gray.500" mb={2}>Non modifiables.</Text>
                    <Flex gap={4} mb={4}>
                        <FormControl>
                            <FormLabel fontSize="sm" color="gray.500">Prénom</FormLabel>
                            <Input value={firstName} isReadOnly bg="gray.100" border="none" />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm" color="gray.500">Nom</FormLabel>
                            <Input value={lastName} isReadOnly bg="gray.100" border="none" />
                        </FormControl>
                    </Flex>
                    <FormControl>
                        <FormLabel fontSize="sm" color="gray.500">Téléphone</FormLabel>
                        <Input value={phone} isReadOnly bg="gray.100" border="none" />
                    </FormControl>
                </Box>
                <Box pt={4}>
                    <Heading size="sm" mb={4}>Adresse de Livraison par défaut</Heading>
                    <FormControl>
                        <FormLabel>Adresse du bureau</FormLabel>
                        <Input value={address} onChange={(e) => setAddress(e.target.value)} bg="white" />
                    </FormControl>
                </Box>
                <Button type="submit" colorScheme="teal" isLoading={loading} mt={2}>
                  Mettre à jour l'adresse
                </Button>
              </VStack>
            </form>
          </TabPanel>

          {/* PANNEAU 2 : ABONNEMENT */}
          <TabPanel borderWidth="1px" borderTopWidth="0" borderRadius="0 0 md md" p={6}>
            {subscriptionLoading ? (
              <Center py={10}><Spinner /></Center>
            ) : subscription ? (
              <VStack align="stretch" spacing={6} maxW="2xl">
                {/* Alerte de statut */}
                {subscription.status === 'past_due' && (
                  <Alert status="warning" borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle>Paiement en attente</AlertTitle>
                      <AlertDescription>
                        Le dernier paiement n'a pas pu être effectué. Veuillez vérifier vos informations bancaires.
                      </AlertDescription>
                    </Box>
                  </Alert>
                )}

                {/* Carte de l'abonnement actif */}
                <Box borderWidth="2px" borderColor="green.400" borderRadius="lg" p={6} bg="green.50">
                  <Flex align="center" justify="space-between" mb={4}>
                    <Heading size="md">Abonnement Actif</Heading>
                    <Badge colorScheme="green" fontSize="md" px={3} py={1} borderRadius="full">
                      {subscription.status === 'active' ? 'Actif' :
                       subscription.status === 'trialing' ? 'Période d\'essai' :
                       subscription.status === 'past_due' ? 'En retard' : subscription.status}
                    </Badge>
                  </Flex>

                  <VStack align="stretch" spacing={4}>
                    {/* Type de plan */}
                    <Flex justify="space-between">
                      <Text fontWeight="bold" color="gray.600">Formule :</Text>
                      <Text fontSize="lg" fontWeight="bold">
                        {subscription.plan_type === 'hebdo_2j' ? 'Hebdo 2 jours' :
                         subscription.plan_type === 'hebdo_3j' ? 'Hebdo 3 jours' :
                         subscription.plan_type === 'hebdo_5j' ? 'Hebdo 5 jours' :
                         subscription.plan_type === 'mensuel' ? 'Mensuel Flexible' :
                         subscription.plan_type}
                      </Text>
                    </Flex>

                    {/* Prix */}
                    <Flex justify="space-between">
                      <Text fontWeight="bold" color="gray.600">Montant :</Text>
                      <Text fontSize="2xl" fontWeight="bold" color="brand.green">
                        {subscription.amount} € / {subscription.plan_type.startsWith('hebdo') ? 'semaine' : 'mois'}
                      </Text>
                    </Flex>

                    <Divider />

                    {/* Dates */}
                    <Flex justify="space-between">
                      <Text color="gray.600">Début de période :</Text>
                      <Text fontWeight="semibold">
                        {new Date(subscription.current_period_start).toLocaleDateString('fr-FR')}
                      </Text>
                    </Flex>

                    <Flex justify="space-between">
                      <Text color="gray.600">Prochain paiement :</Text>
                      <Text fontWeight="semibold">
                        {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
                      </Text>
                    </Flex>

                    {subscription.cancel_at_period_end && (
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <AlertDescription>
                          Votre abonnement sera annulé le {new Date(subscription.current_period_end).toLocaleDateString('fr-FR')}
                        </AlertDescription>
                      </Alert>
                    )}
                  </VStack>
                </Box>

                {/* Actions de gestion (placeholder pour US-007) */}
                <Box borderWidth="1px" borderRadius="lg" p={6}>
                  <Heading size="sm" mb={4}>Gestion de l'abonnement</Heading>
                  <VStack spacing={3} align="stretch">
                    <Button variant="outline" colorScheme="gray" isDisabled>
                      Mettre en pause (Bientôt disponible)
                    </Button>
                    <Button variant="outline" colorScheme="red" isDisabled>
                      Annuler l'abonnement (Bientôt disponible)
                    </Button>
                    <Text fontSize="xs" color="gray.500" mt={2}>
                      Pour modifier votre abonnement, contactez-nous à support@webmecameal.fr
                    </Text>
                  </VStack>
                </Box>
              </VStack>
            ) : (
              <VStack py={10} spacing={4}>
                <Box textAlign="center" mb={4}>
                  <FiX size={48} color="gray" />
                </Box>
                <Heading size="md" color="gray.600">Aucun abonnement actif</Heading>
                <Text color="gray.500" textAlign="center">
                  Vous n'avez pas encore d'abonnement. Découvrez nos formules pour profiter de repas réguliers !
                </Text>
                <Button as={RouterLink} to="/abonnements" colorScheme="teal" size="lg" mt={4}>
                  Découvrir nos abonnements
                </Button>
              </VStack>
            )}
          </TabPanel>

          {/* PANNEAU 3 : HISTORIQUE */}
          <TabPanel borderWidth="1px" borderTopWidth="0" borderRadius="0 0 md md" p={6}>
            {ordersLoading ? (
              <Center py={10}><Spinner /></Center>
            ) : orders.length === 0 ? (
              <VStack py={10} spacing={4}>
                <Text>Vous n'avez pas encore passé de commande.</Text>
                <Button as={RouterLink} to="/" colorScheme="teal" variant="outline">
                  Voir les menus
                </Button>
              </VStack>
            ) : (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>N°</Th>
                      <Th>Date</Th>
                      <Th>Total</Th>
                      <Th>Statut</Th>
                      <Th>Détail</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {orders.map((order) => (
                      <Tr key={order.id}>
                        <Td fontWeight="bold">#{order.id}</Td>
                        <Td>{new Date(order.created_at).toLocaleDateString()}</Td>
                        <Td>{order.total_price} €</Td>
                        <Td>
                          <Badge 
                            colorScheme={
                              order.status === 'paid' ? 'green' : 
                              order.status === 'delivered' ? 'blue' : 
                              order.status === 'cancelled' ? 'red' : 'yellow'
                            }
                          >
                            {order.status === 'paid' ? 'Payé' : order.status}
                          </Badge>
                        </Td>
                        <Td>
                          <IconButton 
                            icon={<ViewIcon />} 
                            size="sm" 
                            onClick={() => handleOpenDetail(order)}
                            aria-label="Voir le détail"
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* MODAL DE DÉTAIL */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Commande #{selectedOrder?.id}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedOrder && (
              <VStack align="stretch" spacing={4}>
                <Box>
                    <Text fontWeight="bold" color="gray.500" fontSize="sm">Livré à :</Text>
                    <Text>{selectedOrder.shipping_name}</Text>
                    <Text>{selectedOrder.shipping_address}</Text>
                </Box>
                <Divider />
                <Box>
                    <Text fontWeight="bold" color="gray.500" fontSize="sm" mb={2}>Articles :</Text>
                    {selectedOrder.order_items.map((item, idx) => (
                        <Flex key={idx} justify="space-between" mb={2}>
                            <Text>
                                {item.quantity}x {item.menus?.week_name || "Menu supprimé"}
                            </Text>
                            <Text fontWeight="bold">
                                {(item.unit_price * item.quantity).toFixed(2)} €
                            </Text>
                        </Flex>
                    ))}
                </Box>
                <Divider />
                <Flex justify="space-between" align="center">
                    <Text fontSize="lg" fontWeight="bold">Total payé</Text>
                    <Text fontSize="xl" fontWeight="bold" color="brand.green">
                        {selectedOrder.total_price} €
                    </Text>
                </Flex>
                {selectedOrder.comments && (
                    <Box bg="yellow.50" p={3} borderRadius="md">
                        <Text fontSize="sm" fontWeight="bold">Note :</Text>
                        <Text fontSize="sm">{selectedOrder.comments}</Text>
                    </Box>
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Fermer</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Container>
  )
}