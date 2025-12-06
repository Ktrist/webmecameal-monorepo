import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'
import {
  Container,
  Heading,
  Text,
  Spinner,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Select,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Box,
  HStack,
  Input,
  Button,
  FormControl,
  FormLabel,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Divider,
  Flex,
} from '@chakra-ui/react'
import { FiEye, FiRefreshCw } from 'react-icons/fi'

// Order Detail Modal Component
function OrderDetailModal({ order, isOpen, onClose }) {
  const [orderItems, setOrderItems] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (order && isOpen) {
      fetchOrderItems()
    }
  }, [order, isOpen])

  const fetchOrderItems = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('order_items')
        .select('*, menus(week_name, price)')
        .eq('order_id', order.id)

      if (error) throw error
      setOrderItems(data)
    } catch (error) {
      console.error('Error fetching order items:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!order) return null

  const getClientName = (profile) => {
    if (!profile) return 'Utilisateur supprimé'
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return profile.email || 'N/A'
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'yellow', label: '⏳ En attente' },
      paid: { color: 'green', label: '✓ Payé' },
      preparing: { color: 'blue', label: '👨‍🍳 En préparation' },
      delivered: { color: 'teal', label: '✓ Livré' },
      cancelled: { color: 'red', label: '✗ Annulé' }
    }
    const config = statusConfig[status] || { color: 'gray', label: status }
    return <Badge colorScheme={config.color} fontSize="md" px={3} py={1}>{config.label}</Badge>
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Flex justify="space-between" align="center">
            <Box>
              <Text>Commande #{order.id}</Text>
              <Text fontSize="sm" fontWeight="normal" color="gray.500">
                {new Date(order.created_at).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Text>
            </Box>
            {getStatusBadge(order.status)}
          </Flex>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack align="stretch" spacing={4}>
            {/* Client Info */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>👤 Client</Text>
              <Box p={3} bg="gray.50" borderRadius="md">
                <Text fontWeight="medium">{getClientName(order.profiles)}</Text>
                {order.profiles?.email && (
                  <Text fontSize="sm" color="gray.600">{order.profiles.email}</Text>
                )}
              </Box>
            </Box>

            {/* Delivery Info */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>📍 Livraison</Text>
              <Box p={3} bg="gray.50" borderRadius="md">
                <Text fontSize="sm"><strong>Date :</strong> {new Date(order.delivery_date).toLocaleDateString('fr-FR')}</Text>
                {order.shipping_address && (
                  <Text fontSize="sm" mt={1}><strong>Adresse :</strong> {order.shipping_address}</Text>
                )}
                {order.shipping_phone && (
                  <Text fontSize="sm" mt={1}><strong>Tél :</strong> {order.shipping_phone}</Text>
                )}
              </Box>
            </Box>

            {/* Order Items */}
            <Box>
              <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>🛒 Articles</Text>
              {loading ? (
                <Center py={4}><Spinner /></Center>
              ) : (
                <VStack align="stretch" spacing={2}>
                  {orderItems.map((item) => (
                    <Flex
                      key={item.id}
                      p={3}
                      bg="white"
                      borderWidth="1px"
                      borderRadius="md"
                      justify="space-between"
                      align="center"
                    >
                      <Box>
                        <Text fontWeight="medium">{item.menus?.week_name || 'Menu supprimé'}</Text>
                        <Text fontSize="sm" color="gray.600">
                          {item.quantity} × {item.unit_price.toFixed(2)} €
                        </Text>
                      </Box>
                      <Text fontWeight="bold">{(item.quantity * item.unit_price).toFixed(2)} €</Text>
                    </Flex>
                  ))}
                </VStack>
              )}
            </Box>

            {/* Promo Code */}
            {order.promo_code_id && order.discount_amount > 0 && (
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>🎁 Code Promo</Text>
                <Box p={3} bg="green.50" borderWidth="1px" borderColor="green.200" borderRadius="md">
                  <Text color="green.700" fontWeight="medium">
                    Réduction appliquée : -{order.discount_amount.toFixed(2)} €
                  </Text>
                </Box>
              </Box>
            )}

            {/* Comments */}
            {order.comments && (
              <Box>
                <Text fontSize="sm" fontWeight="bold" color="gray.600" mb={2}>💬 Commentaire</Text>
                <Box p={3} bg="gray.50" borderRadius="md">
                  <Text fontSize="sm">{order.comments}</Text>
                </Box>
              </Box>
            )}

            <Divider />

            {/* Total */}
            <Flex justify="space-between" align="center" p={3} bg="teal.50" borderRadius="md">
              <Text fontSize="lg" fontWeight="bold">Total</Text>
              <Text fontSize="xl" fontWeight="bold" color="brand.green">
                {order.total_price.toFixed(2)} €
              </Text>
            </Flex>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

// Le composant OrdersTable
function OrdersTable({ orders, onStatusChange, onViewDetails }) {
  if (orders.length === 0) {
    return (
      <Box p={8} textAlign="center" bg="gray.50" borderRadius="md">
        <Text color="gray.500">Aucune commande ne correspond à vos critères.</Text>
      </Box>
    )
  }

  const getClientName = (profile) => {
    if (!profile) return 'Utilisateur supprimé'
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return profile.email || 'N/A'
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      paid: 'green',
      preparing: 'blue',
      delivered: 'teal',
      cancelled: 'red'
    }
    return colors[status] || 'gray'
  }

  return (
    <TableContainer borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
      <Table variant="simple">
        <Thead bg="gray.50">
          <Tr>
            <Th>ID</Th>
            <Th>Client</Th>
            <Th>Date Livraison</Th>
            <Th>Statut</Th>
            <Th isNumeric>Total</Th>
            <Th>Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders.map((order) => (
            <Tr key={order.id} _hover={{ bg: 'gray.50' }}>
              <Td>
                <Badge colorScheme="gray" fontSize="xs">
                  #{order.id}
                </Badge>
              </Td>
              <Td>
                <Text fontSize="sm" fontWeight="medium">{getClientName(order.profiles)}</Text>
                {order.profiles?.email && (
                  <Text fontSize="xs" color="gray.500">{order.profiles.email}</Text>
                )}
              </Td>
              <Td>
                <Text fontSize="sm">
                  {new Date(order.delivery_date).toLocaleDateString('fr-FR')}
                </Text>
              </Td>
              <Td>
                <Select
                  size="sm"
                  value={order.status}
                  onChange={(e) => onStatusChange(order.id, e.target.value)}
                  colorScheme={getStatusColor(order.status)}
                  borderWidth="2px"
                  borderColor={`${getStatusColor(order.status)}.300`}
                  _hover={{ borderColor: `${getStatusColor(order.status)}.400` }}
                  fontWeight="medium"
                  maxW="180px"
                >
                  <option value="pending">⏳ En attente</option>
                  <option value="paid">✓ Payé</option>
                  <option value="preparing">👨‍🍳 Préparation</option>
                  <option value="delivered">✓ Livré</option>
                  <option value="cancelled">✗ Annulé</option>
                </Select>
              </Td>
              <Td isNumeric>
                <Text fontWeight="bold" color="brand.green">
                  {order.total_price.toFixed(2)} €
                </Text>
                {order.discount_amount > 0 && (
                  <Text fontSize="xs" color="green.600">
                    (-{order.discount_amount.toFixed(2)} €)
                  </Text>
                )}
              </Td>
              <Td>
                <IconButton
                  icon={<FiEye />}
                  size="sm"
                  colorScheme="teal"
                  variant="ghost"
                  onClick={() => onViewDetails(order)}
                  aria-label="Voir détails"
                />
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  )
}

// La page principale (avec les filtres)
export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [tabIndex, setTabIndex] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  // Nouveaux états pour les filtres
  const [filterId, setFilterId] = useState('')
  const [filterDate, setFilterDate] = useState('')

  // Le fetch dépend maintenant de 'tabIndex' ET des filtres
  useEffect(() => {
    fetchOrders()
  }, [tabIndex, filterId, filterDate])

  const fetchOrders = async () => {
    setLoading(true)
    try {
      let query = supabase
        .from('orders')
        .select('id, created_at, delivery_date, status, total_price, comments, promo_code_id, discount_amount, profiles ( email, first_name, last_name )')

      // Logique de filtrage par onglet
      if (tabIndex === 0) {
        query = query.not('status', 'in', '("delivered", "cancelled")')
      } else {
        query = query.in('status', ['delivered', 'cancelled'])
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // Client-side filtering for partial ID match
      let filteredData = data
      if (filterId) {
        filteredData = filteredData.filter(order =>
          order.id.toLowerCase().includes(filterId.toLowerCase())
        )
      }
      if (filterDate) {
        filteredData = filteredData.filter(order =>
          order.delivery_date === filterDate
        )
      }

      setOrders(filteredData)
    } catch (error) {
      console.error('Erreur fetch commandes:', error.message)
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les commandes',
        status: 'error'
      })
    } finally {
      setLoading(false)
    }
  }

  // La fonction de mise à jour
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      if (error) throw error

      toast({
        title: 'Statut mis à jour !',
        status: 'success',
        duration: 2000
      })

      // Refresh orders to reflect changes
      fetchOrders()
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        status: 'error'
      })
    }
  }

  const handleViewDetails = (order) => {
    setSelectedOrder(order)
    onOpen()
  }

  const handleClearFilters = () => {
    setFilterId('')
    setFilterDate('')
  }

  return (
    <Container maxW="container.xl" py={6}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Gestion des Commandes</Heading>
        <Button
          leftIcon={<FiRefreshCw />}
          onClick={fetchOrders}
          isLoading={loading}
          colorScheme="teal"
          variant="outline"
        >
          Actualiser
        </Button>
      </Flex>

      {/* Formulaire de filtres */}
      <Box mb={6} p={6} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
        <Heading size="sm" mb={4}>Filtres de recherche</Heading>
        <HStack spacing={4} align="end">
          <FormControl flex={1}>
            <FormLabel fontSize="sm">ID Commande (partiel)</FormLabel>
            <Input
              placeholder="Ex: a3b2c..."
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
              bg="white"
            />
          </FormControl>
          <FormControl flex={1}>
            <FormLabel fontSize="sm">Date de Livraison</FormLabel>
            <Input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              bg="white"
            />
          </FormControl>
          <Button
            onClick={handleClearFilters}
            variant="ghost"
            isDisabled={!filterId && !filterDate}
          >
            Réinitialiser
          </Button>
        </HStack>
      </Box>

      {/* Conteneur d'onglets */}
      <Tabs
        index={tabIndex}
        onChange={(index) => setTabIndex(index)}
        colorScheme="teal"
        variant="enclosed"
      >
        <TabList borderBottomWidth="2px">
          <Tab fontWeight="medium">
            📋 Commandes Actives
            {!loading && tabIndex === 0 && (
              <Badge ml={2} colorScheme="teal">{orders.length}</Badge>
            )}
          </Tab>
          <Tab fontWeight="medium">
            📦 Historique
            {!loading && tabIndex === 1 && (
              <Badge ml={2} colorScheme="gray">{orders.length}</Badge>
            )}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={6}>
            {loading ? (
              <Center py={20}>
                <Spinner size="xl" color="teal.500" thickness="4px" />
              </Center>
            ) : (
              <OrdersTable
                orders={orders}
                onStatusChange={handleStatusChange}
                onViewDetails={handleViewDetails}
              />
            )}
          </TabPanel>
          <TabPanel p={6}>
            {loading ? (
              <Center py={20}>
                <Spinner size="xl" color="teal.500" thickness="4px" />
              </Center>
            ) : (
              <OrdersTable
                orders={orders}
                onStatusChange={handleStatusChange}
                onViewDetails={handleViewDetails}
              />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Order Detail Modal */}
      <OrderDetailModal
        order={selectedOrder}
        isOpen={isOpen}
        onClose={onClose}
      />
    </Container>
  )
}