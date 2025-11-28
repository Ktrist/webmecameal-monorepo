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
  // 1. Importer les nouveaux composants pour les filtres
  Box,
  HStack,
  Input,
  Button,
  FormControl, // <-- AJOUTÉ
  FormLabel,
} from '@chakra-ui/react'

// Le composant OrdersTable (pas de changement)
function OrdersTable({ orders, onStatusChange }) {
  if (orders.length === 0) {
    return <Text>Aucune commande ne correspond à vos critères.</Text>
  }
  const getClientName = (profile) => {
    if (!profile) return 'Utilisateur supprimé'
    if (profile.first_name && profile.last_name) {
      return `${profile.first_name} ${profile.last_name}`
    }
    return profile.email
  }
  return (
    <TableContainer borderWidth="1px" borderRadius="lg">
      <Table variant="simple">
        <Thead bg="gray.50">
          <Tr>
            <Th>ID Commande</Th>
            <Th>Client</Th>
            <Th>Date Livraison</Th>
            <Th>Statut</Th>
            <Th isNumeric>Total</Th>
            <Th>Commentaire</Th>
          </Tr>
        </Thead>
        <Tbody>
          {orders.map((order) => (
            <Tr key={order.id}>
              <Td><Badge>#{order.id}</Badge></Td>
              <Td>{getClientName(order.profiles)}</Td>
              <Td>{new Date(order.delivery_date).toLocaleDateString()}</Td>
              <Td>
                <Select
                  size="sm"
                  value={order.status}
                  onChange={(e) =>
                    onStatusChange(order.id, e.target.value)
                  }
                  borderColor={
                    order.status === 'pending' ? 'yellow.400' : 'green.400'
                  }
                >
                  <option value="pending">En attente (pending)</option>
                  <option value="paid">Payé (paid)</option>
                  <option value="preparing">En préparation</option>
                  <option value="delivered">Livré</option>
                  <option value="cancelled">Annulé</option>
                </Select>
              </Td>
              <Td isNumeric>{order.total_price} €</Td>
              <Td>{order.comments}</Td>
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
  const toast = useToast()

  // 2. Nouveaux états pour les filtres
  const [filterId, setFilterId] = useState('')
  const [filterDate, setFilterDate] = useState('')

  // 3. Le fetch dépend maintenant de 'tabIndex' ET des filtres
  useEffect(() => {
    async function fetchOrders() {
      setLoading(true)
      try {
        let query = supabase
          .from('orders')
          .select('id, created_at, delivery_date, status, total_price, comments, profiles ( email, first_name, last_name )')

        // Logique de filtrage par onglet
        if (tabIndex === 0) {
          query = query.not('status', 'in', '("delivered", "cancelled")')
        } else {
          query = query.in('status', ['delivered', 'cancelled'])
        }

        // 4. Ajout de la logique de filtre (si les champs sont remplis)
        if (filterId) {
          query = query.eq('id', filterId)
        }
        if (filterDate) {
          query = query.eq('delivery_date', filterDate)
        }

        const { data, error } = await query.order('created_at', { ascending: false })

        if (error) throw error
        setOrders(data)
      } catch (error) {
        console.error('Erreur fetch commandes:', error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
    // 5. Se relance quand 'tabIndex' ou les filtres changent
  }, [tabIndex, filterId, filterDate])

  // La fonction de mise à jour (ne change pas)
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId)
      if (error) throw error

      toast({ title: 'Statut mis à jour !', status: 'success' })
      setOrders(currentOrders =>
        currentOrders.filter(order => order.id !== orderId)
      )
    } catch (error) {
      toast({ title: 'Erreur', description: error.message, status: 'error' })
    }
  }

  return (
    <Container maxW="container.xl">
      <Heading mb={6}>Commandes Reçues</Heading>

      {/* 6. Formulaire de filtres */}
      <Box mb={6} p={4} borderWidth="1px" borderRadius="lg">
        <HStack spacing={4}>
          <FormControl>
            <FormLabel fontSize="sm">Filtrer par ID Commande</FormLabel>
            <Input 
              placeholder="Ex: 12" 
              size="sm"
              value={filterId}
              onChange={(e) => setFilterId(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="sm">Filtrer par Date de Livraison</FormLabel>
            <Input 
              type="date" 
              size="sm"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
            />
          </FormControl>
        </HStack>
      </Box>

      {/* Le conteneur d'onglets (ne change pas) */}
      <Tabs index={tabIndex} onChange={(index) => setTabIndex(index)} colorScheme="teal" variant="soft-rounded">
        <TabList>
          <Tab>Commandes Actives</Tab>
          <Tab>Historique</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={4}>
            {loading ? (
              <Center><Spinner size="xl" /></Center>
            ) : (
              <OrdersTable orders={orders} onStatusChange={handleStatusChange} />
            )}
          </TabPanel>
          <TabPanel p={4}>
            {loading ? (
              <Center><Spinner size="xl" /></Center>
            ) : (
              <OrdersTable orders={orders} onStatusChange={handleStatusChange} />
            )}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  )
}