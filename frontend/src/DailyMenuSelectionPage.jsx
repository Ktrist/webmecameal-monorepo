import { useState, useEffect } from 'react'
import { useOutletContext, useNavigate, Link as RouterLink } from 'react-router-dom'
import { supabase } from './supabaseClient'
import {
  Container, Heading, Box, Text, VStack, HStack, Button, Image,
  Badge, Spinner, Center, useToast, Alert, AlertIcon, Card,
  CardBody, Flex, Icon, SimpleGrid
} from '@chakra-ui/react'
import { FiCheck, FiCalendar, FiClock } from 'react-icons/fi'

export default function DailyMenuSelectionPage() {
  const { user, session } = useOutletContext()
  const navigate = useNavigate()
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [subscription, setSubscription] = useState(null)
  const [dailyMenus, setDailyMenus] = useState([])
  const [userSelections, setUserSelections] = useState({})

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchSubscription()
    fetchDailyMenus()
  }, [user])

  const fetchSubscription = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['active', 'trialing'])
        .single()

      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
      setSubscription(data)
    } catch (error) {
      console.error('Erreur subscription:', error)
    }
  }

  const fetchDailyMenus = async () => {
    setLoading(true)
    try {
      // Récupérer les menus des 7 prochains jours
      const today = new Date().toISOString().split('T')[0]
      const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

      const { data: menus, error: menusError } = await supabase
        .from('daily_menus')
        .select(`
          *,
          plat_1:menus!daily_menus_plat_1_id_fkey(id, week_name, description, image_url, price),
          plat_2:menus!daily_menus_plat_2_id_fkey(id, week_name, description, image_url, price)
        `)
        .eq('is_active', true)
        .gte('menu_date', today)
        .lte('menu_date', nextWeek)
        .order('menu_date', { ascending: true })

      if (menusError) throw menusError

      // Filtrer pour ne garder que les jours ouvrés (lundi à vendredi)
      const weekdayMenus = menus?.filter(menu => {
        const date = new Date(menu.menu_date + 'T00:00:00')
        const dayOfWeek = date.getDay() // 0=Dimanche, 1=Lundi, ..., 6=Samedi
        return dayOfWeek >= 1 && dayOfWeek <= 5 // Lundi (1) à Vendredi (5)
      }) || []

      // Récupérer les sélections de l'utilisateur
      if (user && weekdayMenus && weekdayMenus.length > 0) {
        const menuIds = weekdayMenus.map(m => m.id)
        const { data: selections, error: selectionsError } = await supabase
          .from('subscriber_menu_selections')
          .select('*')
          .eq('user_id', user.id)
          .in('daily_menu_id', menuIds)

        if (selectionsError) throw selectionsError

        // Créer un mapping pour accès rapide
        const selectionsMap = {}
        selections?.forEach(sel => {
          selectionsMap[sel.daily_menu_id] = sel.selected_plat_number
        })
        setUserSelections(selectionsMap)
      }

      setDailyMenus(weekdayMenus)
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

  const handleSelectDish = async (dailyMenuId, platNumber) => {
    if (!subscription) {
      toast({
        title: 'Abonnement requis',
        description: 'Vous devez avoir un abonnement actif pour sélectionner vos plats',
        status: 'warning',
      })
      navigate('/abonnements')
      return
    }

    setSaving(true)

    try {
      // Vérifier si une sélection existe déjà
      const existingSelection = userSelections[dailyMenuId]

      if (existingSelection) {
        // Mettre à jour la sélection existante
        const { error } = await supabase
          .from('subscriber_menu_selections')
          .update({ selected_plat_number: platNumber })
          .eq('user_id', user.id)
          .eq('daily_menu_id', dailyMenuId)

        if (error) throw error

        toast({
          title: 'Choix modifié',
          description: 'Votre sélection a été mise à jour',
          status: 'success',
          duration: 2000,
        })
      } else {
        // Créer une nouvelle sélection
        const { error } = await supabase
          .from('subscriber_menu_selections')
          .insert({
            user_id: user.id,
            daily_menu_id: dailyMenuId,
            selected_plat_number: platNumber,
          })

        if (error) throw error

        toast({
          title: 'Plat sélectionné',
          description: 'Votre choix a été enregistré',
          status: 'success',
          duration: 2000,
        })
      }

      // Mettre à jour l'état local
      setUserSelections({
        ...userSelections,
        [dailyMenuId]: platNumber,
      })

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

  // Vérifier si la date est passée
  const isPastDate = (menuDate) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(menuDate + 'T00:00:00')
    return date < today
  }

  // Vérifier si c'est aujourd'hui
  const isToday = (menuDate) => {
    const today = new Date().toISOString().split('T')[0]
    return menuDate === today
  }

  if (!user) return null

  return (
    <Container maxW="container.xl" py={10}>
      <VStack align="stretch" spacing={8}>
        <Box>
          <Heading size="xl" mb={2}>Mes Menus Quotidiens</Heading>
          <Text color="gray.600">
            Choisissez votre plat préféré parmi les 2 options du jour
          </Text>
        </Box>

        {!subscription && (
          <Alert status="warning" borderRadius="md">
            <AlertIcon />
            <Box flex="1">
              <Text fontWeight="bold">Abonnement requis</Text>
              <Text fontSize="sm">
                Vous devez avoir un abonnement actif pour accéder aux menus quotidiens.
              </Text>
            </Box>
            <Button as={RouterLink} to="/abonnements" colorScheme="orange" size="sm" ml={4}>
              Découvrir nos abonnements
            </Button>
          </Alert>
        )}

        {loading ? (
          <Center py={20}>
            <Spinner size="xl" color="brand.green" />
          </Center>
        ) : dailyMenus.length === 0 ? (
          <Center py={20}>
            <VStack spacing={4}>
              <Icon as={FiCalendar} boxSize={16} color="gray.400" />
              <Heading size="md" color="gray.600">Aucun menu disponible</Heading>
              <Text color="gray.500" textAlign="center">
                Les menus de la semaine ne sont pas encore publiés. Revenez bientôt !
              </Text>
            </VStack>
          </Center>
        ) : (
          <VStack align="stretch" spacing={6}>
            {dailyMenus.map((dailyMenu) => {
              const selectedPlat = userSelections[dailyMenu.id]
              const past = isPastDate(dailyMenu.menu_date)
              const today = isToday(dailyMenu.menu_date)

              return (
                <Box
                  key={dailyMenu.id}
                  borderWidth="2px"
                  borderColor={today ? 'green.400' : 'gray.200'}
                  borderRadius="xl"
                  p={6}
                  bg={today ? 'green.50' : 'white'}
                  opacity={past ? 0.6 : 1}
                >
                  <HStack justify="space-between" mb={4}>
                    <VStack align="start" spacing={0}>
                      <HStack>
                        <Icon as={FiCalendar} color="brand.green" />
                        <Heading size="md">
                          {new Date(dailyMenu.menu_date + 'T00:00:00').toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </Heading>
                      </HStack>
                      {today && (
                        <Badge colorScheme="green" fontSize="sm" mt={2}>
                          Aujourd'hui
                        </Badge>
                      )}
                      {past && (
                        <Badge colorScheme="gray" fontSize="sm" mt={2}>
                          Passé
                        </Badge>
                      )}
                    </VStack>

                    {selectedPlat && !past && (
                      <Badge colorScheme="green" fontSize="md" px={4} py={2} borderRadius="full">
                        <HStack>
                          <Icon as={FiCheck} />
                          <Text>Choix enregistré</Text>
                        </HStack>
                      </Badge>
                    )}
                  </HStack>

                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                    {/* Plat 1 */}
                    <DishCard
                      dish={dailyMenu.plat_1}
                      number={1}
                      isSelected={selectedPlat === 1}
                      onSelect={() => handleSelectDish(dailyMenu.id, 1)}
                      disabled={past || saving}
                    />

                    {/* Plat 2 */}
                    <DishCard
                      dish={dailyMenu.plat_2}
                      number={2}
                      isSelected={selectedPlat === 2}
                      onSelect={() => handleSelectDish(dailyMenu.id, 2)}
                      disabled={past || saving}
                    />
                  </SimpleGrid>

                  {past && selectedPlat && (
                    <Text fontSize="sm" color="gray.500" mt={4} textAlign="center">
                      Vous aviez choisi le plat {selectedPlat}
                    </Text>
                  )}
                </Box>
              )
            })}
          </VStack>
        )}
      </VStack>
    </Container>
  )
}

// Composant pour afficher une carte de plat
function DishCard({ dish, number, isSelected, onSelect, disabled }) {
  if (!dish) {
    return (
      <Card variant="outline" opacity={0.5}>
        <CardBody>
          <Center py={10}>
            <Text color="gray.400">Plat non défini</Text>
          </Center>
        </CardBody>
      </Card>
    )
  }

  return (
    <Card
      as="button"
      onClick={onSelect}
      disabled={disabled}
      variant="outline"
      borderWidth="3px"
      borderColor={isSelected ? 'green.500' : 'gray.200'}
      bg={isSelected ? 'green.50' : 'white'}
      transition="all 0.3s"
      _hover={!disabled ? { borderColor: 'green.400', transform: 'translateY(-4px)', shadow: 'lg' } : {}}
      _active={!disabled ? { transform: 'translateY(-2px)' } : {}}
      cursor={disabled ? 'not-allowed' : 'pointer'}
      position="relative"
      textAlign="left"
    >
      {isSelected && (
        <Badge
          position="absolute"
          top={-3}
          right={-3}
          colorScheme="green"
          fontSize="md"
          px={3}
          py={1}
          borderRadius="full"
          zIndex={1}
        >
          <HStack>
            <Icon as={FiCheck} />
            <Text>Mon choix</Text>
          </HStack>
        </Badge>
      )}

      <CardBody>
        <VStack align="stretch" spacing={4}>
          {dish.image_url && (
            <Image
              src={dish.image_url}
              alt={dish.week_name}
              borderRadius="md"
              h="200px"
              w="full"
              objectFit="cover"
            />
          )}

          <Box>
            <Badge colorScheme="blue" mb={2}>
              Choix {number}
            </Badge>
            <Heading size="md" mb={2}>
              {dish.week_name}
            </Heading>
            {dish.description && (
              <Text fontSize="sm" color="gray.600" noOfLines={3}>
                {dish.description}
              </Text>
            )}
          </Box>

          {isSelected && (
            <Button colorScheme="green" size="lg" leftIcon={<Icon as={FiCheck} />}>
              Sélectionné
            </Button>
          )}
          {!isSelected && !disabled && (
            <Button colorScheme="green" variant="outline" size="lg">
              Choisir ce plat
            </Button>
          )}
        </VStack>
      </CardBody>
    </Card>
  )
}
