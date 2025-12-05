import { useState, useEffect } from 'react' // <-- L'IMPORT MANQUANT ÉTAIT ICI
import { supabase } from './supabaseClient'
import {
  Container, Heading, VStack, FormControl, FormLabel, Input,
  NumberInput, NumberInputField, Button, useToast, Text,
  Box, Spinner, Center, Table, Thead, Tbody, Tr, Th, Td,
  TableContainer, IconButton, HStack
} from '@chakra-ui/react'
import { FaTrash, FaEdit } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'

// Composant Liste avec bouton Modifier
function MenuList({ menus, onDelete, onEdit }) {
  return (
    <Box mt={12}>
      <Heading size="lg" mb={4}>Menus Existants</Heading>
      <TableContainer borderWidth="1px" borderRadius="lg">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th>Nom (Interne)</Th>
              <Th isNumeric>Prix</Th>
              <Th>Actif</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {menus.map((menu) => (
              <Tr key={menu.id}>
                <Td>
                  <Text fontWeight="bold">{menu.week_name}</Text>
                  <Text fontSize="xs" color="gray.500">ID: {menu.id}</Text>
                </Td>
                <Td isNumeric>{menu.price} €</Td>
                <Td>{menu.is_active ? "Oui" : "Non"}</Td>
                <Td>
                  <HStack spacing={2}>
                    <IconButton
                      icon={<FaEdit />}
                      colorScheme="blue"
                      size="sm"
                      onClick={() => onEdit(menu.id)}
                      aria-label="Modifier"
                    />
                    <IconButton
                      icon={<FaTrash />}
                      colorScheme="red"
                      size="sm"
                      onClick={() => onDelete(menu.id)}
                      aria-label="Supprimer"
                    />
                  </HStack>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  )
}

export default function AdminMenusPage() {
  const toast = useToast()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // États Simplifiés (Architecture Pro : on gère le reste dans Strapi)
  const [weekName, setWeekName] = useState('')
  const [price, setPrice] = useState('0.00')

  // États pour la liste
  const [menus, setMenus] = useState([])
  const [listLoading, setListLoading] = useState(true)

  // Fetcher la liste
  async function fetchMenus() {
    setListLoading(true)
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setMenus(data)
    } catch (error) {
      toast({ title: "Erreur fetch menus", description: error.message, status: "error" })
    } finally {
      setListLoading(false)
    }
  }

  useEffect(() => {
    fetchMenus()
  }, [])

  // Création Simplifiée (Juste le SKU)
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error: insertError } = await supabase
        .from('menus')
        .insert({
          week_name: weekName,
          price: parseFloat(price),
          is_active: true,
          // description et image_url restent null, c'est Strapi qui gère ça
        })
      
      if (insertError) throw insertError

      toast({ title: "Produit créé ! (Allez dans Strapi pour le contenu)", status: "success" })
      
      setWeekName('')
      setPrice('0.00')
      fetchMenus() 

    } catch (error) {
      toast({ title: "Erreur", description: error.message, status: "error" })
    } finally {
      setLoading(false)
    }
  }

  // Modification
  const handleEdit = (menuId) => {
    navigate(`/admin/menus/${menuId}`)
  }

  // Suppression
  const handleDelete = async (menuId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      try {
        const { error } = await supabase.from('menus').delete().eq('id', menuId)
        if (error) throw error
        toast({ title: "Produit supprimé", status: "info" })
        fetchMenus()
      } catch (error) {
        toast({ title: "Erreur suppression", description: error.message, status: "error" })
      }
    }
  }

  return (
    <Container maxW="container.lg">
      <Heading mb={2}>Gestion des Produits</Heading>
      <Text mb={8} color="gray.600">
        Créez ici la référence technique (Prix, ID). Pour les photos et descriptions, utilisez le CMS Strapi.
      </Text>
      
      <form onSubmit={handleSubmit}>
        <VStack spacing={6} align="stretch" maxW="container.md" p={6} borderWidth="1px" borderRadius="lg" bg="white">
          <Heading size="md">Nouveau Produit</Heading>
          
          <FormControl isRequired>
            <FormLabel>Nom interne (ex: "Menu S42 - Poulet")</FormLabel>
            <Input value={weekName} onChange={(e) => setWeekName(e.target.value)} bg="white" />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Prix (€)</FormLabel>
            <NumberInput precision={2} min={0} value={price} onChange={(v) => setPrice(v)}>
              <NumberInputField bg="white" />
            </NumberInput>
          </FormControl>

          <Button type="submit" colorScheme="teal" isLoading={loading}>
            Générer le produit
          </Button>
        </VStack>
      </form>
      
      {listLoading ? (
        <Center mt={12}><Spinner /></Center>
      ) : (
        <MenuList menus={menus} onDelete={handleDelete} onEdit={handleEdit} />
      )}
    </Container>
  )
}