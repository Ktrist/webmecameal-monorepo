import { useState, useEffect } from 'react'
import {
  Box, Button, Container, Heading, Text, Flex, VStack, Divider,
  // Imports pour les Modales et Drawers (Menu Mobile)
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody,
  ModalCloseButton, useDisclosure, IconButton, HStack,
  Drawer, DrawerBody, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, Link, Spacer,
  Badge, Menu, MenuButton, MenuList, MenuItem
} from '@chakra-ui/react'
import { Link as RouterLink, Outlet, useOutletContext } from 'react-router-dom'
import { FiShoppingCart, FiMenu, FiUser, FiLogOut } from 'react-icons/fi'
import { FaMinus, FaPlus, FaTrash } from 'react-icons/fa'
import { useCart } from './CartContext'
import { supabase } from './supabaseClient'
import { STRAPI_URL } from './config'

export default function Layout() {
  // 1. Récupération des contextes
  const { session, profile } = useOutletContext()
  const { 
    cartItems, itemCount, total, 
    updateQuantity, removeFromCart 
  } = useCart()
  
  // 2. Gestion des Modales et Menus
  const { isOpen: isCartOpen, onOpen: onCartOpen, onClose: onCartClose } = useDisclosure() // Panier
  const { isOpen: isMenuOpen, onOpen: onMenuOpen, onClose: onMenuClose } = useDisclosure() // Burger Menu
  
  // 3. NOUVEAU : État pour les liens de navigation (depuis Strapi)
  const [menuLinks, setMenuLinks] = useState([])

  // 4. Fonction de déconnexion
  const handleLogout = async () => {
    await supabase.auth.signOut()
    onMenuClose()
  }

  // 5. FETCH LE MENU DE NAVIGATION DEPUIS STRAPI (Single Type Global)
  useEffect(() => {
    async function fetchGlobal() {
      try {
        // Fetch de la structure 'Global' et population de la relation 'navigation'
        const res = await fetch(`${STRAPI_URL}/api/global?populate[navigation]=*`)
        const json = await res.json()
        
        if (json.data && json.data.navigation) {
          // Strapi v5 retourne data.navigation
          setMenuLinks(json.data.navigation || [])
        }
      } catch (error) {
        console.error("Erreur fetching global menu:", error)
      }
    }
    fetchGlobal()
  }, [])
  
  // La fonction handleValidateOrder (logique DB) vit dans CheckoutPage.jsx

  return (
    <Box display="flex" flexDirection="column" minH="100vh">
      
      {/* --- HEADER STYLE QUITOQUE --- */}
      <Box shadow="sm" borderBottomWidth="1px" borderColor="gray.200" position="sticky" top={0} zIndex={10} bg="white">
        <Container maxW="container.xl">
          <Flex alignItems="center" py={4} gap={6}>

            {/* Logo */}
            <Heading
              as={RouterLink}
              to="/"
              size="lg"
              color="brand.green"
              fontWeight="bold"
              _hover={{ opacity: 0.8 }}
              transition="opacity 0.2s"
              flexShrink={0}
            >
              Webmecameal
            </Heading>

            {/* --- NAVIGATION DESKTOP (Centre flexible) --- */}
            <HStack
              as="nav"
              spacing={6}
              display={{ base: 'none', lg: 'flex' }}
              flex="1"
              justify="center"
              px={4}
            >
              {menuLinks.map((link) => (
                <Link
                  key={link.id}
                  as={RouterLink}
                  to={link.url}
                  fontSize="sm"
                  fontWeight="500"
                  color="gray.700"
                  whiteSpace="nowrap"
                  _hover={{ color: 'brand.green', textDecoration: 'none' }}
                  transition="color 0.2s"
                >
                  {link.label}
                </Link>
              ))}
            </HStack>

            {/* --- ACTIONS DROITE (Desktop) --- */}
            <HStack spacing={3} display={{ base: 'none', lg: 'flex' }} flexShrink={0}>

              {/* Icône Panier avec Badge - Uniquement si connecté */}
              {session && (
                <Box position="relative">
                  <IconButton
                    icon={<FiShoppingCart size={20} />}
                    variant="ghost"
                    onClick={onCartOpen}
                    aria-label="Panier"
                    size="md"
                    borderRadius="full"
                    _hover={{ bg: 'gray.100' }}
                  />
                  {itemCount > 0 && (
                    <Badge
                      position="absolute"
                      top="-1"
                      right="-1"
                      colorScheme="red"
                      borderRadius="full"
                      fontSize="xs"
                      px={2}
                    >
                      {itemCount}
                    </Badge>
                  )}
                </Box>
              )}

              {/* Bouton Menu utilisateur ou Connexion */}
              {session ? (
                <Menu>
                  <MenuButton
                    as={Button}
                    leftIcon={<FiUser />}
                    variant="outline"
                    borderRadius="full"
                    size="md"
                    borderColor="gray.300"
                    _hover={{ bg: 'gray.50' }}
                    _active={{ bg: 'gray.100' }}
                  >
                    Mon compte
                  </MenuButton>
                  <MenuList>
                    <MenuItem as={RouterLink} to="/mes-menus" icon={<FiShoppingCart />}>
                      Mes menus quotidiens
                    </MenuItem>
                    <MenuItem as={RouterLink} to="/compte" icon={<FiUser />}>
                      Mon profil
                    </MenuItem>
                    <MenuItem as={RouterLink} to="/admin">
                      Administration
                    </MenuItem>
                    <Divider />
                    <MenuItem icon={<FiLogOut />} onClick={handleLogout} color="red.500">
                      Déconnexion
                    </MenuItem>
                  </MenuList>
                </Menu>
              ) : (
                <>
                  {/* Bouton Me connecter - Outline transparent */}
                  <Button
                    as={RouterLink}
                    to="/login"
                    leftIcon={<FiUser />}
                    variant="outline"
                    borderRadius="full"
                    size="md"
                    px={6}
                    borderColor="gray.300"
                    bg="transparent"
                    _hover={{ bg: 'gray.50' }}
                    transition="all 0.2s"
                  >
                    Me connecter
                  </Button>

                  {/* Bouton Je m'abonne - Style teal solid */}
                  <Button
                    as={RouterLink}
                    to="/commander/personnalisation"
                    colorScheme="teal"
                    variant="solid"
                    borderRadius="full"
                    size="md"
                    px={6}
                    _hover={{ transform: 'translateY(-1px)', shadow: 'md' }}
                    transition="all 0.2s"
                  >
                    Je m'abonne
                  </Button>
                </>
              )}
            </HStack>

            {/* --- NAVIGATION MOBILE (Burger + Panier) --- */}
            <HStack display={{ base: 'flex', lg: 'none' }} spacing={2}>
              {/* Panier Mobile - Uniquement si connecté */}
              {session && (
                <Box position="relative">
                  <IconButton
                    icon={<FiShoppingCart size={18} />}
                    variant="ghost"
                    onClick={onCartOpen}
                    aria-label="Panier"
                    size="sm"
                  />
                  {itemCount > 0 && (
                    <Badge
                      position="absolute"
                      top="-1"
                      right="-1"
                      colorScheme="red"
                      borderRadius="full"
                      fontSize="xs"
                      px={1.5}
                    >
                      {itemCount}
                    </Badge>
                  )}
                </Box>
              )}

              {/* Burger Menu */}
              <IconButton
                icon={<FiMenu />}
                onClick={onMenuOpen}
                variant="outline"
                aria-label="Menu"
                size="sm"
              />
            </HStack>

          </Flex>
        </Container>
      </Box>
      
      {/* --- DRAWER MOBILE (Tiroir pour le Menu Burger) --- */}
      <Drawer isOpen={isMenuOpen} placement="right" onClose={onMenuClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Menu</DrawerHeader>
          <DrawerBody>
            <VStack align="stretch" spacing={4} mt={4}>
              {/* Liens dynamiques dans le Drawer */}
              {menuLinks.map((link) => (
                 <Button key={link.id} as={RouterLink} to={link.url} justifyContent="flex-start" variant="ghost" onClick={onMenuClose}>
                    {link.label}
                 </Button>
              ))}
              <Divider />
              {session ? (
                <>
                  <Button as={RouterLink} to="/mes-menus" leftIcon={<FiShoppingCart />} justifyContent="flex-start" variant="ghost" onClick={onMenuClose}>
                    Mes menus quotidiens
                  </Button>
                  <Button as={RouterLink} to="/compte" leftIcon={<FiUser />} justifyContent="flex-start" variant="ghost" onClick={onMenuClose}>
                    Mon Compte
                  </Button>
                  <Button as={RouterLink} to="/admin" justifyContent="flex-start" variant="ghost" onClick={onMenuClose}>
                    Accès Admin
                  </Button>
                  <Divider />
                  <Button leftIcon={<FiLogOut />} colorScheme="red" variant="ghost" justifyContent="flex-start" onClick={handleLogout}>
                    Déconnexion
                  </Button>
                </>
              ) : (
                <Button as={RouterLink} to="/login" colorScheme="teal" w="full" onClick={onMenuClose}>
                  Connexion / Inscription
                </Button>
              )}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* --- CONTENU PRINCIPAL --- */}
      <Box flex="1">
        <Outlet context={useOutletContext()} /> 
      </Box>

      {/* --- FOOTER --- */}
      <Box bg="gray.50" color="gray.600" mt={20}>
        <Container maxW="container.lg" py={10} textAlign="center">
          <Text>© 2025 Webmecameal. Tous droits réservés.</Text>
        </Container>
      </Box>

      {/* --- MODAL PANIER (Aperçu avant Checkout) --- */}
      <Modal isOpen={isCartOpen} onClose={onCartClose} size="lg" scrollBehavior="inside">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Votre Panier</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              {cartItems.length === 0 ? (
                <Text py={8} textAlign="center" color="gray.500">Votre panier est vide.</Text>
              ) : (
                cartItems.map((item) => (
                  <Flex 
                    key={item.id} 
                    justifyContent="space-between" 
                    alignItems="center" 
                    p={3} 
                    borderWidth="1px" 
                    borderRadius="md"
                  >
                    <Box>
                      <Heading size="sm" noOfLines={1}>{item.week_name}</Heading>
                      <Text fontSize="sm" color="gray.600">{item.price} €</Text>
                    </Box>
                    <HStack>
                      <IconButton icon={<FaMinus />} size="xs" onClick={() => updateQuantity(item.id, -1)} aria-label="Diminuer"/>
                      <Text fontWeight="bold" w="20px" textAlign="center">{item.quantity}</Text>
                      <IconButton icon={<FaPlus />} size="xs" onClick={() => updateQuantity(item.id, 1)} aria-label="Augmenter"/>
                      <IconButton icon={<FaTrash />} size="xs" colorScheme="red" variant="ghost" onClick={() => removeFromCart(item.id)} aria-label="Supprimer"/>
                    </HStack>
                  </Flex>
                ))
              )}
              
              {cartItems.length > 0 && (
                <Box pt={4} borderTopWidth="1px">
                  <Flex justifyContent="space-between" alignItems="center">
                    <Text fontSize="lg">Total</Text>
                    <Heading size="md">{total.toFixed(2)} €</Heading>
                  </Flex>
                </Box>
              )}
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" onClick={onCartClose} mr={3}>
              Continuer les achats
            </Button>
            <Button 
              as={RouterLink}
              to="/checkout"
              colorScheme="green" 
              isDisabled={cartItems.length === 0}
              onClick={onCartClose}
            >
              Valider la commande
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </Box>
  )
}