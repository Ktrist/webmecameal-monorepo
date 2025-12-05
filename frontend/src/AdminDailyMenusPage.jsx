import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import {
  Box, Heading, Button, Table, Thead, Tbody, Tr, Th, Td,
  Badge, Spinner, Center, useToast, HStack, Input,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter,
  ModalBody, ModalCloseButton, useDisclosure, FormControl,
  FormLabel, Select, Switch, VStack, Text, IconButton, Alert, AlertIcon
} from '@chakra-ui/react'
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons'

export default function AdminDailyMenusPage() {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [dailyMenus, setDailyMenus] = useState([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Liste des menus disponibles pour sélection
  const [availableMenus, setAvailableMenus] = useState([])

  // État du formulaire
  const [editingMenu, setEditingMenu] = useState(null)
  const [formData, setFormData] = useState({
    menu_date: '',
    plat_1_id: '',
    plat_2_id: '',
    is_active: false,
  })

  // Charger les menus quotidiens
  useEffect(() => {
    fetchDailyMenus()
    fetchAvailableMenus()
  }, [])

  const fetchDailyMenus = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('daily_menus')
        .select(`
          *,
          plat_1:menus!daily_menus_plat_1_id_fkey(id, week_name, image_url),
          plat_2:menus!daily_menus_plat_2_id_fkey(id, week_name, image_url)
        `)
        .order('menu_date', { ascending: false })

      if (error) throw error
      setDailyMenus(data || [])
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        status: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAvailableMenus = async () => {
    try {
      const { data, error } = await supabase
        .from('menus')
        .select('id, week_name')
        .order('week_name')

      if (error) throw error
      setAvailableMenus(data || [])
    } catch (error) {
      console.error('Erreur fetch menus:', error)
    }
  }

  const handleOpenCreate = () => {
    setEditingMenu(null)
    setFormData({
      menu_date: new Date().toISOString().split('T')[0],
      plat_1_id: '',
      plat_2_id: '',
      is_active: false,
    })
    onOpen()
  }

  const handleOpenEdit = (menu) => {
    setEditingMenu(menu)
    setFormData({
      menu_date: menu.menu_date,
      plat_1_id: menu.plat_1_id || '',
      plat_2_id: menu.plat_2_id || '',
      is_active: menu.is_active,
    })
    onOpen()
  }

  const handleSave = async () => {
    // Validation
    if (!formData.menu_date) {
      toast({
        title: 'Date manquante',
        description: 'Veuillez sélectionner une date',
        status: 'warning',
      })
      return
    }

    if (!formData.plat_1_id || !formData.plat_2_id) {
      toast({
        title: 'Plats manquants',
        description: 'Veuillez sélectionner 2 plats différents',
        status: 'warning',
      })
      return
    }

    if (formData.plat_1_id === formData.plat_2_id) {
      toast({
        title: 'Plats identiques',
        description: 'Veuillez sélectionner 2 plats différents',
        status: 'warning',
      })
      return
    }

    setSaving(true)

    try {
      if (editingMenu) {
        // Mise à jour
        const { error } = await supabase
          .from('daily_menus')
          .update({
            menu_date: formData.menu_date,
            plat_1_id: formData.plat_1_id,
            plat_2_id: formData.plat_2_id,
            is_active: formData.is_active,
          })
          .eq('id', editingMenu.id)

        if (error) throw error

        toast({
          title: 'Menu mis à jour',
          status: 'success',
        })
      } else {
        // Création
        const { error } = await supabase
          .from('daily_menus')
          .insert({
            menu_date: formData.menu_date,
            plat_1_id: formData.plat_1_id,
            plat_2_id: formData.plat_2_id,
            is_active: formData.is_active,
          })

        if (error) throw error

        toast({
          title: 'Menu créé',
          status: 'success',
        })
      }

      onClose()
      fetchDailyMenus()
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        status: 'error',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce menu quotidien ?')) return

    try {
      const { error } = await supabase
        .from('daily_menus')
        .delete()
        .eq('id', id)

      if (error) throw error

      toast({
        title: 'Menu supprimé',
        status: 'success',
      })
      fetchDailyMenus()
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        status: 'error',
      })
    }
  }

  const handleToggleActive = async (menu) => {
    try {
      const { error } = await supabase
        .from('daily_menus')
        .update({ is_active: !menu.is_active })
        .eq('id', menu.id)

      if (error) throw error

      toast({
        title: menu.is_active ? 'Menu désactivé' : 'Menu activé',
        status: 'success',
      })
      fetchDailyMenus()
    } catch (error) {
      toast({
        title: 'Erreur',
        description: error.message,
        status: 'error',
      })
    }
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Menus Quotidiens</Heading>
        <Button leftIcon={<AddIcon />} colorScheme="green" onClick={handleOpenCreate}>
          Créer un menu
        </Button>
      </HStack>

      <Alert status="info" mb={6} borderRadius="md">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Gestion des menus quotidiens</Text>
          <Text fontSize="sm">
            Créez des menus quotidiens avec 2 choix de plats. Les abonnés pourront sélectionner leur plat préféré chaque jour.
          </Text>
        </Box>
      </Alert>

      {loading ? (
        <Center py={10}>
          <Spinner size="xl" />
        </Center>
      ) : dailyMenus.length === 0 ? (
        <Center py={10}>
          <VStack>
            <Text color="gray.500">Aucun menu quotidien créé</Text>
            <Button colorScheme="green" onClick={handleOpenCreate}>
              Créer le premier menu
            </Button>
          </VStack>
        </Center>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Plat 1</Th>
                <Th>Plat 2</Th>
                <Th>Statut</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {dailyMenus.map((menu) => (
                <Tr key={menu.id}>
                  <Td fontWeight="bold">
                    {new Date(menu.menu_date + 'T00:00:00').toLocaleDateString('fr-FR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Td>
                  <Td>{menu.plat_1?.week_name || 'Non défini'}</Td>
                  <Td>{menu.plat_2?.week_name || 'Non défini'}</Td>
                  <Td>
                    <Badge colorScheme={menu.is_active ? 'green' : 'gray'}>
                      {menu.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <Switch
                        isChecked={menu.is_active}
                        onChange={() => handleToggleActive(menu)}
                        colorScheme="green"
                      />
                      <IconButton
                        icon={<EditIcon />}
                        size="sm"
                        onClick={() => handleOpenEdit(menu)}
                        aria-label="Modifier"
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDelete(menu.id)}
                        aria-label="Supprimer"
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Modal Création/Édition */}
      <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingMenu ? 'Modifier le menu' : 'Créer un menu quotidien'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Date du menu</FormLabel>
                <Input
                  type="date"
                  value={formData.menu_date}
                  onChange={(e) => setFormData({ ...formData, menu_date: e.target.value })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Plat 1</FormLabel>
                <Select
                  placeholder="Sélectionner le premier plat"
                  value={formData.plat_1_id}
                  onChange={(e) => setFormData({ ...formData, plat_1_id: e.target.value })}
                >
                  {availableMenus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.week_name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Plat 2</FormLabel>
                <Select
                  placeholder="Sélectionner le deuxième plat"
                  value={formData.plat_2_id}
                  onChange={(e) => setFormData({ ...formData, plat_2_id: e.target.value })}
                >
                  {availableMenus.map((menu) => (
                    <option key={menu.id} value={menu.id}>
                      {menu.week_name}
                    </option>
                  ))}
                </Select>
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel mb="0">Publier immédiatement</FormLabel>
                <Switch
                  isChecked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  colorScheme="green"
                />
              </FormControl>

              <Text fontSize="xs" color="gray.500">
                Les abonnés pourront voir ce menu et faire leur choix une fois qu'il sera actif.
              </Text>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button colorScheme="green" onClick={handleSave} isLoading={saving}>
              {editingMenu ? 'Mettre à jour' : 'Créer'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
